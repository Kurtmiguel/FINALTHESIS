"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Dog {
  _id: string;
  dogName: string;
  breed: string;
  age: string;
  hasCollar: boolean;
  imageUrl: string;
}

export default function RecordMonitoring() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await fetch('/api/dogs');
        const data = await response.json();
        setDogs(data);
      } catch (error) {
        console.error('Error fetching dogs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDogs();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Record & Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">This is where you can view and manage dog records.</p>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map((dog) => (
              <Card key={dog._id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedDog(dog)}>
                <CardContent className="p-4">
                  <img src={dog.imageUrl} alt={dog.dogName} className="w-full h-48 object-cover rounded-md mb-2" />
                  <p className="font-semibold text-center">{dog.dogName}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedDog} onOpenChange={() => setSelectedDog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedDog?.dogName}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              <p><strong>Breed:</strong> {selectedDog?.breed}</p>
              <p><strong>Age:</strong> {selectedDog?.age}</p>
              <p><strong>Has Collar:</strong> {selectedDog?.hasCollar ? 'Yes' : 'No'}</p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}