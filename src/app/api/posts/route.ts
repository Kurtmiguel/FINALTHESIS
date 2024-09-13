import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Posts';

export async function GET() {
  await dbConnect();
  const posts = await Post.find().sort({ createdAt: -1 });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const { title, content, author } = await req.json();
  await dbConnect();
  const newPost = new Post({ title, content, author });
  await newPost.save();
  return NextResponse.json(newPost);
}

export async function PUT(req: Request) {
  const { id, title, content } = await req.json();
  await dbConnect();
  const updatedPost = await Post.findByIdAndUpdate(id, { title, content }, { new: true });
  return NextResponse.json(updatedPost);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await dbConnect();
  await Post.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Post deleted successfully' });
}