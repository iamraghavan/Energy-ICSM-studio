import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
    role: 'super_admin' | 'sports_head' | 'scorer' | 'committee';
    assigned_sport_id?: string;
    iat: number;
    exp: number;
    sub: string; // user id
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

export const getDecodedToken = (): DecodedToken | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        // Check if token is expired
        if (Date.now() >= decoded.exp * 1000) {
            localStorage.removeItem('jwt_token');
            return null;
        }
        return decoded;
    } catch (error) {
        console.error("Failed to decode token", error);
        localStorage.removeItem('jwt_token');
        return null;
    }
};

export const getRedirectPathForRole = (role: string): string => {
    const viewId = ROLE_TO_VIEW_ID[role];
    return viewId ? `/console/${viewId}` : '/auth/session';
}
