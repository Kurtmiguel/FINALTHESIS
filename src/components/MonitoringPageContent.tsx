import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";

interface Dog {
  _id: string;
  name: string;
  gender: string;
  breed: string;
  age: number;
  birthday: string;
  imageUrl: string;
}

interface DogForm {
  name: string;
  gender: string;
  breed: string;
  age: string;
  birthday: string;
  imageUrl: string;
}

export default function MonitoringPageContent() {
  const { data: session, status } = useSession();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasCollar, setHasCollar] = useState<boolean | null>(null);
  const [dogForm, setDogForm] = useState<DogForm>({
    name: '',
    gender: '',
    breed: '',
    age: '',
    birthday: '',
    imageUrl: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDogs();
    }
  }, [status]);

  const fetchDogs = async () => {
    try {
      const response = await fetch('/api/dogs');
      if (response.ok) {
        const data: Dog[] = await response.json();
        setDogs(data);
      } else {
        throw new Error('Failed to fetch dogs');
      }
    } catch (error) {
      console.error('Error fetching dogs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dogs. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateDog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dogForm),
      });

      if (response.ok) {
        const newDog: Dog = await response.json();
        setDogs([...dogs, newDog]);
        setIsOpen(false);
        toast({
          title: "Success",
          description: "Dog profile created successfully!",
        });
      } else {
        throw new Error('Failed to create dog profile');
      }
    } catch (error) {
      console.error('Error creating dog profile:', error);
      toast({
        title: "Error",
        description: "Failed to create dog profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDogForm({ ...dogForm, [name]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload this file to a server or cloud storage
      // and get back a URL. For this example, we'll use a placeholder URL.
      setDogForm({ ...dogForm, imageUrl: '/placeholder-dog-image.jpg' });
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please sign in to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dog Monitoring</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Create Dog Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Dog Profile</DialogTitle>
            </DialogHeader>
            {hasCollar === null ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Does the dog have a collar?</h3>
                <RadioGroup onValueChange={(value: string) => setHasCollar(value === 'yes')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <form onSubmit={handleCreateDog} className="space-y-4">
                <div>
                  <Label htmlFor="name">Dog's Name</Label>
                  <Input id="name" name="name" onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" name="gender" onChange={handleInputChange} className="w-full p-2 border rounded" required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input id="breed" name="breed" onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input id="birthday" name="birthday" type="date" onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="picture">Picture</Label>
                  <Input id="picture" name="picture" type="file" onChange={handleFileChange} accept="image/*" required />
                </div>
                <Button type="submit">Create Profile</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dogs.map((dog) => (
          <Card key={dog._id}>
            <CardHeader>
              <CardTitle>{dog.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Age: {dog.age}</p>
              <p>Breed: {dog.breed}</p>
              <img src={dog.imageUrl} alt={dog.name} className="mt-2 w-full h-40 object-cover rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}