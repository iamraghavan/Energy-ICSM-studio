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

export const getRedirectPathForRole = (role: string): string => {
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
