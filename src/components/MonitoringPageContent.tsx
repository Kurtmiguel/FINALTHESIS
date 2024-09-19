'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import DogProfileDialog from '@/components/DogProfileDialog';
import DogProfileEditDialog from '@/components/DogProfileEditDialog';
import DogProfileCard from '@/components/DogProfileCard';
import { DogData, NewDogData, UpdateDogData } from '@/lib/schemas';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert";

const MonitoringPageContent: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editingDog, setEditingDog] = useState<DogData | null>(null);
  const [dogProfiles, setDogProfiles] = useState<DogData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDogProfiles();
    }
  }, [status, router]);

  const fetchDogProfiles = async () => {
    try {
      const response = await fetch('/api/dogs');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in.');
        }
        throw new Error('Failed to fetch dog profiles');
      }
      const data: DogData[] = await response.json();
      console.log('Fetched dog profiles:', data);
      setDogProfiles(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching dog profiles:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleProfileCreation = async (newProfile: NewDogData) => {
    try {
      console.log('Creating new dog profile:', newProfile);
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfile),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in.');
        }
        throw new Error('Failed to create dog profile');
      }

      const createdProfile: DogData = await response.json();
      console.log('Created dog profile:', createdProfile);
      
      setDogProfiles(prevProfiles => [...prevProfiles, createdProfile]);
      setIsCreateDialogOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error creating dog profile:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleEditProfile = (id: string) => {
    const dogToEdit = dogProfiles.find(dog => dog._id === id);
    if (dogToEdit) {
      setEditingDog(dogToEdit);
      setIsEditDialogOpen(true);
    }
  };

  const handleProfileUpdate = async (id: string, updatedProfile: UpdateDogData) => {
    try {
      console.log('Updating dog profile:', id, updatedProfile);
      const response = await fetch(`/api/dogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in.');
        }
        throw new Error('Failed to update dog profile');
      }

      const updatedDog: DogData = await response.json();
      console.log('Updated dog profile:', updatedDog);
      
      setDogProfiles(prevProfiles => 
        prevProfiles.map(dog => dog._id === id ? updatedDog : dog)
      );
      setIsEditDialogOpen(false);
      setEditingDog(null);
      setError(null);
    } catch (error) {
      console.error('Error updating dog profile:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating the profile');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      console.log('Deleting dog profile:', id);
      const response = await fetch(`/api/dogs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in.');
        }
        throw new Error('Failed to delete dog profile');
      }

      const data = await response.json();
      console.log(data.message); // Log the success message

      // If the delete was successful, update the UI immediately
      setDogProfiles(prevProfiles => prevProfiles.filter(dog => dog._id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting dog profile:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while deleting the profile');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dog Monitoring Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Manage and monitor your dog profiles</p>
        </div>

        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Dog Profiles</h2>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center space-x-2"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Create Dog Profile</span>
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dogProfiles.map((profile) => (
                <DogProfileCard 
                  key={profile._id} 
                  profile={profile} 
                  onEdit={handleEditProfile}
                  onDelete={handleDeleteProfile}
                />
              ))}
            </div>

            {dogProfiles.length === 0 && !error && (
              <div className="text-center py-12">
                <PlusCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No dog profiles</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new dog profile.</p>
                <div className="mt-6">
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create Dog Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DogProfileDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen}
          onProfileCreation={handleProfileCreation}
        />
        <DogProfileEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onProfileUpdate={handleProfileUpdate}
          dogProfile={editingDog}
        />
      </div>
    </div>
  );
};

export default MonitoringPageContent;