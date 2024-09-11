import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    const db = await dbConnect();
    const dogs = await db.connection.collection('dogs').find().toArray();
    return NextResponse.json(dogs);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return NextResponse.json({ error: 'Failed to fetch dogs' }, { status: 500 });
  }
}

