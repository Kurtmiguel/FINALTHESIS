import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { DogData } from '@/lib/schemas';

interface DogProfileCardProps {
  dog: DogData;
  onActivateCollar: () => void;
}

export default function DogProfileCard({ dog, onActivateCollar }: DogProfileCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className="w-1/4">
          <Image
            src={dog.imageUrl || '/placeholder-dog.png'}
            alt={dog.name}
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
        </div>
        <div className="w-2/4">
          <p><strong>Name:</strong> {dog.name}</p>
          <p><strong>Gender:</strong> {dog.gender}</p>
          <p><strong>Breed:</strong> {dog.breed}</p>
          <p><strong>Age:</strong> {dog.age}</p>
          <p><strong>Birthday:</strong> {new Date(dog.birthday).toLocaleDateString()}</p>
        </div>
        <div className="w-1/4 flex justify-end">
          <Button onClick={onActivateCollar} disabled={dog.collarActivated}>
            {dog.collarActivated ? 'Connected' : 'Activate Collar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}