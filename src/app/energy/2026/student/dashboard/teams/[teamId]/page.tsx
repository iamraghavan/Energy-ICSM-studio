

import { ManageTeamClientPage } from '@/components/student-dashboard/ManageTeamClientPage';

export default function ManageTeamPage({ params }: { params: { teamId: string } }) {
    const teamId = params.teamId;

    if (!teamId) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p>Invalid Team ID.</p>
            </div>
        );
    }
    
    return <ManageTeamClientPage teamId={teamId} />;
}
