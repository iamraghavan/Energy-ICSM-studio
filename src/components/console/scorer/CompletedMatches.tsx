'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMatches, type ApiMatch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "./MatchCard";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function CompletedMatches() {
    const [completedMatches, setCompletedMatches] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCompleted = async () => {
            setIsLoading(true);
            try {
                const data = await getMatches('completed');
                setCompletedMatches(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch completed matches.' });
            } finally {
                setIsLoading(false);
            }
        }
        fetchCompleted();
    }, [toast]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Completed Matches</CardTitle>
                <CardDescription>A record of finished matches and their final scores.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                {!isLoading && completedMatches.length > 0 ? (
                    completedMatches.map(match => (
                       <MatchCard key={match.id} match={match}>
                           <div className="text-right">
                                <p className="text-xl font-bold">{match.score_details.team_a} - {match.score_details.team_b}</p>
                                <Badge variant="secondary">Completed</Badge>
                           </div>
                       </MatchCard>
                    ))
                ) : (
                   !isLoading && <p className="text-muted-foreground text-center py-8">No completed matches yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
