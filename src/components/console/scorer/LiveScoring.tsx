'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchCard } from './MatchCard';
import { ArrowRight, Clapperboard } from 'lucide-react';
import { socket } from '@/lib/socket';

export function LiveScoring() {
    const [liveFixtures, setLiveFixtures] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchLiveMatches = async () => {
        setIsLoading(true);
        try {
            const matches = await getLiveMatches();
            setLiveFixtures(matches.filter(m => m.status === 'live'));
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch live matches.' });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchLiveMatches();
        
        if (socket.connected) {
             socket.emit('join_room', 'live_overview');
        } else {
            socket.on('connect', () => socket.emit('join_room', 'live_overview'));
        }

        const onUpdate = (data: any) => {
            console.log('Overview update received:', data);
            toast({ title: 'Live Matches Updated', description: 'The list of live matches has changed.' });
            fetchLiveMatches();
        };
        
        socket.on('overview_update', onUpdate);
        socket.on('match_status_change', onUpdate);
        
        return () => {
            socket.emit('leave_room', 'live_overview');
            socket.off('overview_update', onUpdate);
            socket.off('match_status_change', onUpdate);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
         <Card>
            <CardHeader>
                <CardTitle>Live Matches</CardTitle>
                <CardDescription>Select a match to start live scoring on its dedicated page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                {!isLoading && liveFixtures.length > 0 ? (
                    liveFixtures.map(match => (
                       <MatchCard key={match.id} match={match}>
                           <Button asChild>
                               <Link href={`/console/scorer/live/${match.id}`}>
                                    Score Match <ArrowRight className="ml-2 h-4 w-4" />
                               </Link>
                           </Button>
                       </MatchCard>
                    ))
                ) : (
                    !isLoading && 
                    <div className="text-center py-16 text-muted-foreground border rounded-lg">
                        <Clapperboard className="h-12 w-12 mx-auto mb-4" />
                        <p className="font-medium">No matches are currently live.</p>
                        <p className="text-sm">Start a match from the "Schedule" tab to begin scoring.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
