import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewDogData, initialFormData } from '@/types/dogTypes';

interface DogRegistrationFormProps {
  onSubmit: (data: NewDogData) => void;
}

const DogRegistrationForm: React.FC<DogRegistrationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<NewDogData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value, 10) : value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
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
        <Select name="gender" onValueChange={(value) => handleSelectChange(value, 'gender')} required>
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
      <div>
        <Label htmlFor="picture">Picture</Label>
        <Input id="picture" name="picture" type="file" onChange={handleFileChange} accept="image/*" />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default DogRegistrationForm;