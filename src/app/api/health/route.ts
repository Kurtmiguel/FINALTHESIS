import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import mongoose from 'mongoose'

export async function GET() {
  try {
    // Test database connection using your existing dbConnect
    await dbConnect()
    
    // Check if the connection is ready
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected')
    }
    
    return NextResponse.json(
      { 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        dbName: mongoose.connection.db?.databaseName || 'unknown'
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      },
      { status: 500 }
    )
  }
}