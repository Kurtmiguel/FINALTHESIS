'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DogProfileCard from '@/components/DogProfileCard';
import CreateDogProfileModal from '@/components/CreateDogProfileModal';
import { toast } from "@/components/ui/use-toast";
import { DogData } from '@/lib/schemas';
import RealTimeTracking from './RealtimeTracking';

export default function MonitoringPageContent() {
  const { data: session } = useSession();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dogProfiles, setDogProfiles] = useState<DogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDogProfiles();
  }, []);

  const fetchDogProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dogs');
      if (!response.ok) throw new Error('Failed to fetch dog profiles');
      const data: DogData[] = await response.json();
      console.log('Fetched dog profiles:', data);
      setDogProfiles(data);
    } catch (error) {
      console.error('Error fetching dog profiles:', error);
      toast({ title: "Error", description: "Failed to fetch dog profiles.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDogProfile = (newDog: DogData) => {
    console.log('New dog profile received:', newDog);
    setDogProfiles(prevProfiles => {
      const updatedProfiles = [...prevProfiles, newDog];
      console.log('Updated dog profiles:', updatedProfiles);
      return updatedProfiles;
    });
    setShowCreateModal(false);
  };

  const handleActivateCollar = async (dogId: string) => {
    console.log('Activating collar for dog:', dogId);
    // Implement collar activation logic here
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Button onClick={() => setShowCreateModal(true)} className="w-full">
          Create Dog Profile
        </Button>
        {isLoading ? (
          <div>Loading dog profiles...</div>
        ) : dogProfiles.length > 0 ? (
          dogProfiles.map((dog) => (
            <DogProfileCard 
              key={dog._id} 
              dog={dog} 
              onActivateCollar={() => handleActivateCollar(dog._id)}
            />
          ))
        ) : (
          <div>No dog profiles found. Create one to get started!</div>
        )}
      </div>
      <div className="h-1/2 p-6 bg-gray-100">
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <RealTimeTracking />
          </CardContent>
        </Card>
      </div>
      {showCreateModal && (
        <CreateDogProfileModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDogProfile}
        />
      )}
    </div>
  );
}