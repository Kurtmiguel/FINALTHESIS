import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import Dog from '@/models/Dog';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const deletedDog = await Dog.findByIdAndDelete(params.id);
    
    if (!deletedDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Dog deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting dog:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}