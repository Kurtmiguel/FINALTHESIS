import mongoose from 'mongoose';

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

export default mongoose.models.User || mongoose.model('User', UserSchema);