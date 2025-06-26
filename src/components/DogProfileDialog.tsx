import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Heart } from 'lucide-react';
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
  };

  const handleCollarChoice = (choice: boolean) => {
    setHasCollar(choice);
    setStep('dog-registration');
  };

  const handleDogRegistration = (data: NewDogData) => {
    const dogWithCollar = { ...data, collarActivated: hasCollar ?? false };
    setDogData(dogWithCollar);
    
    if (hasCollar) {
      setStep('device-registration');
    } else {
      // If no collar, submit immediately
      submitProfile(dogWithCollar);
    }
  };

  const handleDeviceRegistration = async (data: NewDeviceData) => {
    setDeviceData(data);
    
    if (dogData) {
      // First register the device, then create the dog profile
      await submitProfileWithDevice(dogData, data);
    }
  };

  const submitProfile = async (profile: NewDogData) => {
    setIsSubmitting(true);
    try {
      await onProfileCreation(profile);
      handleOpenChange(false);
    } catch (error) {
      console.error('Error creating dog profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitProfileWithDevice = async (profile: NewDogData, device: NewDeviceData) => {
    setIsSubmitting(true);
    try {
      // First register the device
      const deviceResponse = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(device),
      });

      if (!deviceResponse.ok) {
        const errorData = await deviceResponse.json();
        throw new Error(errorData.error || 'Failed to register device');
      }

      const createdDevice = await deviceResponse.json();
      
      // Then create the dog profile with device reference
      const profileWithDevice: NewDogData = {
        ...profile,
        deviceInfo: {
          deviceId: createdDevice.deviceId,
          name: createdDevice.name,
        }
      };

      await onProfileCreation(profileWithDevice);
      handleOpenChange(false);
    } catch (error) {
      console.error('Error creating profile with device:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
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
          <DogRegistrationForm 
            onSubmit={handleDogRegistration} 
            initialData={{ collarActivated: hasCollar ?? false }}
            isLoading={isSubmitting}
          />
        );

      case 'device-registration':
        return (
          <DeviceRegistrationForm
            onSubmit={handleDeviceRegistration}
            onBack={() => setStep('dog-registration')}
            isLoading={isSubmitting}
          />
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

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default DogProfileDialog;