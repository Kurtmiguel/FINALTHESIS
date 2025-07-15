// app/api/gps-tracker/route.ts - Enhanced with Geofencing
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import TrackingData from '@/models/TrackingData'
import Device from '@/models/Device'
import Geofence from '@/models/Geofence'
import Alert from '@/models/Alert'
import Dog from '@/models/Dog'
import { headers } from 'next/headers'

// Utility function to calculate distance between two GPS coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Function to check geofence violations
async function checkGeofenceViolations(
  deviceId: string, 
  latitude: number, 
  longitude: number,
  battery: number
) {
  try {
    // Find active geofences for this device
    const activeGeofences = await Geofence.find({
      deviceId: deviceId,
      isActive: true,
      alertsEnabled: true
    }).populate('dogId', 'name breed').populate('owner', 'fullName email');

    if (activeGeofences.length === 0) {
      console.log(`📍 No active geofences found for device ${deviceId}`);
      return;
    }

    for (const geofence of activeGeofences) {
      const distance = calculateDistance(
        latitude,
        longitude,
        geofence.centerLatitude,
        geofence.centerLongitude
      );

      console.log(`📍 Geofence check - Device: ${deviceId}, Distance: ${distance.toFixed(2)}m, Radius: ${geofence.radius}m`);

      const isInsideGeofence = distance <= geofence.radius;
      const dogName = (geofence.dogId as any).name;
      const geofenceName = geofence.name;

      // Check for recent alerts to avoid spam (within last 5 minutes)
      const recentAlertTime = new Date(Date.now() - 5 * 60 * 1000);
      const recentAlert = await Alert.findOne({
        deviceId: deviceId,
        geofenceId: geofence._id,
        alertType: { $in: ['geofence_exit', 'geofence_entry'] },
        createdAt: { $gte: recentAlertTime }
      });

      if (recentAlert) {
        console.log(`⏱️ Recent alert found, skipping duplicate alert for ${deviceId}`);
        continue;
      }

      if (!isInsideGeofence) {
        // Dog is outside geofence - create exit alert
        console.log(`🚨 GEOFENCE VIOLATION: ${dogName} is ${distance.toFixed(0)}m outside ${geofenceName}`);
        
        const exitAlert = (Alert as any).createGeofenceExitAlert(
          deviceId,
          geofence.dogId._id,
          geofence._id,
          geofence.owner,
          { latitude, longitude },
          distance - geofence.radius, // Distance beyond the boundary
          dogName,
          geofenceName
        );

        await exitAlert.save();
        console.log(`📢 Exit alert created for ${dogName}`);

      } else {
        // Dog is inside geofence - check if there was a previous exit alert that needs to be resolved
        const lastExitAlert = await Alert.findOne({
          deviceId: deviceId,
          geofenceId: geofence._id,
          alertType: 'geofence_exit',
          isResolved: false
        }).sort({ createdAt: -1 });

        if (lastExitAlert) {
          // Dog returned to geofence - create entry alert and resolve exit alert
          console.log(`✅ GEOFENCE RETURN: ${dogName} has returned to ${geofenceName}`);
          
          const entryAlert = (Alert as any).createGeofenceEntryAlert(
            deviceId,
            geofence.dogId._id,
            geofence._id,
            geofence.owner,
            { latitude, longitude },
            dogName,
            geofenceName
          );

          await entryAlert.save();

          // Resolve the previous exit alert
          await Alert.findByIdAndUpdate(lastExitAlert._id, {
            isResolved: true,
            resolvedAt: new Date()
          });

          console.log(`📢 Entry alert created and exit alert resolved for ${dogName}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking geofence violations:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const headersList = await headers()
    const apiKey = headersList.get('x-api-key')
    
    if (apiKey !== process.env.GPS_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['deviceId', 'latitude', 'longitude', 'gpsValid', 'battery', 'timestamp']
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Connect to database
    await dbConnect()

    // Find the device and validate it exists and is active
    const device = await Device.findOne({ 
      deviceId: body.deviceId,
      isActive: true 
    }).populate('owner')

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found or inactive' },
        { status: 404 }
      )
    }

    // Create tracking data document
    const trackingData = new TrackingData({
      deviceId: body.deviceId,
      latitude: parseFloat(body.latitude),
      longitude: parseFloat(body.longitude),
      gpsValid: Boolean(body.gpsValid),
      battery: parseInt(body.battery),
      timestamp: new Date(body.timestamp),
      uptime: parseInt(body.uptime || 0),
      wifiRSSI: parseInt(body.wifiRSSI || 0),
      createdAt: new Date()
    })

    // Save tracking data
    const result = await trackingData.save()

    // Update device's last seen and battery level
    await Device.findByIdAndUpdate(device._id, {
      lastSeen: new Date(),
      batteryLevel: parseInt(body.battery)
    })

    // 🔥 NEW: Check geofence violations if GPS is valid
    if (body.gpsValid && body.latitude !== 0 && body.longitude !== 0) {
      console.log(`🛰️ Valid GPS data received, checking geofences for device ${body.deviceId}`)
      await checkGeofenceViolations(
        body.deviceId,
        parseFloat(body.latitude),
        parseFloat(body.longitude),
        parseInt(body.battery)
      )
    } else {
      console.log(`⚠️ GPS data invalid or zero coordinates, skipping geofence check`)
    }

    // Check for low battery alert (if battery < 20% and no recent low battery alert)
    if (parseInt(body.battery) < 20) {
      const recentBatteryAlert = await Alert.findOne({
        deviceId: body.deviceId,
        alertType: 'battery_low',
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Within last hour
      })

      if (!recentBatteryAlert) {
        const dog = await Dog.findOne({ assignedDevice: device._id })
        if (dog) {
          const batteryAlert = new Alert({
            alertType: 'battery_low',
            title: `${dog.name}'s collar battery is low`,
            message: `Battery level is at ${body.battery}%. Please charge the collar soon.`,
            severity: body.battery < 10 ? 'critical' : 'medium',
            deviceId: body.deviceId,
            dogId: dog._id,
            owner: device.owner,
            metadata: {
              batteryLevel: parseInt(body.battery)
            }
          })
          
          await batteryAlert.save()
          console.log(`🔋 Low battery alert created for ${dog.name} (${body.battery}%)`)
        }
      }
    }

    // Log successful data reception with geofence status
    console.log(`📡 GPS data processed for ${body.deviceId}:`, {
      coordinates: `${body.latitude}, ${body.longitude}`,
      gpsValid: body.gpsValid,
      battery: `${body.battery}%`,
      timestamp: body.timestamp,
      geofenceChecked: body.gpsValid,
      owner: device.owner
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'GPS data saved and geofences checked successfully',
        id: result._id,
        deviceOwner: device.owner,
        geofenceChecked: body.gpsValid
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Error processing GPS data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'GPS Tracker API endpoint with Geofencing - Main System',
    status: 'active',
    features: ['gps_tracking', 'geofencing', 'battery_monitoring', 'alerts']
  })
}