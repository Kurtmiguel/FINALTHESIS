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
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex items-center space-x-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <Image
            src={profile.imageUrl || '/placeholder-dog-image.jpg'}
            alt={`${profile.name}'s picture`}
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        </div>
        
        <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="font-semibold">Name: </span>
            <span>{profile.name}</span>
          </div>
          <div>
            <span className="font-semibold">Age: </span>
            <span>{profile.age} years</span>
          </div>
          <div>
            <span className="font-semibold">Gender: </span>
            <span>{profile.gender}</span>
          </div>
          <div>
            <span className="font-semibold">Birthday: </span>
            <span>{new Date(profile.birthday).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-semibold">Breed: </span>
            <span>{profile.breed}</span>
          </div>
          <div>
            <span className="font-semibold">Smart Collar: </span>
            <Badge variant={profile.collarActivated ? "default" : "secondary"}>
              {profile.collarActivated ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
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