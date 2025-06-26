import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MapPin, Smartphone, Battery } from 'lucide-react';
import { DogData } from '@/lib/schemas';

interface DogProfileCardProps {
  profile: DogData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DogProfileCard: React.FC<DogProfileCardProps> = ({ profile, onEdit, onDelete }) => {
  const router = useRouter();

  const handleTrackDog = () => {
    // Navigate to the tracking page for this specific dog
    router.push(`/tracking/${profile._id}`);
  };

  const getCollarStatus = () => {
    if (!profile.collarActivated) {
      return {
        variant: "secondary" as const,
        text: "No Smart Collar",
        icon: null
      };
    }

    if (profile.deviceInfo) {
      return {
        variant: "default" as const,
        text: profile.deviceInfo.isActive ? "Smart Collar Active" : "Smart Collar Inactive",
        icon: <Smartphone className="w-3 h-3 mr-1" />
      };
    }

    return {
      variant: "outline" as const,
      text: "Collar Setup Pending",
      icon: <Smartphone className="w-3 h-3 mr-1" />
    };
  };

  const collarStatus = getCollarStatus();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-24 h-24 mb-4">
            <Image
              src={profile.imageUrl || '/placeholder-dog-image.jpg'}
              alt={`${profile.name}'s picture`}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
          
          {/* Collar Status Badge */}
          <Badge variant={collarStatus.variant} className="mt-2 flex items-center">
            {collarStatus.icon}
            {collarStatus.text}
          </Badge>

          {/* Device Info (if available) */}
          {profile.deviceInfo && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              <div className="flex items-center justify-center space-x-2">
                <span>Device: {profile.deviceInfo.deviceId}</span>
                {profile.deviceInfo.batteryLevel !== undefined && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <Battery className="w-3 h-3 mr-1" />
                      <span>{profile.deviceInfo.batteryLevel}%</span>
                    </div>
                  </>
                )}
              </div>
              {profile.deviceInfo.lastSeen && (
                <div className="mt-1">
                  Last seen: {new Date(profile.deviceInfo.lastSeen).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          <div>
            <span className="font-medium text-gray-500">Age: </span>
            <span className="text-gray-900">{profile.age} years</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Gender: </span>
            <span className="text-gray-900 capitalize">{profile.gender}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Birthday: </span>
            <span className="text-gray-900">{new Date(profile.birthday).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Breed: </span>
            <span className="text-gray-900">{profile.breed}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Track Button (only show if collar is activated and device is assigned) */}
          {profile.collarActivated && profile.deviceInfo && (
            <Button 
              className="w-full mb-2 bg-green-600 hover:bg-green-700" 
              onClick={handleTrackDog}
            >
              <MapPin className="w-4 h-4 mr-2" />
              View Live Location
            </Button>
          )}
          
          {/* Edit and Delete buttons */}
          <div className="flex justify-between space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(profile._id)} className="flex-1">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(profile._id)} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DogProfileCard;