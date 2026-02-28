import { ManageTeamClientPage } from '@/components/student-dashboard/ManageTeamClientPage';

export default async function ManageTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;

    if (!teamId) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p>Invalid Team ID.</p>
            </div>
        );
    }
    
    return <ManageTeamClientPage teamId={teamId} />;
}
