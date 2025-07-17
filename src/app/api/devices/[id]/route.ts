import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import Device from '@/models/Device';
import Dog from '@/models/Dog';
import Geofence from '@/models/Geofence';
import Alert from '@/models/Alert';
import TrackingData from '@/models/TrackingData';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const device = await Device.findOne({ 
      _id: params.id, 
      owner: session.user.id 
    }).populate('assignedDog', 'name breed');

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const deviceData = {
      _id: device._id.toString(),
      deviceId: device.deviceId,
      name: device.name,
      isActive: device.isActive,
      owner: device.owner,
      assignedDog: device.assignedDog?._id?.toString(),
      assignedDogName: (device.assignedDog as any)?.name,
      registrationDate: device.registrationDate.toISOString(),
      lastSeen: device.lastSeen?.toISOString(),
      batteryLevel: device.batteryLevel,
      firmwareVersion: device.firmwareVersion || "1.0.0",
    };

    return NextResponse.json(deviceData);
  } catch (error) {
    console.error('Error fetching device:', error);
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
    
    const device = await Device.findOneAndUpdate(
      { _id: params.id, owner: session.user.id },
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedDog', 'name breed');

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const deviceData = {
      _id: device._id.toString(),
      deviceId: device.deviceId,
      name: device.name,
      isActive: device.isActive,
      owner: device.owner,
      assignedDog: device.assignedDog?._id?.toString(),
      assignedDogName: (device.assignedDog as any)?.name,
      registrationDate: device.registrationDate.toISOString(),
      lastSeen: device.lastSeen?.toISOString(),
      batteryLevel: device.batteryLevel,
      firmwareVersion: device.firmwareVersion || "1.0.0",
    };

    return NextResponse.json(deviceData);
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🗑️ [API] Device deletion request received for ID:', params.id);
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log('❌ [API] Unauthorized deletion attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [API] User authenticated:', session.user.email);

    await dbConnect();
    console.log('✅ [API] Database connected');

    // Find the device first to ensure it exists and belongs to the user
    const device = await Device.findOne({ 
      _id: params.id, 
      owner: session.user.id 
    }).populate('assignedDog', 'name breed');

    if (!device) {
      console.log('❌ [API] Device not found or access denied');
      return NextResponse.json({ error: 'Device not found or access denied' }, { status: 404 });
    }

    console.log('🔍 [API] Device found:', {
      deviceId: device.deviceId,
      name: device.name,
      owner: session.user.email,
      assignedDog: device.assignedDog ? (device.assignedDog as any).name : 'None'
    });

    // Start a transaction-like cleanup process
    console.log('🧹 [API] Starting cleanup process...');

    // 1. Remove device reference from assigned dog
    if (device.assignedDog) {
      console.log('🐕 [API] Removing device assignment from dog:', (device.assignedDog as any).name);
      await Dog.findByIdAndUpdate(device.assignedDog, {
        $unset: { assignedDevice: "" },
        collarActivated: false
      });
      console.log('✅ [API] Dog assignment removed');
    }

    // 2. Delete all geofences associated with this device
    console.log('🛡️ [API] Deleting geofences for device:', device.deviceId);
    const geofenceDeleteResult = await Geofence.deleteMany({ 
      deviceId: device.deviceId 
    });
    console.log('✅ [API] Geofences deleted:', geofenceDeleteResult.deletedCount);

    // 3. Delete all alerts associated with this device
    console.log('🚨 [API] Deleting alerts for device:', device.deviceId);
    const alertDeleteResult = await Alert.deleteMany({ 
      deviceId: device.deviceId 
    });
    console.log('✅ [API] Alerts deleted:', alertDeleteResult.deletedCount);

    // 4. Delete all tracking data associated with this device
    console.log('📍 [API] Deleting tracking data for device:', device.deviceId);
    const trackingDeleteResult = await TrackingData.deleteMany({ 
      deviceId: device.deviceId 
    });
    console.log('✅ [API] Tracking data deleted:', trackingDeleteResult.deletedCount);

    // 5. Finally, delete the device itself
    console.log('📱 [API] Deleting device from database...');
    await Device.findByIdAndDelete(params.id);
    console.log('✅ [API] Device deleted successfully');

    // Log the complete cleanup summary
    console.log('🎉 [API] Device deletion completed successfully:', {
      deviceId: device.deviceId,
      deviceName: device.name,
      owner: session.user.email,
      geofencesDeleted: geofenceDeleteResult.deletedCount,
      alertsDeleted: alertDeleteResult.deletedCount,
      trackingDataDeleted: trackingDeleteResult.deletedCount,
      dogAssignmentRemoved: !!device.assignedDog
    });

    return NextResponse.json({ 
      message: 'Device and all associated data deleted successfully',
      deletedDevice: {
        deviceId: device.deviceId,
        name: device.name
      },
      cleanup: {
        geofencesDeleted: geofenceDeleteResult.deletedCount,
        alertsDeleted: alertDeleteResult.deletedCount,
        trackingDataDeleted: trackingDeleteResult.deletedCount,
        dogAssignmentRemoved: !!device.assignedDog
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ [API] Error deleting device:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Cast to ObjectId failed')) {
        return NextResponse.json(
          { error: 'Invalid device ID format' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error. Failed to delete device.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}