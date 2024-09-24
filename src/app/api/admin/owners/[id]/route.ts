import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import User from '@/models/Users';
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
    
    // Delete all dogs associated with the user
    await Dog.deleteMany({ owner: params.id });
    
    // Delete the user
    const deletedUser = await User.findByIdAndDelete(params.id);
    
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User and associated dogs deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}