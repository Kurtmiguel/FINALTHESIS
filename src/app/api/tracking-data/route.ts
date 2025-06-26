import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'  // Use your existing db.ts
import TrackingData from '@/models/TrackingData'  // Mongoose model
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    // Check authentication for user-specific queries
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const latest = searchParams.get('latest') === 'true'
    
    // If no specific deviceId is provided, use the default from the original GPS tracker
    const targetDeviceId = deviceId || 'dog-collar-001'

    // Connect to database using your existing dbConnect
    await dbConnect()

    let query = { deviceId: targetDeviceId }
    
    if (latest) {
      // Get only the latest record using mongoose
      const latestData = await TrackingData
        .findOne(query)
        .sort({ createdAt: -1 })
        .lean()
      
      return NextResponse.json({
        success: true,
        data: latestData,
        count: latestData ? 1 : 0
      })
    } else {
      // Get historical data using mongoose
      const data = await TrackingData
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()

      return NextResponse.json({
        success: true,
        data: data,
        count: data.length
      })
    }

  } catch (error) {
    console.error('Error fetching tracking data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking data' },
      { status: 500 }
    )
  }
}

// Also add a new endpoint to get tracking data for all user's devices
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { deviceIds } = body // Array of device IDs to fetch data for

    if (!deviceIds || !Array.isArray(deviceIds)) {
      return NextResponse.json(
        { error: 'deviceIds array is required' },
        { status: 400 }
      )
    }

    // Connect to database using your existing dbConnect
    await dbConnect()

    // Get latest data for each device using mongoose
    const trackingData = await Promise.all(
      deviceIds.map(async (deviceId: string) => {
        const latest = await TrackingData
          .findOne({ deviceId })
          .sort({ createdAt: -1 })
          .lean()
        return { deviceId, data: latest }
      })
    )

    return NextResponse.json({
      success: true,
      data: trackingData,
      count: trackingData.length
    })

  } catch (error) {
    console.error('Error fetching multiple device tracking data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking data' },
      { status: 500 }
    )
  }
}