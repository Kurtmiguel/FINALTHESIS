import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/Users';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (session.user.isAdmin) {
    await dbConnect();
    const users = await User.find({ isAdmin: false }).lean();
    return NextResponse.json(users);
  }

  return NextResponse.json({
    name: session.user.name,
    email: session.user.email,
    isAdmin: session.user.isAdmin,
  });
}