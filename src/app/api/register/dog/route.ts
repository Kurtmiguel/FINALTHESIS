import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { NewDogData, dogSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const dogData: NewDogData = await request.json();
    
    // Validate dogData
    const validatedData = dogSchema.parse(dogData);

    // Insert dog profile into database
    const result = await (await dbConnect()).connection.collection('dogs').insertOne({
      ...validatedData,
      collarActivated: false, // Set default value
    });

    return NextResponse.json({ message: 'Dog profile created successfully', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error creating dog profile:', error);
    return NextResponse.json({ error: 'Failed to create dog profile' }, { status: 500 });
  }
}