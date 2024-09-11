import mongoose from 'mongoose';

const dogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  birthday: { type: Date, required: true },
  imageUrl: { type: String },
});

export const DogModel = mongoose.models.Dog || mongoose.model('Dog', dogSchema);