"use client"

import { useForm } from 'react-hook-form';
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

export function RegisterForm() {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter your full name" {...register('fullName')} />
            </FormControl>
            <FormMessage>{errors.fullName?.message}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="age"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Age</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter your age"
                {...register('age', { valueAsNumber: true })}
              />
            </FormControl>
            <FormMessage>{errors.age?.message}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="birthdate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Birthdate</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...register('birthdate', { valueAsDate: true })}
              />
            </FormControl>
            <FormMessage>{errors.birthdate?.message}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="Enter your address" {...register('address')} />
            </FormControl>
            <FormMessage>{errors.address?.message}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contactNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter your contact number" {...register('contactNumber')} />
            </FormControl>
            <FormMessage>{errors.contactNumber?.message}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Enter your email" {...register('email')} />
            </FormControl>
            <FormMessage>{errors.email?.message}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Enter your password" {...register('password')} />
            </FormControl>
            <FormMessage>{errors.password?.message}</FormMessage>
          </FormItem>
        )}
      />

      <Button type="submit" className="w-full">Register</Button>
    </form>
  );
}
