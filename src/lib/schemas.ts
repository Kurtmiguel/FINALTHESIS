// app/lib/schemas.ts - Enhanced with Geofencing
import * as z from 'zod';
import { Types } from 'mongoose';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  isAdmin: z.boolean().optional(),
});

export const userSchema = z.object({
  fullName: z.string().min(2),
  address: z.string().min(5),
  contactNumber: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(6),
});

export const dogSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(['male', 'female']),
  age: z.number().int().positive(),
  breed: z.string().min(1),
  birthday: z.string(),
  imageUrl: z.string().optional(),
  collarActivated: z.boolean().optional().default(false),
  assignedDevice: z.string().optional(), // Device ID reference
});

// Device Schema
export const deviceSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required"),
  name: z.string().min(1, "Device name is required"),
  isActive: z.boolean().default(true),
  assignedDog: z.string().optional(), // Dog ID reference
  firmwareVersion: z.string().optional().default("1.0.0"),
});

// Geofence Schema
export const geofenceSchema = z.object({
  name: z.string().min(1, "Geofence name is required").max(100),
  centerLatitude: z.number().min(-90).max(90),
  centerLongitude: z.number().min(-180).max(180),
  radius: z.number().min(1).max(1000),
  geofenceType: z.enum(['indoor', 'outdoor']).default('outdoor'),
  isActive: z.boolean().default(true),
  deviceId: z.string().min(1, "Device ID is required"),
  dogId: z.string().min(1, "Dog ID is required"),
  alertsEnabled: z.boolean().default(true),
  description: z.string().max(500).optional(),
}).refine((data) => {
  // Validate radius based on geofence type
  const maxRadius = data.geofenceType === 'indoor' ? 45 : 90;
  return data.radius <= maxRadius;
}, {
  message: "Radius exceeds maximum for geofence type",
  path: ["radius"],
});

// Alert Schema
export const alertSchema = z.object({
  alertType: z.enum(['geofence_exit', 'geofence_entry', 'battery_low', 'device_offline']),
  title: z.string().min(1).max(150),
  message: z.string().min(1).max(500),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  isRead: z.boolean().default(false),
  deviceId: z.string().min(1),
  dogId: z.string().min(1),
  geofenceId: z.string().optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  metadata: z.object({
    batteryLevel: z.number().min(0).max(100).optional(),
    distance: z.number().min(0).optional(),
    previousStatus: z.string().optional(),
    duration: z.number().optional(),
  }).optional(),
  isResolved: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type DogFormData = z.infer<typeof dogSchema>;
export type DeviceFormData = z.infer<typeof deviceSchema>;
export type GeofenceFormData = z.infer<typeof geofenceSchema>;
export type AlertFormData = z.infer<typeof alertSchema>;

export type DogData = DogFormData & { 
  _id: string; 
  owner: Types.ObjectId;
  assignedDevice?: string; // Device ID
  deviceInfo?: {
    deviceId: string;
    name: string;
    isActive: boolean;
    lastSeen?: string;
    batteryLevel?: number;
  };
};

export type DeviceData = DeviceFormData & {
  _id: string;
  owner: Types.ObjectId;
  registrationDate: string;
  lastSeen?: string;
  batteryLevel?: number;
  assignedDogName?: string; // For display purposes
  firmwareVersion?: string;
};

// Geofence Data Types
export type GeofenceData = GeofenceFormData & {
  _id: string;
  owner: Types.ObjectId;
  dogName?: string;
  dogBreed?: string;
  createdAt: string;
  updatedAt: string;
};

// Alert Data Types
export type AlertData = AlertFormData & {
  _id: string;
  owner: Types.ObjectId;
  dogName?: string;
  dogBreed?: string;
  dogImageUrl?: string;
  geofenceName?: string;
  geofenceType?: string;
  createdAt: string;
  readAt?: string;
  resolvedAt?: string;
};

// Update NewDogData to include device assignment
export type NewDogData = DogFormData & {
  deviceInfo?: {
    deviceId: string;
    name: string;
  };
};

export type UpdateDogData = Partial<DogFormData>;
export type NewDeviceData = DeviceFormData;
export type UpdateDeviceData = Partial<DeviceFormData>;
export type NewGeofenceData = GeofenceFormData;
export type UpdateGeofenceData = Partial<GeofenceFormData>;
export type NewAlertData = AlertFormData;
export type UpdateAlertData = Partial<AlertFormData>;

// Pagination types
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  unreadCount?: number;
  hasMore: boolean;
}

// API Response types
export interface AlertsResponse {
  alerts: AlertData[];
  pagination: PaginationData;
}

export interface GeofencesResponse {
  geofences: GeofenceData[];
  pagination?: PaginationData;
}

// Geofence violation types
export interface GeofenceViolation {
  deviceId: string;
  dogId: string;
  geofenceId: string;
  violationType: 'exit' | 'entry';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Geofence status types
export interface GeofenceStatus {
  geofenceId: string;
  isActive: boolean;
  dogInside: boolean;
  lastChecked: string;
  violations: number;
  alertsEnabled: boolean;
}