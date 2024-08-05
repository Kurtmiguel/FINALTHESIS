import { z } from 'zod';

export const userSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  age: z.number().min(18, 'Must be at least 18 years old'),
  birthdate: z.date(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  contactNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const adminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  specialCode: z.string().min(6, 'Special code must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});