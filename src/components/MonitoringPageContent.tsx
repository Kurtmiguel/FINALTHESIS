'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import DogProfileDialog from '@/components/DogProfileDialog';
import DogProfileEditDialog from '@/components/DogProfileEditDialog';
import DogProfileCard from '@/components/DogProfileCard';
import { DogData, NewDogData, UpdateDogData } from '@/lib/schemas';
import { useRouter } from 'next/navigation';

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
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // This will prevent any flash of content before redirecting
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <main className="flex-1 bg-gray-100 p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Dog Profiles</h2>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Dog Profile</span>
                </Button>
              </div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <div className="space-y-4">
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
                <p className="text-center text-gray-500 mt-4">No dog profiles created yet. Click the button above to add a new profile.</p>
              )}
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
        </main>
      </div>
    </div>
  );
};

export default MonitoringPageContent;