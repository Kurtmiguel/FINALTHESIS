import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  Trash2, 
  MapPin, 
  Smartphone, 
  Battery, 
  AlertTriangle, 
  MoreVertical
} from 'lucide-react';
import { DogData } from '@/lib/schemas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DogProfileCardProps {
  profile: DogData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Define the valid Badge variants
type BadgeVariant = "secondary" | "default" | "destructive" | "outline" | null | undefined;

const DogProfileCard: React.FC<DogProfileCardProps> = ({ 
  profile, 
  onEdit, 
  onDelete
}) => {
  const router = useRouter();

  const handleTrackDog = () => {
    // Check if device is still available
    if (!profile.deviceInfo) {
      alert('No device assigned to this dog. Please assign a smart collar device first.');
      return;
    }
    
    // Navigate to the tracking page for this specific dog
    router.push(`/tracking/${profile._id}`);
  };

  const handleDeleteProfile = () => {
    const deviceInfo = profile.deviceInfo;
    let confirmMessage = `Are you sure you want to delete ${profile.name}'s profile?\n\n`;
    
    if (deviceInfo) {
      confirmMessage += `This will also permanently remove the associated device "${deviceInfo.deviceId}" and all its data:\n`;
      confirmMessage += `• Device registration\n`;
      confirmMessage += `• All tracking data\n`;
      confirmMessage += `• All geofences\n`;
      confirmMessage += `• All alerts\n\n`;
    }
    
    confirmMessage += `This action cannot be undone.`;
    
    const confirmed = window.confirm(confirmMessage);
    if (confirmed) {
      onDelete(profile._id);
    }
  };

  const getCollarStatus = () => {
    if (!profile.collarActivated) {
      return {
        variant: "secondary" as BadgeVariant,
        text: "No Smart Collar",
        icon: null,
        isValid: false
      };
    }

    if (profile.deviceInfo) {
      const isActive = profile.deviceInfo.isActive;
      return {
        variant: (isActive ? "default" : "destructive") as BadgeVariant,
        text: isActive ? "Smart Collar Active" : "Smart Collar Inactive",
        icon: <Smartphone className="w-3 h-3 mr-1" />,
        isValid: isActive
      };
    }

    // Device was deleted or not found
    return {
      variant: "destructive" as BadgeVariant,
      text: "Device Missing",
      icon: <AlertTriangle className="w-3 h-3 mr-1" />,
      isValid: false
    };
  };

  const collarStatus = getCollarStatus();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-4">
          {/* Profile Header with Options Menu */}
          <div className="w-full flex justify-end mb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(profile._id)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteProfile}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
          {profile.deviceInfo ? (
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
          ) : profile.collarActivated && (
            <div className="mt-2 text-xs text-red-600 text-center">
              <div className="flex items-center justify-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Device not found or deleted</span>
              </div>
              <div className="mt-1">
                Please assign a new device or disable collar tracking
              </div>
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
          {/* Track Button (only show if collar is activated and device is valid) */}
          {profile.collarActivated && (
            <Button 
              className={`w-full ${
                collarStatus.isValid 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
              onClick={handleTrackDog}
              disabled={!collarStatus.isValid}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {collarStatus.isValid ? 'View Live Location' : 'Device Required'}
            </Button>
          )}
          
          {/* Device Assignment Warning */}
          {profile.collarActivated && !collarStatus.isValid && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
              <div className="flex items-center justify-center space-x-1 text-yellow-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">
                  {profile.deviceInfo ? 'Device inactive' : 'No device assigned'}
                </span>
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                Edit profile to assign a working device
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DogProfileCard;