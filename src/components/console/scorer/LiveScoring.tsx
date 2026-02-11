'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMatches, updateScore, type ApiMatch, type ApiTeam } from "@/lib/api";
import { io, type Socket } from 'socket.io-client';
import { Plus, Minus, Users, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchCard } from './MatchCard';

const SOCKET_URL = 'https://energy-sports-meet-backend.onrender.com';

export function LiveScoring() {
    const [liveFixtures, setLiveFixtures] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<ApiMatch | null>(null);
    const [score, setScore] = useState<{ team_a: number, team_b: number }>({ team_a: 0, team_b: 0 });
    const [socket, setSocket] = useState<Socket | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchLiveMatches();
    }, []);
    
    useEffect(() => {
        if (!selectedMatch) return;

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected');
            newSocket.emit('join_match', selectedMatch.id);
        });

        newSocket.on('score_updated', (data) => {
            if (data.matchId === selectedMatch.id) {
                console.log('Received score update:', data);
                setScore(data.score_details);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [selectedMatch]);
    
    const fetchLiveMatches = async () => {
        setIsLoading(true);
        try {
            const matches = await getMatches('live');
            setLiveFixtures(matches);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch live matches.' });
        } finally {
            setIsLoading(false);
        }
    }

    const handleSelectMatch = (match: ApiMatch) => {
        setSelectedMatch(match);
        setScore(match.score_details || { team_a: 0, team_b: 0 });
    };

    const handleUpdateScore = async (team: 'team_a' | 'team_b', change: 1 | -1) => {
        if (!selectedMatch) return;

        const newScore = { ...score, [team]: Math.max(0, score[team] + change) };
        setScore(newScore); // Optimistic update

        try {
            await updateScore(selectedMatch.id, newScore, 'live');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Failed to sync score with server.' });
            // Revert score on failure
            setScore(score);
        }
    };

    const handleEndMatch = async () => {
        if (!selectedMatch) return;
        try {
            await updateScore(selectedMatch.id, score, 'completed');
            toast({ title: 'Match Ended', description: 'The match has been moved to completed status.' });
            setSelectedMatch(null);
            fetchLiveMatches();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to end the match.' });
        }
    }

    if (selectedMatch) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                         <Button variant="outline" size="icon" onClick={() => setSelectedMatch(null)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <CardTitle>Live Scoring: {selectedMatch.Sport.name}</CardTitle>
                            <CardDescription>{selectedMatch.TeamA.team_name} vs {selectedMatch.TeamB.team_name}</CardDescription>
                        </div>
                        <Badge className="ml-auto animate-pulse">LIVE</Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                   <TeamScoreControl 
                        team={selectedMatch.TeamA}
                        score={score.team_a} 
                        onIncrement={() => handleUpdateScore('team_a', 1)}
                        onDecrement={() => handleUpdateScore('team_a', -1)}
                    />
                    <TeamScoreControl 
                        team={selectedMatch.TeamB}
                        score={score.team_b} 
                        onIncrement={() => handleUpdateScore('team_b', 1)}
                        onDecrement={() => handleUpdateScore('team_b', -1)}
                    />
                </CardContent>
                <CardFooter className="justify-end">
                    <Button variant="destructive" onClick={handleEndMatch}>End Match</Button>
                </CardFooter>
            </Card>
        );
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
                           <Button onClick={() => handleSelectMatch(match)}>Start Scoring</Button>
                       </MatchCard>
                    ))
                ) : (
                    !isLoading && <p className="text-muted-foreground text-center py-8">No matches are currently live.</p>
                )}
            </CardContent>
        </Card>
    );
}


function TeamScoreControl({ team, score, onIncrement, onDecrement }: { team: ApiTeam, score: number, onIncrement: () => void, onDecrement: () => void }) {
    return (
        <div className="border rounded-lg p-4 flex flex-col items-center gap-4">
            <h3 className="text-2xl font-bold font-headline">{team.team_name}</h3>
            <p className="text-6xl font-bold">{score}</p>
            <div className="flex items-center gap-4">
                <Button size="icon" variant="outline" onClick={onDecrement}><Minus className="h-4 w-4" /></Button>
                <Button size="icon" onClick={onIncrement}><Plus className="h-4 w-4" /></Button>
            </div>
            <Separator className="my-4" />
            <h4 className="font-semibold flex items-center gap-2"><Users className="w-5 h-5"/> Lineup</h4>
            <div className="space-y-3 w-full">
                <p className="text-sm text-muted-foreground text-center">Lineup data not available.</p>
            </div>
        </div>
    )
}
