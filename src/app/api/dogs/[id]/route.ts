import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import Dog, { IDog } from '@/models/Dog';
import { UpdateDogData, DogData } from '@/lib/schemas';
import { authOptions } from '../../auth/[...nextauth]/route';
import { Types } from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        
        // FIXED: Added populate and lean for device information
        const dog = await Dog.findOne({ 
            _id: params.id, 
            owner: session.user.id 
        })
        .populate('assignedDevice')
        .lean() as IDog & { 
            _id: Types.ObjectId, 
            assignedDevice?: {
                _id: Types.ObjectId;
                deviceId: string;
                name: string;
                isActive: boolean;
                lastSeen?: Date;
                batteryLevel?: number;
            } 
        };

        if (!dog) {
            return NextResponse.json({ error: 'Dog profile not found' }, { status: 404 });
        }

        // FIXED: Transform response to match main API format
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

        // FIXED: Include device info if available - THIS WAS MISSING!
        if (dog.assignedDevice) {
            dogData.deviceInfo = {
                deviceId: dog.assignedDevice.deviceId,
                name: dog.assignedDevice.name,
                isActive: dog.assignedDevice.isActive,
                lastSeen: dog.assignedDevice.lastSeen?.toISOString(),
                batteryLevel: dog.assignedDevice.batteryLevel,
            };
        }

        console.log('🐕 [DEBUG] Individual dog API - Device Info:', {
            dogId: dogData._id,
            hasDevice: !!dogData.deviceInfo,
            deviceId: dogData.deviceInfo?.deviceId,
            deviceName: dogData.deviceInfo?.name
        });

        return NextResponse.json(dogData);
    } catch (error) {
        console.error('Error fetching dog profile:', error);
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
        const updateData: UpdateDogData = await req.json();
        
        // FIXED: Added populate for device information on update too
        const dog = await Dog.findOneAndUpdate(
            { _id: params.id, owner: session.user.id },
            updateData,
            { new: true, runValidators: true }
        )
        .populate('assignedDevice')
        .lean() as IDog & { 
            _id: Types.ObjectId, 
            assignedDevice?: {
                _id: Types.ObjectId;
                deviceId: string;
                name: string;
                isActive: boolean;
                lastSeen?: Date;
                batteryLevel?: number;
            } 
        };

        if (!dog) {
            return NextResponse.json({ error: 'Dog profile not found' }, { status: 404 });
        }

        // FIXED: Transform response with device info
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

        // Include device info if available
        if (dog.assignedDevice) {
            dogData.deviceInfo = {
                deviceId: dog.assignedDevice.deviceId,
                name: dog.assignedDevice.name,
                isActive: dog.assignedDevice.isActive,
                lastSeen: dog.assignedDevice.lastSeen?.toISOString(),
                batteryLevel: dog.assignedDevice.batteryLevel,
            };
        }

        return NextResponse.json(dogData);
    } catch (error) {
        console.error('Error updating dog profile:', error);
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
        const dog = await Dog.findOneAndDelete({ _id: params.id, owner: session.user.id });

        if (!dog) {
            return NextResponse.json({ error: 'Dog profile not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Dog profile deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting dog profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}