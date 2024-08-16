import * as z from 'zod';

export const userSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  age: z.number().nullable().refine((val) => val === null || (val >= 18 && val <= 120), {
    message: 'Age must be between 18 and 120',
  }),
  birthdate: z.string().min(1, 'Birthdate is required'),
  address: z.string().min(1, 'Address is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  isAdmin: z.boolean().default(false),
});

export const adminSchema = loginSchema.extend({
  adminCode: z.string().min(6, 'Admin code must be at least 6 characters'),
});