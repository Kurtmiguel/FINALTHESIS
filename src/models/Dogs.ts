import mongoose, { Schema } from 'mongoose';
import { dogSchema, DogData } from '@/lib/schemas';

const DogMongooseSchema = new Schema<DogData>({
  name: { type: String, required: true, minlength: 1 },
  age: { type: Number, required: true, min: 0 },
  breed: { type: String, required: true, minlength: 1 },
  birthday: { type: String, required: true },
  imageUrl: { type: String, required: false },
  collarActivated: { type: Boolean, required: false, default: false },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Add any pre-save hooks, virtuals, or methods here if needed

export const DogModel = mongoose.models.Dog || mongoose.model<DogData>('Dog', DogMongooseSchema);