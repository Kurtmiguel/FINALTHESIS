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

export const LoginPageComponent = () => {
  const methods = useForm({
    resolver: zodResolver(userSchema.pick({ email: true, password: true })),  // Adjust schema for login
    defaultValues: {
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
        <div className="max-w-lg bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6">Login</h2>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
            <FormProvider {...methods}>
              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="text-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{methods.formState.errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="text-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{methods.formState.errors.password?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-500 text-white text-lg py-3 rounded-lg hover:bg-blue-600"
              >
                Log In
              </Button>
            </FormProvider>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm">Don't have an account? <Link href="/register" className="text-blue-500">Register here</Link></p>
          </div>
        </div>
      </main>

      <footer className="bg-blue-950 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Barangay Canine Management System</p>
      </footer>
    </div>
  );
};
