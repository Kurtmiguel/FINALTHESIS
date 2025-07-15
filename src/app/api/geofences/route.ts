// app/api/geofences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import Geofence, { IGeofence } from '@/models/Geofence';
import Dog from '@/models/Dog';
import Device from '@/models/Device';
import { authOptions } from '../auth/[...nextauth]/route';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dogId = searchParams.get('dogId');
    const deviceId = searchParams.get('deviceId');

    await dbConnect();
    
    let query: any = { owner: session.user.id };
    
    if (dogId) {
      query.dogId = dogId;
    }
    
    if (deviceId) {
      query.deviceId = deviceId;
    }

    const geofences = await Geofence.find(query)
      .populate('dogId', 'name breed')
      .sort({ createdAt: -1 })
      .lean() as (IGeofence & { 
        _id: Types.ObjectId, 
        dogId: { _id: Types.ObjectId; name: string; breed: string } 
      })[];

    const geofenceData = geofences.map(geofence => ({
      _id: geofence._id.toString(),
      name: geofence.name,
      centerLatitude: geofence.centerLatitude,
      centerLongitude: geofence.centerLongitude,
      radius: geofence.radius,
      geofenceType: geofence.geofenceType,
      isActive: geofence.isActive,
      deviceId: geofence.deviceId,
      dogId: geofence.dogId._id.toString(),
      dogName: geofence.dogId.name,
      dogBreed: geofence.dogId.breed,
      owner: geofence.owner,
      alertsEnabled: geofence.alertsEnabled,
      description: geofence.description,
      createdAt: geofence.createdAt.toISOString(),
      updatedAt: geofence.updatedAt.toISOString()
    }));

    return NextResponse.json(geofenceData);
  } catch (error) {
    console.error('Error fetching geofences:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const {
      name,
      centerLatitude,
      centerLongitude,
      radius,
      geofenceType = 'outdoor',
      deviceId,
      dogId,
      alertsEnabled = true,
      description
    } = await req.json();

    // Validation
    if (!name || !centerLatitude || !centerLongitude || !radius || !deviceId || !dogId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify dog belongs to user
    const dog = await Dog.findOne({ _id: dogId, owner: session.user.id });
    if (!dog) {
      return NextResponse.json(
        { error: 'Dog not found or access denied' },
        { status: 404 }
      );
    }

    // Verify device belongs to user and is assigned to the dog
    const device = await Device.findOne({ 
      deviceId: deviceId, 
      owner: session.user.id,
      assignedDog: dogId 
    });
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found or not assigned to this dog' },
        { status: 404 }
      );
    }

    // Validate radius based on 60 feet standard
    const maxRadius = 18; // 60 feet
    if (radius > maxRadius) {
      return NextResponse.json(
        { error: `Radius cannot exceed ${maxRadius}m (60 feet)` },
        { status: 400 }
      );
    }

    // Check if there's already an active geofence for this device
    const existingGeofence = await Geofence.findOne({
      deviceId: deviceId,
      isActive: true
    });

    if (existingGeofence) {
      return NextResponse.json(
        { error: 'Device already has an active geofence. Please deactivate it first.' },
        { status: 400 }
      );
    }

    const geofence = new Geofence({
      name,
      centerLatitude,
      centerLongitude,
      radius,
      geofenceType,
      deviceId,
      dogId,
      owner: session.user.id,
      alertsEnabled,
      description
    });

    await geofence.save();

    // Populate dog information for response
    await geofence.populate('dogId', 'name breed');

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

    console.log(`✅ Geofence created: ${name} for ${(geofence.dogId as any).name} (${geofenceType}, ${radius}m)`);

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Error creating geofence:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}