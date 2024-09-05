import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewDogData, DogData } from '@/lib/schemas';
import { toast } from "@/components/ui/use-toast";

interface CreateDogProfileModalProps {
  onClose: () => void;
  onSubmit: (dog: DogData) => void;
}

export default function CreateDogProfileModal({ onClose, onSubmit }: CreateDogProfileModalProps) {
  const [dogData, setDogData] = useState<NewDogData>({
    name: '',
    gender: 'male',
    breed: '',
    age: 0,
    birthday: '',
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setDogData({ ...dogData, [e.target.name]: value });
  };

  const handleSelectChange = (name: 'gender') => (value: 'male' | 'female') => {
    setDogData({ ...dogData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDogData({ ...dogData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Submitting dog data:', dogData);

    try {
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dogData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create dog profile');
      }

      const newDog: DogData = await response.json();
      console.log('New dog created:', newDog);

      onSubmit(newDog);
      toast({ title: "Success", description: "Dog profile created successfully." });
    } catch (error) {
      console.error('Error creating dog profile:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create dog profile.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Dog Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... (form fields remain the same) ... */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={dogData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select onValueChange={handleSelectChange('gender')} value={dogData.gender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="breed">Breed</Label>
            <Input id="breed" name="breed" value={dogData.breed} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" name="age" type="number" value={dogData.age} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="birthday">Birthday</Label>
            <Input id="birthday" name="birthday" type="date" value={dogData.birthday} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="image">Picture</Label>
            <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}