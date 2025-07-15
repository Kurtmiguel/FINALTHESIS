// app/api/alerts/route.ts - Fixed TypeScript Issues
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import Alert, { IAlert } from '@/models/Alert';
import { authOptions } from '../auth/[...nextauth]/route';
import { Types } from 'mongoose';

// Define proper populated types
interface PopulatedDog {
  _id: Types.ObjectId;
  name: string;
  breed: string;
  imageUrl?: string;
}

interface PopulatedGeofence {
  _id: Types.ObjectId;
  name: string;
  geofenceType: string;
}

interface PopulatedAlert extends Omit<IAlert, 'dogId' | 'geofenceId'> {
  _id: Types.ObjectId;
  dogId: PopulatedDog;
  geofenceId?: PopulatedGeofence;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dogId = searchParams.get('dogId');
    const deviceId = searchParams.get('deviceId');
    const isRead = searchParams.get('isRead');
    const alertType = searchParams.get('alertType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    await dbConnect();
    
    let query: any = { owner: session.user.id };
    
    if (dogId) {
      query.dogId = dogId;
    }
    
    if (deviceId) {
      query.deviceId = deviceId;
    }

    if (isRead !== null) {
      query.isRead = isRead === 'true';
    }

    if (alertType) {
      query.alertType = alertType;
    }

    const skip = (page - 1) * limit;

    // Fix: Use proper typing without type assertion on the query itself
    const [alerts, totalCount, unreadCount] = await Promise.all([
      Alert.find(query)
        .populate('dogId', 'name breed imageUrl')
        .populate('geofenceId', 'name geofenceType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Alert.countDocuments(query),
      Alert.countDocuments({ ...query, isRead: false })
    ]);

    // Type the result properly after the query
    const typedAlerts = alerts as unknown as PopulatedAlert[];

    const alertData = typedAlerts.map(alert => ({
      _id: alert._id.toString(),
      alertType: alert.alertType,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      isRead: alert.isRead,
      deviceId: alert.deviceId,
      dogId: alert.dogId._id.toString(),
      dogName: alert.dogId.name,
      dogBreed: alert.dogId.breed,
      dogImageUrl: alert.dogId.imageUrl,
      geofenceId: alert.geofenceId?._id.toString(),
      geofenceName: alert.geofenceId?.name,
      geofenceType: alert.geofenceId?.geofenceType,
      coordinates: alert.coordinates,
      metadata: alert.metadata,
      createdAt: alert.createdAt.toISOString(),
      readAt: alert.readAt?.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
      isResolved: alert.isResolved
    }));

    return NextResponse.json({
      alerts: alertData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        unreadCount,
        hasMore: skip + alerts.length < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Mark multiple alerts as read
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { alertIds, markAsRead = true } = await req.json();

    if (!alertIds || !Array.isArray(alertIds)) {
      return NextResponse.json(
        { error: 'alertIds array is required' },
        { status: 400 }
      );
    }

    const updateData: any = { 
      isRead: markAsRead 
    };

    if (markAsRead) {
      updateData.readAt = new Date();
    } else {
      updateData.$unset = { readAt: 1 };
    }

    const result = await Alert.updateMany(
      { 
        _id: { $in: alertIds }, 
        owner: session.user.id 
      },
      updateData
    );

    return NextResponse.json({
      message: `${result.modifiedCount} alerts updated`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}