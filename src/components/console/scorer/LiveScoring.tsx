'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fixtures, teams, sports } from "@/lib/data";
import type { Fixture, Player, Team, Sport } from "@/lib/types";
import { io, type Socket } from 'socket.io-client';
import { Plus, Minus, Users, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const API_URL = 'https://energy-sports-meet-backend.onrender.com';

const getTeam = (id: string): Team | undefined => teams.find(t => t.id === id);
const getSport = (id: string): Sport | undefined => sports.find(s => s.id === id);


export function LiveScoring() {
    const [liveFixtures, setLiveFixtures] = useState<Fixture[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);
    const [teamA, setTeamA] = useState<Team | null>(null);
    const [teamB, setTeamB] = useState<Team | null>(null);
    const [sport, setSport] = useState<Sport | null>(null);
    const [score, setScore] = useState<{ A: number, B: number }>({ A: 0, B: 0 });
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        setLiveFixtures(fixtures.filter(f => f.status === 'Live'));
        
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected');
        });

        newSocket.on('score_updated', (data) => {
            console.log('Received score update:', data);
            if (selectedMatch && data.matchId === selectedMatch.id) {
                setScore({ A: data.teamAScore, B: data.teamBScore });
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [selectedMatch]);

    const handleSelectMatch = (fixture: Fixture) => {
        setSelectedMatch(fixture);
        setTeamA(getTeam(fixture.teamAId)!);
        setTeamB(getTeam(fixture.teamBId)!);
        setSport(getSport(fixture.sportId)!);
        setScore({ A: fixture.scoreA ?? 0, B: fixture.scoreB ?? 0 });
        socket?.emit('join_match', fixture.id);
    };

    const handleUpdateScore = (team: 'A' | 'B', change: 1 | -1) => {
        const newScore = { ...score };
        if (team === 'A') newScore.A = Math.max(0, newScore.A + change);
        if (team === 'B') newScore.B = Math.max(0, newScore.B + change);
        
        setScore(newScore);

        socket?.emit('update_score', {
            matchId: selectedMatch!.id,
            teamAScore: newScore.A,
            teamBScore: newScore.B,
        });
    };

    const handleEndMatch = () => {
        alert("This would end the match and move it to 'Completed'. (Simulation)");
        setSelectedMatch(null);
    }

    if (selectedMatch && teamA && teamB && sport) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                         <Button variant="outline" size="icon" onClick={() => setSelectedMatch(null)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <CardTitle>Live Scoring: {sport.name}</CardTitle>
                            <CardDescription>{teamA.name} vs {teamB.name}</CardDescription>
                        </div>
                        <Badge className="ml-auto animate-pulse">LIVE</Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                   <TeamScoreControl 
                        team={teamA} 
                        score={score.A} 
                        onIncrement={() => handleUpdateScore('A', 1)}
                        onDecrement={() => handleUpdateScore('A', -1)}
                    />
                    <TeamScoreControl 
                        team={teamB} 
                        score={score.B} 
                        onIncrement={() => handleUpdateScore('B', 1)}
                        onDecrement={() => handleUpdateScore('B', -1)}
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
                {liveFixtures.length > 0 ? (
                    liveFixtures.map(fixture => {
                        const teamA = getTeam(fixture.teamAId);
                        const teamB = getTeam(fixture.teamBId);
                        if (!teamA || !teamB) return null;

                        return (
                            <div key={fixture.id} className="border p-4 rounded-lg flex items-center justify-between hover:bg-muted/50">
                                <div>
                                    <p className="font-bold">{teamA.name} vs {teamB.name}</p>
                                    <p className="text-sm text-muted-foreground">{getSport(fixture.sportId)?.name}</p>
                                </div>
                                <Button onClick={() => handleSelectMatch(fixture)}>Start Scoring</Button>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-muted-foreground text-center py-8">No matches are currently live.</p>
                )}
            </CardContent>
        </Card>
    );
}


function TeamScoreControl({ team, score, onIncrement, onDecrement }: { team: Team, score: number, onIncrement: () => void, onDecrement: () => void }) {
    return (
        <div className="border rounded-lg p-4 flex flex-col items-center gap-4">
            <h3 className="text-2xl font-bold font-headline">{team.name}</h3>
            <p className="text-6xl font-bold">{score}</p>
            <div className="flex items-center gap-4">
                <Button size="icon" variant="outline" onClick={onDecrement}><Minus className="h-4 w-4" /></Button>
                <Button size="icon" onClick={onIncrement}><Plus className="h-4 w-4" /></Button>
            </div>
            <Separator className="my-4" />
            <h4 className="font-semibold flex items-center gap-2"><Users className="w-5 h-5"/> Lineup</h4>
            <div className="space-y-3 w-full">
                {team.players.length > 0 ? team.players.map(player => (
                    <div key={player.id} className="flex items-center gap-3">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={player.photoUrl} alt={player.name} data-ai-hint={player.imageHint} />
                            <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{player.name}</p>
                    </div>
                )) : <p className="text-sm text-muted-foreground text-center">No player data.</p>}
            </div>
        </div>
    )
}
