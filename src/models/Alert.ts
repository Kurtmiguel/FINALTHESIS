// app/models/Alert.ts
import mongoose, { Document, Model, Types } from 'mongoose';

export interface IAlert extends Document {
  _id: Types.ObjectId;
  alertType: 'geofence_exit' | 'geofence_entry' | 'battery_low' | 'device_offline';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  deviceId: string;
  dogId: Types.ObjectId;
  geofenceId?: Types.ObjectId;
  owner: Types.ObjectId;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  metadata?: {
    batteryLevel?: number;
    distance?: number; // distance from geofence center when violation occurred
    previousStatus?: string;
    duration?: number; // how long the condition persisted
  };
  createdAt: Date;
  readAt?: Date;
  resolvedAt?: Date;
  isResolved: boolean;
}

const AlertSchema = new mongoose.Schema({
  alertType: {
    type: String,
    enum: ['geofence_exit', 'geofence_entry', 'battery_low', 'device_offline'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 150
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
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
  geofenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Geofence',
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  metadata: {
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    distance: {
      type: Number,
      min: 0
    },
    previousStatus: String,
    duration: Number
  },
  readAt: Date,
  resolvedAt: Date,
  isResolved: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
AlertSchema.index({ owner: 1, isRead: 1, createdAt: -1 });
AlertSchema.index({ deviceId: 1, alertType: 1, createdAt: -1 });
AlertSchema.index({ dogId: 1, isResolved: 1, createdAt: -1 });
AlertSchema.index({ geofenceId: 1, alertType: 1, createdAt: -1 });

// Static method to create geofence exit alert
AlertSchema.statics.createGeofenceExitAlert = function(
  deviceId: string,
  dogId: Types.ObjectId,
  geofenceId: Types.ObjectId,
  owner: Types.ObjectId,
  coordinates: { latitude: number; longitude: number },
  distance: number,
  dogName: string,
  geofenceName: string
) {
  return new this({
    alertType: 'geofence_exit',
    title: `${dogName} left the safe zone`,
    message: `${dogName} has moved ${distance.toFixed(0)}m outside the "${geofenceName}" geofence boundary.`,
    severity: 'high',
    deviceId,
    dogId,
    geofenceId,
    owner,
    coordinates,
    metadata: {
      distance
    }
  });
};

// Static method to create geofence entry alert
AlertSchema.statics.createGeofenceEntryAlert = function(
  deviceId: string,
  dogId: Types.ObjectId,
  geofenceId: Types.ObjectId,
  owner: Types.ObjectId,
  coordinates: { latitude: number; longitude: number },
  dogName: string,
  geofenceName: string
) {
  return new this({
    alertType: 'geofence_entry',
    title: `${dogName} returned to safe zone`,
    message: `${dogName} has returned to the "${geofenceName}" geofence area.`,
    severity: 'low',
    deviceId,
    dogId,
    geofenceId,
    owner,
    coordinates
  });
};

const Alert: Model<IAlert> = mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);

export default Alert;