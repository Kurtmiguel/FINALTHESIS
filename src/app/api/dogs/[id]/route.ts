import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import Dog from '@/models/Dog';
import { UpdateDogData } from '@/lib/schemas';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET and PUT functions remain the same
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const dog = await Dog.findOne({ _id: params.id, owner: session.user.id });

        if (!dog) {
            return NextResponse.json({ error: 'Dog profile not found' }, { status: 404 });
        }

        return NextResponse.json(dog);
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
        const dog = await Dog.findOneAndUpdate(
            { _id: params.id, owner: session.user.id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!dog) {
            return NextResponse.json({ error: 'Dog profile not found' }, { status: 404 });
        }

        return NextResponse.json(dog);
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

        // Return a success message instead of an empty object
        return NextResponse.json({ message: 'Dog profile deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting dog profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}