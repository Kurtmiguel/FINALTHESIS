"use client";

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, UserFormData } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from 'next/navigation';
import Footer from './Footer';
import Header from './Header';

export const RegisterForm = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const methods = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      address: '',
      contactNumber: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Registration Form</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <FormProvider {...methods}>
              <FormField
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage>{methods.formState.errors.fullName?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your address" {...field} />
                    </FormControl>
                    <FormMessage>{methods.formState.errors.address?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your contact number" {...field} />
                    </FormControl>
                    <FormMessage>{methods.formState.errors.contactNumber?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage>{methods.formState.errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage>{methods.formState.errors.password?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600">Register</Button>
            </FormProvider>
          </form>
        </div>
      </main>
      <Footer/>
    </div>
  );
};