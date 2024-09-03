'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const LoginPageComponent = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      isAdmin: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        isAdmin: data.isAdmin,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        if (data.isAdmin) {
          router.push('/admin-dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6">Login</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={methods.control}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-lg">
                        Login as Admin
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-500 text-white text-lg py-3 rounded-lg hover:bg-blue-600"
              >
                Log In
              </Button>
            </form>
          </FormProvider>
          <div className="mt-6 text-center">
            <p className="text-sm">Don't have an account? <Link href="/register" className="text-blue-500">Register here</Link></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPageComponent;