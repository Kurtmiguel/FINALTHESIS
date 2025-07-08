import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import { NewDeviceData, DeviceData } from '@/lib/schemas';
import Device, { IDevice } from '@/models/Device';
import Dog from '@/models/Dog';
import { authOptions } from '../auth/[...nextauth]/route';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Get devices with populated dog information
    const devices = await Device.find({ owner: session.user.id })
      .populate('assignedDog', 'name')
      .lean() as (IDevice & { _id: Types.ObjectId, assignedDog?: { name: string } })[];
    
    const deviceData: DeviceData[] = devices.map(device => ({
      _id: device._id.toString(),
      deviceId: device.deviceId,
      name: device.name,
      isActive: device.isActive,
      owner: device.owner,
      assignedDog: device.assignedDog?._id?.toString(),
      assignedDogName: device.assignedDog?.name,
      registrationDate: device.registrationDate.toISOString(),
      lastSeen: device.lastSeen?.toISOString(),
      batteryLevel: device.batteryLevel,
      firmwareVersion: device.firmwareVersion || "1.0.0", // Provide default
    }));
    
    return NextResponse.json(deviceData);
  } catch (error) {
    console.error('Error fetching devices:', error);
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
    const newDevice: NewDeviceData = await req.json();
    
    // Check if device ID already exists
    const existingDevice = await Device.findOne({ deviceId: newDevice.deviceId });
    if (existingDevice) {
      return NextResponse.json(
        { error: 'Device ID already exists' }, 
        { status: 400 }
      );
    }
    
    const device = new Device({
      ...newDevice,
      owner: session.user.id,
      registrationDate: new Date(),
      firmwareVersion: newDevice.firmwareVersion || "1.0.0", // Ensure default
    });
    
    await device.save();
    
    const createdDevice: DeviceData = {
      _id: device._id.toString(),
      deviceId: device.deviceId,
      name: device.name,
      isActive: device.isActive,
      owner: device.owner,
      assignedDog: device.assignedDog?.toString(),
      registrationDate: device.registrationDate.toISOString(),
      lastSeen: device.lastSeen?.toISOString(),
      batteryLevel: device.batteryLevel,
      firmwareVersion: device.firmwareVersion || "1.0.0", // Provide default
    };
    
    return NextResponse.json(createdDevice, { status: 201 });
  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}