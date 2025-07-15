// app/api/alerts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import Alert from '@/models/Alert';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const alert = await Alert.findOne({ 
      _id: params.id, 
      owner: session.user.id 
    })
    .populate('dogId', 'name breed imageUrl')
    .populate('geofenceId', 'name geofenceType');

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const responseData = {
      _id: alert._id.toString(),
      alertType: alert.alertType,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      isRead: alert.isRead,
      deviceId: alert.deviceId,
      dogId: alert.dogId._id.toString(),
      dogName: (alert.dogId as any).name,
      dogBreed: (alert.dogId as any).breed,
      dogImageUrl: (alert.dogId as any).imageUrl,
      geofenceId: alert.geofenceId?._id.toString(),
      geofenceName: (alert.geofenceId as any)?.name,
      geofenceType: (alert.geofenceId as any)?.geofenceType,
      coordinates: alert.coordinates,
      metadata: alert.metadata,
      createdAt: alert.createdAt.toISOString(),
      readAt: alert.readAt?.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
      isResolved: alert.isResolved
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { isRead, isResolved } = await req.json();
    
    const updateData: any = {};
    
    if (typeof isRead === 'boolean') {
      updateData.isRead = isRead;
      if (isRead) {
        updateData.readAt = new Date();
      } else {
        updateData.$unset = { readAt: 1 };
      }
    }
    
    if (typeof isResolved === 'boolean') {
      updateData.isResolved = isResolved;
      if (isResolved) {
        updateData.resolvedAt = new Date();
        // Auto-mark as read when resolved
        updateData.isRead = true;
        updateData.readAt = new Date();
      } else {
        if (!updateData.$unset) updateData.$unset = {};
        updateData.$unset.resolvedAt = 1;
      }
    }

    const alert = await Alert.findOneAndUpdate(
      { _id: params.id, owner: session.user.id },
      updateData,
      { new: true }
    )
    .populate('dogId', 'name breed imageUrl')
    .populate('geofenceId', 'name geofenceType');

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const responseData = {
      _id: alert._id.toString(),
      alertType: alert.alertType,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      isRead: alert.isRead,
      deviceId: alert.deviceId,
      dogId: alert.dogId._id.toString(),
      dogName: (alert.dogId as any).name,
      dogBreed: (alert.dogId as any).breed,
      dogImageUrl: (alert.dogId as any).imageUrl,
      geofenceId: alert.geofenceId?._id.toString(),
      geofenceName: (alert.geofenceId as any)?.name,
      geofenceType: (alert.geofenceId as any)?.geofenceType,
      coordinates: alert.coordinates,
      metadata: alert.metadata,
      createdAt: alert.createdAt.toISOString(),
      readAt: alert.readAt?.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
      isResolved: alert.isResolved
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const alert = await Alert.findOneAndDelete({ 
      _id: params.id, 
      owner: session.user.id 
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Alert deleted successfully',
      deletedId: alert._id.toString()
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}