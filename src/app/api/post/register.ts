import { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { userSchema } from '@/lib/schemas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = userSchema.parse(req.body);
    const { fullName, address, contactNumber, email, password } = data;

    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hash(password, 12);

    const result = await db.collection('users').insertOne({
      fullName,
      address,
      contactNumber,
      email,
      password: hashedPassword,
      isAdmin: false,
    });

    res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error });
  }
}