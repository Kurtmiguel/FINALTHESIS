'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, WifiOff } from 'lucide-react';
import DogRegistrationForm from '@/components/DogRegistrationForm';
import EditDogProfileForm from '@/components/EditDogProfileForm';
import { NewDogData, DogData } from '@/types/dogTypes';

const MonitoringPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dogs, setDogs] = useState<DogData[]>([]);
  const [editingDog, setEditingDog] = useState<DogData | null>(null);

  const fetchDogs = async () => {
    try {
      const response = await fetch('/api/dogs');
      if (response.ok) {
        const data = await response.json();
        setDogs(data);
      } else {
        console.error('Failed to fetch dogs');
      }
    } catch (error) {
      console.error('Error fetching dogs:', error);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, []);

  const handleFormSubmit = async (data: NewDogData) => {
    try {
      const response = await fetch('/api/register/dog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        console.log('Dog profile created successfully');
        fetchDogs(); // Refresh the dog list
      } else {
        console.error('Failed to create dog profile');
      }
    } catch (error) {
      console.error('Error creating dog profile:', error);
    }
    setIsDialogOpen(false);
  };

  const handleEditSubmit = async (updatedDog: DogData) => {
    try {
      const response = await fetch(`/api/dogs/${updatedDog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDog),
      });
      if (response.ok) {
        console.log('Dog profile updated successfully');
        fetchDogs(); // Refresh the dog list
      } else {
        console.error('Failed to update dog profile');
      }
    } catch (error) {
      console.error('Error updating dog profile:', error);
    }
    setEditingDog(null);
  };

  const handleDelete = async (dogId: string) => {
    try {
      const response = await fetch(`/api/dogs/${dogId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Dog profile deleted successfully');
        fetchDogs(); // Refresh the dog list
      } else {
        console.error('Failed to delete dog profile');
      }
    } catch (error) {
      console.error('Error deleting dog profile:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monitoring Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-center mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                <PlusCircle className="h-5 w-5" />
                <span>Create Dog Profile</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Dog Registration Form</DialogTitle>
              </DialogHeader>
              <DogRegistrationForm onSubmit={handleFormSubmit} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dogs.map((dog) => (
            <div key={dog._id} className="bg-gray-100 p-4 rounded-lg flex items-start space-x-4">
              <img 
                src={dog.imageUrl || '/placeholder-dog.png'} 
                alt={dog.name} 
                className="w-24 h-24 object-cover rounded-full"
              />
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{dog.name}</h3>
                <p>Breed: {dog.breed}</p>
                <p>Gender: {dog.gender}</p>
                <p>Age: {dog.age}</p>
                <p className="flex items-center mt-2">
                  <WifiOff className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-500">No Smart Collar</span>
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <Dialog open={editingDog?._id === dog._id} onOpenChange={(open) => open ? setEditingDog(dog) : setEditingDog(null)}>
                  <DialogTrigger asChild>
                    <Button className="bg-yellow-500 hover:bg-yellow-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Dog Profile</DialogTitle>
                    </DialogHeader>
                    {editingDog && <EditDogProfileForm dog={editingDog} onSubmit={handleEditSubmit} />}
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-red-500 hover:bg-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this dog profile?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the dog profile from the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(dog._id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;