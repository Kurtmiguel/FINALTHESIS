'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Loader2, Bug, Dog } from 'lucide-react';
import DogProfileDialog from '@/components/DogProfileDialog';
import DogProfileEditDialog from '@/components/DogProfileEditDialog';
import DogProfileCard from '@/components/DogProfileCard';
import { DogData, NewDogData, UpdateDogData } from '@/lib/schemas';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert";

const MonitoringPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dogs'>('dogs');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editingDog, setEditingDog] = useState<DogData | null>(null);
  const [dogProfiles, setDogProfiles] = useState<DogData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
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
      console.log('🔍 [Dashboard] Fetching dog profiles...');
      const response = await fetch('/api/dogs');
      
      console.log('📡 [Dashboard] Dog profiles response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in.');
        }
        throw new Error('Failed to fetch dog profiles');
      }
      const data: DogData[] = await response.json();
      console.log('✅ [Dashboard] Fetched dog profiles:', data);
      setDogProfiles(data);
      setError(null);
      
      // Update debug info
      setDebugInfo({
        profileCount: data.length,
        profilesWithDevices: data.filter(dog => dog.deviceInfo).length,
        lastFetch: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [Dashboard] Error fetching dog profiles:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleProfileCreation = async (newProfile: NewDogData) => {
    try {
      console.log('🐕 [Dashboard] Creating new dog profile:', newProfile);
      setError(null);
      
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfile),
      });

      console.log('📡 [Dashboard] Dog creation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [Dashboard] Dog creation failed:', errorData);
        
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in.');
        } else if (response.status === 400) {
          // Handle specific device-related errors
          if (errorData.error?.includes('Device not found')) {
            throw new Error('Device registration failed: ' + errorData.error + ' Please register the device first or contact support.');
          } else {
            throw new Error(errorData.error || 'Failed to create dog profile');
          }
        } else {
          throw new Error('Failed to create dog profile');
        }
      }

      const createdProfile: DogData = await response.json();
      console.log('✅ [Dashboard] Created dog profile:', createdProfile);
      
      setDogProfiles(prevProfiles => [...prevProfiles, createdProfile]);
      setIsCreateDialogOpen(false);
      setError(null);
      
      // Refresh the list to get updated device info
      setTimeout(() => {
        fetchDogProfiles();
      }, 1000);
      
    } catch (error) {
      console.error('❌ [Dashboard] Error creating dog profile:', error);
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
      console.log('🔄 [Dashboard] Updating dog profile:', id, updatedProfile);
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
      console.log('✅ [Dashboard] Updated dog profile:', updatedDog);
      
      setDogProfiles(prevProfiles => 
        prevProfiles.map(dog => dog._id === id ? updatedDog : dog)
      );
      setIsEditDialogOpen(false);
      setEditingDog(null);
      setError(null);
    } catch (error) {
      console.error('❌ [Dashboard] Error updating dog profile:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating the profile');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      console.log('🗑️ [Dashboard] Deleting dog profile:', id);
      
      // Find the dog profile to check if it has an assigned device
      const dogToDelete = dogProfiles.find(dog => dog._id === id);
      
      // If the dog has an assigned device, delete it first
      if (dogToDelete?.assignedDevice) {
        console.log('🔧 [Dashboard] Dog has assigned device, deleting device first:', dogToDelete.assignedDevice);
        
        const deviceResponse = await fetch(`/api/devices/${dogToDelete.assignedDevice}`, {
          method: 'DELETE',
        });
        
        if (deviceResponse.ok) {
          const deviceResult = await deviceResponse.json();
          console.log('✅ [Dashboard] Device deleted successfully:', deviceResult);
        } else {
          console.warn('⚠️ [Dashboard] Device deletion failed, but continuing with profile deletion');
        }
      }
      
      // Now delete the dog profile
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
      console.log('✅ [Dashboard] Dog profile deleted successfully:', data.message);

      // If the delete was successful, update the UI immediately
      setDogProfiles(prevProfiles => prevProfiles.filter(dog => dog._id !== id));
      setError(null);
      
      // Show success message
      const deviceMessage = dogToDelete?.deviceInfo ? 
        ` and associated device "${dogToDelete.deviceInfo.deviceId}"` : '';
      alert(`${dogToDelete?.name}'s profile${deviceMessage} has been deleted successfully.`);
      
    } catch (error) {
      console.error('❌ [Dashboard] Error deleting dog profile:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while deleting the profile');
    }
  };

  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pet Monitoring Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">Manage your pets and smart collar devices</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDebugInfo}
              className="flex items-center space-x-2"
            >
              <Bug className="w-4 h-4" />
              <span>Debug</span>
            </Button>
          </div>
        </div>

        {/* Debug Information */}
        {showDebugInfo && debugInfo && (
          <div className="mb-6 bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
            <h3 className="text-white font-bold mb-3">🔍 Debug Information</h3>
            <div className="space-y-1">
              <div><strong>Total Profiles:</strong> {debugInfo.profileCount}</div>
              <div><strong>Profiles with Devices:</strong> {debugInfo.profilesWithDevices}</div>
              <div><strong>Last Fetch:</strong> {debugInfo.lastFetch}</div>
              <div><strong>Session Status:</strong> {status}</div>
              <div><strong>User Email:</strong> {session?.user?.email}</div>
              <div><strong>Active Tab:</strong> {activeTab}</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              <strong>Error:</strong> {error}
              <br />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setError(null)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dogs')}>
          <TabsList className="grid w-full grid-cols-1 mb-6">
            <TabsTrigger value="dogs" className="flex items-center space-x-2">
              <Dog className="w-4 h-4" />
              <span>Dog Profiles</span>
            </TabsTrigger>
          </TabsList>

          {/* Dogs Tab */}
          <TabsContent value="dogs">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Dog Profiles</h2>
                  <Button 
                    onClick={() => {
                      console.log('➕ [Dashboard] Opening create dialog');
                      setIsCreateDialogOpen(true);
                      setError(null); // Clear any existing errors
                    }}
                    className="flex items-center space-x-2"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Create Dog Profile</span>
                  </Button>
                </div>

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
                    <Dog className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No dog profiles</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new dog profile.</p>
                    <div className="mt-6">
                      <Button onClick={() => {
                        console.log('➕ [Dashboard] Opening create dialog from empty state');
                        setIsCreateDialogOpen(true);
                        setError(null);
                      }}>
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Create Dog Profile
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <DogProfileDialog 
          open={isCreateDialogOpen} 
          onOpenChange={(open) => {
            console.log('📱 [Dashboard] Dialog open state changed:', open);
            setIsCreateDialogOpen(open);
            if (!open) {
              setError(null); // Clear errors when closing
            }
          }}
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