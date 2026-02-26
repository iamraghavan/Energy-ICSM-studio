
'use client';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getScorerTeamDetails, updateMatchState, submitCricketBall, undoLastBall, type ApiMatch, type StudentTeamMember } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { ArrowLeft, User, Loader2, RotateCw, RotateCcw, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EndMatchDialog } from './EndMatchDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const BatsmanCard = ({ player, onStrike, stats }: { player: any, onStrike: boolean, stats: any }) => {
    const name = player?.name || player?.Student?.name || stats?.name || 'Waiting...';
    return (
        <Card className={cn("border-slate-700 text-white p-4 transition-all duration-300", onStrike ? 'bg-blue-600 ring-4 ring-blue-400 shadow-2xl scale-105 z-10' : 'bg-slate-800 opacity-80')}>
            <h4 className="font-black text-[10px] uppercase tracking-tighter truncate mb-2">{name}{onStrike && ' *'}</h4>
            <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black font-mono">{stats?.runs ?? 0}</p>
                <p className="text-white/60 text-[10px] font-bold uppercase">({stats?.balls ?? 0})</p>
            </div>
            <p className="text-[8px] text-white/40 uppercase font-bold mt-1">4s: {stats?.fours ?? 0} | 6s: {stats?.sixes ?? 0}</p>
        </Card>
    )
}

const BowlerCard = ({ player, stats }: { player: any, stats: any }) => {
    const name = player?.name || player?.Student?.name || stats?.name || 'Select Bowler';
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
                    <p className="text-xl font-black font-mono tracking-tighter">{stats?.wickets ?? 0}/{stats?.runs_conceded ?? 0}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{(stats?.overs || 0.0).toFixed(1)} Ov</p>
                 </div>
            </div>
        </Card>
    )
}

export function CricketScoringInterface({ match: initialMatch, onBack }: { match: ApiMatch, onBack: () => void }) {
    // SYNC: Establish real-time connection to Firebase match node
    const { matchData, isLoading: isSyncing } = useMatchSync(initialMatch.id);
    
    const [teamARoster, setTeamARoster] = useState<StudentTeamMember[]>([]);
    const [teamBRoster, setTeamBRoster] = useState<StudentTeamMember[]>([]);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isProcessingCommand, setIsProcessingCommand] = useState(false);

    const [isPlayerSelectOpen, setIsPlayerSelectOpen] = useState(false);
    const [isEndMatchDialogOpen, setIsEndMatchDialogOpen] = useState(false);

    const [modalStrikerId, setModalStrikerId] = useState<string | null>(null);
    const [modalNonStrikerId, setModalNonStrikerId] = useState<string | null>(null);
    const [modalBowlerId, setModalBowlerId] = useState<string | null>(null);

    const { toast } = useToast();
    
    // Priority: Use matchData (Firebase) if available, fallback to initialMatch (REST)
    const score = matchData?.score_details || initialMatch.score_details || {};
    const state = matchData?.match_state || initialMatch.match_state || {};
    const batsmenStats = matchData?.current_batsmen_stats || {};
    const bowlerStats = matchData?.current_bowler_stats || {};
    
    const battingTeamId = String(state.batting_team_id || initialMatch.team_a_id);
    const bowlingTeamId = battingTeamId === String(initialMatch.team_a_id) ? String(initialMatch.team_b_id) : String(initialMatch.team_a_id);

    useEffect(() => {
        const fetchRosters = async () => {
            setIsLoadingInitial(true);
            try {
                const [teamA, teamB] = await Promise.all([
                    getScorerTeamDetails(initialMatch.team_a_id),
                    getScorerTeamDetails(initialMatch.team_b_id),
                ]);
                // Handling potentially nested structure from common API
                const rosterA = Array.isArray(teamA) ? teamA : (teamA.members || teamA.Members || []);
                const rosterB = Array.isArray(teamB) ? teamB : (teamB.members || teamB.Members || []);
                setTeamARoster(rosterA);
                setTeamBRoster(rosterB);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch team rosters.' });
            } finally {
                setIsLoadingInitial(false);
            }
        };
        fetchRosters();
    }, [initialMatch.team_a_id, initialMatch.team_b_id, toast]);

    // Update modal selections when state changes or modal opens
    useEffect(() => {
        if (isPlayerSelectOpen) {
            setModalStrikerId(state.striker_id ? String(state.striker_id) : null);
            setModalNonStrikerId(state.non_striker_id ? String(state.non_striker_id) : null);
            setModalBowlerId(state.bowler_id ? String(state.bowler_id) : null);
        }
    }, [isPlayerSelectOpen, state.striker_id, state.non_striker_id, state.bowler_id]);

    const battingRoster = battingTeamId === String(initialMatch.team_a_id) ? teamARoster : teamBRoster;
    const bowlingRoster = bowlingTeamId === String(initialMatch.team_a_id) ? teamARoster : teamBRoster;

    // Get current players based on the synced IDs
    const striker = battingRoster.find(p => String(p.student_id || p.id) === String(state.striker_id));
    const nonStriker = battingRoster.find(p => String(p.student_id || p.id) === String(state.non_striker_id));
    const currentBowler = bowlingRoster.find(p => String(p.student_id || p.id) === String(state.bowler_id));

    // Get current stats for players from the synced stats node
    const currentStrikerStats = batsmenStats[String(state.striker_id)] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
    const currentNonStrikerStats = batsmenStats[String(state.non_striker_id)] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
    const currentBowlerStats = bowlerStats[String(state.bowler_id)] || { runs_conceded: 0, wickets: 0, overs: 0 };

    const handleSavePlayers = async () => {
        if (!modalStrikerId || !modalNonStrikerId || !modalBowlerId) {
            toast({ variant: 'destructive', title: 'Selection Missing', description: 'Please select all players.' });
            return;
        }
        setIsProcessingCommand(true);
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
            toast({ variant: 'destructive', title: 'Update Failed', description: error.response?.data?.message || 'Server error.' });
        } finally {
            setIsProcessingCommand(false);
        }
    };

    const handleRotateStriker = async () => {
        if (!state.striker_id || !state.non_striker_id) {
            toast({ variant: 'destructive', title: 'Rotation Error', description: 'Players must be selected first.' });
            return;
        }
        setIsProcessingCommand(true);
        try {
            // Commands: Striker -> Non-striker and vice versa
            await updateMatchState(initialMatch.id, {
                striker_id: String(state.non_striker_id),
                non_striker_id: String(state.striker_id),
                bowler_id: state.bowler_id,
                batting_team_id: battingTeamId,
                current_innings: state.current_innings || 1
            });
            toast({ title: 'Strikers Swapped' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Rotation Failed', description: error.response?.data?.message || 'Check connection.' });
        } finally {
            setIsProcessingCommand(false);
        }
    };

    const handleBall = async (runs: number, isWicket: boolean = false, extraType: string | null = null) => {
        if (!state.striker_id || !state.bowler_id) {
            toast({ variant: 'destructive', title: 'Lineup Required', description: 'Please set the striker and bowler first.' });
            setIsPlayerSelectOpen(true);
            return;
        }
        setIsProcessingCommand(true);
        try {
            const extras = extraType ? 1 : 0;
            await submitCricketBall(initialMatch.id, {
                runs: (extraType === 'wide' || extraType === 'no_ball') ? 0 : runs, // Runs are usually extra + run for NB, but wide is just extra
                is_wicket: isWicket,
                wicket_type: isWicket ? 'bowled' : null,
                extras: extras,
                extra_type: extraType,
                striker_id: String(state.striker_id),
                non_striker_id: String(state.non_striker_id),
                bowler_id: String(state.bowler_id),
                batting_team_id: battingTeamId
            });
            // We do NOT update state here. We wait for Firebase to push the update to us.
        } catch (error) {
            toast({ variant: 'destructive', title: 'Scoring Error', description: 'Could not record ball.' });
        } finally {
            setIsProcessingCommand(false);
        }
    };

    const handleUndo = async () => {
        setIsProcessingCommand(true);
        try {
            await undoLastBall(initialMatch.id);
            toast({ title: 'Ball Undone' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Undo Failed' });
        } finally {
            setIsProcessingCommand(false);
        }
    };

    if (isLoadingInitial) return <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4"><Loader2 className="animate-spin h-12 w-12 text-blue-500" /><p className="font-black uppercase tracking-widest text-xs">Loading Console...</p></div>

    const teamScore = score[battingTeamId] || { runs: 0, wickets: 0, overs: 0 };
    const currentOvers = teamScore.overs || 0.0;
    // Check if over ended (balls are 6)
    const isOverEnd = currentOvers > 0 && Math.round((currentOvers % 1) * 10) === 0;

    return (
        <div className="bg-slate-950 text-white min-h-screen flex flex-col">
            <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 sticky top-0 z-50">
                <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5"/></Button>
                <div className="text-center">
                    <h1 className="font-black text-[10px] tracking-[0.2em] uppercase text-blue-400">Cricket Scorer Pro</h1>
                    <div className="flex items-center gap-1.5 justify-center mt-0.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", isSyncing ? "bg-amber-500 animate-pulse" : "bg-green-500")} />
                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{isSyncing ? 'Syncing...' : 'Real-time'}</span>
                    </div>
                </div>
                <Button variant="destructive" size="sm" className="font-black uppercase text-[10px]" onClick={() => setIsEndMatchDialogOpen(true)}>End</Button>
            </header>

            <main className="p-4 space-y-4 max-w-md mx-auto w-full flex-1 pb-24">
                <Card className="bg-slate-900 border-slate-800 text-white p-6 shadow-2xl relative overflow-hidden group text-center">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">
                        <span className="text-blue-400 max-w-[120px] truncate">{initialMatch.TeamA.team_name}</span>
                        <span className="px-2 py-0.5 bg-slate-800 rounded-full text-[8px]">VS</span>
                        <span className="max-w-[120px] truncate">{initialMatch.TeamB.team_name}</span>
                    </div>
                    <div>
                        <div className="flex items-baseline justify-center gap-1">
                            <p className="text-7xl font-black tracking-tighter">{teamScore.runs ?? 0}</p>
                            <p className="text-3xl font-black text-slate-600">/{teamScore.wickets ?? 0}</p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-black tracking-widest mt-4 px-4 py-1 text-xs">
                            {(teamScore.overs ?? 0).toFixed(1)} OVERS
                        </Badge>
                    </div>
                </Card>

                {isOverEnd && (
                    <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-500">
                        <Info className="h-4 w-4 stroke-amber-500" />
                        <AlertTitle className="font-black uppercase text-[10px] tracking-widest">Over Completed</AlertTitle>
                        <AlertDescription className="text-xs font-bold">Please change the bowler and swap striker positions if necessary.</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <BatsmanCard player={striker} onStrike={true} stats={currentStrikerStats} />
                    <BatsmanCard player={nonStriker} onStrike={false} stats={currentNonStrikerStats} />
                </div>
                
                <BowlerCard player={currentBowler} stats={currentBowlerStats} />

                <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map(r => (
                            <Button key={r} className="h-14 text-2xl font-black bg-slate-800 hover:bg-slate-700" disabled={isProcessingCommand} onClick={() => handleBall(r)}>{r}</Button>
                        ))}
                        <Button className="h-14 text-2xl font-black bg-emerald-600 hover:bg-emerald-700" disabled={isProcessingCommand} onClick={() => handleBall(4)}>4</Button>
                        <Button className="h-14 text-2xl font-black bg-blue-600 hover:bg-blue-700" disabled={isProcessingCommand} onClick={() => handleBall(6)}>6</Button>
                        <Button className="h-14 text-2xl font-black bg-red-600 hover:bg-red-700" disabled={isProcessingCommand} onClick={() => handleBall(0, true)}>W</Button>
                        <Button variant="outline" className="h-14 bg-slate-900 border-slate-700 font-black text-xs uppercase" disabled={isProcessingCommand} onClick={handleUndo}><RotateCcw className="w-4 h-4 mr-2"/>Undo</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" className="h-12 bg-amber-600 hover:bg-amber-700 font-black uppercase text-xs tracking-widest" disabled={isProcessingCommand} onClick={() => handleBall(0, false, 'wide')}>WD (Wide)</Button>
                        <Button variant="secondary" className="h-12 bg-amber-600 hover:bg-amber-700 font-black uppercase text-xs tracking-widest" disabled={isProcessingCommand} onClick={() => handleBall(0, false, 'no_ball')}>NB (No Ball)</Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="secondary" className="h-14 bg-slate-800 font-black uppercase text-xs tracking-widest hover:bg-slate-700" onClick={() => setIsPlayerSelectOpen(true)} disabled={isProcessingCommand}>
                        {isProcessingCommand ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Change Bowler
                    </Button>
                    <Button variant="secondary" className="h-14 bg-slate-800 font-black uppercase text-xs tracking-widest hover:bg-slate-700" onClick={handleRotateStriker} disabled={isProcessingCommand}>
                        {isProcessingCommand ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <RotateCw className="w-4 h-4 mr-2"/>}
                        Strike Swap
                    </Button>
                </div>
            </main>

            <Dialog open={isPlayerSelectOpen} onOpenChange={setIsPlayerSelectOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-[95vw] sm:max-w-md rounded-3xl overflow-hidden p-0 shadow-2xl">
                    <DialogHeader className="p-6 bg-slate-800/50">
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter">Lineup Management</DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest">Set striker, non-striker, and bowler</DialogDescription>
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
                        <Button onClick={handleSavePlayers} disabled={isProcessingCommand} className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-black uppercase text-lg">
                            {isProcessingCommand ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                            Update Lineup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EndMatchDialog isOpen={isEndMatchDialogOpen} onClose={() => setIsEndMatchDialogOpen(false)} match={initialMatch} onEndMatch={onBack} />
        </div>
    )
}
