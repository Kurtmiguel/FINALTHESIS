import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { DogData } from '@/lib/schemas';

interface DogProfileCardProps {
  profile: DogData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DogProfileCard: React.FC<DogProfileCardProps> = ({ profile, onEdit, onDelete }) => {
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
          <Badge variant={profile.collarActivated ? "default" : "secondary"} className="mt-2">
            {profile.collarActivated ? "Smart Collar Active" : "Smart Collar Inactive"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          <div>
            <span className="font-medium text-gray-500">Age: </span>
            <span className="text-gray-900">{profile.age} years</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Gender: </span>
            <span className="text-gray-900">{profile.gender}</span>
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
        
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => onEdit(profile._id)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(profile._id)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DogProfileCard;