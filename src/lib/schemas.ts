import * as z from 'zod';

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

export type LoginFormData = z.infer<typeof loginSchema>;
export type UserFormData = z.infer<typeof userSchema>;