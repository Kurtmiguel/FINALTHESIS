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
  imageUrl: z.string().optional(), // Allow both URLs and base64 strings
  collarActivated: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type DogFormData = z.infer<typeof dogSchema>;

// This type includes the _id field that MongoDB adds and the owner field
export type DogData = DogFormData & { 
  _id: string; 
  owner: Types.ObjectId;
};

// Helper type for creating a new dog (without _id and owner)
export type NewDogData = Omit<DogFormData, 'collarActivated'>;

// Helper type for updating a dog
export type UpdateDogData = Partial<DogFormData>;