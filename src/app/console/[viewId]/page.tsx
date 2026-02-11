'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { getDecodedToken, getRoleForViewId } from '@/lib/auth';

import { SuperAdminDashboard } from '@/components/console/SuperAdminDashboard';
import { SportsHeadDashboard } from '@/components/console/SportsHeadDashboard';
import { ScorerDashboard } from '@/components/console/ScorerDashboard';
import { CommitteeDashboard } from '@/components/console/CommitteeDashboard';
import { Skeleton } from '@/components/ui/skeleton';

const VIEW_MAP: Record<string, React.ComponentType> = {
    '8f7a2b9c': SuperAdminDashboard,
    'x9d2k1m4': SportsHeadDashboard,
    'm2p5q8l0': ScorerDashboard,
    'c4r1v3n7': CommitteeDashboard
};

export default function ConsoleViewPage() {
    const router = useRouter();
    const params = useParams();
    const viewId = params.viewId as string;
    const [isLoading, setIsLoading] = useState(true);

    const ComponentToRender = useMemo(() => VIEW_MAP[viewId] || null, [viewId]);

    useEffect(() => {
        const tokenData = getDecodedToken();
        const expectedRole = getRoleForViewId(viewId);

        if (!tokenData) {
            router.replace('/auth/session');
            return;
        }

        if (!expectedRole || tokenData.role !== expectedRole) {
            notFound();
            return;
        }

        setIsLoading(false);

    }, [viewId, router]);

    if (!ComponentToRender) {
        notFound();
        return null;
    }

    if (isLoading) {
        return (
             <div className="p-4 sm:p-8">
                <Skeleton className="h-10 w-1/4 mb-6" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <ComponentToRender />
        </div>
    );
}
