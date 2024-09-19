import dbConnect from '@/lib/db';
import User, { IUser } from '@/models/Users';
import Dog from '@/models/Dog';
import { Types } from 'mongoose';

export interface UserData {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  contactNumber: string;
}

export async function getUsersAndDogs() {
  await dbConnect();

  const usersRaw = await User.find({ isAdmin: false }, '_id fullName email contactNumber').lean<IUser[]>();
  const users: UserData[] = usersRaw.map(user => ({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    contactNumber: user.contactNumber
  }));

  const dogs = await Dog.find().lean();

  const dogsWithCollars = dogs.filter(dog => dog.collarActivated).length;
  const dogsWithoutCollars = dogs.length - dogsWithCollars;

  return {
    users,
    dogsWithCollars,
    dogsWithoutCollars
  };
}