import mongoose from 'mongoose';

const dogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  birthday: { type: Date, required: true },
  imageUrl: { type: String, required: true },
  collarActivated: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.Dog || mongoose.model('Dog', dogSchema);