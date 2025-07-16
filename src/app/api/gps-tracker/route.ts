// app/api/gps-tracker/route.ts - Enhanced with Geofencing
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import TrackingData from '@/models/TrackingData'
import Device from '@/models/Device'
import '@/models/Users' 
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
    console.log('📡 [GPS-API] Received GPS data from device');
    
    // Verify API key
    const headersList = await headers()
    const apiKey = headersList.get('x-api-key')
    
    if (apiKey !== process.env.GPS_API_KEY) {
      console.log('❌ [GPS-API] Unauthorized access attempt with invalid API key');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📋 [GPS-API] Request body:', {
      deviceId: body.deviceId,
      latitude: body.latitude,
      longitude: body.longitude,
      gpsValid: body.gpsValid,
      battery: body.battery,
      timestamp: body.timestamp
    });
    
    // Validate required fields
    const requiredFields = ['deviceId', 'latitude', 'longitude', 'gpsValid', 'battery', 'timestamp']
    for (const field of requiredFields) {
      if (!(field in body)) {
        console.log(`❌ [GPS-API] Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Connect to database
    await dbConnect()
    console.log('✅ [GPS-API] Database connected');

    // Find the device and validate it exists and is active
    console.log(`🔍 [GPS-API] Looking for device: ${body.deviceId}`);
    
    const device = await Device.findOne({ 
      deviceId: body.deviceId,
      isActive: true 
    }).populate('owner', 'email fullName') // This works because User schema is registered above

    if (!device) {
      console.log(`❌ [GPS-API] Device not found or inactive: ${body.deviceId}`);
      return NextResponse.json(
        { error: 'Device not found or inactive' },
        { status: 404 }
      )
    }

    console.log('✅ [GPS-API] Device found:', {
      deviceId: device.deviceId,
      deviceName: device.name,
      owner: device.owner ? (device.owner as any).email : 'Unknown',
      isActive: device.isActive
    });

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
    console.log('💾 [GPS-API] Saving tracking data to database');
    const result = await trackingData.save()
    console.log('✅ [GPS-API] Tracking data saved with ID:', result._id);

    // Update device's last seen and battery level
    console.log('🔄 [GPS-API] Updating device last seen and battery level');
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
    console.log(`✅ [GPS-API] GPS data processed successfully for ${body.deviceId}:`, {
      coordinates: `${body.latitude}, ${body.longitude}`,
      gpsValid: body.gpsValid,
      battery: `${body.battery}%`,
      timestamp: body.timestamp,
      geofenceChecked: body.gpsValid,
      owner: device.owner ? (device.owner as any).email : 'Unknown'
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'GPS data saved and geofences checked successfully',
        id: result._id,
        deviceId: body.deviceId,
        timestamp: new Date().toISOString(),
        geofenceChecked: body.gpsValid
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ [GPS-API] Error processing GPS data:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('MissingSchemaError')) {
        console.error('❌ [GPS-API] Schema registration error - ensure all models are properly imported');
      } else if (error.message.includes('validation')) {
        console.error('❌ [GPS-API] Data validation error:', error.message);
        return NextResponse.json(
          { error: 'Invalid data format', details: error.message },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process GPS data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Connect to database to test connection
    await dbConnect()
    
    return NextResponse.json({ 
      message: 'GPS Tracker API endpoint with Geofencing - Main System',
      status: 'active',
      timestamp: new Date().toISOString(),
      features: ['gps_tracking', 'geofencing', 'battery_monitoring', 'alerts'],
      endpoints: {
        POST: 'Receive GPS data from devices with geofencing',
        GET: 'Health check'
      }
    })
  } catch (error) {
    console.error('❌ [GPS-API] Health check failed:', error);
    return NextResponse.json({
      message: 'GPS Tracker API endpoint - Main System', 
      status: 'error',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}