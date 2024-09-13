import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DogRegistrationForm from './DogRegistrationForm';
import { DogData, UpdateDogData } from '@/lib/schemas';

interface DogProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (id: string, profile: UpdateDogData) => Promise<void>;
  dogProfile: DogData | null;
}

const DogProfileEditDialog: React.FC<DogProfileEditDialogProps> = ({ 
  open, 
  onOpenChange, 
  onProfileUpdate, 
  dogProfile 
}) => {
  const handleSubmit = async (data: UpdateDogData) => {
    if (dogProfile) {
      await onProfileUpdate(dogProfile._id, data);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Dog Profile</DialogTitle>
        </DialogHeader>
        {dogProfile && (
          <DogRegistrationForm 
            onSubmit={handleSubmit} 
            initialData={dogProfile}
            isEditMode={true}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DogProfileEditDialog;