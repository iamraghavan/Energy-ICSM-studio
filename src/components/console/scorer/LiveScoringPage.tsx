
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMatchById, type ApiMatch } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { StandardScoringInterface } from './StandardScoringInterface';
import { CricketScoringInterface } from './CricketScoringInterface';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export function LiveScoringPage({ matchId }: { matchId: string }) {
    const [match, setMatch] = useState<ApiMatch | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!matchId) {
            setError('No match ID provided.');
            setIsLoading(false);
            return;
        }

        const fetchMatch = async () => {
            setIsLoading(true);
            try {
                const data = await getMatchById(matchId);
                setMatch(data);
            } catch (err) {
                setError('Failed to load match data. It may not be live or may not exist.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMatch();
    }, [matchId]);

    const handleBack = () => {
        router.push('/console/scorer/dashboard');
    };

    if (isLoading) {
        return (
            <div className="container py-8">
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }
    
    if (error || !match) {
        return (
            <div className="container py-8">
                <Card>
                    <CardHeader className="items-center text-center">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                        <CardTitle className="mt-4">Error Loading Match</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const isCricket = match.Sport.name === 'Cricket';

    return (
        <div className="container py-8">
            {isCricket ? (
                <CricketScoringInterface match={match} onBack={handleBack} />
            ) : (
                <StandardScoringInterface match={match} onBack={handleBack} />
            )}
        </div>
    );
}
