import mongoose, { Document, Model, Types } from 'mongoose';

export interface IDog extends Document {
  _id: Types.ObjectId;
  name: string;
  gender: 'male' | 'female';
  age: number;
  breed: string;
  birthday: Date;
  imageUrl?: string;
  collarActivated: boolean;
  owner: Types.ObjectId;
}

const DogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  age: { type: Number, required: true },
  breed: { type: String, required: true },
  birthday: { type: Date, required: true },
  imageUrl: { type: String },
  collarActivated: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Dog: Model<IDog> = mongoose.models.Dog || mongoose.model<IDog>('Dog', DogSchema);

export default Dog;