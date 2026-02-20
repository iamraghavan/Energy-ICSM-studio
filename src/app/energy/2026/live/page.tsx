'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Clapperboard, MapPin, Trophy } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

function PublicMatchCard({ match }: { match: ApiMatch }) {
    const teamAScore = match.score_details?.[match.team_a_id]?.score ?? match.score_details?.[match.team_a_id]?.runs ?? 0;
    const teamBScore = match.score_details?.[match.team_b_id]?.score ?? match.score_details?.[match.team_b_id]?.runs ?? 0;
    
    const teamAWickets = match.score_details?.[match.team_a_id]?.wickets;
    const teamBWickets = match.score_details?.[match.team_b_id]?.wickets;

    const teamAOvers = match.score_details?.[match.team_a_id]?.overs;
    const teamBOvers = match.score_details?.[match.team_b_id]?.overs;

    const isCricket = match.Sport.name === 'Cricket';

    return (
        <div className="border p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/50">
            <div className="flex-1 space-y-2">
                 <div className="flex items-center gap-x-4 text-sm text-muted-foreground">
                     <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        <span>{match.Sport.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{match.venue}</span>
                    </div>
                 </div>
                <p className="font-bold text-xl">{match.TeamA.team_name} vs {match.TeamB.team_name}</p>
            </div>
            <div className="ml-auto shrink-0 text-right space-y-1">
                <p className="text-2xl font-bold font-mono">
                    {teamAScore}{isCricket && teamAWickets !== undefined ? `/${teamAWickets}` : ''} - {teamBScore}{isCricket && teamBWickets !== undefined ? `/${teamBWickets}` : ''}
                </p>
                {isCricket && (
                    <p className="text-xs text-muted-foreground">
                        (Overs: {teamAOvers?.toFixed(1) || '0.0'} - {teamBOvers?.toFixed(1) || '0.0'})
                    </p>
                )}
                 <Badge className="animate-pulse">LIVE</Badge>
            </div>
        </div>
    )
}

export default function LivePage() {
    const [liveMatches, setLiveMatches] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchLiveMatches = async () => {
        setIsLoading(true);
        try {
            const matches = await getLiveMatches();
            setLiveMatches(matches);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch live matches.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchLiveMatches();
        
        if (socket.connected) {
             socket.emit('join_room', 'live_overview');
        } else {
            socket.on('connect', () => socket.emit('join_room', 'live_overview'));
        }

        const onUpdate = (data: any) => {
            console.log('Live overview update received:', data);
            fetchLiveMatches();
        };
        
        socket.on('overview_update', onUpdate);
        socket.on('match_status_change', onUpdate);
        socket.on('score_updated', onUpdate);
        socket.on('cricket_score_update', onUpdate);
        
        return () => {
            socket.emit('leave_room', 'live_overview');
            socket.off('overview_update', onUpdate);
            socket.off('match_status_change', onUpdate);
            socket.off('score_updated', onUpdate);
            socket.off('cricket_score_update', onUpdate);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="container py-8 md:py-12">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Live Matches</CardTitle>
                    <CardDescription>Live scores and updates from ongoing matches.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                     {!isLoading && liveMatches.length > 0 ? (
                         liveMatches.map(match => (
                            <PublicMatchCard key={match.id} match={match} />
                         ))
                     ) : (
                         !isLoading &&
                         <div className="text-center py-16 text-muted-foreground border rounded-lg bg-muted/50">
                            <Clapperboard className="h-12 w-12 mx-auto mb-4" />
                            <p className="font-medium">No matches are currently live.</p>
                            <p className="text-sm">Check back soon for real-time updates!</p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
