
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
  locked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  college?: {
    name: string;
  };
  Captain?: {
    name: string;
    email?: string;
    College?: {
        name: string;
        city?: string;
    };
  };
  Sport?: {
    id: number;
    name: string;
    category: 'Boys' | 'Girls';
    type?: 'Team' | 'Individual';
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
    members: TeamMember[];
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
    checked_in: boolean;
    kit_delivered: boolean;
    id_verified: boolean;
    created_at: string;
    name: string;
    college_name: string;
    college_city: string;
    college_state: string;
    pd_name?: string | null;
    pd_whatsapp?: string | null;
    college_email?: string | null;
    college_contact?: string | null;
    total_amount?: string;
    email: string;
    mobile: string;
    whatsapp: string;
    city: string;
    state: string;
    college_id: string | null;
    other_college: string | null;
    Sports?: ApiSport[];
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

export type TeamMemberRole = 'Captain' | 'Vice-Captain' | 'Player';
export type CricketSportRole = 'Batsman' | 'Bowler' | 'All-rounder';
export type FootballSportRole = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
export type BasketballSportRole = 'Point Guard' | 'Shooting Guard' | 'Small Forward' | 'Power Forward' | 'Center';

export type BattingStyle = 'Right Hand' | 'Left Hand';
export type BowlingStyle = 
    | 'Right Arm Fast' 
    | 'Right Arm Medium' 
    | 'Right Arm Spin' 
    | 'Left Arm Fast' 
    | 'Left Arm Medium' 
    | 'Left Arm Spin' 
    | 'N/A';

export type StudentTeamMember = {
    id: string;
    student_id: string;
    name: string;
    email: string;
    mobile: string;
    role: TeamMemberRole;
    sport_role?: CricketSportRole | FootballSportRole | BasketballSportRole | string | null;
    batting_style?: BattingStyle | null;
    bowling_style?: BowlingStyle | null;
    is_wicket_keeper?: boolean | null;
    additional_details?: any;
    Student?: {
        id: string;
        name: string;
        mobile: string;
    }
};

export type FullTeamDetails = {
    id: string;
    team_name: string;
    sport_id: number;
    Sport: ApiSport;
    members: StudentTeamMember[];
    Captain: {
        name: string;
        mobile: string;
    } | null;
};

export type FullSportsHeadTeam = {
    id: string;
    team_name: string;
    sport_id: number;
    Sport: ApiSport;
    members: StudentTeamMember[];
    Captain: {
        name: string;
        mobile: string;
    } | null;
};

export type StudentDashboardOverview = {
    registration: {
        id: string;
        code: string;
        name: string;
        email: string;
        college: string;
        status: string;
        payment_status: string;
    };
    registered_sports: ApiSport[];
    teams: FullTeamDetails[];
};

export type StudentLoginResponse = {
    id: string;
    registration_code: string;
    name: string;
    dob: string | null;
    gender: string | null;
    email: string;
    mobile: string;
    whatsapp: string;
    city: string;
    state: string;
    department: string | null;
    year_of_study: string | null;
    other_college: string;
    college_id: number;
    college_name: string;
    college_city: string;
    college_state: string;
    pd_name: string | null;
    pd_whatsapp: string | null;
    college_email: string | null;
    college_contact: string | null;
    total_amount: string;
    is_captain: boolean;
    accommodation_needed: boolean;
    payment_status: 'pending' | 'verified' | 'rejected' | 'approved';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    createdAt: string;
    updatedAt: string;
    Sports: ApiSport[];
    Teams: ApiTeam[];
    isNewUser: boolean;
    token: string;
};

export type SportStudent = {
    registration_id: string;
    student_id: string;
    name: string;
    college: string;
    team_id: string | null;
    team_name: string | null;
    mobile: string;
    department: string | null;
}

export type SportsHeadAnalytics = {
    totalTeams: number;
    totalPlayers: number;
    upcomingMatches: number;
};

export type SportsHeadTeam = {
    id: string;
    team_name: string;
    player_count: number;
    captain_id: string;
    Captain: { name: string } | null;
    Sport?: ApiSport;
};

export type SportsHeadRegistration = {
    id: string;
    registration_code: string;
    name: string;
    mobile: string;
    email: string;
    college_id: number;
    college_name: string;
    college_city: string;
    college_state: string;
    team_created: boolean;
    team_info: {
        id: string;
        name: string;
    } | null;
    Sports: {
        id: number;
        name: string;
        category: 'Boys' | 'Girls';
    }[];
};

export type ApiMatch = {
    id: string;
    sport_id: number;
    team_a_id: string;
    team_b_id: string;
    start_time: string;
    venue: string;
    status: 'scheduled' | 'live' | 'completed';
    score_details: any;
    match_state?: any;
    match_events?: any[];
    referee_name?: string;
    Sport: ApiSport;
    TeamA: ApiTeam;
    TeamB: ApiTeam;
};

const API_BASE_URL = 'https://energy-sports-meet-backend.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30s to handle slow server spin-ups
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('student_token');
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
        const pathname = window.location.pathname;
        const isAdminRoute = pathname.startsWith('/console/admin') ||
                             pathname.startsWith('/console/sports-head') ||
                             pathname.startsWith('/console/scorer') ||
                             pathname.startsWith('/console/committee');

        if (isAdminRoute) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('assigned_sport_id');
            if (pathname !== '/auth/session') {
                window.location.href = '/auth/session';
            }
        } else {
            localStorage.removeItem('student_token');
            localStorage.removeItem('student_session');
            if (pathname !== '/energy/2026/auth') {
                window.location.href = '/energy/2026/auth';
            }
        }
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (credentials: {username: string, password: string}) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const getSports = async (): Promise<ApiSport[]> => {
  const response = await api.get('/sports');
  const responseData = response.data;
  return Array.isArray(responseData) ? responseData : responseData?.data || [];
};

export const getTeamsBySport = async (sportId: string): Promise<ApiTeam[]> => {
    const response = await api.get(`/teams/sport/${sportId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
}

export const getScorerMatches = async (): Promise<ApiMatch[]> => {
    const response = await api.get('/scorer/matches');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
}

export const getMatchById = async (matchId: string): Promise<ApiMatch> => {
    const response = await api.get(`/scorer/matches/${matchId}`);
    return response.data;
};

export const createMatch = async (matchData: any) => {
    const response = await api.post('/scorer/matches', matchData);
    return response.data;
}

export const getScorerTeamDetails = async (teamId: string): Promise<FullSportsHeadTeam> => {
    const response = await api.get(`/scorer/teams/${teamId}`);
    const data = response.data.data || response.data;
    if (data.Members && !data.members) {
        data.members = data.Members;
    }
    return data;
}

export const getLineup = async (matchId: string) => {
    const response = await api.get(`/scorer/matches/${matchId}/lineup`);
    return response.data;
}

export const saveLineup = async (matchId: string, lineup: {player_id: string, is_substitute: boolean}[]) => {
    const response = await api.post(`/scorer/matches/${matchId}/lineup`, { players: lineup });
    return response.data;
}

export const endMatch = async (matchId: string, winnerId: string | null, mvpId?: string | null) => {
    const response = await api.post(`/scorer/matches/${matchId}/end`, {
        winner_id: winnerId,
        mvp_id: mvpId
    });
    return response.data;
};

export const getLiveMatches = async (): Promise<ApiMatch[]> => {
    const response = await api.get('/matches/live');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
};

export const getAdminAnalytics = async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
}

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

export const createUser = async (userData: any) => {
    const response = await api.post('/admin/users', userData);
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

export const getRegistrations = async (): Promise<Registration[]> => {
    const response = await api.get('/admin/registrations');
    const responseData = response.data;
    return Array.isArray(responseData) ? responseData : (responseData?.data || []);
};

export const getPayments = async (filters: { status?: string, sport_id?: string }): Promise<Registration[]> => {
    const response = await api.get('/admin/payments', { params: filters });
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

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

export const deleteSport = async (sportId: number) => {
    const response = await api.delete(`/sports/${sportId}`);
    return response.data;
}

export const updateSport = async (sportId: number, sportData: any) => {
    const response = await api.put(`/sports/${sportId}`, sportData);
    return response.data;
}

export const createSport = async (sportData: any) => {
    const response = await api.post('/sports', sportData);
    return response.data;
}

export const getRegistration = async (id: string): Promise<Registration> => {
    const response = await api.get(`/register/details`, { params: { id } });
    return response.data.data || response.data;
};

export const verifyPayment = async (registrationId: string, status: 'approved' | 'rejected', remarks: string) => {
    const response = await api.post('/admin/verify-payment', {
        registrationId,
        status,
        remarks,
    });
    return response.data;
};

export const getCommitteeRegistrations = async (filters: any): Promise<Registration[]> => {
    const response = await api.get('/committee/registrations', { params: filters });
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

export const updateCheckIn = async (registrationId: string, data: any) => {
    const response = await api.patch(`/committee/checkin/${registrationId}`, data);
    return response.data;
};

export const getPassHTML = async (registrationId: string): Promise<string> => {
    const response = await api.get(`/committee/registrations/${registrationId}/print-pass`, {
        headers: { 'Accept': 'text/html' },
        responseType: 'text'
    });
    return response.data;
};

export const updateMatchState = async (matchId: string, state: any) => {
    const response = await api.post(`/scorer/matches/${matchId}/state`, state);
    return response.data;
};
