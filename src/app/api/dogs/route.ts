import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import { NewDogData, DogData } from '@/lib/schemas';
import Dog, { IDog } from '@/models/Dog';
import { authOptions } from '../auth/[...nextauth]/route';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const dogs = await Dog.find({ owner: session.user.id }).lean() as (IDog & { _id: Types.ObjectId })[];
    const dogData: DogData[] = dogs.map(dog => ({
      _id: dog._id.toString(),
      name: dog.name,
      gender: dog.gender,
      age: dog.age,
      breed: dog.breed,
      birthday: dog.birthday.toISOString().split('T')[0], // Convert Date to string
      imageUrl: dog.imageUrl,
      collarActivated: dog.collarActivated,
      owner: dog.owner
    }));
    return NextResponse.json(dogData);
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
    const dog = new Dog({
      ...newDog,
      owner: session.user.id
    });
    await dog.save();
    const createdDog: DogData = {
      _id: dog._id.toString(),
      name: dog.name,
      gender: dog.gender,
      age: dog.age,
      breed: dog.breed,
      birthday: dog.birthday.toISOString().split('T')[0], // Convert Date to string
      imageUrl: dog.imageUrl,
      collarActivated: dog.collarActivated,
      owner: dog.owner
    };
    return NextResponse.json(createdDog, { status: 201 });
  } catch (error) {
    console.error('Error creating dog profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}