import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { DogModel } from '@/models/Dogs'; // Assuming you have a Dog model

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;
    const updatedDog = await request.json();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid dog ID' }, { status: 400 });
    }

    const result = await DogModel.findByIdAndUpdate(id, updatedDog, { new: true });

    if (!result) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Dog profile updated successfully', dog: result });
  } catch (error) {
    console.error('Error updating dog profile:', error);
    return NextResponse.json({ error: 'Failed to update dog profile' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid dog ID' }, { status: 400 });
    }

    const result = await DogModel.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Dog profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting dog profile:', error);
    return NextResponse.json({ error: 'Failed to delete dog profile' }, { status: 500 });
  }
}