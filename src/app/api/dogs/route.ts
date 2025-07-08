import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import { NewDogData, DogData } from '@/lib/schemas';
import Dog, { IDog } from '@/models/Dog';
import Device from '@/models/Device';
import { authOptions } from '../auth/[...nextauth]/route';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Get dogs with populated device information
    const dogs = await Dog.find({ owner: session.user.id })
      .populate('assignedDevice')
      .lean() as (IDog & { 
        _id: Types.ObjectId, 
        assignedDevice?: {
          _id: Types.ObjectId;
          deviceId: string;
          name: string;
          isActive: boolean;
          lastSeen?: Date;
          batteryLevel?: number;
        } 
      })[];
    
    // Get latest tracking data for devices if available
    const dogsWithDeviceInfo = await Promise.all(
      dogs.map(async (dog) => {
        const dogData: DogData = {
          _id: dog._id.toString(),
          name: dog.name,
          gender: dog.gender,
          age: dog.age,
          breed: dog.breed,
          birthday: dog.birthday.toISOString().split('T')[0],
          imageUrl: dog.imageUrl,
          collarActivated: dog.collarActivated,
          owner: dog.owner,
          assignedDevice: dog.assignedDevice?._id?.toString(),
        };

        // If dog has an assigned device, include device info
        if (dog.assignedDevice) {
          dogData.deviceInfo = {
            deviceId: dog.assignedDevice.deviceId,
            name: dog.assignedDevice.name,
            isActive: dog.assignedDevice.isActive,
            lastSeen: dog.assignedDevice.lastSeen?.toISOString(),
            batteryLevel: dog.assignedDevice.batteryLevel,
          };
        }

        return dogData;
      })
    );
    
    return NextResponse.json(dogsWithDeviceInfo);
  } catch (error) {
    console.error('Error fetching dogs:', error);
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
    const newDog: NewDogData = await req.json();
    
    let assignedDeviceId = null;
    
    // If device info is provided, find or create the device
    if (newDog.deviceInfo && newDog.collarActivated) {
      const device = await Device.findOne({ 
        deviceId: newDog.deviceInfo.deviceId,
        owner: session.user.id 
      });
      
      if (!device) {
        return NextResponse.json(
          { error: 'Device not found. Please register the device first.' },
          { status: 400 }
        );
      }
      
      assignedDeviceId = device._id;
      
      // Update device to show it's assigned to this dog
      await Device.findByIdAndUpdate(device._id, {
        assignedDog: null // Will be updated after dog is created
      });
    }
    
    const dog = new Dog({
      name: newDog.name,
      gender: newDog.gender,
      age: newDog.age,
      breed: newDog.breed,
      birthday: new Date(newDog.birthday),
      imageUrl: newDog.imageUrl,
      collarActivated: newDog.collarActivated,
      assignedDevice: assignedDeviceId,
      owner: session.user.id
    });
    
    await dog.save();
    
    // Update device to reference this dog
    if (assignedDeviceId) {
      await Device.findByIdAndUpdate(assignedDeviceId, {
        assignedDog: dog._id
      });
    }
    
    const createdDog: DogData = {
      _id: dog._id.toString(),
      name: dog.name,
      gender: dog.gender,
      age: dog.age,
      breed: dog.breed,
      birthday: dog.birthday.toISOString().split('T')[0],
      imageUrl: dog.imageUrl,
      collarActivated: dog.collarActivated,
      assignedDevice: dog.assignedDevice?.toString(),
      owner: dog.owner
    };
    
    // Include device info if available
    if (newDog.deviceInfo) {
      createdDog.deviceInfo = {
        deviceId: newDog.deviceInfo.deviceId,
        name: newDog.deviceInfo.name,
        isActive: true,
      };
    }
    
    return NextResponse.json(createdDog, { status: 201 });
  } catch (error) {
    console.error('Error creating dog profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}