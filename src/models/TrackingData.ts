import mongoose, { Document, Model, Types } from 'mongoose';

export interface ITrackingData extends Document {
  _id: Types.ObjectId;
  deviceId: string;
  latitude: number;
  longitude: number;
  gpsValid: boolean;
  battery: number;
  timestamp: Date;
  uptime: number;
  wifiRSSI: number;
  createdAt: Date;
}

const TrackingDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  gpsValid: {
    type: Boolean,
    required: true
  },
  battery: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timestamp: {
    type: Date,
    required: true
  },
  uptime: {
    type: Number,
    required: true
  },
  wifiRSSI: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { 
  timestamps: true 
});

// Create compound index for efficient queries
TrackingDataSchema.index({ deviceId: 1, createdAt: -1 });
TrackingDataSchema.index({ deviceId: 1, gpsValid: 1, createdAt: -1 });

const TrackingData: Model<ITrackingData> = mongoose.models.TrackingData || mongoose.model<ITrackingData>('TrackingData', TrackingDataSchema);

export default TrackingData;