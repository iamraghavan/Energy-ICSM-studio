
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
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
import { useMatchSocket } from '@/hooks/useMatchSocket';

const API_BASE_URL = 'https://energy-sports-meet-backend.onrender.com/api/v1';

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


export function CricketScoringInterface({ match: initialMatch, onBack }: { match: ApiMatch, onBack: () => void }) {
    const { score: liveScore, matchState, isConnected, submitAction } = useMatchSocket(initialMatch.id);
    
    const [score, setScore] = useState(initialMatch.score_details || {});
    const [activePlayers, setActivePlayers] = useState(initialMatch.match_state || {});
    const [events, setEvents] = useState<any[]>([]);

    const [teamARoster, setTeamARoster] = useState<StudentTeamMember[]>([]);
    const [teamBRoster, setTeamBRoster] = useState<StudentTeamMember[]>([]);
    const [rostersLoading, setRostersLoading] = useState(true);

    // State for the player selection modal
    const [isPlayerSelectOpen, setIsPlayerSelectOpen] = useState(false);
    const [modalBattingTeamId, setModalBattingTeamId] = useState<string | null>(activePlayers?.batting_team_id || initialMatch.team_a_id);
    const [modalStrikerId, setModalStrikerId] = useState<string | null>(null);
    const [modalNonStrikerId, setModalNonStrikerId] = useState<string | null>(null);
    const [modalBowlerId, setModalBowlerId] = useState<string | null>(null);
    
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
        if (liveScore) setScore(liveScore);
    }, [liveScore]);

    useEffect(() => {
        if (matchState) setActivePlayers(matchState);
    }, [matchState]);
    
     useEffect(() => {
        const fetchRosterData = async () => {
            setRostersLoading(true);
            try {
                const [teamAData, teamBData, matchEvents] = await Promise.all([
                    getScorerTeamDetails(initialMatch.team_a_id),
                    getScorerTeamDetails(initialMatch.team_b_id),
                    axios.get(`${API_BASE_URL}/scorer/matches/${initialMatch.id}/events`).then(res => res.data)
                ]);
                setTeamARoster(teamAData.members || []);
                setTeamBRoster(teamBData.members || []);
                setEvents(matchEvents || []);
                
                const currentState = initialMatch.match_state || {};
                setActivePlayers(currentState);
                setModalBattingTeamId(currentState?.batting_team_id || initialMatch.team_a_id);
                setModalStrikerId(currentState?.striker_id);
                setModalNonStrikerId(currentState?.non_striker_id);
                setModalBowlerId(currentState?.bowler_id);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch team rosters or events.' });
            } finally {
                setRostersLoading(false);
            }
        };
        fetchRosterData();
    }, [initialMatch.team_a_id, initialMatch.team_b_id, initialMatch.id, initialMatch.match_state, toast]);
    
    const { batting_team_id, striker_id, non_striker_id, bowler_id } = activePlayers;

    const bowlingTeamId = useMemo(() => batting_team_id === initialMatch.team_a_id ? initialMatch.team_b_id : initialMatch.team_a_id, [batting_team_id, initialMatch]);
    const battingTeam = useMemo(() => batting_team_id === initialMatch.team_a_id ? initialMatch.TeamA : initialMatch.TeamB, [batting_team_id, initialMatch]);
    const bowlingTeam = useMemo(() => bowlingTeamId === initialMatch.team_a_id ? initialMatch.TeamA : initialMatch.TeamB, [bowlingTeamId, initialMatch]);
    const battingTeamRoster = useMemo(() => batting_team_id === initialMatch.team_a_id ? teamARoster : teamBRoster, [batting_team_id, teamARoster, teamBRoster, initialMatch.team_a_id]);
    const bowlingTeamRoster = useMemo(() => bowlingTeamId === initialMatch.team_a_id ? teamBRoster : teamARoster, [bowlingTeamId, teamARoster, teamBRoster, initialMatch.team_a_id]);

    useEffect(() => {
        if(wicketType === 'bowled' || wicketType === 'lbw' || wicketType === 'stumped' || wicketType === 'hit_wicket') setPlayerOutId(striker_id);
        else setPlayerOutId(null);
    }, [wicketType, striker_id]);


    const handleBallPlayed = useCallback(async (ballData: any) => {
        if (!striker_id || !non_striker_id || !bowler_id) {
            toast({ variant: "destructive", title: "Selection Missing", description: `Please select striker, non-striker, and bowler.` });
            setIsPlayerSelectOpen(true);
            return;
        }
       
        const payload = { ...ballData, striker_id, bowler_id, batting_team_id };
        try {
            await submitAction("submit_cricket_ball", payload);
            toast({ title: "Ball Logged!" });
            setIsExtraModalOpen(false);
            setIsWicketModalOpen(false);
            setExtraRuns(1); setRunsOnWicket(0);
        } catch(error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: String(error) });
        }
    }, [batting_team_id, bowler_id, submitAction, striker_id, non_striker_id, toast]);
    
    const handleWicketSubmit = () => {
        if (!wicketType || !playerOutId) return toast({ variant: 'destructive', title: 'Missing Details' });
        handleBallPlayed({ is_wicket: true, wicket_type: wicketType, player_out_id: playerOutId, fielder_id: fielderId || null, runs: runsOnWicket });
    }

    const handleSaveSelection = async () => {
        try {
            const token = localStorage.getItem('jwt_token');
            await axios.post(`${API_BASE_URL}/scorer/matches/${initialMatch.id}/state`, 
            {
                striker_id: modalStrikerId,
                non_striker_id: modalNonStrikerId,
                bowler_id: modalBowlerId,
                batting_team_id: modalBattingTeamId
            }, 
            {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: 'Players selection saved!' });
            setActivePlayers({
                 ...activePlayers,
                 striker_id: modalStrikerId,
                 non_striker_id: modalNonStrikerId,
                 bowler_id: modalBowlerId,
                 batting_team_id: modalBattingTeamId
            })
            setIsPlayerSelectOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save player selection.' });
        }
    }

    const handleEndMatch = async () => {
        if (!winnerId) return toast({ variant: 'destructive', title: 'Error', description: 'Please select a winner.' });
        const payload = { status: "completed", winner_id: winnerId === 'draw' ? null : winnerId };
        try {
            await submitAction("update_match_status", payload);
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
        const teamScore = score[batting_team_id!] || { overs: 0.0 };
        const currentOver = Math.floor(teamScore.overs || 0);
        return events.filter(e => e.batting_team_id === batting_team_id && Math.floor(e.over_number) === currentOver).sort((a,b) => a.ball_number - b.ball_number);
    }, [events, score, batting_team_id]);
    
    const teamScore = score[batting_team_id!] || { runs: 0, wickets: 0, overs: 0.0 };
    
    const striker = useMemo(() => battingTeamRoster.find(p => p.student_id === striker_id), [striker_id, battingTeamRoster]);
    const nonStriker = useMemo(() => battingTeamRoster.find(p => p.student_id === non_striker_id), [non_striker_id, battingTeamRoster]);
    const bowler = useMemo(() => bowlingTeamRoster.find(p => p.student_id === bowler_id), [bowler_id, bowlingTeamRoster]);

    const strikerStats = useMemo(() => calculatePlayerStats(striker_id), [striker_id, calculatePlayerStats]);
    const nonStrikerStats = useMemo(() => calculatePlayerStats(non_striker_id), [non_striker_id, calculatePlayerStats]);
    const bowlerStats = useMemo(() => calculateBowlerStats(bowler_id), [bowler_id, calculateBowlerStats]);

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
                        <p className="text-slate-400">{initialMatch.Sport.name}</p>
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
                        <div className="space-y-1.5"><Label>Batting Team</Label><Select onValueChange={setModalBattingTeamId} value={modalBattingTeamId!}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={initialMatch.team_a_id}>{initialMatch.TeamA.team_name}</SelectItem><SelectItem value={initialMatch.team_b_id}>{initialMatch.TeamB.team_name}</SelectItem></SelectContent></Select></div>
                        <div className="space-y-1.5"><Label>Striker</Label><Select onValueChange={setModalStrikerId} value={modalStrikerId!}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent>{(modalBattingTeamId === initialMatch.team_a_id ? teamARoster : teamBRoster).map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-1.5"><Label>Non-Striker</Label><Select onValueChange={setModalNonStrikerId} value={modalNonStrikerId!}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent>{(modalBattingTeamId === initialMatch.team_a_id ? teamARoster : teamBRoster).map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-1.5"><Label>Bowler</Label><Select onValueChange={setModalBowlerId} value={modalBowlerId!}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent>{(modalBattingTeamId === initialMatch.team_a_id ? teamBRoster : teamARoster).map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <DialogFooter><Button onClick={handleSaveSelection} className="bg-blue-600">Save Selection</Button></DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isEndMatchDialogOpen} onOpenChange={setIsEndMatchDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white"><DialogHeader><DialogTitle>End Match</DialogTitle></DialogHeader>
                    <div className="py-4"><RadioGroup onValueChange={setWinnerId} className="space-y-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value={initialMatch.team_a_id} id={`team-a-${initialMatch.id}`} /><Label htmlFor={`team-a-${initialMatch.id}`}>{initialMatch.TeamA.team_name}</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value={initialMatch.team_b_id} id={`team-b-${initialMatch.id}`} /><Label htmlFor={`team-b-${initialMatch.id}`}>{initialMatch.TeamB.team_name}</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="draw" id={`draw-${initialMatch.id}`} /><Label htmlFor={`draw-${initialMatch.id}`}>Match Draw</Label></div>
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
                    <DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={() => handleBallPlayed({ extras: extraRuns, extra_type: extraType, runs: extraRuns })} className="bg-blue-600">Log Extra</Button></DialogFooter>
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
