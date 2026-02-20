
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { endMatch, postCricketScore, getLineup, type ApiMatch } from "@/lib/api";
import { ArrowLeft, Send, Timer as TimerIcon, Play, Pause, Goal, Replace, Square, Info, Shield, Users, ArrowRight, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { socket } from '@/lib/socket';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';


const extraTypes = ['wide', 'noball', 'bye', 'legbye'];
const wicketTypes = ['bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket'];

export function CricketScoringInterface({ match, onBack }: { match: ApiMatch, onBack: () => void }) {
    const [score, setScore] = useState(match.score_details || {});
    const [lastBall, setLastBall] = useState<any>(null);
    const [lineup, setLineup] = useState<{ teamA: any[], teamB: any[] } | null>(null);

    const [battingTeamId, setBattingTeamId] = useState<string | null>(null);
    const [strikerId, setStrikerId] = useState<string | null>(null);
    const [nonStrikerId, setNonStrikerId] = useState<string | null>(null);
    const [bowlerId, setBowlerId] = useState<string | null>(null);
    
    const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
    const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
    
    const [isEndMatchDialogOpen, setIsEndMatchDialogOpen] = useState(false);
    const [winnerId, setWinnerId] = useState<string | null>(null);

    const { toast } = useToast();

     useEffect(() => {
        if (socket.connected) {
            socket.emit("join_match", match.id);
        } else {
            socket.on("connect", () => socket.emit("join_match", match.id));
        }

        const handleScoreUpdate = (data: any) => {
             if (data.matchId === match.id) {
                setScore(data.score);
                setLastBall(data.last_ball);
            }
        };

        socket.on('cricket_score_update', handleScoreUpdate);

        const fetchLineupData = async () => {
            try {
                const lineupData = await getLineup(match.id);
                setLineup({
                    teamA: lineupData.teamA.squad,
                    teamB: lineupData.teamB.squad
                });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch lineup.' });
            }
        };

        fetchLineupData();

        return () => {
            socket.emit("leave_match", match.id);
            socket.off('cricket_score_update', handleScoreUpdate);
        };
    }, [match.id, toast]);

    const handleBallPlayed = async (ballData: any) => {
        const requiredFields = { batting_team_id: battingTeamId, striker_id: strikerId, non_striker_id: nonStrikerId, bowler_id: bowlerId };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                toast({ variant: "destructive", title: "Error", description: `Please select ${key.replace('_', ' ')}` });
                return;
            }
        }
        
        try {
            await postCricketScore(match.id, { ...requiredFields, ...ballData });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to post ball event.' });
        }
    }

    const handleEndMatch = async () => {
        if (!winnerId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a winner.' });
            return;
        }
        try {
            await endMatch(match.id, winnerId === 'draw' ? null : winnerId);
            toast({ title: 'Match Ended', description: 'The match has been moved to completed status.' });
            setIsEndMatchDialogOpen(false);
            onBack();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to end the match.' });
        }
    };
    
    const bowlingTeamId = battingTeamId === match.team_a_id ? match.team_b_id : match.team_a_id;

    const battingTeamPlayers = useMemo(() => {
        if (!lineup || !battingTeamId) return [];
        return battingTeamId === match.team_a_id ? lineup.teamA : lineup.teamB;
    }, [lineup, battingTeamId, match]);

    const bowlingTeamPlayers = useMemo(() => {
        if (!lineup || !bowlingTeamId) return [];
        return bowlingTeamId === match.team_a_id ? lineup.teamA : lineup.teamB;
    }, [lineup, bowlingTeamId, match]);
    
    const teamAScore = score[match.team_a_id] || { runs: 0, wickets: 0, overs: 0.0 };
    const teamBScore = score[match.team_b_id] || { runs: 0, wickets: 0, overs: 0.0 };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
                    <div><CardTitle>Live Cricket Scoring</CardTitle><CardDescription>{match.TeamA.team_name} vs {match.TeamB.team_name}</CardDescription></div>
                    <Badge className="ml-auto animate-pulse">LIVE</Badge>
                </div>
            </CardHeader>
            <CardContent className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Scoreboard */}
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-2 gap-4 items-center">
                            <div className="text-center space-y-2 border-r pr-4">
                                <h3 className="font-bold text-xl">{match.TeamA.team_name}</h3>
                                <p className="text-4xl font-bold">{teamAScore.runs}/{teamAScore.wickets}</p>
                                <p className="text-muted-foreground">({teamAScore.overs.toFixed(1)} Overs)</p>
                            </div>
                             <div className="text-center space-y-2">
                                <h3 className="font-bold text-xl">{match.TeamB.team_name}</h3>
                                <p className="text-4xl font-bold">{teamBScore.runs}/{teamBScore.wickets}</p>
                                <p className="text-muted-foreground">({teamBScore.overs.toFixed(1)} Overs)</p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Player Selection */}
                     <Card>
                        <CardHeader><CardTitle>Current Players</CardTitle></CardHeader>
                        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Select onValueChange={setBattingTeamId}><SelectTrigger><SelectValue placeholder="Batting Team..." /></SelectTrigger><SelectContent><SelectItem value={match.team_a_id}>{match.TeamA.team_name}</SelectItem><SelectItem value={match.team_b_id}>{match.TeamB.team_name}</SelectItem></SelectContent></Select>
                            <Select onValueChange={setStrikerId} disabled={!battingTeamId}><SelectTrigger><SelectValue placeholder="Striker..." /></SelectTrigger><SelectContent>{battingTeamPlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
                            <Select onValueChange={setNonStrikerId} disabled={!battingTeamId}><SelectTrigger><SelectValue placeholder="Non-Striker..." /></SelectTrigger><SelectContent>{battingTeamPlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
                            <Select onValueChange={setBowlerId} disabled={!bowlingTeamId}><SelectTrigger><SelectValue placeholder="Bowler..." /></SelectTrigger><SelectContent>{bowlingTeamPlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
                        </CardContent>
                    </Card>

                    {/* Scoring Controls */}
                    <Card>
                        <CardHeader><CardTitle>Log Ball Event</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Runs Scored</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[0, 1, 2, 3, 4, 6].map(runs => <Button key={runs} variant="outline" onClick={() => handleBallPlayed({ runs })}>{runs}</Button>)}
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Events</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="secondary" onClick={() => setIsExtraModalOpen(true)}>Extra</Button>
                                    <Button variant="destructive" onClick={() => setIsWicketModalOpen(true)}>Wicket</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                     <Card>
                        <CardHeader><CardTitle>Last Ball</CardTitle></CardHeader>
                        <CardContent>
                            {lastBall ? <pre className="text-xs bg-muted p-2 rounded-md">{JSON.stringify(lastBall, null, 2)}</pre> : <p className="text-muted-foreground text-center">Waiting for first ball...</p>}
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
             <CardFooter className="justify-end">
                <Button variant="destructive" onClick={() => setIsEndMatchDialogOpen(true)}>End Match</Button>
            </CardFooter>
        </Card>
    )
}
