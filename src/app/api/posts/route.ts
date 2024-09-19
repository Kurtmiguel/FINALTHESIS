import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Posts';
import { uploadImages } from '@/lib/uploadImages';

export async function GET() {
  await dbConnect();
  const posts = await Post.find().sort({ createdAt: -1 });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const author = formData.get('author') as string;
  const imageFiles = formData.getAll('images') as File[];

  if (!title || !content || !author) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await dbConnect();

  const imageUrls = await uploadImages(imageFiles);

  const newPost = new Post({ 
    title, 
    content, 
    author, 
    images: imageUrls.length > 0 ? imageUrls : [] 
  });
  await newPost.save();
  return NextResponse.json(newPost);
}

