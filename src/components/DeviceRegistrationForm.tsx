import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deviceSchema, NewDeviceData } from '@/lib/schemas';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, Wifi, AlertTriangle, Info, Loader2 } from 'lucide-react';

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
  const [validationError, setValidationError] = useState<string | null>(null);

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
    console.log('🔧 Device registration form values:', values);
    setValidationError(null);
    
    // Additional client-side validation
    if (!values.deviceId.trim()) {
      setValidationError('Device ID is required');
      return;
    }
    
    if (!values.name.trim()) {
      setValidationError('Device name is required');
      return;
    }
    
    // Validate device ID format (basic validation)
    if (values.deviceId.length < 3) {
      setValidationError('Device ID must be at least 3 characters long');
      return;
    }
    
    // Check for common device ID formats
    const deviceIdPattern = /^[a-zA-Z0-9\-_]+$/;
    if (!deviceIdPattern.test(values.deviceId)) {
      setValidationError('Device ID can only contain letters, numbers, hyphens, and underscores');
      return;
    }
    
    onSubmit(values);
  };

  const generateDeviceId = () => {
    // Generate a random device ID suggestion
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    const suggestedId = `dog-collar-${timestamp}-${randomSuffix}`;
    form.setValue('deviceId', suggestedId);
  };

  const clearForm = () => {
    form.reset();
    setValidationError(null);
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
        {/* Important Notice */}
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Make sure your collar device is powered on and connected to WiFi before registration.
          </AlertDescription>
        </Alert>

        {/* Validation Error */}
        {validationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device ID *</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input 
                        placeholder="e.g., dog-collar-001" 
                        {...field}
                        disabled={isLoading}
                        className="font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateDeviceId}
                        disabled={isLoading}
                        className="w-full text-xs"
                      >
                        Generate Random ID
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the unique ID found on your smart collar device, or generate a random one
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
                  <FormLabel>Device Name *</FormLabel>
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
                  <FormLabel>Firmware Version</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1.0.0" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Current firmware version of your device (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Device ID Conflict Help */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Device ID already exists?</strong><br />
                If you get an error that the Device ID already exists, it means:
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li>Another user has already registered this device</li>
                  <li>You've already registered this device before</li>
                  <li>Try using a different, unique Device ID</li>
                </ul>
              </AlertDescription>
            </Alert>

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
                type="button" 
                variant="secondary" 
                onClick={clearForm}
                disabled={isLoading}
                className="px-3"
              >
                Clear
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Device'
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Troubleshooting Tips */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Troubleshooting Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Ensure your collar is powered on and connected to WiFi</li>
            <li>• Use a unique Device ID that hasn't been registered before</li>
            <li>• Device ID should only contain letters, numbers, hyphens, and underscores</li>
            <li>• Contact support if you believe you own a device that shows as "already registered"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceRegistrationForm;