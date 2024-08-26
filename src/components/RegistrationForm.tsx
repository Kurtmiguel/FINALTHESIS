"use client";

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from 'next/link';
import Image from 'next/image';

export const RegisterForm = () => {
  const methods = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      address: '',
      contactNumber: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
    // Handle form submission
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-950 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/brgylogo.png"  
              alt="Logo"
              width={40}
              height={40}
              className="mr-2"
              priority={true}
            />
            <span className="text-2xl font-bold">Barangay Canine Management System</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Registration Form</h2>
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

      <footer className="bg-blue-950 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Barangay Canine Management System</p>
      </footer>
    </div>
  );
};
