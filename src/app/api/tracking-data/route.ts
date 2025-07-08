// app/api/tracking-data/route.ts - Enhanced with debugging
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import TrackingData from '@/models/TrackingData'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] Tracking-data API called')
    
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const latest = searchParams.get('latest') === 'true'
    
    console.log('📋 [DEBUG] Query params:', { deviceId, limit, latest })
    
    // If no specific deviceId is provided, use the default from the original GPS tracker
    const targetDeviceId = deviceId || 'dog-collar-001'
    console.log('🎯 [DEBUG] Target device ID:', targetDeviceId)

    // Connect to database using your existing dbConnect
    await dbConnect()
    console.log('✅ [DEBUG] Database connected')

    let query = { deviceId: targetDeviceId }
    console.log('🔎 [DEBUG] MongoDB query:', query)
    
    if (latest) {
      // Get only the latest record using mongoose
      console.log('📡 [DEBUG] Fetching latest record...')
      const latestData = await TrackingData
        .findOne(query)
        .sort({ createdAt: -1 })
        .lean()
      
      console.log('📊 [DEBUG] Latest data found:', latestData ? 'YES' : 'NO')
      if (latestData) {
        console.log('📍 [DEBUG] GPS Valid:', latestData.gpsValid)
        console.log('🔋 [DEBUG] Battery:', latestData.battery)
        console.log('📅 [DEBUG] Timestamp:', latestData.timestamp)
        console.log('🆔 [DEBUG] Device ID:', latestData.deviceId)
      }
      
      return NextResponse.json({
        success: true,
        data: latestData,
        count: latestData ? 1 : 0,
        debug: {
          requestedDeviceId: deviceId,
          targetDeviceId,
          query,
          foundData: !!latestData
        }
      })
    } else {
      // Get historical data using mongoose
      console.log('📈 [DEBUG] Fetching historical data...')
      const data = await TrackingData
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()

      console.log('📊 [DEBUG] Historical data count:', data.length)

      return NextResponse.json({
        success: true,
        data: data,
        count: data.length,
        debug: {
          requestedDeviceId: deviceId,
          targetDeviceId,
          query,
          foundCount: data.length
        }
      })
    }

  } catch (error) {
    console.error('❌ [DEBUG] Error fetching tracking data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch tracking data',
        debug: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      },
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