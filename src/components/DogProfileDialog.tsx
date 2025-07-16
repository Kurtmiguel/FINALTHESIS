import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, Heart, AlertTriangle, Loader2 } from 'lucide-react';
import DogRegistrationForm from './DogRegistrationForm';
import DeviceRegistrationForm from './DeviceRegistrationForm';
import { NewDogData, NewDeviceData } from '@/lib/schemas';

interface DogProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileCreation: (profile: NewDogData) => Promise<void>;
}

type Step = 'collar-choice' | 'dog-registration' | 'device-registration';

const DogProfileDialog: React.FC<DogProfileDialogProps> = ({ 
  open, 
  onOpenChange, 
  onProfileCreation 
}) => {
  const [step, setStep] = useState<Step>('collar-choice');
  const [hasCollar, setHasCollar] = useState<boolean | null>(null);
  const [dogData, setDogData] = useState<NewDogData | null>(null);
  const [deviceData, setDeviceData] = useState<NewDeviceData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset all state when closing
      resetDialog();
    }
    onOpenChange(newOpen);
  };

  const resetDialog = () => {
    setStep('collar-choice');
    setHasCollar(null);
    setDogData(null);
    setDeviceData(null);
    setIsSubmitting(false);
    setError(null);
  };

  const handleCollarChoice = (choice: boolean) => {
    setHasCollar(choice);
    setStep('dog-registration');
    setError(null); // Clear any previous errors
  };

  const handleDogRegistration = (data: NewDogData) => {
    const dogWithCollar = { ...data, collarActivated: hasCollar ?? false };
    setDogData(dogWithCollar);
    setError(null); // Clear any previous errors
    
    if (hasCollar) {
      setStep('device-registration');
    } else {
      // If no collar, submit immediately
      submitProfile(dogWithCollar);
    }
  };

  const handleDeviceRegistration = async (data: NewDeviceData) => {
    setDeviceData(data);
    setError(null); // Clear any previous errors
    
    if (dogData) {
      // First register the device, then create the dog profile
      await submitProfileWithDevice(dogData, data);
    }
  };

  const submitProfile = async (profile: NewDogData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onProfileCreation(profile);
      handleOpenChange(false);
    } catch (error) {
      console.error('Error creating dog profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to create dog profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitProfileWithDevice = async (profile: NewDogData, device: NewDeviceData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('🔧 Registering device:', device);
      
      // First register the device
      const deviceResponse = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(device),
      });

      console.log('📡 Device registration response status:', deviceResponse.status);

      if (!deviceResponse.ok) {
        const errorData = await deviceResponse.json();
        console.error('❌ Device registration failed:', errorData);
        
        // Handle specific error cases
        if (deviceResponse.status === 400 && errorData.error?.includes('already exists')) {
          throw new Error(`Device ID "${device.deviceId}" is already registered. Please use a different Device ID or contact support if this is your device.`);
        } else if (deviceResponse.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else {
          throw new Error(errorData.error || 'Failed to register device');
        }
      }

      const createdDevice = await deviceResponse.json();
      console.log('✅ Device registered successfully:', createdDevice);
      
      // Then create the dog profile with device reference
      const profileWithDevice: NewDogData = {
        ...profile,
        deviceInfo: {
          deviceId: createdDevice.deviceId,
          name: createdDevice.name,
        }
      };

      console.log('🐕 Creating dog profile with device:', profileWithDevice);
      await onProfileCreation(profileWithDevice);
      
      console.log('✅ Dog profile with device created successfully');
      handleOpenChange(false);
    } catch (error) {
      console.error('❌ Error creating profile with device:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToDeviceStep = () => {
    setStep('device-registration');
    setError(null);
  };

  const handleBackToDogStep = () => {
    setStep('dog-registration');
    setError(null);
  };

  const renderContent = () => {
    switch (step) {
      case 'collar-choice':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Smart Collar Setup</h3>
              <p className="text-gray-600">Does your dog have a smart GPS tracking collar?</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500"
                onClick={() => handleCollarChoice(true)}
              >
                <CardHeader className="text-center pb-3">
                  <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Yes, I have a smart collar</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription>
                    I want to register my smart collar for GPS tracking
                  </CardDescription>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-gray-400"
                onClick={() => handleCollarChoice(false)}
              >
                <CardHeader className="text-center pb-3">
                  <Heart className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">No smart collar</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription>
                    I just want to create a dog profile without tracking
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'dog-registration':
        return (
          <div className="space-y-4">
            <DogRegistrationForm 
              onSubmit={handleDogRegistration} 
              initialData={{ collarActivated: hasCollar ?? false }}
              isLoading={isSubmitting}
            />
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('collar-choice')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </div>
        );

      case 'device-registration':
        return (
          <div className="space-y-4">
            <DeviceRegistrationForm
              onSubmit={handleDeviceRegistration}
              onBack={handleBackToDogStep}
              isLoading={isSubmitting}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'collar-choice' && 'Create Dog Profile'}
            {step === 'dog-registration' && 'Dog Information'}
            {step === 'device-registration' && 'Smart Collar Registration'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${step === 'collar-choice' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'dog-registration' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            {hasCollar && (
              <div className={`w-3 h-3 rounded-full ${step === 'device-registration' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isSubmitting && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">
                  {step === 'device-registration' ? 'Registering device...' : 'Creating profile...'}
                </div>
                <div className="text-sm text-blue-700">
                  Please wait while we process your request
                </div>
              </div>
            </div>
          </div>
        )}

        {renderContent()}

        {/* Retry Button for Device Registration Errors */}
        {error && step === 'device-registration' && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBackToDeviceStep}
                disabled={isSubmitting}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleBackToDogStep}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back to Dog Info
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DogProfileDialog;