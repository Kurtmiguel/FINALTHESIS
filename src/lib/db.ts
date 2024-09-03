import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('Current working directory:', process.cwd());
console.log('MONGODB_URI status:', process.env.MONGODB_URI ? 'Set' : 'Not set');

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in the environment variables. Please check your .env.local file.');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the NodeJS.Global interface
declare global {
  var mongoose: Cached | undefined;
}

let cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Error connecting to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;