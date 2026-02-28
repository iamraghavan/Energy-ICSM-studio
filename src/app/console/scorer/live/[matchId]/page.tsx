
'use client';
import { use } from 'react';
import { LiveScoringPage } from '@/components/console/scorer/LiveScoringPage';

export default function Page({ params }: { params: Promise<{ matchId: string }> }) {
    const { matchId } = use(params);

    if (!matchId) {
        return <div className="p-8 text-center text-muted-foreground">Loading match context...</div>;
    }

    return <LiveScoringPage matchId={matchId} />;
}
