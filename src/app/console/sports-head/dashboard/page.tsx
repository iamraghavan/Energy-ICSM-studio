'use client';
import { SportsHeadDashboard } from '@/components/console/SportsHeadDashboard';
import { getUserSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { UserSession } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';


export default function SportsHeadDashboardPage() {
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
                </div>
            </div>
        );
    }
    return <SportsHeadDashboard user={user} />;
}
