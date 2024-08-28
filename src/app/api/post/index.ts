import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const client = await clientPromise;
  const db = client.db();

  if (req.method === 'GET') {
    const posts = await db.collection('posts').find().toArray();
    return res.status(200).json(posts);
  } else if (req.method === 'POST') {
    if (!session.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { content, image } = req.body;
    const newPost = {
      content,
      image,
      createdAt: new Date(),
      author: session.user.name,
    };

    const result = await db.collection('posts').insertOne(newPost);
    return res.status(201).json({ message: 'Post created', postId: result.insertedId });
  }

  res.status(405).json({ message: 'Method not allowed' });
}