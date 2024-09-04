'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DogRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialHasCollar: boolean;
}

export default function DogRegistrationForm({ 
  open, 
  onOpenChange, 
  initialHasCollar 
}: DogRegistrationFormProps) {
  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [dogPicture, setDogPicture] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', dogName);
      formData.append('breed', breed);
      formData.append('hasCollar', initialHasCollar.toString());
      if (dogPicture) {
        formData.append('dogPicture', dogPicture);
      }

      const response = await fetch('/api/dogs', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Dog registered successfully!');
        onOpenChange(false);
      } else {
        throw new Error('Failed to register dog');
      }
    } catch (error) {
      console.error('Error registering dog:', error);
      alert('Failed to register dog. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register Your Dog</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dogName">Dog Name</Label>
            <Input
              id="dogName"
              value={dogName}
              onChange={(e) => setDogName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="breed">Breed</Label>
            <Input
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="dogPicture">Dog Picture</Label>
            <Input
              id="dogPicture"
              type="file"
              accept="image/*"
              onChange={(e) => setDogPicture(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Register Dog</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}