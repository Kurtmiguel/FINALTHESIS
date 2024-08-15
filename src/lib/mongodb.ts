// lib/mongodb.ts
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI || '');

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable
  (global as any)._mongoClientPromise = clientPromise = client.connect();
} else {
  clientPromise = client.connect();
}

export default clientPromise;
