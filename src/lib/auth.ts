'use client';
import { jwtDecode } from 'jwt-decode';

export interface DecodedJwtPayload {
    id: string;
    role: 'super_admin' | 'sports_head' | 'scorer' | 'committee';
    assigned_sport_id?: string;
    iat: number;
    exp: number;
}

export interface UserSession extends DecodedJwtPayload {}

export const getUserSession = (): UserSession | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        return null;
    }

    try {
        const decoded = jwtDecode<DecodedJwtPayload>(token);
        
        if (Date.now() >= decoded.exp * 1000) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('assigned_sport_id');
            return null;
        }

        const role = localStorage.getItem('user_role') as UserSession['role'];
        const assigned_sport_id = localStorage.getItem('assigned_sport_id') || undefined;

        if (!role) {
             localStorage.removeItem('jwt_token');
             localStorage.removeItem('user_role');
             localStorage.removeItem('assigned_sport_id');
             return null;
        }

        return {
            id: decoded.id,
            role: role,
            assigned_sport_id: assigned_sport_id,
            iat: decoded.iat,
            exp: decoded.exp,
        };

    } catch (error) {
        console.error("Failed to decode token", error);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('assigned_sport_id');
        return null;
    }
};

export interface DecodedStudentJwtPayload {
    id: string;
    name: string;
    iat: number;
    exp: number;
}

export interface StudentSession {
    id: string;
    name: string;
    iat: number;
    exp: number;
}

export const getStudentSession = (): StudentSession | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('student_token');

    if (!token) {
        return null;
    }

    try {
        const decoded = jwtDecode<DecodedStudentJwtPayload>(token);
        
        if (Date.now() >= decoded.exp * 1000) {
            localStorage.removeItem('student_token');
            return null;
        }

        return {
            id: decoded.id,
            name: decoded.name,
            iat: decoded.iat,
            exp: decoded.exp,
        };

    } catch (error) {
        console.error("Failed to decode student token", error);
        localStorage.removeItem('student_token');
        return null;
    }
};
