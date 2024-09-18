import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Posts';
import { uploadImages } from '@/lib/uploadImages';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const post = await Post.findById(params.id);
  
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const formData = await req.formData();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const imageFiles = formData.getAll('images') as File[];

  if (!title || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await dbConnect();

  const existingPost = await Post.findById(params.id);
  if (!existingPost) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  let updatedImages = existingPost.images || [];

  if (imageFiles.length > 0) {
    const newImageUrls = await uploadImages(imageFiles);
    updatedImages = [...updatedImages, ...newImageUrls];
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      params.id,
      { title, content, images: updatedImages },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const deletedPost = await Post.findByIdAndDelete(params.id);
    
    if (!deletedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}