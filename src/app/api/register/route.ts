import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const client = await clientPromise
    const usersCollection = client.db().collection('users')

    const { email } = req.body
    const existingUser = await usersCollection.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const result = await usersCollection.insertOne(req.body)
    res.status(201).json({ message: 'User created', userId: result.insertedId })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}