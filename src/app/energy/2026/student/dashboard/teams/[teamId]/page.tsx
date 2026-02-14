'use client';

import { Suspense } from 'react';
import { ManageTeamClientPage } from '@/components/student-dashboard/ManageTeamClientPage';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function TeamPage() {
    const params = useParams();
    const teamId = params.teamId as string;

    if (!teamId) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p>Invalid Team ID.</p>
            </div>
        );
    }
    
    return <ManageTeamClientPage teamId={teamId} />;
}

export default function ManageTeamPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <TeamPage />
        </Suspense>
    );
}
