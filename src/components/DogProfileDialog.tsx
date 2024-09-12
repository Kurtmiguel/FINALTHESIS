import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import DogRegistrationForm from './DogRegistrationForm';
import { NewDogData } from '@/lib/schemas';

interface DogProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileCreation: (profile: NewDogData) => Promise<void>;
}

const DogProfileDialog: React.FC<DogProfileDialogProps> = ({ open, onOpenChange, onProfileCreation }) => {
  const [step, setStep] = useState<'collar-choice' | 'registration'>('collar-choice');
  const [hasCollar, setHasCollar] = useState<boolean | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset the state when closing the dialog
      setStep('collar-choice');
      setHasCollar(null);
    }
    onOpenChange(newOpen);
  };

  const handleCollarChoice = (choice: boolean) => {
    setHasCollar(choice);
    setStep('registration');
  };

  const handleSubmit = async (data: NewDogData) => {
    await onProfileCreation({ ...data, collarActivated: hasCollar ?? false });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Dog Profile</DialogTitle>
        </DialogHeader>
        {step === 'collar-choice' ? (
          <div className="flex flex-col items-center space-y-4">
            <p>Does the dog have a smart collar?</p>
            <div className="flex space-x-4">
              <Button onClick={() => handleCollarChoice(true)}>Yes</Button>
              <Button onClick={() => handleCollarChoice(false)}>No</Button>
            </div>
          </div>
        ) : (
          <DogRegistrationForm 
            onSubmit={handleSubmit} 
            initialData={{ collarActivated: hasCollar ?? false }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DogProfileDialog;