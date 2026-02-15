
import { Suspense } from 'react';
import { ManageTeamClientPage } from '@/components/student-dashboard/ManageTeamClientPage';
import { Loader2 } from 'lucide-react';

export default function ManageTeamPage({ params }: { params: { teamId: string } }) {
    const teamId = params.teamId;

    if (!teamId) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p>Invalid Team ID.</p>
            </div>
        );
    }
    
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ManageTeamClientPage teamId={teamId} />
        </Suspense>
    );
}
