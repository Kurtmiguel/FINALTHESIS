import { NextResponse } from 'next/server';

let posts: any[] = [];

export async function GET(request: Request) {
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const post = await request.json();
  posts.unshift({ ...post, id: Date.now() }); // Add new post to the beginning
  return NextResponse.json(post);
}