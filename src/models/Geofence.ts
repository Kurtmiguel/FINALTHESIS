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
    max: 1000, // Maximum 1km radius
    validate: {
      validator: function(v: number) {
        // Ensure radius matches geofence type standards
        const geofenceType = (this as any).geofenceType;
        if (geofenceType === 'indoor') {
          return v <= 45; // Max 45 meters for indoor
        } else if (geofenceType === 'outdoor') {
          return v <= 90; // Max 90 meters for outdoor
        }
        return true;
      },
      message: 'Radius exceeds maximum for geofence type'
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

// Static method to get default radius based on type
GeofenceSchema.statics.getDefaultRadius = function(type: 'indoor' | 'outdoor') {
  return type === 'indoor' ? 45 : 90; // meters
};

const Geofence: Model<IGeofence> = mongoose.models.Geofence || mongoose.model<IGeofence>('Geofence', GeofenceSchema);

export default Geofence;