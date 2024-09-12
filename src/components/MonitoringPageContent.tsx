'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import DogProfileDialog from '@/components/DogProfileDialog';
import DogProfileCard from '@/components/DogProfileCard';
import { DogData, NewDogData } from '@/lib/schemas';

const MonitoringPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dogProfiles, setDogProfiles] = useState<DogData[]>([]);

  useEffect(() => {
    fetchDogProfiles();
  }, []);

  const fetchDogProfiles = async () => {
    try {
      const response = await fetch('/api/dogs');
      if (!response.ok) throw new Error('Failed to fetch dog profiles');
      const data: DogData[] = await response.json();
      console.log('Fetched dog profiles:', data);
      setDogProfiles(data);
    } catch (error) {
      console.error('Error fetching dog profiles:', error);
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

      if (!response.ok) throw new Error('Failed to create dog profile');

      const createdProfile: DogData = await response.json();
      console.log('Created dog profile:', createdProfile);
      
      setDogProfiles(prevProfiles => [...prevProfiles, createdProfile]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating dog profile:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <main className="flex-1 bg-gray-100 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Dog Profiles</h2>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Dog Profile</span>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dogProfiles.map((profile) => (
                  <DogProfileCard key={profile._id} profile={profile} />
                ))}
              </div>
              {dogProfiles.length === 0 && (
                <p className="text-center text-gray-500 mt-4">No dog profiles created yet. Click the button above to add a new profile.</p>
              )}
            </div>
            <DogProfileDialog 
              open={isDialogOpen} 
              onOpenChange={setIsDialogOpen}
              onProfileCreation={handleProfileCreation}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MonitoringPage;