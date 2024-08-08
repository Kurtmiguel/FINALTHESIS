import { NextResponse } from 'next/server';
import { userSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const validatedData = userSchema.parse(body);
    // Process the data (e.g., save to database)
    return NextResponse.json({ message: 'Registration successful' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}