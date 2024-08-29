"use client";

import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PawPrint } from "lucide-react";

export default function DogRegister() {
  const [image, setImage] = useState<File | null>(null);
  const [hasCollar, setHasCollar] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    const form = e.currentTarget;
    const formData = new FormData();

    formData.append('dogName', (form.dogName as HTMLInputElement).value);
    formData.append('breed', (form.breed as HTMLInputElement).value);
    formData.append('age', (form.age as HTMLInputElement).value);
    formData.append('hasCollar', hasCollar.toString());

    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('/api/register-dog', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        setStatus({ type: 'success', message: 'Dog registered successfully!' });
        form.reset();
        setImage(null);
        setHasCollar(false);
      } else {
        setStatus({ type: 'error', message: 'Failed to register dog. Please try again.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again later.' });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <PawPrint className="h-6 w-6" />
            Dog Registration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="dogName" className="text-gray-700">Dog Name</Label>
              <Input id="dogName" name="dogName" placeholder="Enter dog's name" required className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed" className="text-gray-700">Breed</Label>
              <Input id="breed" name="breed" placeholder="Enter dog's breed" required className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-gray-700">Age</Label>
              <Input id="age" name="age" type="number" placeholder="Enter dog's age" required className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image" className="text-gray-700">Dog Image</Label>
              <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex items-center space-x-2">
                <Button type="button" onClick={handleChooseFile} variant="outline">
                  Choose File
                </Button>
                <span className="text-sm text-gray-500">
                  {image ? image.name : 'No file chosen'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasCollar"
                checked={hasCollar}
                onChange={(e) => setHasCollar(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="hasCollar" className="text-sm font-medium text-gray-700">
                Dog has a collar
              </Label>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
              Register Dog
            </Button>
          </form>
          {status.type && (
            <div className={`mt-4 p-3 rounded-md ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {status.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}