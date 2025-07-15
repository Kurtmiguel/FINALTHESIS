// app/api/geofences/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import Geofence from '@/models/Geofence';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const geofence = await Geofence.findOne({ 
      _id: params.id, 
      owner: session.user.id 
    }).populate('dogId', 'name breed');

    if (!geofence) {
      return NextResponse.json({ error: 'Geofence not found' }, { status: 404 });
    }

    const responseData = {
      _id: geofence._id.toString(),
      name: geofence.name,
      centerLatitude: geofence.centerLatitude,
      centerLongitude: geofence.centerLongitude,
      radius: geofence.radius,
      geofenceType: geofence.geofenceType,
      isActive: geofence.isActive,
      deviceId: geofence.deviceId,
      dogId: geofence.dogId._id.toString(),
      dogName: (geofence.dogId as any).name,
      dogBreed: (geofence.dogId as any).breed,
      owner: geofence.owner,
      alertsEnabled: geofence.alertsEnabled,
      description: geofence.description,
      createdAt: geofence.createdAt.toISOString(),
      updatedAt: geofence.updatedAt.toISOString()
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching geofence:', error);
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
    
    const updateData = await req.json();
    
    // Validate radius if provided
    if (updateData.radius) {
      const maxRadius = 18; // 60 feet standard
      if (updateData.radius > maxRadius) {
        return NextResponse.json(
          { error: `Radius cannot exceed ${maxRadius}m (60 feet)` },
          { status: 400 }
        );
      }
    }

    const geofence = await Geofence.findOneAndUpdate(
      { _id: params.id, owner: session.user.id },
      updateData,
      { new: true, runValidators: true }
    ).populate('dogId', 'name breed');

    if (!geofence) {
      return NextResponse.json({ error: 'Geofence not found' }, { status: 404 });
    }

    const responseData = {
      _id: geofence._id.toString(),
      name: geofence.name,
      centerLatitude: geofence.centerLatitude,
      centerLongitude: geofence.centerLongitude,
      radius: geofence.radius,
      geofenceType: geofence.geofenceType,
      isActive: geofence.isActive,
      deviceId: geofence.deviceId,
      dogId: geofence.dogId._id.toString(),
      dogName: (geofence.dogId as any).name,
      dogBreed: (geofence.dogId as any).breed,
      owner: geofence.owner,
      alertsEnabled: geofence.alertsEnabled,
      description: geofence.description,
      createdAt: geofence.createdAt.toISOString(),
      updatedAt: geofence.updatedAt.toISOString()
    };

    console.log(`✅ Geofence updated: ${geofence.name} for ${(geofence.dogId as any).name}`);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating geofence:', error);
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
    
    const geofence = await Geofence.findOneAndDelete({ 
      _id: params.id, 
      owner: session.user.id 
    });

    if (!geofence) {
      return NextResponse.json({ error: 'Geofence not found' }, { status: 404 });
    }

    console.log(`🗑️ Geofence deleted: ${geofence.name}`);

    return NextResponse.json({ 
      message: 'Geofence deleted successfully',
      deletedId: geofence._id.toString()
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting geofence:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}