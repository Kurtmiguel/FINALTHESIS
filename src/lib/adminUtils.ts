import dbConnect from '@/lib/db';
import User, { IUser } from '@/models/Users';
import Dog, { IDog } from '@/models/Dog';
import { Types } from 'mongoose';

export interface UserData {
  _id: string; // Changed from Types.ObjectId to string
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
}

export interface DogData {
  _id: Types.ObjectId;
  name: string;
  breed: string;
  owner: Types.ObjectId;
  collarActivated: boolean;
}

export async function getUsersAndDogs() {
  await dbConnect();

  const usersRaw = await User.find({ isAdmin: false }, '_id fullName email contactNumber address').lean<IUser[]>();
  const users: UserData[] = usersRaw.map(user => ({
    _id: user._id.toString(), // Convert ObjectId to string
    fullName: user.fullName,
    email: user.email,
    contactNumber: user.contactNumber,
    address: user.address
  }));

  const dogsRaw = await Dog.find().lean<IDog[]>();
  const dogs: DogData[] = dogsRaw.map(dog => ({
    _id: dog._id,
    name: dog.name,
    breed: dog.breed,
    owner: dog.owner,
    collarActivated: dog.collarActivated
  }));

  const dogsWithCollars = dogs.filter(dog => dog.collarActivated).length;
  const dogsWithoutCollars = dogs.length - dogsWithCollars;

  return {
    users,
    dogs,
    dogsWithCollars,
    dogsWithoutCollars
  };
}