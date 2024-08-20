import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide a full name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
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
  age: {
    type: Number,
    required: [true, 'Please provide an age'],
  },
  birthdate: {
    type: Date,
    required: [true, 'Please provide a birthdate'],
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide a contact number'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);