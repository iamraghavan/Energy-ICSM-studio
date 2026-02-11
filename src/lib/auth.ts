import { jwtDecode } from 'jwt-decode';

// This is what is ACTUALLY inside the JWT token from the backend
export interface DecodedJwtPayload {
    id: string;
    iat: number;
    exp: number;
}

// This is the user session object we will use throughout the app
export interface UserSession {
    role: 'super_admin' | 'sports_head' | 'scorer' | 'committee';
    assigned_sport_id?: string;
    exp: number;
    id: string;
}


const ROLE_TO_VIEW_ID: Record<string, string> = {
    super_admin: '8f7a2b9c',
    sports_head: 'x9d2k1m4',
    scorer: 'm2p5q8l0',
    committee: 'c4r1v3n7'
};

const VIEW_ID_TO_ROLE: Record<string, string> = {
    '8f7a2b9c': 'super_admin',
    'x9d2k1m4': 'sports_head',
    'm2p5q8l0': 'scorer',
    'c4r1v3n7': 'committee'
};

export const getRoleForViewId = (viewId: string): string | undefined => {
    return VIEW_ID_TO_ROLE[viewId];
}

export const getUserSession = (): UserSession | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('user_role') as UserSession['role'] | null;

    if (!token || !role) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        return null;
    }

    try {
        const decoded = jwtDecode<DecodedJwtPayload>(token);
        
        // Check if token is expired
        if (Date.now() >= decoded.exp * 1000) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
            return null;
        }

        // Construct the session object
        return {
            id: decoded.id,
            exp: decoded.exp,
            role: role,
        };

    } catch (error) {
        console.error("Failed to decode token", error);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        return null;
    }
};

export const getRedirectPathForRole = (role: string): string => {
    const viewId = ROLE_TO_VIEW_ID[role];
    return viewId ? `/console/${viewId}` : '/auth/session';
}
