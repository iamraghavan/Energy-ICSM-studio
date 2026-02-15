
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentSession, type StudentSession } from '@/lib/auth';
import { getStudentDashboardOverview, type StudentDashboardOverview } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type DashboardContextType = {
    dashboardData: StudentDashboardOverview | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [dashboardData, setDashboardData] = useState<StudentDashboardOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getStudentDashboardOverview();
            setDashboardData(data);
        } catch (err) {
            setError('Could not load dashboard data.');
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load your dashboard.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const value = { dashboardData, isLoading, error, refetch: fetchDashboardData };

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [session, setSession] = useState<StudentSession | null>(null);
    
    useEffect(() => {
        const studentSession = getStudentSession();
        if (!studentSession) {
            router.replace('/energy/2026/auth');
        } else {
            setSession(studentSession);
        }
    }, [router]);
    
    if (!session) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    return (
        <DashboardProvider>
             <div className="container py-8 md:py-12 space-y-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-headline">Welcome, {session.name}!</h1>
                    <p className="text-muted-foreground mt-2">Manage your registrations and teams.</p>
                </div>
                {children}
            </div>
        </DashboardProvider>
    );
}
