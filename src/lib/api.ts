import axios from 'axios';
import type { College } from './types';

export type ApiSport = {
    id: number;
    name: string;
    type: 'Team' | 'Individual';
    max_players: number;
    amount: string;
};

const API_BASE_URL = 'https://energy-sports-meet-backend.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getColleges = async (): Promise<College[]> => {
    const response = await fetch(`${API_BASE_URL}/colleges`);
    if (!response.ok) {
        throw new Error('Failed to fetch colleges');
    }
    const responseData = await response.json();
    
    const collegesFromApi: { id: number; name: string; city: string; state: string; }[] = Array.isArray(responseData) ? responseData : responseData?.data || [];
    
    const formattedColleges: College[] = collegesFromApi.map(college => ({
        ...college,
        id: String(college.id),
    }));
  
    // Adding a default "Other" option for manual entry
    return [...formattedColleges, { id: 'other', name: 'Other (Please specify)', city: '', state: '' }];
};

export const getSports = async (): Promise<ApiSport[]> => {
  const response = await fetch(`${API_BASE_URL}/sports`);
  if (!response.ok) {
    throw new Error('Failed to fetch sports');
  }
  const responseData = await response.json();
  
  // Defensively handle cases where the data might be nested or not an array
  return Array.isArray(responseData) ? responseData : responseData?.data || [];
};

export const registerStudent = async (formData: FormData) => {
  const response = await api.post('/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
