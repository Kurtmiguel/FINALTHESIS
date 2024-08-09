import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'posts.json');

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    // Read the current posts from the file
    let posts = JSON.parse(await fs.readFile(DATA_FILE_PATH, 'utf-8'));

    // Find the index of the post to delete
    const postIndex = posts.findIndex((post: any) => post.id.toString() === id);

    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Remove the post from the array
    posts.splice(postIndex, 1);

    // Write the updated posts back to the file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(posts, null, 2));

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}