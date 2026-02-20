
'use client';
import { useParams } from 'next/navigation';
import { LiveScoringPage } from '@/components/console/scorer/LiveScoringPage';

export default function Page() {
    const params = useParams();
    const matchId = params.matchId as string;

    if (!matchId) {
        return <div>Loading...</div>; // Or a more sophisticated loading state
    }

    return <LiveScoringPage matchId={matchId} />;
}
