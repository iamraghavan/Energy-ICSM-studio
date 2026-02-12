'use client';
import { jwtDecode } from 'jwt-decode';

export interface DecodedJwtPayload {
    id: string;
    iat: number;
    exp: number;
}

export interface UserSession {
    role: 'super_admin' | 'sports_head' | 'scorer' | 'committee';
    assigned_sport_id?: string;
    exp: number;
    id: string;
}

const ROLE_MAP: Record<string, UserSession['role']> = {
    '8f7a2b9c': 'super_admin',
    'x9d2k1m4': 'sports_head',
    'm2p5q8l0': 'scorer',
    'c4r1v3n7': 'committee',
};

export const getRoleForViewId = (viewId: string): UserSession['role'] | undefined => {
    return ROLE_MAP[viewId];
};

export const getRedirectPathForRole = (role: string): string => {
    // All roles can start at the dashboard now.
    // Specific role permissions can be handled within pages or in the layout.
    return '/console/dashboard';
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
        
        if (Date.now() >= decoded.exp * 1000) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
            return null;
        }

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
