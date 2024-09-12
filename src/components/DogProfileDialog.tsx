import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DogRegistrationForm from './DogRegistrationForm';

interface DogProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DogProfileDialog: React.FC<DogProfileDialogProps> = ({ open, onOpenChange }) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      // Reset the dialog state when it's closed
      setShowRegistrationForm(false);
    }
  }, [open]);

  const handleCreateProfile = (hasSmartCollar: boolean): void => {
    if (hasSmartCollar) {
      console.log("Creating dog profile with smart collar");
      onOpenChange(false);
      // Add your logic for smart collar profile creation
    } else {
      setShowRegistrationForm(true);
    }
  };

  const handleFormSubmit = (dogProfile: any) => {
    console.log("Submitting dog profile:", dogProfile);
    // Here you would handle the submission of the dog profile
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Dog Profile</DialogTitle>
        </DialogHeader>
        {!showRegistrationForm ? (
          <div className="grid gap-4 py-4">
            <p className="text-center">Does the dog have a smart collar?</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => handleCreateProfile(true)} variant="outline">
                Yes
              </Button>
              <Button onClick={() => handleCreateProfile(false)} variant="outline">
                No
              </Button>
            </div>
          </div>
        ) : (
          <DogRegistrationForm onSubmit={handleFormSubmit} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DogProfileDialog;