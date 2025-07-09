// app/api/tracking-data/history/route.ts
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import TrackingData from '@/models/TrackingData'
import Device from '@/models/Device'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '1000')

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 [DEBUG] History API called:', { deviceId, startDate, endDate, limit })

    await dbConnect()

    // Verify the device belongs to the current user
    const device = await Device.findOne({ 
      deviceId: deviceId,
      owner: session.user.id 
    })

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found or access denied' },
        { status: 404 }
      )
    }

    // Build the query
    let query: any = { 
      deviceId: deviceId,
      gpsValid: true, // Only get valid GPS data
      latitude: { $ne: 0 }, // Exclude zero latitude
      longitude: { $ne: 0 } // Exclude zero longitude
    }

    // Add date range if provided
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }

    console.log('🔎 [DEBUG] MongoDB history query:', query)

    // Fetch historical data, sorted by creation time
    const historicalData = await TrackingData
      .find(query)
      .sort({ createdAt: 1 }) // Ascending order for path tracing
      .limit(limit)
      .select('latitude longitude timestamp createdAt battery gpsValid')
      .lean()

    console.log('📊 [DEBUG] Historical data found:', historicalData.length, 'points')

    // Filter out any remaining invalid coordinates and format the data
    const validData = historicalData.filter(point => 
      point.latitude !== 0 && 
      point.longitude !== 0 && 
      point.gpsValid &&
      Math.abs(point.latitude) <= 90 &&
      Math.abs(point.longitude) <= 180
    )

    console.log('✅ [DEBUG] Valid GPS points after filtering:', validData.length)

    // Group data by date for better organization
    const groupedByDate = validData.reduce((acc: any, point) => {
      const date = new Date(point.createdAt).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push({
        latitude: point.latitude,
        longitude: point.longitude,
        timestamp: point.timestamp,
        createdAt: point.createdAt,
        battery: point.battery
      })
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      deviceId: deviceId,
      totalPoints: validData.length,
      dateRange: {
        start: startDate,
        end: endDate
      },
      data: validData,
      groupedByDate: groupedByDate,
      summary: {
        firstPoint: validData.length > 0 ? validData[0] : null,
        lastPoint: validData.length > 0 ? validData[validData.length - 1] : null,
        datesWithData: Object.keys(groupedByDate)
      }
    })

  } catch (error) {
    console.error('❌ [DEBUG] Error fetching historical tracking data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch historical tracking data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}