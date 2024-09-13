import mongoose from 'mongoose';

const dogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  age: { type: Number, required: true },
  breed: { type: String, required: true },
  birthday: { type: Date, required: true },
  imageUrl: { type: String },
  collarActivated: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

const Dog = mongoose.models.Dog || mongoose.model('Dog', dogSchema);

export default Dog;