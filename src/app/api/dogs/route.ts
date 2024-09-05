import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { DogModel } from '@/models/Dogs';

export async function GET() {
  console.log('GET /api/dogs called');
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('Unauthorized access attempt in GET /api/dogs');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const dogs = await DogModel.find({ owner: session.user.id });
    console.log(`Fetched ${dogs.length} dogs for user ${session.user.id}`);
    return NextResponse.json(dogs);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return NextResponse.json({ error: 'Failed to fetch dogs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('POST /api/dogs called');
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('Unauthorized access attempt in POST /api/dogs');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dogData = await request.json();
    console.log('Received dog data:', dogData);

    await dbConnect();
    const newDog = new DogModel({
      ...dogData,
      owner: session.user.id,
      collarActivated: false,
    });

    const savedDog = await newDog.save();
    console.log('New dog created:', savedDog);

    return NextResponse.json(savedDog, { status: 201 });
  } catch (error) {
    console.error('Error creating dog profile:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create dog profile' }, { status: 500 });
  }
}