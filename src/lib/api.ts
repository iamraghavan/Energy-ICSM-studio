import axios from 'axios';
import type { College } from './types';

export type ApiSport = {
    id: number;
    name: string;
    type: 'Team' | 'Individual';
    max_players: number;
    amount: string;
};


const api = axios.create({
  baseURL: 'https://energy-sports-meet-backend.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getColleges = async (): Promise<College[]> => {
    const response = await api.get('/colleges');
    const collegesFromApi: { id: number; name: string; city: string; state: string; }[] = response.data;
    
    const formattedColleges: College[] = collegesFromApi.map(college => ({
        ...college,
        id: String(college.id),
    }));
  
    // Adding a default "Other" option for manual entry
    return [...formattedColleges, { id: 'other', name: 'Other (Please specify)', city: '', state: '' }];
  };

export const getSports = async (): Promise<ApiSport[]> => {
  const response = await api.get('/sports');
  return response.data;
};

export const registerStudent = async (formData: FormData) => {
  const response = await api.post('/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
