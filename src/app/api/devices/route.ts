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
      firmwareVersion: device.firmwareVersion || "1.0.0",
    }));
    
    return NextResponse.json(deviceData);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔧 [API] Device registration request received');
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log('❌ [API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [API] User authenticated:', session.user.email);

    await dbConnect();
    console.log('✅ [API] Database connected');
    
    const requestBody = await req.json();
    console.log('📝 [API] Request body received:', requestBody);
    
    // Validate required fields
    if (!requestBody.deviceId || !requestBody.name) {
      console.log('❌ [API] Missing required fields');
      return NextResponse.json(
        { error: 'Device ID and name are required' }, 
        { status: 400 }
      );
    }
    
    // Sanitize and validate device ID
    const deviceId = requestBody.deviceId.trim();
    const name = requestBody.name.trim();
    
    if (deviceId.length < 3) {
      return NextResponse.json(
        { error: 'Device ID must be at least 3 characters long' }, 
        { status: 400 }
      );
    }
    
    // Check device ID format
    const deviceIdPattern = /^[a-zA-Z0-9\-_]+$/;
    if (!deviceIdPattern.test(deviceId)) {
      return NextResponse.json(
        { error: 'Device ID can only contain letters, numbers, hyphens, and underscores' }, 
        { status: 400 }
      );
    }
    
    const newDevice: NewDeviceData = {
      deviceId: deviceId,
      name: name,
      isActive: requestBody.isActive !== undefined ? requestBody.isActive : true,
      firmwareVersion: requestBody.firmwareVersion || "1.0.0",
    };
    
    console.log('🔍 [API] Checking for existing device with ID:', deviceId);
    
    // Check if device ID already exists (globally, not just for this user)
    const existingDevice = await Device.findOne({ deviceId: deviceId });
    if (existingDevice) {
      console.log('❌ [API] Device ID already exists:', {
        deviceId: deviceId,
        existingOwner: existingDevice.owner,
        currentUser: session.user.id,
        isOwnDevice: existingDevice.owner.toString() === session.user.id
      });
      
      // Check if the existing device belongs to the current user
      if (existingDevice.owner.toString() === session.user.id) {
        return NextResponse.json(
          { 
            error: `You have already registered a device with ID "${deviceId}". Each device must have a unique ID.`,
            code: 'DEVICE_ALREADY_REGISTERED_BY_USER'
          }, 
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { 
            error: `Device ID "${deviceId}" is already registered by another user. Please choose a different Device ID.`,
            code: 'DEVICE_ID_TAKEN'
          }, 
          { status: 400 }
        );
      }
    }
    
    console.log('✅ [API] Device ID is available, creating new device');
    
    const device = new Device({
      ...newDevice,
      owner: session.user.id,
      registrationDate: new Date(),
    });
    
    console.log('💾 [API] Saving device to database');
    const savedDevice = await device.save();
    console.log('✅ [API] Device saved successfully:', savedDevice._id);
    
    const createdDevice: DeviceData = {
      _id: savedDevice._id.toString(),
      deviceId: savedDevice.deviceId,
      name: savedDevice.name,
      isActive: savedDevice.isActive,
      owner: savedDevice.owner,
      assignedDog: savedDevice.assignedDog?.toString(),
      registrationDate: savedDevice.registrationDate.toISOString(),
      lastSeen: savedDevice.lastSeen?.toISOString(),
      batteryLevel: savedDevice.batteryLevel,
      firmwareVersion: savedDevice.firmwareVersion || "1.0.0",
    };
    
    console.log('🎉 [API] Device registration completed successfully:', {
      deviceId: createdDevice.deviceId,
      owner: session.user.email,
      deviceDbId: createdDevice._id
    });
    
    return NextResponse.json(createdDevice, { status: 201 });
    
  } catch (error) {
    console.error('❌ [API] Error creating device:', error);
    
    // Handle specific MongoDB errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { 
          error: 'Device ID already exists. Please choose a different Device ID.',
          code: 'DUPLICATE_DEVICE_ID'
        }, 
        { status: 400 }
      );
    }
    
    // Handle validation errors
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { 
          error: 'Invalid device data. Please check all required fields.',
          details: error.message
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error. Please try again.',
        code: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    );
  }
}