import * as dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/Users';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Looking for .env.local at:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env.local file:', result.error);
} else {
  console.log('.env.local file loaded successfully');
}

console.log('MONGODB_URI status:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET status:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set');

async function initDb() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB successfully');

    const adminEmail = 'admin@example.com';
    const adminPassword = 'adminPassword123';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const newAdmin = new User({
        fullName: 'Admin User',
        address: 'Admin Address',
        contactNumber: '1234567890',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
      });

      await newAdmin.save();
      console.log('Admin user created successfully');
      console.log('Admin details:', {
        email: newAdmin.email,
        isAdmin: newAdmin.isAdmin
      });
    } else {
      console.log('Admin user already exists');
      console.log('Existing admin details:', {
        email: existingAdmin.email,
        isAdmin: existingAdmin.isAdmin
      });
    }
  } catch (error) {
    console.error('Error in initDb:', error);
  } finally {
    process.exit();
  }
}

initDb().catch((error) => {
  console.error('Unhandled error in initDb:', error);
  process.exit(1);
});