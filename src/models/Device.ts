import mongoose, { Document, Model, Types } from 'mongoose';

export interface IDevice extends Document {
  _id: Types.ObjectId;
  deviceId: string; // Unique identifier like "dog-collar-001"
  name: string; // User-friendly name like "Buddy's Collar"
  isActive: boolean;
  owner: Types.ObjectId;
  assignedDog?: Types.ObjectId; // Optional - which dog is wearing this collar
  registrationDate: Date;
  lastSeen?: Date;
  batteryLevel?: number;
  firmwareVersion?: string;
}

const DeviceSchema = new mongoose.Schema({
  deviceId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedDog: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Dog',
    default: null 
  },
  registrationDate: { 
    type: Date, 
    default: Date.now 
  },
  lastSeen: { 
    type: Date 
  },
  batteryLevel: { 
    type: Number,
    min: 0,
    max: 100
  },
  firmwareVersion: {
    type: String,
    default: "1.0.0"
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
DeviceSchema.index({ owner: 1 });
DeviceSchema.index({ deviceId: 1 });
DeviceSchema.index({ assignedDog: 1 });

const Device: Model<IDevice> = mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);

export default Device;