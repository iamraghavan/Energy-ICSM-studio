import axios from 'axios';
import type { College } from './types';

export type ApiSport = {
    id: number;
    name: string;
    category: 'Boys' | 'Girls';
    type: 'Team' | 'Individual';
    min_players?: number;
    max_players: number;
    amount: string;
};

export type ApiTeam = {
  id: string;
  sport_id: string | number;
  team_name: string;
  captain_id: string;
  college?: {
    name: string;
  };
  Captain?: {
    name: string;
  };
  Sport?: {
    id: number;
    name: string;
    category: 'Boys' | 'Girls';
  };
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

export type Registration = {
    id: string;
    registration_code: string;
    student_id: string;
    team_id: string | null;
    is_captain: boolean;
    accommodation_needed: boolean;
    payment_status: 'pending' | 'verified' | 'rejected' | 'approved';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    college_name: string;
    college_city: string;
    college_state: string;
    pd_name?: string | null;
    pd_whatsapp?: string | null;
    college_email?: string | null;
    college_contact?: string | null;
    total_amount?: string;
    Student: {
        id: string;
        name: string;
        email: string;
        mobile: string;
        whatsapp: string;
        city: string;
        state: string;
        college_id: string | null;
        other_college: string | null;
        College: {
            id: number;
            name: string;
            city: string;
            state: string;
        } | null;
    };
    Sports: ApiSport[];
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
    if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
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
  const response = await api.post('/register', formData);
  return response.data;
};

export const getRegistrations = async (): Promise<Registration[]> => {
    const response = await api.get('/admin/registrations');
    const responseData = response.data;
    return Array.isArray(responseData) ? responseData : (responseData?.data || []);
};

export const getRegistration = async (id: string): Promise<Registration> => {
    const response = await api.get('/register/details', { params: { id }});
    return response.data;
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
    const response = await api.get('/admin/users');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

export const createUser = async (userData: any) => {
    const response = await api.post('/auth/create-user', userData);
    return response.data;
};

export const updateUser = async (userId: string, userData: any) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
}

export const deleteUser = async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
};

// Match & Team Management
export const getMatchesBySport = async (sportId: string, status?: 'scheduled' | 'live' | 'completed'): Promise<ApiMatch[]> => {
    const response = await api.get(`/matches/sport/${sportId}`, { params: { status } });
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

export const getLiveMatches = async (): Promise<ApiMatch[]> => {
    const response = await api.get('/matches/live');
    return response.data.data || response.data;
}

export const createMatch = async (matchData: any) => {
    const response = await api.post('/sports-head/matches/schedule', matchData);
    return response.data;
}

export const updateScore = async (matchId: string, scoreDetails: any, status: 'live' | 'completed') => {
    const response = await api.patch(`/scorer/matches/${matchId}/score`, { score_details: scoreDetails, status });
    return response.data;
};

export const postMatchEvent = async (matchId: string, eventData: any) => {
    const response = await api.post(`/scorer/matches/${matchId}/event`, eventData);
    return response.data;
}

export const getLineup = async (matchId: string) => {
    const response = await api.get(`/matches/${matchId}/lineup`);
    return response.data;
}

export const manageLineup = async (matchId: string, lineupData: any) => {
    const response = await api.post(`/matches/${matchId}/lineup`, lineupData);
    return response.data;
}

export const getTeam = async (id: string): Promise<ApiTeamDetails> => {
    const response = await api.get(`/teams/${id}`);
    return response.data.data || response.data;
}

export const getTeamsBySport = async (sportId: string): Promise<ApiTeam[]> => {
    const response = await api.get(`/teams/sport/${sportId}`);
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
}

// Admin
export const getAdminAnalytics = async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
}

// College Management
export const getCollegesAdmin = async (): Promise<(Omit<College, 'id'> & {id: number})[]> => {
    const response = await api.get('/colleges/admin');
    return response.data.data || response.data;
};
export const createCollege = async (collegeData: Omit<College, 'id'>) => {
    const response = await api.post('/colleges', collegeData);
    return response.data;
};
export const bulkCreateColleges = async (collegesData: Omit<College, 'id'>[]) => {
    const response = await api.post('/colleges/bulk', { colleges: collegesData });
    return response.data;
}
export const updateCollege = async (collegeId: number, collegeData: Partial<Omit<College, 'id'>>) => {
    const response = await api.put(`/colleges/${collegeId}`, collegeData);
    return response.data;
}
export const deleteCollege = async (collegeId: number) => {
    const response = await api.delete(`/colleges/${collegeId}`);
    return response.data;
}

// Sports Management
export const createSport = async (sportData: any) => {
    const response = await api.post('/sports', sportData);
    return response.data;
}
export const updateSport = async (sportId: number, sportData: any) => {
    const response = await api.put(`/sports/${sportId}`, sportData);
    return response.data;
}
export const deleteSport = async (sportId: number) => {
    const response = await api.delete(`/sports/${sportId}`);
    return response.data;
}

// Committee Module
export const searchCommitteeRegistrations = async (query: string): Promise<Registration[]> => {
    const response = await api.get('/committee/registrations', { params: { search: query } });
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
}

export const checkInStudent = async (registrationId: string) => {
    const response = await api.patch(`/committee/checkin/${registrationId}`);
    return response.data;
}


export type ApiMatch = {
    id: string;
    sport_id: number;
    team_a_id: string;
    team_b_id: string;
    start_time: string;
    venue: string;
    status: 'scheduled' | 'live' | 'completed';
    score_details: any;
    Sport: ApiSport;
    TeamA: ApiTeam;
    TeamB: ApiTeam;
};
