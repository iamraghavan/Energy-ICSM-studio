'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLiveMatches, updateScore, postMatchEvent, type ApiMatch } from "@/lib/api";
import { io, type Socket } from 'socket.io-client';
import { ArrowLeft, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchCard } from './MatchCard';

const SOCKET_URL = 'https://api.egspgroup.in';

function ScoringInterface({ match, onBack }: { match: ApiMatch, onBack: () => void }) {
    const [score, setScore] = useState(match.score_details || {});
    const [events, setEvents] = useState<any[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const newSocket = io(SOCKET_URL);

        newSocket.on('connect', () => {
            newSocket.emit('join_match', match.id);
        });

        newSocket.on('match_event', (data) => {
            if (data.matchId === match.id) {
                setScore(data.score);
                setEvents(prev => [data.event, ...prev]);
                toast({ title: "Event Received", description: `Type: ${data.event.event_type}` });
            }
        });

        newSocket.on('score_updated', (data) => {
             if (data.matchId === match.id) {
                setScore(data.score_details);
            }
        })

        return () => {
            newSocket.disconnect();
        };
    }, [match.id, toast]);

    const handleEndMatch = async () => {
        try {
            await updateScore(match.id, score, 'completed');
            toast({ title: 'Match Ended', description: 'The match has been moved to completed status.' });
            onBack();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to end the match.' });
        }
    };
    
    const handleGoal = async (teamId: string) => {
        const eventData = {
            event_type: 'goal',
            key: 'goals',
            value: 1,
            team_id: teamId
        };
        try {
            await postMatchEvent(match.id, eventData);
            toast({title: "Event Sent!", description: "Goal scored for " + (teamId === match.TeamA.id ? match.TeamA.team_name : match.TeamB.team_name)});
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to send event.' });
        }
    };
    
    const scoreA = (score[match.team_a_id] as any)?.goals ?? score.team_a ?? 0;
    const scoreB = (score[match.team_b_id] as any)?.goals ?? score.team_b ?? 0;


    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <CardTitle>Live Scoring: {match.Sport.name}</CardTitle>
                        <CardDescription>{match.TeamA.team_name} vs {match.TeamB.team_name}</CardDescription>
                    </div>
                    <Badge className="ml-auto animate-pulse">LIVE</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-center mb-4">Scoreboard</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="border p-4 rounded-lg">
                            <p className="font-bold text-xl">{match.TeamA.team_name}</p>
                            <p className="text-4xl font-bold">{scoreA}</p>
                        </div>
                         <div className="border p-4 rounded-lg">
                            <p className="font-bold text-xl">{match.TeamB.team_name}</p>
                             <p className="text-4xl font-bold">{scoreB}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-2">Actions (Example: Football)</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <Button onClick={() => handleGoal(match.team_a_id)}><Send className="mr-2"/> Goal for {match.TeamA.team_name}</Button>
                        <Button onClick={() => handleGoal(match.team_b_id)}><Send className="mr-2"/> Goal for {match.TeamB.team_name}</Button>
                     </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-2">Event Timeline</h3>
                    <div className="border rounded-lg p-4 h-48 overflow-y-auto space-y-2">
                        {events.length === 0 && <p className="text-muted-foreground text-center">No events yet.</p>}
                        {events.map((event, i) => (
                             <div key={i} className="text-sm p-2 bg-muted rounded-md">
                                <pre className="whitespace-pre-wrap">{JSON.stringify(event, null, 2)}</pre>
                            </div>
                        ))}
                    </div>
                </div>

            </CardContent>
            <CardFooter className="justify-end">
                <Button variant="destructive" onClick={handleEndMatch}>End Match</Button>
            </CardFooter>
        </Card>
    );
}

export function LiveScoring() {
    const [liveFixtures, setLiveFixtures] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<ApiMatch | null>(null);
    const { toast } = useToast();

    const fetchLiveMatches = async () => {
        setIsLoading(true);
        try {
            const matches = await getLiveMatches();
            setLiveFixtures(matches);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch live matches.' });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchLiveMatches();
    }, []);

    if (selectedMatch) {
        return <ScoringInterface match={selectedMatch} onBack={() => {
            setSelectedMatch(null);
            fetchLiveMatches();
        }} />;
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle>Live Matches</CardTitle>
                <CardDescription>Select a match to start live scoring.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                {!isLoading && liveFixtures.length > 0 ? (
                    liveFixtures.map(match => (
                       <MatchCard key={match.id} match={match}>
                           <Button onClick={() => setSelectedMatch(match)}>Start Scoring</Button>
                       </MatchCard>
                    ))
                ) : (
                    !isLoading && <p className="text-muted-foreground text-center py-8">No matches are currently live.</p>
                )}
            </CardContent>
        </Card>
    );
}
