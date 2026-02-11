import axios from 'axios';
import type { College } from './types';

export type ApiSport = {
    id: number;
    name: string;
    type: 'Team' | 'Individual';
    max_players: number;
    amount: string;
};

export type Registration = {
    id: string;
    registration_code: string;
    student_id: string;
    sport_id: number;
    team_id: string | null;
    is_captain: boolean;
    accommodation_needed: boolean;
    payment_status: 'pending' | 'verified' | 'rejected' | 'approved';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    Student: {
        id: string;
        name: string;
        dob: string;
        gender: string;
        email: string;
        mobile: string;
        whatsapp: string;
        city: string;
        state: string;
        college_id: string | null;
        other_college: string | null;
        department: string;
        year_of_study: string;
        College: {
            id: number;
            name: string;
            city: string;
            state: string;
        } | null;
    };
    Sport: {
        id: number;
        name: string;
        type: 'Team' | 'Individual';
        amount: string;
    } | null;
    Team: {
        id: string;
        sport_id: number;
        team_name: string;
        captain_id: string;
        locked: boolean;
    } | null;
    Payment: {
        id: string;
        registration_id: string;
        amount: string;
        txn_id: string;
        screenshot_url: string;
        verified_by: string | null;
        verified_at: string | null;
    } | null;
};


export type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    role: 'super_admin' | 'sports_head' | 'scorer' | 'committee';
    assigned_sport_id?: number | null;
};

const API_BASE_URL = 'https://energy-sports-meet-backend.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        window.location.href = '/auth/session';
    }
    return Promise.reject(error);
  }
);


export const loginUser = async (credentials: {username: string, password: string}) => {
    const response = await api.post('/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });
    return response.data;
};

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
  const response = await api.get('/sports');
  const responseData = response.data;
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

export const getRegistrations = async (): Promise<Registration[]> => {
    const response = await api.get('/register');
    const responseData = response.data;
    // Defensively handle cases where the data might be nested or not an array
    return Array.isArray(responseData) ? responseData : (responseData?.data || []);
};

export const getRegistration = async (id: string): Promise<Registration> => {
    const response = await api.get(`/register/${id}`);
    const responseData = response.data;
    // Handle cases where the data might be the registration object directly,
    // or nested under a `data` property.
    return responseData.data || responseData;
};

export const verifyPayment = async (registrationCode: string, status: 'approved' | 'rejected', remarks: string) => {
    const response = await api.post('/admin/verify-payment', {
        registration_code: registrationCode,
        status: status,
        remarks: remarks,
    });
    return response.data;
};

// User Management
export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/auth/users');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

export const createUser = async (userData: any) => {
    const response = await api.post('/auth/create-user', userData);
    return response.data;
};

export const updateUser = async (userId: string, userData: any) => {
    const response = await api.put(`/auth/users/${userId}`, userData);
    return response.data;
}

export const deleteUser = async (userId: string) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
};
