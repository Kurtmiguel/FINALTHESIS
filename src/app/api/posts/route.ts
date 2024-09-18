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

export async function PUT(req: Request) {
  const formData = await req.formData();
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const imageFiles = formData.getAll('images') as File[];

  if (!id || !title || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await dbConnect();

  const existingPost = await Post.findById(id);
  if (!existingPost) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const newImageUrls = await uploadImages(imageFiles);
  const updatedImages = existingPost.images ? [...existingPost.images, ...newImageUrls] : newImageUrls;

  const updatedPost = await Post.findByIdAndUpdate(
    id,
    { title, content, images: updatedImages },
    { new: true }
  );

  return NextResponse.json(updatedPost);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
  }

  await dbConnect();
  const deletedPost = await Post.findByIdAndDelete(id);
  
  if (!deletedPost) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Post deleted successfully' });
}