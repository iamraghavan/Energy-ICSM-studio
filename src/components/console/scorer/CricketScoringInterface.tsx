
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getScorerTeamDetails, type ApiMatch, type FullSportsHeadTeam, type StudentTeamMember } from "@/lib/api";
import { ArrowLeft, RotateCcw, User, MoreHorizontal, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMatchSocket } from '@/hooks/useMatchSocket';
import { EndMatchDialog } from './EndMatchDialog';

const API_BASE_URL = 'https://energy-sports-meet-backend.onrender.com/api/v1';

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

export function CricketScoringInterface({ match: initialMatch, onBack }: { match: ApiMatch, onBack: () => void }) {
    const { score: liveScore, matchState, isConnected, submitAction, events: liveEvents } = useMatchSocket(initialMatch.id, initialMatch);
    
    const [score, setScore] = useState(initialMatch.score_details || {});
    const [activePlayers, setActivePlayers] = useState(initialMatch.match_state || {});
    const [events, setEvents] = useState<any[]>(initialMatch.match_events || []);
    const [teamARoster, setTeamARoster] = useState<StudentTeamMember[]>([]);
    const [teamBRoster, setTeamBRoster] = useState<StudentTeamMember[]>([]);
    const [rostersLoading, setRostersLoading] = useState(true);

    const [isPlayerSelectOpen, setIsPlayerSelectOpen] = useState(false);
    const [modalBattingTeamId, setModalBattingTeamId] = useState<string | null>(activePlayers?.batting_team_id || initialMatch.team_a_id);
    const [modalStrikerId, setModalStrikerId] = useState<string | null>(null);
    const [modalNonStrikerId, setModalNonStrikerId] = useState<string | null>(null);
    const [modalBowlerId, setModalBowlerId] = useState<string | null>(null);
    
    const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
    const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
    const [isEndMatchDialogOpen, setIsEndMatchDialogOpen] = useState(false);

    const { toast } = useToast();
    
    useEffect(() => { if (liveScore) setScore(liveScore); }, [liveScore]);
    useEffect(() => { if (matchState) setActivePlayers(matchState); }, [matchState]);
    useEffect(() => { if (liveEvents) setEvents(liveEvents); }, [liveEvents]);
    
    useEffect(() => {
        const fetchRosterData = async () => {
            setRostersLoading(true);
            try {
                const [teamAData, teamBData] = await Promise.all([
                    getScorerTeamDetails(initialMatch.team_a_id),
                    getScorerTeamDetails(initialMatch.team_b_id),
                ]);
                setTeamARoster(teamAData.members || []);
                setTeamBRoster(teamBData.members || []);
                const currentState = initialMatch.match_state || {};
                setActivePlayers(currentState);
                setModalBattingTeamId(currentState?.batting_team_id || initialMatch.team_a_id);
                setModalStrikerId(currentState?.striker_id);
                setModalNonStrikerId(currentState?.non_striker_id);
                setModalBowlerId(currentState?.bowler_id);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch team rosters.' });
            } finally {
                setRostersLoading(false);
            }
        };
        fetchRosterData();
    }, [initialMatch.team_a_id, initialMatch.team_b_id, initialMatch.id, initialMatch.match_state, toast]);
    
    const { batting_team_id, striker_id, non_striker_id, bowler_id } = activePlayers;
    const battingTeam = useMemo(() => batting_team_id === initialMatch.team_a_id ? initialMatch.TeamA : initialMatch.TeamB, [batting_team_id, initialMatch]);
    const bowlingTeam = useMemo(() => batting_team_id === initialMatch.team_a_id ? initialMatch.TeamB : initialMatch.TeamA, [batting_team_id, initialMatch]);
    const battingTeamRoster = useMemo(() => batting_team_id === initialMatch.team_a_id ? teamARoster : teamBRoster, [batting_team_id, teamARoster, teamBRoster]);
    const bowlingTeamRoster = useMemo(() => batting_team_id === initialMatch.team_a_id ? teamBRoster : teamARoster, [batting_team_id, teamARoster, teamBRoster]);

    const handleBallPlayed = async (ballData: any) => {
        if (!striker_id || !non_striker_id || !bowler_id) {
            toast({ variant: "destructive", title: "Selection Missing", description: `Please select players.` });
            setIsPlayerSelectOpen(true);
            return;
        }
        try {
            await submitAction("submit_cricket_ball", { ...ballData, striker_id, bowler_id, batting_team_id });
            toast({ title: "Ball Logged!" });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: String(error) });
        }
    };

    const handleSaveSelection = async (battingId = modalBattingTeamId, striker = modalStrikerId, nonStriker = modalNonStrikerId, bowler = modalBowlerId) => {
        try {
            await axios.post(`${API_BASE_URL}/scorer/matches/${initialMatch.id}/state`, {
                striker_id: striker,
                non_striker_id: nonStriker,
                bowler_id: bowler,
                batting_team_id: battingId,
            });
            toast({ title: 'Players selection saved!' });
            setIsPlayerSelectOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save player selection.' });
        }
    }
    
    const handleUndo = async () => {
        try {
            await submitAction('undo_event', {});
            toast({title: 'Last Action Undone'});
        } catch (error) {
            toast({variant: 'destructive', title: 'Undo Failed', description: String(error)});
        }
    }

    if (rostersLoading) return <div className="h-screen w-full flex items-center justify-center bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-white"/></div>

    const teamScore = score[batting_team_id!] || { runs: 0, wickets: 0, overs: 0.0 };
    const strikerPlayer = battingTeamRoster.find(p => p.student_id === striker_id);
    const nonStrikerPlayer = battingTeamRoster.find(p => p.student_id === non_striker_id);
    const currentBowler = bowlingTeamRoster.find(p => p.student_id === bowler_id);

    return (
        <div className="bg-slate-950 text-white min-h-screen">
            <header className="p-4 flex items-center justify-between border-b border-slate-800">
                <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft /></Button>
                <h1 className="font-bold">Cricket Console</h1>
                <Button variant="ghost" onClick={() => setIsEndMatchDialogOpen(true)}>End Match</Button>
            </header>

            <main className="p-4 space-y-4 max-w-2xl mx-auto">
                <Card className="bg-slate-900 border-slate-800 text-white text-center p-4">
                    <div className="flex justify-between items-center text-sm">
                        <p className="font-bold text-blue-400">{battingTeam.team_name}</p>
                        <p className="font-semibold">{bowlingTeam.team_name}</p>
                    </div>
                    <div className="my-4">
                        <p className="text-6xl font-black">{teamScore.runs}<span className="text-4xl font-bold text-slate-400">/{teamScore.wickets}</span></p>
                        <Badge variant="secondary" className="bg-slate-800 text-slate-300 font-mono">{(teamScore.overs || 0).toFixed(1)} Overs</Badge>
                    </div>
                </Card>

                <div className="grid grid-cols-2 gap-2">
                    <BatsmanCard player={strikerPlayer!} stats={{runs: 0, balls: 0}} onStrike={true} />
                    <BatsmanCard player={nonStrikerPlayer!} stats={{runs: 0, balls: 0}} onStrike={false} />
                </div>
                <BowlerCard player={currentBowler} stats={{wickets: 0, runs: 0, overs: '0.0'}} />

                <div className="space-y-2 pt-4">
                    <div className="grid grid-cols-4 gap-2">
                        {[0,1,2,3].map(runs => <Button key={runs} className="h-16 text-xl font-bold bg-slate-800" onClick={() => handleBallPlayed({ runs })}>{runs}</Button>)}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Button className="h-16 text-xl font-bold bg-green-600" onClick={() => handleBallPlayed({ runs: 4 })}>4</Button>
                        <Button className="h-16 text-xl font-bold bg-blue-600" onClick={() => handleBallPlayed({ runs: 6 })}>6</Button>
                        <Button className="h-16 text-xl font-bold bg-red-600" onClick={() => setIsWicketModalOpen(true)}>OUT</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                         <Button className="h-14 bg-slate-800" onClick={() => setIsPlayerSelectOpen(true)}>Players</Button>
                         <Button className="h-14 bg-slate-800" onClick={handleUndo}>Undo</Button>
                         <Button className="h-14 bg-slate-800" onClick={() => handleSaveSelection(batting_team_id, non_striker_id, striker_id, bowler_id)}>Rotate</Button>
                    </div>
                </div>
            </main>

            <Dialog open={isPlayerSelectOpen} onOpenChange={setIsPlayerSelectOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader><DialogTitle>Change Active Players</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5"><Label>Striker</Label><Select onValueChange={setModalStrikerId} value={modalStrikerId ?? undefined}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent>{battingTeamRoster.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-1.5"><Label>Non-Striker</Label><Select onValueChange={setModalNonStrikerId} value={modalNonStrikerId ?? undefined}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent>{battingTeamRoster.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-1.5"><Label>Bowler</Label><Select onValueChange={setModalBowlerId} value={modalBowlerId ?? undefined}><SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger><SelectContent>{bowlingTeamRoster.map(p => <SelectItem key={p.student_id} value={p.student_id}>{p.Student?.name || p.name}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <DialogFooter><Button onClick={() => handleSaveSelection()} className="bg-blue-600">Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <EndMatchDialog isOpen={isEndMatchDialogOpen} onClose={() => setIsEndMatchDialogOpen(false)} match={initialMatch} onEndMatch={onBack} />
        </div>
    )
}
