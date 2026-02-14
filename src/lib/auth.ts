
'use client';
import { jwtDecode } from 'jwt-decode';
import type { StudentLoginResponse } from '@/lib/api';

export interface DecodedJwtPayload {
    id: string;
    role: 'super_admin' | 'sports_head' | 'scorer' | 'committee';
    assigned_sport_id?: string;
    iat: number;
    exp: number;
}

export interface UserSession extends DecodedJwtPayload {}

const clearUserSession = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('assigned_sport_id');
};

export const getUserSession = (): UserSession | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        return null;
    }

    try {
        const decoded = jwtDecode<DecodedJwtPayload>(token);
        
        if (Date.now() >= decoded.exp * 1000) {
            clearUserSession();
            return null;
        }

        const role = localStorage.getItem('user_role') as UserSession['role'];
        const assigned_sport_id = localStorage.getItem('assigned_sport_id') || undefined;

        if (!role) {
             clearUserSession();
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
        clearUserSession();
        return null;
    }
};

export interface DecodedStudentJwtPayload {
    id: string;
    iat: number;
    exp: number;
}

export type StudentSession = StudentLoginResponse & {
    iat: number;
    exp: number;
};

const clearStudentSession = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_session');
};

export const getStudentSession = (): StudentSession | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('student_token');
    const sessionDataString = localStorage.getItem('student_session');

    if (!token || !sessionDataString) {
        clearStudentSession();
        return null;
    }

    try {
        const decoded = jwtDecode<DecodedStudentJwtPayload>(token);
        
        if (Date.now() >= decoded.exp * 1000) {
            clearStudentSession();
            return null;
        }

        const sessionData: Omit<StudentLoginResponse, 'token'> = JSON.parse(sessionDataString);

        return {
            ...sessionData,
            token: token,
            id: decoded.id, 
            iat: decoded.iat,
            exp: decoded.exp,
        };

    } catch (error) {
        console.error("Failed to decode token or parse session", error);
        clearStudentSession();
        return null;
    }
};
