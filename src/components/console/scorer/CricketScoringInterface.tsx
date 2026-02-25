
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getScorerTeamDetails, type ApiMatch, type FullSportsHeadTeam, type StudentTeamMember } from "@/lib/api";
import { ArrowLeft, PlusCircle, Shield, Disc, Trophy, Replace, User, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMatchSync } from '@/hooks/useMatchSync';

const extraTypes = ['wide', 'noball', 'bye', 'legbye'];
const wicketTypes = ['bowled', 'caught', 'runout', 'lbw', 'stumped', 'hit_wicket'];

const BatsmanCard = ({ player, stats, onStrike }: { player: StudentTeamMember, stats: any, onStrike: boolean }) => {
    if (!player) return <Card className="bg-slate-800/50 border-slate-700 p-4"><p className="text-slate-400">Select Batsman</p></Card>;
    const sr = stats.balls > 0 ? (stats.runs / stats.balls) * 100 : 0;
    return (
        <Card className={cn("border-slate-700 text-white p-4", onStrike ? 'bg-blue-600' : 'bg-slate-800')}>
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg">{player.Student?.name || player.name}{onStrike && ' *'}</h4>
            </div>
            <div className="flex items-end gap-2">
                <p className="text-4xl font-bold">{stats.runs}</p>
                <p className="text-slate-300 pb-1">({stats.balls})</p>
            </div>
            <div className="text-xs text-slate-300 flex justify-between mt-2">
                <span>4s: {stats.fours}</span>
                <span>6s: {stats.sixes}</span>
                <span>SR: {sr.toFixed(2)}</span>
            </div>
        </Card>
    )
}

const BowlerCard = ({ player, stats }: { player: StudentTeamMember | undefined, stats: any }) => {
    if (!player) return <Card className="bg-slate-800/50 border-slate-700 p-4"><p className="text-slate-400">Select Bowler</p></Card>;

    return (
        <Card className="bg-slate-800 border-slate-700 text-white p-4 mt-4">
             <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold flex items-center gap-2"><User className="w-4 h-4 text-slate-400"/> {player.Student?.name || player.name}</p>
                    <p className="text-xs text-slate-400 ml-6">{player.bowling_style || 'Right-arm Fast'}</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold font-mono">{stats.wickets}/{stats.runs}</p>
                    <p className="text-xs text-slate-400 text-right">{stats.overs} Overs</p>
                 </div>
            </div>
        </Card>
    )
}

const ThisOverBall = ({ event }: { event: any }) => {
    let text = event.runs?.toString() || '0';
    let color = 'bg-slate-700';

    if (event.is_wicket) {
        text = 'W';
        color = 'bg-red-500';
    } else if (event.extra_type) {
        text = `${event.extras || ''}${event.extra_type.substring(0,2)}`;
        color = 'bg-orange-500';
    } else if (event.runs === 4) {
        color = 'bg-green-500';
    } else if (event.runs === 6) {
        color = 'bg-blue-500';
    }
    
    return (
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm", color)}>
            {text}
        </div>
    )
}


export function CricketScoringInterface({ match, onBack }: { match: ApiMatch, onBack: () => void }) {
    const { syncedData, sendEvent } = useMatchSync(match.id);
    
    const [score, setScore] = useState(match.score_details || {});
    const [events, setEvents] = useState<any[]>(Array.isArray(match.match_events) ? [...match.match_events].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);
    const [teamARoster, setTeamARoster] = useState<StudentTeamMember[]>([]);
    const [teamBRoster, setTeamBRoster] = useState<StudentTeamMember[]>([]);
    const [rostersLoading, setRostersLoading] = useState(true);

    const [battingTeamId, setBattingTeamId] = useState<string | null>(match.team_a_id);
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
    const [isPlayerSelectOpen, setIsPlayerSelectOpen] = useState(false);
    const [winnerId, setWinnerId] = useState<string | null>(null);

    const { toast } = useToast();
    
    const bowlingTeamId = useMemo(() => battingTeamId === match.team_a_id ? match.team_b_id : match.team_a_id, [battingTeamId, match]);
    const battingTeam = useMemo(() => battingTeamId === match.team_a_id ? match.TeamA : match.TeamB, [battingTeamId, match]);
    const bowlingTeam = useMemo(() => bowlingTeamId === match.team_a_id ? match.TeamA : match.TeamB, [bowlingTeamId, match]);
    const battingTeamRoster = useMemo(() => battingTeamId === match.team_a_id ? teamARoster : teamBRoster, [battingTeamId, teamARoster, teamBRoster, match.team_a_id]);
    const bowlingTeamRoster = useMemo(() => bowlingTeamId === match.team_a_id ? teamARoster : teamBRoster, [bowlingTeamId, teamARoster, teamBRoster, match.team_a_id]);

    useEffect(() => {
        if(syncedData) {
            if (syncedData.score_details) setScore(syncedData.score_details);
            if (syncedData.match_events) {
                setEvents(prev => [...syncedData.match_events!, ...prev]
                    .filter((v, i, a) => a.findIndex(t => t?.id === v?.id) === i)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                );
            }
        }
    }, [syncedData]);

     useEffect(() => {
        const fetchRosterData = async () => {
            setRostersLoading(true);
            try {
                const [teamAData, teamBData] = await Promise.all([
                    getScorerTeamDetails(match.team_a_id),
                    getScorerTeamDetails(match.team_b_id)
                ]);
                setTeamARoster(teamAData.members || []);
                setTeamBRoster(teamBData.members || []);
                if (!strikerId) setStrikerId(teamAData.members?.[0]?.student_id || null);
                if (!nonStrikerId) setNonStrikerId(teamAData.members?.[1]?.student_id || null);
                if (!bowlerId) setBowlerId(teamBData.members?.[0]?.student_id || null);

            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch team rosters.' });
            } finally {
                setRostersLoading(false);
            }
        };
        fetchRosterData();
    }, [match.team_a_id, match.team_b_id, toast, strikerId, nonStrikerId, bowlerId]);
    
    useEffect(() => {
        if(wicketType === 'bowled' || wicketType === 'lbw' || wicketType === 'stumped' || wicketType === 'hit_wicket') setPlayerOutId(strikerId);
        else setPlayerOutId(null);
    }, [wicketType, strikerId]);


    const handleBallPlayed = useCallback(async (ballData: any) => {
        const requiredFields = { batting_team_id: battingTeamId, striker_id: strikerId, non_striker_id: nonStrikerId, bowler_id: bowlerId };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                toast({ variant: "destructive", title: "Selection Missing", description: `Please select the ${key.replace(/_/g, ' ')}.` });
                setIsPlayerSelectOpen(true);
                return;
            }
        }
        if (strikerId === nonStrikerId) {
            toast({ variant: "destructive", title: "Invalid Selection", description: `Striker and non-striker cannot be the same player.` });
            setIsPlayerSelectOpen(true);
            return;
        }

        const payload = { ...requiredFields, ...ballData };
        try {
            await sendEvent("submit_cricket_ball", payload);
            if(ballData.runs % 2 !== 0 && !ballData.extra_type) {
                setStrikerId(nonStrikerId);
                setNonStrikerId(strikerId);
            }
            toast({ title: "Ball Logged!" });
            setIsExtraModalOpen(false);
            setIsWicketModalOpen(false);
            setExtraRuns(1); setRunsOnWicket(0);
        } catch(error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: String(error) });
        }
    }, [battingTeamId, bowlerId, nonStrikerId, sendEvent, strikerId, toast]);
    
    const handleWicketSubmit = () => {
        if (!wicketType || !playerOutId) return toast({ variant: 'destructive', title: 'Missing Details' });
        handleBallPlayed({ is_wicket: true, wicket_type: wicketType, player_out_id: playerOutId, fielder_id: fielderId || null, runs: runsOnWicket });
    }

    const handleEndMatch = async () => {
        if (!winnerId) return toast({ variant: 'destructive', title: 'Error', description: 'Please select a winner.' });
        const payload = { status: "completed", winner_id: winnerId === 'draw' ? null : winnerId };
        try {
            await sendEvent("update_match_status", payload);
            toast({ title: 'Match Ended!' });
            setIsEndMatchDialogOpen(false);
            onBack();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: String(error) });
        }
    };
    
    const calculatePlayerStats = useCallback((playerId: string | null) => {
        return events.reduce((acc, event) => {
            if (playerId && event.striker_id === playerId) {
                if (!event.extra_type || event.extra_type === 'noball') acc.balls++;
                if (event.runs) {
                    acc.runs += event.runs;
                    if (event.runs === 4) acc.fours++;
                    if (event.runs === 6) acc.sixes++;
                }
            }
            return acc;
        }, { runs: 0, balls: 0, fours: 0, sixes: 0 });
    }, [events]);
    
    const calculateBowlerStats = useCallback((playerId: string | null) => {
        const stats = events.reduce((acc, event) => {
            if (playerId && event.bowler_id === playerId) {
                if (!event.extra_type || event.extra_type === 'legbye' || event.extra_type === 'bye') {
                   acc.balls++;
                }
                if (event.runs) acc.runs += event.runs;
                if (event.is_wicket && event.wicket_type !== 'runout') acc.wickets++;
            }
            return acc;
        }, { balls: 0, runs: 0, wickets: 0 });

        const overs = Math.floor(stats.balls / 6);
        const ballsInOver = stats.balls % 6;
        return {...stats, overs: `${overs}.${ballsInOver}`};
    }, [events]);

    const currentOverEvents = useMemo(() => {
        const teamScore = score[battingTeamId!] || { overs: 0.0 };
        const currentOver = Math.floor(teamScore.overs || 0);
        return events.filter(e => e.batting_team_id === battingTeamId && Math.floor(e.over_number) === currentOver).sort((a,b) => a.ball_number - b.ball_number);
    }, [events, score, battingTeamId]);
    
    const teamScore = score[battingTeamId!] || { runs: 0, wickets: 0, overs: 0.0 };
    
    const striker = useMemo(() => battingTeamRoster.find(p => p.student_id === strikerId), [strikerId, battingTeamRoster]);
    const nonStriker = useMemo(() => battingTeamRoster.find(p => p.student_id === nonStrikerId), [nonStrikerId, battingTeamRoster]);
    const bowler = useMemo(() => bowlingTeamRoster.find(p => p.student_id === bowlerId), [bowlerId, bowlingTeamRoster]);

    const strikerStats = useMemo(() => calculatePlayerStats(strikerId), [strikerId, calculatePlayerStats]);
    const nonStrikerStats = useMemo(() => calculatePlayerStats(nonStrikerId), [nonStrikerId, calculatePlayerStats]);
    const bowlerStats = useMemo(() => calculateBowlerStats(bowlerId), [bowlerId, calculateBowlerStats]);

    if (rostersLoading) return <div className="h-screen w-full flex items-center justify-center bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-white"/></div>

    return (
        <div className="bg-slate-950 text-white min-h-screen">
            <header className="p-4 flex items-center justify-between border-b border-slate-800">
                <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft /></Button>
                <h1 className="font-bold">Live Match Scoring</h1>
                <Button variant="ghost" onClick={() => setIsEndMatchDialogOpen(true)}>End Match</Button>
            </header>

            <main className="p-4 space-y-4">
                <Card className="bg-slate-900 border-slate-800 text-white text-center p-4">
                    <div className="flex justify-between items-center text-sm">
                        <p className="font-bold text-blue-400">{battingTeam.team_name}</p>
                        <p className="text-slate-400">{match.Sport.name}</p>
                        <p className="font-semibold">{bowlingTeam.team_name}</p>
                    </div>
                    <div className="my-4">
                        <p className="text-6xl font-black">{teamScore.runs}<span className="text-4xl font-bold text-slate-400">/{teamScore.wickets}</span></p>
                        <Badge variant="secondary" className="bg-slate-800 text-slate-300 font-mono">{(teamScore.overs || 0).toFixed(1)} Overs</Badge>
                    </div>
                </Card>

                <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400 font-semibold">THIS OVER:</p>
                    <div className="flex items-center gap-1.5">
                       {currentOverEvents.map((e,i) => <ThisOverBall key={e.id || i} event={e} />)}
                    </div>
                </div>

                {/* Player Cards */}
                <div className="grid grid-cols-2 gap-2">
                    {striker && <BatsmanCard player={striker} stats={strikerStats} onStrike={true} />}
                    {nonStriker && <BatsmanCard player={nonStriker} stats={nonStrikerStats} onStrike={false} />}
                </div>
                 {bowler && <BowlerCard player={bowler} stats={bowlerStats} />}
                 <Button variant="outline" className="w-full bg-slate-800 border-slate-700" onClick={() => setIsPlayerSelectOpen(true)}>Change Players</Button>


                {/* Scoring Pad */}
                <div className="space-y-2 pt-4">
                    <p className="text-xs font-semibold text-center text-slate-400">SCORING PAD</p>
                     <div className="grid grid-cols-[2fr,2fr,2fr,1.5fr] gap-2">
                        {[0,1,2,3].map(runs => <Button key={runs} className="h-20 text-2xl font-bold bg-slate-800" onClick={() => handleBallPlayed({ runs })}>{runs}</Button>)}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Button className="h-20 text-2xl font-bold bg-green-600 col-span-1" onClick={() => handleBallPlayed({ runs: 4 })}>4</Button>
                        <Button className="h-20 text-2xl font-bold bg-blue-600 col-span-1" onClick={() => handleBallPlayed({ runs: 6 })}>6</Button>
                        <Button className="h-20 text-xl font-bold bg-red-600" onClick={() => setIsWicketModalOpen(true)}>OUT</Button>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                         <Button className="h-14 text-lg font-bold bg-orange-600" onClick={() => handleBallPlayed({ extras: 1, extra_type: 'wide' })}>WD</Button>
                         <Button className="h-14 text-lg font-bold bg-purple-600" onClick={() => handleBallPlayed({ extras: 1, extra_type: 'noball' })}>NB</Button>
                    </div>
                     <Button className="w-full h-14 bg-slate-800" onClick={() => setIsExtraModalOpen(true)}>
                        <MoreHorizontal /> More Extras
                    </Button>
                </div>
            </main>

             <Dialog open={isPlayerSelectOpen} onOpenChange={setIsPlayerSelectOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader><DialogTitle>Select Players</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5"><Label>Batting Team</Label><Select onValueChange={setBattingTeamId} value={battingTeamId!}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={match.team_a_id}>{match.TeamA.team_name}</SelectItem><SelectItem value={match.team_b_id}>{match.TeamB.team_name}</SelectItem></SelectContent></Select></div>
                        <div className="space-y-1.5"><Label>Striker</Label><Select onValueChange={setStrikerId} value={strikerId!}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent>{battingTeamRoster.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-1.5"><Label>Non-Striker</Label><Select onValueChange={setNonStrikerId} value={nonStrikerId!}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent>{battingTeamRoster.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-1.5"><Label>Bowler</Label><Select onValueChange={setBowlerId} value={bowlerId!}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent>{bowlingTeamRoster.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <DialogFooter><DialogClose asChild><Button className="bg-blue-600">Done</Button></DialogClose></DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isEndMatchDialogOpen} onOpenChange={setIsEndMatchDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white"><DialogHeader><DialogTitle>End Match</DialogTitle></DialogHeader>
                    <div className="py-4"><RadioGroup onValueChange={setWinnerId} className="space-y-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value={match.team_a_id} id={`team-a-${match.id}`} /><Label htmlFor={`team-a-${match.id}`}>{match.TeamA.team_name}</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value={match.team_b_id} id={`team-b-${match.id}`} /><Label htmlFor={`team-b-${match.id}`}>{match.TeamB.team_name}</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="draw" id={`draw-${match.id}`} /><Label htmlFor={`draw-${match.id}`}>Match Draw</Label></div>
                    </RadioGroup></div>
                    <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={handleEndMatch} className="bg-red-600" disabled={!winnerId}>Confirm & End</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Dialog open={isExtraModalOpen} onOpenChange={setIsExtraModalOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white"><DialogHeader><DialogTitle>Log Extra</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <RadioGroup value={extraType} onValueChange={setExtraType} className="flex gap-4">
                            {extraTypes.map(type => (<div key={type} className="flex items-center space-x-2"><RadioGroupItem value={type} id={`extra-${type}`} /><Label htmlFor={`extra-${type}`} className="capitalize">{type}</Label></div>))}
                        </RadioGroup>
                        <div className="space-y-2"><Label htmlFor="extra-runs">Runs from extra</Label><Input id="extra-runs" type="number" min={0} value={extraRuns} onChange={e => setExtraRuns(parseInt(e.target.value) || 0)} className="bg-slate-800 border-slate-700"/></div>
                    </div>
                    <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={() => handleBallPlayed({ extras: extraRuns, extra_type: extraType })} className="bg-blue-600">Log Extra</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isWicketModalOpen} onOpenChange={setIsWicketModalOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white"><DialogHeader><DialogTitle>Log Wicket</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2"><Label>Wicket Type</Label><Select value={wicketType} onValueChange={setWicketType}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent>{wicketTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent></Select></div>
                         <div className="space-y-2"><Label>Player Out</Label><Select value={playerOutId ?? undefined} onValueChange={setPlayerOutId}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue/></SelectTrigger><SelectContent>{battingTeamRoster.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>
                        {(wicketType === 'caught' || wicketType === 'runout' || wicketType === 'stumped') && (<div className="space-y-2"><Label>Fielder</Label><Select value={fielderId ?? undefined} onValueChange={setFielderId}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue/></SelectTrigger><SelectContent>{bowlingTeamRoster.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>)}
                         <div className="space-y-2"><Label htmlFor="wicket-runs">Runs on this ball</Label><Input id="wicket-runs" type="number" min={0} value={runsOnWicket} onChange={e => setRunsOnWicket(parseInt(e.target.value) || 0)} className="bg-slate-800 border-slate-700"/></div>
                    </div>
                    <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={handleWicketSubmit} className="bg-red-600">Log Wicket</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
