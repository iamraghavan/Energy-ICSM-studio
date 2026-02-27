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
export type StudentTeamMember = {
    id: string;
    student_id: string;
    name: string;
    email: string;
    mobile: string;
    role: TeamMemberRole;
    sport_role?: string | null;
    batting_style?: string | null;
    bowling_style?: string | null;
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
    match_history?: any[];
    referee_name?: string;
    Sport: ApiSport;
    TeamA: ApiTeam;
    TeamB: ApiTeam;
};

const API_BASE_URL = 'https://energy-sports-meet-backend.vercel.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
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

// --- Core API Methods ---

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
    return response.data?.data || response.data;
};

export const createMatch = async (matchData: any) => {
    const response = await api.post('/scorer/matches', matchData);
    return response.data;
}

export const getScorerTeamDetails = async (teamId: string): Promise<FullSportsHeadTeam> => {
    const response = await api.get(`/scorer/teams/${teamId}`);
    const data = response.data.data || response.data;
    return data;
}

// --- Firebase-First Scoring Engine (Hybrid Commands) ---

export const submitCricketBall = async (matchId: string, ballData: {
    batting_team_id: string;
    striker_id: string;
    non_striker_id: string;
    bowler_id: string;
    runs: number;
    extras: number;
    extra_type: string | null;
    is_wicket: boolean;
    wicket_type: string | null;
}) => {
    // Aligns with Guide: POST /api/v1/matches/:matchId/cricket
    const response = await api.post(`/matches/${matchId}/cricket`, ballData);
    return response.data;
};

export const submitStandardScore = async (matchId: string, scoreData: {
    points: number;
    team_id: string;
    event_type: string;
}) => {
    // Aligns with Guide: POST /api/v1/matches/:matchId/standard
    const response = await api.post(`/matches/${matchId}/standard`, scoreData);
    return response.data;
};

export const submitTossResult = async (matchId: string, tossData: {
    winner_id: string;
    decision: string;
    details: string;
}) => {
    // Aligns with Guide: POST /api/v1/matches/:matchId/toss
    const response = await api.post(`/matches/${matchId}/toss`, tossData);
    return response.data;
};

export const updateMatchState = async (matchId: string, state: any) => {
    // Aligns with Guide: POST /api/v1/matches/:matchId/state
    const response = await api.post(`/matches/${matchId}/state`, state);
    return response.data;
};

export const startMatch = async (matchId: string) => {
    const response = await api.post(`/scorer/matches/${matchId}/start`);
    return response.data;
};

export const endMatch = async (matchId: string, winnerId: string | null, mvpId?: string | null) => {
    // Hits /end to trigger MySQL archival as per guide
    const response = await api.post(`/scorer/matches/${matchId}/end`, {
        winner_id: winnerId,
        mvp_id: mvpId
    });
    return response.data;
};

export const undoLastBall = async (matchId: string) => {
    const response = await api.post(`/scorer/matches/${matchId}/undo`);
    return response.data;
};

export const getLiveMatches = async (): Promise<ApiMatch[]> => {
    const response = await api.get('/matches/live');
    const responseData = response.data;
    return Array.isArray(responseData) ? responseData : responseData?.data || [];
};

export const getRegistration = async (id: string): Promise<Registration> => {
    const response = await api.get(`/register/details`, { params: { id } });
    return response.data?.data || response.data;
};

// --- Student Portal Functions ---

export const registerStudent = async (formData: FormData) => {
    const response = await api.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const requestStudentOtp = async (identifier: string) => {
    const response = await api.post('/auth/student/request-otp', { identifier });
    return response.data;
};

export const verifyStudentOtp = async (identifier: string, otp: string) => {
    const response = await api.post('/auth/student/verify-otp', { identifier, otp });
    return response.data;
};

export const getStudentDashboardOverview = async (): Promise<StudentDashboardOverview> => {
    const response = await api.get('/student/dashboard/overview');
    return response.data?.data || response.data;
};

export const createStudentTeam = async (sportId: number, teamName: string) => {
    const response = await api.post('/student/teams', { sport_id: sportId, team_name: teamName });
    return response.data;
};

export const getStudentTeamDetails = async (teamId: string): Promise<FullTeamDetails> => {
    const response = await api.get(`/student/teams/${teamId}`);
    return response.data?.data || response.data;
};

export const updateTeamName = async (teamId: string, teamName: string) => {
    const response = await api.put(`/student/teams/${teamId}`, { team_name: teamName });
    return response.data;
};

export const deleteTeam = async (teamId: string) => {
    const response = await api.delete(`/student/teams/${teamId}`);
    return response.data;
};

export const deleteTeamMember = async (memberId: string) => {
    const response = await api.delete(`/student/members/${memberId}`);
    return response.data;
};

export const bulkAddTeamMembers = async (teamId: string, members: any[]) => {
    const response = await api.post(`/student/teams/${teamId}/members/bulk`, { members });
    return response.data;
};

export const updateTeamMember = async (memberId: string, data: any) => {
    const response = await api.put(`/student/members/${memberId}`, data);
    return response.data;
};

// --- Sports Head Functions ---

export const getSportsHeadStats = async () => {
    const response = await api.get('/sports-head/stats');
    return response.data?.data || response.data;
};

export const getSportsHeadAnalytics = async () => {
    const response = await api.get('/sports-head/analytics');
    return response.data?.data || response.data;
};

export const getSportsHeadMatches = async (status?: string): Promise<ApiMatch[]> => {
    const response = await api.get('/sports-head/matches', { params: { status } });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
};

export const scheduleMatch = async (matchData: any) => {
    const response = await api.post('/sports-head/matches', matchData);
    return response.data;
};

export const getSportsHeadTeams = async (): Promise<SportsHeadTeam[]> => {
    const response = await api.get('/sports-head/teams');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
};

export const getSportsHeadRegistrations = async (): Promise<SportsHeadRegistration[]> => {
    const response = await api.get('/sports-head/registrations');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
};

export const createSportsHeadTeam = async (teamData: any) => {
    const response = await api.post('/sports-head/teams', teamData);
    return response.data;
};

export const getSportsHeadTeamDetails = async (teamId: string): Promise<FullSportsHeadTeam> => {
    const response = await api.get(`/sports-head/teams/${teamId}`);
    return response.data?.data || response.data;
};

export const removePlayerFromTeam = async (teamId: string, studentId: string) => {
    const response = await api.delete(`/sports-head/teams/${teamId}/members/${studentId}`);
    return response.data;
};

export const updateSportsHeadTeam = async (teamId: string, teamData: any) => {
    const response = await api.put(`/sports-head/teams/${teamId}`, teamData);
    return response.data;
};

export const deleteSportsHeadTeam = async (teamId: string) => {
    const response = await api.delete(`/sports-head/teams/${teamId}`);
    return response.data;
};

export const sportsHeadBulkAddPlayers = async (teamId: string, players: any[]) => {
    const response = await api.post(`/sports-head/teams/${teamId}/members/bulk`, { players });
    return response.data;
};

export const updateSportsHeadTeamMember = async (teamId: string, studentId: string, data: any) => {
    const response = await api.put(`/sports-head/teams/${teamId}/members/${studentId}`, data);
    return response.data;
};

export const getSportsHeadStudents = async (): Promise<SportStudent[]> => {
    const response = await api.get('/sports-head/students');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || []);
};

export const bulkAddPlayersToTeam = async (teamId: string, registrationIds: string[]) => {
    const response = await api.post(`/sports-head/teams/${teamId}/members`, { registrationIds });
    return response.data;
};

// --- Admin Functions ---

export const getAdminAnalytics = async () => {
    const response = await api.get('/admin/analytics');
    return response.data?.data || response.data;
}

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