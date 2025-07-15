// app/models/Geofence.ts
import mongoose, { Document, Model, Types } from 'mongoose';

export interface IGeofence extends Document {
  _id: Types.ObjectId;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number; // in meters
  geofenceType: 'indoor' | 'outdoor';
  isActive: boolean;
  deviceId: string;
  dogId: Types.ObjectId;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  alertsEnabled: boolean;
  description?: string;
}

const GeofenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  centerLatitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  centerLongitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  radius: {
    type: Number,
    required: true,
    min: 1,
    max: 18, // 60 feet standard
    validate: {
      validator: function(v: number) {
        // 60 feet standard for all geofence types
        return v <= 18;
      },
      message: 'Radius exceeds maximum of 18m (60 feet)'
    }
  },
  geofenceType: {
    type: String,
    enum: ['indoor', 'outdoor'],
    required: true,
    default: 'outdoor'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  dogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dog',
    required: true,
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  alertsEnabled: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxLength: 500,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
GeofenceSchema.index({ deviceId: 1, isActive: 1 });
GeofenceSchema.index({ owner: 1, isActive: 1 });
GeofenceSchema.index({ dogId: 1, isActive: 1 });

// Static method to get default radius (60 feet standard)
GeofenceSchema.statics.getDefaultRadius = function(type: 'indoor' | 'outdoor') {
  return 18; // 60 feet = 18 meters
};

const Geofence: Model<IGeofence> = mongoose.models.Geofence || mongoose.model<IGeofence>('Geofence', GeofenceSchema);

export default Geofence;