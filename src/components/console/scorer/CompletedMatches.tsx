'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMatchesBySport, type ApiMatch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "./MatchCard";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { History } from 'lucide-react';

export function CompletedMatches({ sportId }: { sportId?: string }) {
    const [completedMatches, setCompletedMatches] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!sportId) return;
        const fetchCompleted = async () => {
            setIsLoading(true);
            try {
                const data = await getMatchesBySport(sportId, 'completed');
                setCompletedMatches(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch completed matches.' });
            } finally {
                setIsLoading(false);
            }
        }
        fetchCompleted();
    }, [sportId, toast]);

    const renderContent = () => {
        if (!sportId) {
            return (
                <div className="text-center py-16 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4" />
                    <p>Select a sport to see its match history.</p>
                </div>
            )
        }

        if (isLoading) {
            return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        }

        if (completedMatches.length > 0) {
            return completedMatches.map(match => (
               <MatchCard key={match.id} match={match}>
                   <div className="text-right">
                        <p className="text-xl font-bold">{match.score_details?.team_a || 0} - {match.score_details?.team_b || 0}</p>
                        <Badge variant="secondary">Completed</Badge>
                   </div>
               </MatchCard>
            ))
        }

        return <p className="text-muted-foreground text-center py-8">No completed matches yet for this sport.</p>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Completed Matches</CardTitle>
                <CardDescription>A record of finished matches and their final scores.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {renderContent()}
            </CardContent>
        </Card>
    );
}
