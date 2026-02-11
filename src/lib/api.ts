import axios from 'axios';
import type { College } from './types';

export type ApiSport = {
    id: number;
    name: string;
    type: 'Team' | 'Individual';
    max_players: number;
    amount: string;
};

export type ApiTeam = {
  id: string;
  sport_id: number;
  team_name: string;
  captain_id: string;
  college: {
    name: string;
  }
};

export type TeamMember = {
    id: string; 
    name: string;
    College: { name: string; } | null;
    other_college: string | null;
};

export type ApiTeamDetails = ApiTeam & {
    Captain: TeamMember;
    Members: TeamMember[];
};

export type ApiMatch = {
    id: string;
    sport_id: number;
    team_a_id: string;
    team_b_id: string;
    start_time: string;
    venue: string;
    referee_name: string | null;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    score_details: any;
    Sport: ApiSport;
    TeamA: ApiTeam;
    TeamB: ApiTeam;
    created_at: string;
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
    return Array.isArray(responseData) ? responseData : (responseData?.data || []);
};

export const getRegistration = async (id: string): Promise<Registration> => {
    const response = await api.get('/register/details', { params: { id }});
    const responseData = response.data;
    return Array.isArray(responseData) ? responseData[0] : (responseData.data || responseData);
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

// Match & Team Management
export const getMatches = async (status: 'live' | 'scheduled' | 'completed'): Promise<ApiMatch[]> => {
    const response = await api.get(`/matches?status=${status}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
}

export const getTeams = async (): Promise<ApiTeam[]> => {
    const response = await api.get('/teams');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

export const getTeam = async (id: string): Promise<ApiTeamDetails> => {
    const response = await api.get(`/teams/${id}`);
    return response.data.data || response.data;
}

export const getTeamsBySport = async (sportId: string): Promise<ApiTeam[]> => {
    const response = await api.get(`/teams/sport/${sportId}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
}

export const createMatch = async (data: { sport_id: number; team_a_id: string; team_b_id: string; start_time: string; venue: string; referee_name?: string; }) => {
    const response = await api.post('/matches', data);
    return response.data;
}

export const updateScore = async (matchId: string, scoreDetails: any, status: 'live' | 'completed' | 'scheduled') => {
    const response = await api.put(`/matches/${matchId}/score`, {
        score_details: scoreDetails,
        status: status,
    });
    return response.data;
};

export const postMatchEvent = async (matchId: string, eventData: any) => {
    const response = await api.post(`/matches/${matchId}/event`, eventData);
    return response.data;
};

export const getLineup = async (matchId: string): Promise<any> => {
    const response = await api.get(`/matches/${matchId}/lineup`);
    return response.data.data || response.data;
};

export const manageLineup = async (matchId: string, lineupData: { action: 'add' | 'remove', student_id: string, team_id: string, is_substitute?: boolean }) => {
    const response = await api.post(`/matches/${matchId}/lineup`, lineupData);
    return response.data;
};
