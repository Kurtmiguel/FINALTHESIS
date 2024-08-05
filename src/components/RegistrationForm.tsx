"use client"

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
      age: undefined,
      birthdate: undefined,
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
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your age"
                  {...field}
                />
              </FormControl>
              <FormMessage>{methods.formState.errors.age?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          name="birthdate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birthdate</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage>{methods.formState.errors.birthdate?.message}</FormMessage>
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

        <Button type="submit" className="w-full">Register</Button>
      </FormProvider>
    </form>
  );
};

const UserRegister: React.FC = () => {
  return (
    <div>
      <header className="bg-blue-500 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png" // Replace with your actual logo path
              alt="Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <span className="text-2xl font-bold">Your System Name</span>
          </Link>
          <nav>
            <Link href="/login" className="mr-4">Login</Link>
            <Link href="/register">Register</Link>
          </nav>
        </div>
      </header>
      <main className="p-4">
        <h2 className="text-xl font-bold mb-4">User Registration</h2>
        <RegisterForm />
      </main>
    </div>
  )
};

export default UserRegister;
