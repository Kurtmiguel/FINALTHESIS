import { dogSchema } from '@/lib/schemas';
import { z } from 'zod';

export type DogFormData = z.infer<typeof dogSchema>;

export interface DogData extends DogFormData {
  _id: string;
  owner: string;
  collarActivated: boolean;
}

export type NewDogData = Omit<DogFormData, 'collarActivated'>;

export type UpdateDogData = Partial<DogFormData>;

export const initialFormData: NewDogData = {
  name: '',
  gender: 'male',
  age: 0,
  breed: '',
  birthday: '',
  imageUrl: '',
};