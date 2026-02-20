

'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { endMatch, postCricketScore, getScorerTeamDetails, type ApiMatch, type FullSportsHeadTeam, type StudentTeamMember } from "@/lib/api";
import { ArrowLeft, PlusCircle, Shield, Disc, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { socket } from '@/lib/socket';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';


const extraTypes = ['wide', 'noball', 'bye', 'legbye'];
const wicketTypes = ['bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket'];

function CricketTimelineEvent({ event, match }: { event: any, match: ApiMatch | null }) {
    if (!event) return null;

    const getEventDetails = (e: any) => {
        if (e.is_wicket) {
            return { icon: Shield, color: 'text-red-500 bg-red-500/10', title: `WICKET! (${e.wicket_type || 'Dismissed'})` };
        }
        if (e.extras > 0) {
             return { icon: PlusCircle, color: 'text-blue-500 bg-blue-500/10', title: `${e.extras} ${e.extra_type}` };
        }
        if (e.runs > 0) {
             return { icon: Trophy, color: 'text-green-500 bg-green-500/10', title: `${e.runs} run${e.runs > 1 ? 's' : ''}` };
        }
        return { icon: Disc, color: 'text-gray-500 bg-gray-500/10', title: 'Dot Ball' };
    };

    const { icon: Icon, color, title } = getEventDetails(event);
    
    const time = new Date(event.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex items-start gap-3">
            <div className="text-xs text-muted-foreground pt-1.5">{time}</div>
            <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center", color)}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{title}</p>
                 <p className="text-sm text-muted-foreground">Over {event.over_number}.{event.ball_number}</p>
            </div>
        </div>
    );
};


export function CricketScoringInterface({ match, onBack }: { match: ApiMatch, onBack: () => void }) {
    const [score, setScore] = useState(match.score_details || {});
    const [events, setEvents] = useState<any[]>(match.match_events || []);
    const [teamARoster, setTeamARoster] = useState<StudentTeamMember[]>([]);
    const [teamBRoster, setTeamBRoster] = useState<StudentTeamMember[]>([]);
    const [rostersLoading, setRostersLoading] = useState(true);

    const [battingTeamId, setBattingTeamId] = useState<string | null>(null);
    const [strikerId, setStrikerId] = useState<string | null>(null);
    const [nonStrikerId, setNonStrikerId] = useState<string | null>(null);
    const [bowlerId, setBowlerId] = useState<string | null>(null);
    
    const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
    const [extraType, setExtraType] = useState<string>('wide');
    const [extraRuns, setExtraRuns] = useState<number>(1);
    
    const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
    const [wicketType, setWicketType] = useState<string>('bowled');
    const [playerOutId, setPlayerOutId] = useState<string|null>(null);
    const [fielderId, setFielderId] = useState<string|null>(null);
    const [runsOnWicket, setRunsOnWicket] = useState<number>(0);


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
                 if (data.last_ball) {
                    setEvents(prev => [data.last_ball, ...prev].slice(0, 50)); // Keep last 50 events
                }
            }
        };

        socket.on('cricket_score_update', handleScoreUpdate);

        const fetchRosterData = async () => {
            setRostersLoading(true);
            try {
                const [teamAData, teamBData] = await Promise.all([
                    getScorerTeamDetails(match.team_a_id),
                    getScorerTeamDetails(match.team_b_id)
                ]);
                setTeamARoster(teamAData.members || []);
                setTeamBRoster(teamBData.members || []);
                 if ((teamAData.members || []).length === 0 || (teamBData.members || []).length === 0) {
                     toast({ variant: 'default', title: 'Lineup is Empty', description: 'Please add players to the team rosters via the Sports Head dashboard.' });
                }
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch team rosters. Scoring may be limited.' });
            } finally {
                setRostersLoading(false);
            }
        };


        fetchRosterData();

        return () => {
            socket.emit("leave_match", match.id);
            socket.off('cricket_score_update', handleScoreUpdate);
        };
    }, [match.id, match.team_a_id, match.team_b_id, toast]);
    
    useEffect(() => {
        if(wicketType === 'bowled' || wicketType === 'lbw' || wicketType === 'stumped' || wicketType === 'hit_wicket') {
            setPlayerOutId(strikerId);
        } else {
            setPlayerOutId(null);
        }
    }, [wicketType, strikerId]);


    const handleBallPlayed = async (ballData: any) => {
        const requiredFields = { batting_team_id: battingTeamId, striker_id: strikerId, non_striker_id: nonStrikerId, bowler_id: bowlerId };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                toast({ variant: "destructive", title: "Selection Missing", description: `Please select the ${key.replace(/_/g, ' ')}.` });
                return;
            }
        }
        
        try {
            await postCricketScore(match.id, { ...requiredFields, ...ballData });
            setIsExtraModalOpen(false);
            setIsWicketModalOpen(false);
            setExtraRuns(1);
            setRunsOnWicket(0);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to post ball event.' });
        }
    }
    
    const handleWicketSubmit = () => {
        handleBallPlayed({
            is_wicket: true,
            wicket_type: wicketType,
            player_out_id: playerOutId,
            fielder_id: fielderId,
            runs: runsOnWicket,
        });
    }

    const handleEndMatch = async () => {
        if (!winnerId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a winner.' });
            return;
        }
        try {
            await endMatch(match.id, winnerId === 'draw' ? null : winnerId, score);
            toast({ title: 'Match Ended', description: 'The match has been moved to completed status.' });
            setIsEndMatchDialogOpen(false);
            onBack();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to end the match.' });
        }
    };

    const battingTeamPlayers = useMemo(() => {
        if (!battingTeamId) return [];
        return battingTeamId === match.team_a_id ? teamARoster : teamBRoster;
    }, [battingTeamId, teamARoster, teamBRoster, match.team_a_id]);

    const bowlingTeamId = useMemo(() => {
        if (!battingTeamId) return null;
        return battingTeamId === match.team_a_id ? match.team_b_id : match.team_a_id;
    }, [battingTeamId, match.team_a_id, match.team_b_id]);

    const bowlingTeamPlayers = useMemo(() => {
        if (!bowlingTeamId) return [];
        return bowlingTeamId === match.team_a_id ? teamARoster : teamBRoster;
    }, [bowlingTeamId, teamARoster, teamBRoster, match.team_a_id]);
    
    const teamAScore = score[match.team_a_id] || { runs: 0, wickets: 0, overs: 0.0 };
    const teamBScore = score[match.team_b_id] || { runs: 0, wickets: 0, overs: 0.0 };

    return (
        <>
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
                    <div className="border rounded-lg p-6 grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                         <div className="text-center space-y-2">
                            <h3 className="font-bold text-xl truncate">{match.TeamA.team_name}</h3>
                            <p className="text-4xl font-bold">{teamAScore.runs}/{teamAScore.wickets}</p>
                            <p className="text-muted-foreground">({teamAScore.overs.toFixed(1)} Overs)</p>
                        </div>
                        <div className="text-4xl font-bold text-muted-foreground">VS</div>
                         <div className="text-center space-y-2">
                            <h3 className="font-bold text-xl truncate">{match.TeamB.team_name}</h3>
                            <p className="text-4xl font-bold">{teamBScore.runs}/{teamBScore.wickets}</p>
                            <p className="text-muted-foreground">({teamBScore.overs.toFixed(1)} Overs)</p>
                        </div>
                    </div>
                    
                    {/* Scoring Controls */}
                     <div className="border rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Log Ball Event</h3>
                        <div className="space-y-2">
                            <Label>Runs Scored</Label>
                            <div className="flex flex-wrap gap-2">
                                {[0, 1, 2, 3, 4, 6].map(runs => <Button key={runs} size="lg" variant="outline" onClick={() => handleBallPlayed({ runs })}>{runs}</Button>)}
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Events</Label>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="secondary" onClick={() => setIsExtraModalOpen(true)}>Extra</Button>
                                <Button variant="destructive" onClick={() => setIsWicketModalOpen(true)}>Wicket</Button>
                            </div>
                        </div>
                    </div>

                    {/* Player Selection */}
                     <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Current Players</h3>
                        {rostersLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <Label>Batting Team</Label>
                                    <Select onValueChange={setBattingTeamId} value={battingTeamId ?? undefined}>
                                        <SelectTrigger><SelectValue placeholder="Batting Team..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={match.team_a_id}>{match.TeamA.team_name}</SelectItem>
                                            <SelectItem value={match.team_b_id}>{match.TeamB.team_name}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                 </div>
                                  <div className="space-y-2">
                                    <Label>Bowler</Label>
                                    <Select onValueChange={setBowlerId} value={bowlerId ?? undefined} disabled={!bowlingTeamId}>
                                        <SelectTrigger><SelectValue placeholder="Bowler..." /></SelectTrigger>
                                        <SelectContent>
                                            {bowlingTeamPlayers.length > 0 ? (
                                                bowlingTeamPlayers.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.name}</SelectItem>)
                                            ) : (
                                                <div className="p-2 text-center text-sm text-muted-foreground">No players in roster.</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Striker</Label>
                                    <Select onValueChange={setStrikerId} value={strikerId ?? undefined} disabled={!battingTeamId}>
                                        <SelectTrigger><SelectValue placeholder="Striker..." /></SelectTrigger>
                                        <SelectContent>
                                            {battingTeamPlayers.length > 0 ? (
                                                battingTeamPlayers.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.name}</SelectItem>)
                                            ) : (
                                                <div className="p-2 text-center text-sm text-muted-foreground">No players in roster.</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Non-Striker</Label>
                                    <Select onValueChange={setNonStrikerId} value={nonStrikerId ?? undefined} disabled={!battingTeamId}>
                                        <SelectTrigger><SelectValue placeholder="Non-Striker..." /></SelectTrigger>
                                        <SelectContent>
                                             {battingTeamPlayers.length > 0 ? (
                                                battingTeamPlayers.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.name}</SelectItem>)
                                            ) : (
                                                <div className="p-2 text-center text-sm text-muted-foreground">No players in roster.</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                  </div>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="lg:col-span-1">
                     <Card>
                        <CardHeader><CardTitle>Match Timeline</CardTitle></CardHeader>
                        <CardContent>
                             <ScrollArea className="h-[400px]">
                                <div className="space-y-4">
                                {events.length > 0 ? (
                                    events.map((event, i) => <CricketTimelineEvent key={i} event={event} match={match} />)
                                ) : (
                                    <p className="text-muted-foreground text-center py-8 text-sm">Waiting for first ball...</p>
                                )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
             <CardFooter className="justify-end">
                <Button variant="destructive" onClick={() => setIsEndMatchDialogOpen(true)}>End Match</Button>
            </CardFooter>
        </Card>
         <Dialog open={isEndMatchDialogOpen} onOpenChange={setIsEndMatchDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>End Match & Select Winner</DialogTitle>
                    <DialogDescription>
                        Select the winning team to finalize the match. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <RadioGroup onValueChange={setWinnerId} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={match.team_a_id} id={`team-a-${match.id}`} />
                            <Label htmlFor={`team-a-${match.id}`}>{match.TeamA.team_name}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={match.team_b_id} id={`team-b-${match.id}`} />
                            <Label htmlFor={`team-b-${match.id}`}>{match.TeamB.team_name}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="draw" id={`draw-${match.id}`} />
                            <Label htmlFor={`draw-${match.id}`}>Match Draw</Label>
                        </div>
                    </RadioGroup>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleEndMatch} disabled={!winnerId}>Confirm & End Match</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Extra Modal */}
        <Dialog open={isExtraModalOpen} onOpenChange={setIsExtraModalOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Log Extra</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">
                    <RadioGroup value={extraType} onValueChange={setExtraType} className="flex gap-4">
                        {extraTypes.map(type => (
                            <div key={type} className="flex items-center space-x-2">
                                <RadioGroupItem value={type} id={`extra-${type}`} /><Label htmlFor={`extra-${type}`} className="capitalize">{type}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                    <div className="space-y-2">
                        <Label htmlFor="extra-runs">Runs from extra (incl. overthrow)</Label>
                        <Input id="extra-runs" type="number" min={0} value={extraRuns} onChange={e => setExtraRuns(parseInt(e.target.value) || 0)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={() => handleBallPlayed({ extras: extraRuns, extra_type: extraType })}>Log Extra</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Wicket Modal */}
        <Dialog open={isWicketModalOpen} onOpenChange={setIsWicketModalOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Log Wicket</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Wicket Type</Label>
                        <Select value={wicketType} onValueChange={setWicketType}><SelectTrigger><SelectValue placeholder="Select dismissal type" /></SelectTrigger><SelectContent>{wicketTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent></Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Player Out</Label>
                        <Select value={playerOutId ?? undefined} onValueChange={setPlayerOutId}><SelectTrigger><SelectValue placeholder="Select player who got out" /></SelectTrigger><SelectContent>{battingTeamPlayers.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.name}</SelectItem>)}</SelectContent></Select>
                    </div>
                    {(wicketType === 'caught' || wicketType === 'run_out' || wicketType === 'stumped') && (
                        <div className="space-y-2">
                            <Label>Fielder</Label>
                            <Select value={fielderId ?? undefined} onValueChange={setFielderId}><SelectTrigger><SelectValue placeholder="Select fielder" /></SelectTrigger><SelectContent>{bowlingTeamPlayers.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.name}</SelectItem>)}</SelectContent></Select>
                        </div>
                    )}
                     <div className="space-y-2">
                        <Label htmlFor="wicket-runs">Runs Scored on this ball (if any)</Label>
                        <Input id="wicket-runs" type="number" min={0} value={runsOnWicket} onChange={e => setRunsOnWicket(parseInt(e.target.value) || 0)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleWicketSubmit}>Log Wicket</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        </>
    )
}
