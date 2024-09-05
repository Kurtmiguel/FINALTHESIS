import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { DogModel } from '@/models/Dogs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const dogs = await DogModel.find({ owner: session.user.id });
    return NextResponse.json(dogs);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return NextResponse.json({ error: 'Failed to fetch dogs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dogData = await request.json();
    await dbConnect();
    const newDog = new DogModel({
      ...dogData,
      owner: session.user.id,
      collarActivated: false,
    });
    await newDog.save();
    return NextResponse.json(newDog, { status: 201 });
  } catch (error) {
    console.error('Error creating dog profile:', error);
    return NextResponse.json({ error: 'Failed to create dog profile' }, { status: 500 });
  }
}