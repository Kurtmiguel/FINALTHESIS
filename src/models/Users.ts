import mongoose, { Document, Model, Types } from 'mongoose';

// Interface to define the structure of a User document
export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  address: string;
  contactNumber: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the User model
export interface IUserModel extends Model<IUser> {}

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide a full name'],
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide a contact number'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Check if the model already exists to prevent OverwriteModelError
const User = (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;