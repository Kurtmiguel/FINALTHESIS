import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import TrackingData from '@/models/TrackingData'
import Device from '@/models/Device'
import { headers } from 'next/headers'

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

    // Log successful data reception
    console.log(`GPS data received from ${body.deviceId}:`, {
      coordinates: `${body.latitude}, ${body.longitude}`,
      gpsValid: body.gpsValid,
      battery: `${body.battery}%`,
      timestamp: body.timestamp,
      owner: device.owner
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'GPS data saved successfully',
        id: result._id,
        deviceOwner: device.owner
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error saving GPS data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'GPS Tracker API endpoint - Main System',
    status: 'active'
  })
}