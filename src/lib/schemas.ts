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

export type LoginFormData = z.infer<typeof loginSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type DogFormData = z.infer<typeof dogSchema>;
export type DeviceFormData = z.infer<typeof deviceSchema>;

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
  // Make firmwareVersion optional in DeviceData
  firmwareVersion?: string;
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