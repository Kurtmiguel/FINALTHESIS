import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deviceSchema, NewDeviceData } from '@/lib/schemas';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Wifi } from 'lucide-react';

interface DeviceRegistrationFormProps {
  onSubmit: (data: NewDeviceData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const DeviceRegistrationForm: React.FC<DeviceRegistrationFormProps> = ({ 
  onSubmit, 
  onBack, 
  isLoading = false 
}) => {
  const form = useForm<NewDeviceData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      deviceId: "",
      name: "",
      isActive: true,
      firmwareVersion: "1.0.0",
    },
  });

  const handleSubmit = (values: NewDeviceData) => {
    console.log('Device registration values:', values);
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Smartphone className="h-12 w-12 text-blue-600" />
            <Wifi className="h-6 w-6 text-green-500 absolute -top-1 -right-1" />
          </div>
        </div>
        <CardTitle>Register Smart Collar</CardTitle>
        <CardDescription>
          Enter your smart collar details to enable GPS tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., dog-collar-001" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the unique ID found on your smart collar device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Buddy's Smart Collar" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Give your device a friendly name for easy identification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firmwareVersion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firmware Version (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1.0.0" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Current firmware version of your device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                disabled={isLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  'Register Device'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DeviceRegistrationForm;