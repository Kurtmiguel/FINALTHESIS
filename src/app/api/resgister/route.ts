// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/db';
import { z } from 'zod';
import { userSchema } from '@/lib/schemas';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const parsedData = userSchema.parse(req.body);

    const client = await clientPromise;
    const db = client.db();

    const usersCollection = db.collection('users');
    const result = await usersCollection.insertOne(parsedData);

    res.status(200).json({ message: 'User registered successfully', userId: result.insertedId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default handler;
