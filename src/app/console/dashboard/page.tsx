'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession, type UserSession } from '@/lib/auth';
import { SuperAdminDashboard } from '@/components/console/SuperAdminDashboard';
import { SportsHeadDashboard } from '@/components/console/SportsHeadDashboard';
import { ScorerDashboard } from '@/components/console/ScorerDashboard';
import { CommitteeDashboard } from '@/components/console/CommitteeDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardRouterPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const session = getUserSession();
        if (!session) {
            router.replace('/auth/session');
        } else {
            setUser(session);
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading || !user) {
        return (
             <div className="container py-8">
                <Skeleton className="h-10 w-1/3 mb-6" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
                 <div className="grid gap-4 md:gap-8 lg:grid-cols-2 mt-8">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                 </div>
            </div>
        );
    }

    switch (user.role) {
        case 'super_admin':
            return <SuperAdminDashboard />;
        case 'sports_head':
            return <SportsHeadDashboard user={user} />;
        case 'scorer':
            return <ScorerDashboard />;
        case 'committee':
            return <CommitteeDashboard />;
        default:
            router.replace('/auth/session');
            return null;
    }
}
