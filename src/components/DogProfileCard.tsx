import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DogData } from '@/lib/schemas';

interface DogProfileCardProps {
  profile: DogData;
}

const DogProfileCard: React.FC<DogProfileCardProps> = ({ profile }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={profile.imageUrl || '/placeholder-dog-image.jpg'}
            alt={`${profile.name}'s picture`}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl mb-2">{profile.name}</CardTitle>
        <div className="space-y-1">
          <p><span className="font-semibold">Gender:</span> {profile.gender}</p>
          <p><span className="font-semibold">Breed:</span> {profile.breed}</p>
          <p><span className="font-semibold">Age:</span> {profile.age}</p>
          <p><span className="font-semibold">Birthday:</span> {new Date(profile.birthday).toLocaleDateString()}</p>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Smart Collar:</span>
            <Badge variant={profile.collarActivated ? "default" : "secondary"}>
              {profile.collarActivated ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DogProfileCard;