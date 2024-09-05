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
      setDogProfiles(data);
    } catch (error) {
      console.error('Error fetching dog profiles:', error);
      toast({ title: "Error", description: "Failed to fetch dog profiles.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDogProfile = (newDog: DogData) => {
    setDogProfiles([...dogProfiles, newDog]);
    setShowCreateModal(false);
    toast({ title: "Success", description: "Dog profile created successfully." });
  };

  const handleActivateCollar = async (dogId: string) => {
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
        ) : (
          dogProfiles.map((dog) => (
            <DogProfileCard 
              key={dog._id} 
              dog={dog} 
              onActivateCollar={() => handleActivateCollar(dog._id)}
            />
          ))
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