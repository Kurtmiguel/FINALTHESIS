import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DogData } from '@/types/dogTypes';

interface EditDogProfileFormProps {
  dog: DogData;
  onSubmit: (updatedDog: DogData) => void;
}

const EditDogProfileForm: React.FC<EditDogProfileFormProps> = ({ dog, onSubmit }) => {
  const [formData, setFormData] = useState<DogData>(dog);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Dog's Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="gender">Gender</Label>
        <Select name="gender" onValueChange={(value) => handleSelectChange(value, 'gender')} value={formData.gender}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="breed">Breed</Label>
        <Input id="breed" name="breed" value={formData.breed} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="age">Age</Label>
        <Input id="age" name="age" type="number" value={formData.age.toString()} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="birthday">Birthday</Label>
        <Input id="birthday" name="birthday" type="date" value={formData.birthday} onChange={handleChange} required />
      </div>
      <Button type="submit">Update Profile</Button>
    </form>
  );
};

export default EditDogProfileForm;