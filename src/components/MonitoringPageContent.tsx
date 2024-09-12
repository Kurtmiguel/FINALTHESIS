'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import DogProfileDialog from './DogProfileDialog';


const MonitoringPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <main className="flex-1 bg-gray-100 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center">
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Dog Profile</span>
                </Button>
                <DogProfileDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Monitoring Dashboard</h2>
              <p className="text-gray-600">Your monitoring content goes here.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MonitoringPage;