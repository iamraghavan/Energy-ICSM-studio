
'use client';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getScorerTeamDetails, updateMatchState, type ApiMatch, type StudentTeamMember } from "@/lib/api";
import { ArrowLeft, User, Loader2, RotateCw, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMatchSocket } from '@/hooks/useMatchSocket';
import { EndMatchDialog } from './EndMatchDialog';

const BatsmanCard = ({ player, onStrike, stats }: { player: StudentTeamMember | undefined, onStrike: boolean, stats: any }) => {
    const name = player?.name || player?.Student?.name || 'Waiting...';
    return (
        <Card className={cn("border-slate-700 text-white p-4 transition-all duration-300", onStrike ? 'bg-blue-600 ring-4 ring-blue-400 shadow-2xl scale-105 z-10' : 'bg-slate-800 opacity-80')}>
            <h4 className="font-black text-[10px] uppercase tracking-tighter truncate mb-2">{name}{onStrike && ' *'}</h4>
            <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black font-mono">{stats?.runs || 0}</p>
                <p className="text-white/60 text-[10px] font-bold uppercase">({stats?.balls || 0})</p>
            </div>
        </Card>
    )
}

const BowlerCard = ({ player, stats }: { player: StudentTeamMember | undefined, stats: any }) => {
    const name = player?.name || player?.Student?.name || 'Select Bowler';
    return (
        <Card className="bg-slate-900 border-slate-700 text-white p-4 mt-2">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center"><User className="w-4 h-4 text-blue-400"/></div>
                    <div>
                        <p className="font-black text-[10px] uppercase tracking-tight">{name}</p>
                        <p className="text-[8px] text-slate-500 uppercase font-bold">Current Bowler</p>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="text-xl font-black font-mono tracking-tighter">{stats?.wickets || 0}/{stats?.runs || 0}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{(stats?.overs || 0.0).toFixed(1)} Ov</p>
                 </div>
            </div>
        </Card>
    )
}

export function CricketScoringInterface({ match: initialMatch, onBack }: { match: ApiMatch, onBack: () => void }) {
    const { score: liveScore, matchState, isConnected, submitAction } = useMatchSocket(initialMatch.id, initialMatch);
    
    const [teamARoster, setTeamARoster] = useState<StudentTeamMember[]>([]);
    const [teamBRoster, setTeamBRoster] = useState<StudentTeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingState, setIsUpdatingState] = useState(false);

    const [isPlayerSelectOpen, setIsPlayerSelectOpen] = useState(false);
    const [isEndMatchDialogOpen, setIsEndMatchDialogOpen] = useState(false);

    const [modalStrikerId, setModalStrikerId] = useState<string | null>(null);
    const [modalNonStrikerId, setModalNonStrikerId] = useState<string | null>(null);
    const [modalBowlerId, setModalBowlerId] = useState<string | null>(null);

    const { toast } = useToast();
    
    const score = liveScore || initialMatch.score_details || {};
    const state = matchState || initialMatch.match_state || {};
    
    const battingTeamId = String(state.batting_team_id || initialMatch.team_a_id);
    const bowlingTeamId = battingTeamId === String(initialMatch.team_a_id) ? String(initialMatch.team_b_id) : String(initialMatch.team_a_id);

    useEffect(() => {
        const fetchRosters = async () => {
            setIsLoading(true);
            try {
                const [teamA, teamB] = await Promise.all([
                    getScorerTeamDetails(initialMatch.team_a_id),
                    getScorerTeamDetails(initialMatch.team_b_id),
                ]);
                setTeamARoster(teamA.members || []);
                setTeamBRoster(teamB.members || []);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch team rosters.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchRosters();
    }, [initialMatch.team_a_id, initialMatch.team_b_id, toast]);

    useEffect(() => {
        if (isPlayerSelectOpen) {
            setModalStrikerId(state.striker_id ? String(state.striker_id) : null);
            setModalNonStrikerId(state.non_striker_id ? String(state.non_striker_id) : null);
            setModalBowlerId(state.bowler_id ? String(state.bowler_id) : null);
        }
    }, [isPlayerSelectOpen, state.striker_id, state.non_striker_id, state.bowler_id]);

    const battingRoster = battingTeamId === String(initialMatch.team_a_id) ? teamARoster : teamBRoster;
    const bowlingRoster = bowlingTeamId === String(initialMatch.team_a_id) ? teamARoster : teamBRoster;

    const striker = battingRoster.find(p => String(p.student_id || p.id) === String(state.striker_id));
    const nonStriker = battingRoster.find(p => String(p.student_id || p.id) === String(state.non_striker_id));
    const bowler = bowlingRoster.find(p => String(p.student_id || p.id) === String(state.bowler_id));

    const strikerStats = state.batsmen_stats?.[state.striker_id] || { runs: 0, balls: 0 };
    const nonStrikerStats = state.batsmen_stats?.[state.non_striker_id] || { runs: 0, balls: 0 };
    const bowlerStats = state.bowlers_stats?.[state.bowler_id] || { runs: 0, wickets: 0, overs: 0 };

    const handleSavePlayers = async () => {
        if (!modalStrikerId || !modalNonStrikerId || !modalBowlerId) {
            toast({ variant: 'destructive', title: 'Selection Missing', description: 'Please select all players.' });
            return;
        }
        setIsUpdatingState(true);
        try {
            await updateMatchState(initialMatch.id, {
                striker_id: modalStrikerId,
                non_striker_id: modalNonStrikerId,
                bowler_id: modalBowlerId,
                batting_team_id: battingTeamId,
                current_innings: state.current_innings || 1
            });
            toast({ title: 'Lineup Updated' });
            setIsPlayerSelectOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.response?.data?.message || 'Could not update lineup.' });
        } finally {
            setIsUpdatingState(false);
        }
    };

    const handleRotateStriker = async () => {
        if (!state.striker_id || !state.non_striker_id) {
            toast({ variant: 'destructive', title: 'Rotation Error', description: 'Players must be selected first.' });
            return;
        }
        setIsUpdatingState(true);
        try {
            await updateMatchState(initialMatch.id, {
                striker_id: state.non_striker_id,
                non_striker_id: state.striker_id,
                bowler_id: state.bowler_id,
                batting_team_id: battingTeamId,
                current_innings: state.current_innings || 1
            });
            toast({ title: 'Strikers Swapped' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Rotation Failed' });
        } finally {
            setIsUpdatingState(false);
        }
    };

    const handleBall = async (runs: number, isWicket: boolean = false) => {
        if (!state.striker_id || !state.bowler_id) {
            toast({ variant: 'destructive', title: 'Lineup Required', description: 'Please set the striker and bowler first.' });
            setIsPlayerSelectOpen(true);
            return;
        }
        try {
            await submitAction('submit_cricket_ball', {
                runs,
                is_wicket: isWicket,
                wicket_type: isWicket ? 'bowled' : null,
                extras: 0,
                extra_type: null,
                striker_id: state.striker_id,
                non_striker_id: state.non_striker_id,
                bowler_id: state.bowler_id,
                batting_team_id: battingTeamId
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: String(error) });
        }
    };

    const handleUndo = async () => {
        try {
            await submitAction('undo_event', {});
            toast({ title: 'Action Undone' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Undo Failed' });
        }
    };

    if (isLoading) return <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4"><Loader2 className="animate-spin h-12 w-12 text-blue-500" /><p className="font-black uppercase tracking-widest text-xs">Initializing Scorer Console</p></div>

    const teamScore = score[battingTeamId] || { runs: 0, wickets: 0, overs: 0 };

    return (
        <div className="bg-slate-950 text-white min-h-screen flex flex-col">
            <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 sticky top-0 z-50">
                <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5"/></Button>
                <div className="text-center">
                    <h1 className="font-black text-[10px] tracking-[0.2em] uppercase text-blue-400">Cricket Scorer Pro</h1>
                    <div className="flex items-center gap-1.5 justify-center mt-0.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{isConnected ? 'Live Sync' : 'Offline Mode'}</span>
                    </div>
                </div>
                <Button variant="destructive" size="sm" className="font-black uppercase text-[10px]" onClick={() => setIsEndMatchDialogOpen(true)}>End</Button>
            </header>

            <main className="p-4 space-y-4 max-w-md mx-auto w-full flex-1">
                <Card className="bg-slate-900 border-slate-800 text-white p-6 shadow-2xl relative overflow-hidden group text-center">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">
                        <span className="text-blue-400 max-w-[120px] truncate">{initialMatch.TeamA.team_name}</span>
                        <span className="px-2 py-0.5 bg-slate-800 rounded-full text-[8px]">VS</span>
                        <span className="max-w-[120px] truncate">{initialMatch.TeamB.team_name}</span>
                    </div>
                    <div>
                        <div className="flex items-baseline justify-center gap-1">
                            <p className="text-7xl font-black tracking-tighter">{teamScore.runs || 0}</p>
                            <p className="text-3xl font-black text-slate-600">/{teamScore.wickets || 0}</p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-black tracking-widest mt-4 px-4 py-1 text-xs">
                            {(teamScore.overs || 0.0).toFixed(1)} OVERS
                        </Badge>
                    </div>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                    <BatsmanCard player={striker} onStrike={true} stats={strikerStats} />
                    <BatsmanCard player={nonStriker} onStrike={false} stats={nonStrikerStats} />
                </div>
                
                <BowlerCard player={bowler} stats={bowlerStats} />

                <div className="grid grid-cols-4 gap-2 pt-4">
                    {[0, 1, 2, 3].map(r => (
                        <Button key={r} className="h-16 text-2xl font-black bg-slate-800" onClick={() => handleBall(r)}>{r}</Button>
                    ))}
                    <Button className="h-16 text-2xl font-black bg-emerald-600" onClick={() => handleBall(4)}>4</Button>
                    <Button className="h-16 text-2xl font-black bg-blue-600" onClick={() => handleBall(6)}>6</Button>
                    <Button className="h-16 text-2xl font-black bg-red-600" onClick={() => handleBall(0, true)}>W</Button>
                    <Button variant="outline" className="h-16 bg-slate-900 border-slate-700 font-black text-xs uppercase" onClick={handleUndo}><RotateCcw className="w-4 h-4 mr-2"/>Undo</Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="secondary" className="h-14 bg-slate-800 font-black uppercase text-xs tracking-widest" onClick={() => setIsPlayerSelectOpen(true)} disabled={isUpdatingState}>
                        {isUpdatingState ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Manage Lineup
                    </Button>
                    <Button variant="secondary" className="h-14 bg-slate-800 font-black uppercase text-xs tracking-widest" onClick={handleRotateStriker} disabled={isUpdatingState}>
                        {isUpdatingState ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <RotateCw className="w-4 h-4 mr-2"/>}
                        Strike Swap
                    </Button>
                </div>
            </main>

            <Dialog open={isPlayerSelectOpen} onOpenChange={setIsPlayerSelectOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-[95vw] sm:max-w-md rounded-3xl overflow-hidden p-0">
                    <DialogHeader className="p-6 bg-slate-800/50">
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter">Lineup Management</DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest">Select active strikers and current bowler</DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-blue-400 text-[10px] uppercase font-black tracking-[0.2em]">Striker (On Strike)</Label>
                                <Select onValueChange={setModalStrikerId} value={modalStrikerId || undefined}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 h-14 rounded-2xl font-bold"><SelectValue placeholder="Select Striker" /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        {battingRoster.map(p => {
                                            const pId = String(p.student_id || p.id);
                                            const pName = p.name || p.Student?.name || 'Unknown Player';
                                            return (
                                                <SelectItem key={pId} value={pId} className="font-bold uppercase text-xs">{pName}</SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">Non-Striker</Label>
                                <Select onValueChange={setModalNonStrikerId} value={modalNonStrikerId || undefined}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 h-14 rounded-2xl font-bold"><SelectValue placeholder="Select Non-Striker" /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        {battingRoster.map(p => {
                                            const pId = String(p.student_id || p.id);
                                            const pName = p.name || p.Student?.name || 'Unknown Player';
                                            return (
                                                <SelectItem key={pId} value={pId} className="font-bold uppercase text-xs">{pName}</SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-emerald-400 text-[10px] uppercase font-black tracking-[0.2em]">Current Bowler</Label>
                                <Select onValueChange={setModalBowlerId} value={modalBowlerId || undefined}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 h-14 rounded-2xl font-bold"><SelectValue placeholder="Select Bowler" /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        {bowlingRoster.map(p => {
                                            const pId = String(p.student_id || p.id);
                                            const pName = p.name || p.Student?.name || 'Unknown Player';
                                            return (
                                                <SelectItem key={pId} value={pId} className="font-bold uppercase text-xs">{pName}</SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-6">
                        <Button onClick={handleSavePlayers} disabled={isUpdatingState} className="w-full h-14 bg-blue-600 font-black uppercase">
                            {isUpdatingState ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                            Update Lineup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EndMatchDialog isOpen={isEndMatchDialogOpen} onClose={() => setIsEndMatchDialogOpen(false)} match={initialMatch} onEndMatch={onBack} />
        </div>
    )
}
