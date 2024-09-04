'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PlusIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CollarSelectionDialog from '@/components/CollarSellectionDialog';
import DogRegistrationForm from '@/components/DogRegistrationForm.tsx';


export default function MonitoringPage() {
  const { data: session } = useSession();
  const [showCollarSelection, setShowCollarSelection] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [hasCollar, setHasCollar] = useState(false);

  const handleCollarSelection = (collarStatus: boolean) => {
    setHasCollar(collarStatus);
    setShowCollarSelection(false);
    setShowRegistrationForm(true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-sky-100 border-2 border-sky-200">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {session?.user?.name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is your personal dashboard. Here you can manage your canine registrations and view important information.</p>
          <Button 
            onClick={() => setShowCollarSelection(true)} 
            className="mt-4 bg-sky-500 hover:bg-sky-600"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add your Dog
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Registered Dogs</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add a list or grid of registered dogs here */}
          <p>No dogs registered yet.</p>
        </CardContent>
      </Card>

      <CollarSelectionDialog
        open={showCollarSelection}
        onOpenChange={setShowCollarSelection}
        onSelect={handleCollarSelection}
      />

      {showRegistrationForm && (
        <DogRegistrationForm
          open={showRegistrationForm}
          onOpenChange={setShowRegistrationForm}
          initialHasCollar={hasCollar}
        />
      )}
    </div>
  );
}