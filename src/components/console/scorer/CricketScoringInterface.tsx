
'use client';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getScorerTeamDetails, updateMatchState, submitCricketBall, undoLastBall, type ApiMatch, type StudentTeamMember } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { ArrowLeft, User, Loader2, Info, Trophy, ChevronRight } from 'lucide-react';
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
        <Card className={cn(
            "border-slate-700 text-white p-4 transition-all duration-300 relative overflow-hidden", 
            onStrike ? 'bg-blue-600 ring-4 ring-blue-400 shadow-2xl scale-105 z-10' : 'bg-slate-800 opacity-80'
        )}>
            {onStrike && <div className="absolute top-0 right-0 p-1"><Trophy className="h-3 w-3 text-white/50" /></div>}
            <h4 className="font-black text-[10px] uppercase tracking-tighter truncate mb-2">
                {name}{onStrike && ' *'}
            </h4>
            <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black font-mono">{stats?.runs ?? 0}</p>
                <p className="text-white/60 text-[10px] font-bold uppercase">({stats?.balls ?? 0})</p>
            </div>
            <div className="flex gap-2 mt-1">
                <p className="text-[8px] text-white/40 uppercase font-bold">4s: {stats?.fours ?? 0}</p>
                <p className="text-[8px] text-white/40 uppercase font-bold">6s: {stats?.sixes ?? 0}</p>
            </div>
        </Card>
    )
}

const BowlerCard = ({ player, stats }: { player: any, stats: any }) => {
    const name = player?.name || player?.Student?.name || stats?.name || 'Select Bowler';
    return (
        <Card className="bg-slate-900 border-slate-700 text-white p-4">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <User className="w-5 h-5 text-emerald-400"/>
                    </div>
                    <div>
                        <p className="font-black text-[11px] uppercase tracking-tight">{name}</p>
                        <p className="text-[8px] text-emerald-500 uppercase font-black tracking-widest">Active Bowler</p>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="text-2xl font-black font-mono tracking-tighter">
                        {stats?.wickets ?? 0}/{stats?.runs_conceded ?? 0}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        {(stats?.overs || 0.0).toFixed(1)} OVERS
                    </p>
                 </div>
            </div>
        </Card>
    )
}

export function CricketScoringInterface({ match: initialMatch, onBack }: { match: ApiMatch, onBack: () => void }) {
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
    
    // Commands: Command Logic (REST) + Reactive Logic (Firebase RTDB)
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
                setTeamARoster(teamA.members || []);
                setTeamBRoster(teamB.members || []);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch team rosters.' });
            } finally {
                setIsLoadingInitial(false);
            }
        };
        fetchRosters();
    }, [initialMatch.team_a_id, initialMatch.team_b_id, toast]);

    const battingRoster = battingTeamId === String(initialMatch.team_a_id) ? teamARoster : teamBRoster;
    const bowlingRoster = bowlingTeamId === String(initialMatch.team_a_id) ? teamARoster : teamBRoster;

    const striker = battingRoster.find(p => String(p.student_id) === String(state.striker_id));
    const nonStriker = battingRoster.find(p => String(p.student_id) === String(state.non_striker_id));
    const activeBowler = bowlingRoster.find(p => String(p.student_id) === String(state.bowler_id));

    const currentStrikerStats = batsmenStats[String(state.striker_id)] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
    const currentNonStrikerStats = batsmenStats[String(state.non_striker_id)] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
    const currentBowlerStats = bowlerStats[String(state.bowler_id)] || { runs_conceded: 0, wickets: 0, overs: 0 };

    const handleSavePlayers = async () => {
        if (!modalStrikerId || !modalNonStrikerId || !modalBowlerId) {
            toast({ variant: 'destructive', title: 'Selection Missing', description: 'Please select all active players.' });
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
            toast({ title: 'Lineup Commitment Sent' });
            setIsPlayerSelectOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.response?.data?.message || 'Server error.' });
        } finally {
            setIsProcessingCommand(false);
        }
    };

    const handleBall = async (runs: number, isWicket: boolean = false, extraType: string | null = null) => {
        if (!state.striker_id || !state.bowler_id) {
            toast({ variant: 'destructive', title: 'Lineup Required', description: 'Assign players before scoring.' });
            setIsPlayerSelectOpen(true);
            return;
        }
        setIsProcessingCommand(true);
        try {
            // PAYLOAD: Standardized high-performance scoring payload
            await submitCricketBall(initialMatch.id, {
                batting_team_id: battingTeamId,
                striker_id: String(state.striker_id),
                non_striker_id: String(state.non_striker_id),
                bowler_id: String(state.bowler_id),
                runs: runs,
                extras: extraType ? 1 : 0,
                extra_type: extraType as any,
                is_wicket: isWicket,
                wicket_type: isWicket ? 'bowled' : null
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Scoring Error', description: 'Action could not be synced.' });
        } finally {
            setIsProcessingCommand(false);
        }
    };

    const handleUndo = async () => {
        setIsProcessingCommand(true);
        try {
            await undoLastBall(initialMatch.id);
            toast({ title: 'Event Undone' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Undo Failed' });
        } finally {
            setIsProcessingCommand(false);
        }
    };

    if (isLoadingInitial) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
                <p className="font-black uppercase tracking-widest text-xs">Authenticating Scorers Hub...</p>
            </div>
        )
    }

    const teamScore = score[battingTeamId] || { runs: 0, wickets: 0, overs: 0 };
    const currentOvers = teamScore.overs || 0.0;
    const isOverEnd = currentOvers > 0 && Math.round((currentOvers % 1) * 10) === 0;

    return (
        <div className="bg-slate-950 text-white min-h-screen flex flex-col font-body">
            <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
                <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5"/></Button>
                <div className="text-center">
                    <h1 className="font-black text-[10px] tracking-[0.2em] uppercase text-blue-400">Cricket Scoring Hub</h1>
                    <div className="flex items-center gap-1.5 justify-center mt-0.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", isSyncing ? "bg-amber-500 animate-pulse" : "bg-green-500")} />
                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{isSyncing ? 'Syncing RTDB' : 'State Ready'}</span>
                    </div>
                </div>
                <Button variant="destructive" size="sm" className="font-black uppercase text-[10px] h-8" onClick={() => setIsEndMatchDialogOpen(true)}>Finish Match</Button>
            </header>

            <main className="p-4 space-y-4 max-w-md mx-auto w-full flex-1 pb-24">
                <Card className="bg-slate-900 border-slate-800 text-white p-6 shadow-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">
                        <span className={cn(battingTeamId === String(initialMatch.team_a_id) ? "text-blue-400 font-black" : "text-white")}>{initialMatch.TeamA.team_name}</span>
                        <span className="px-2 py-0.5 bg-slate-800 rounded-full text-[8px]">VS</span>
                        <span className={cn(battingTeamId === String(initialMatch.team_b_id) ? "text-blue-400 font-black" : "text-white")}>{initialMatch.TeamB.team_name}</span>
                    </div>
                    <div className="text-center">
                        <div className="flex items-baseline justify-center gap-1">
                            <p className="text-7xl font-black tracking-tighter">{teamScore.runs ?? 0}</p>
                            <p className="text-3xl font-black text-slate-600">/{teamScore.wickets ?? 0}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-black tracking-widest px-4 py-1 text-xs">
                                {(teamScore.overs || 0.0).toFixed(1)} OVERS
                            </Badge>
                        </div>
                    </div>
                </Card>

                {isOverEnd && (
                    <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-500 py-3">
                        <Info className="h-4 w-4 stroke-amber-500" />
                        <AlertTitle className="font-black uppercase text-[10px] tracking-widest">Cycle Complete</AlertTitle>
                        <AlertDescription className="text-[11px] font-bold">Over complete. Rotate bowlers and verify strikers.</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <BatsmanCard player={striker} onStrike={true} stats={currentStrikerStats} />
                    <BatsmanCard player={nonStriker} onStrike={false} stats={currentNonStrikerStats} />
                </div>
                
                <BowlerCard player={activeBowler} stats={currentBowlerStats} />

                <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map(r => (
                            <Button key={r} className="h-14 text-2xl font-black bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-950" disabled={isProcessingCommand} onClick={() => handleBall(r)}>{r}</Button>
                        ))}
                        <Button className="h-14 text-2xl font-black bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-900" disabled={isProcessingCommand} onClick={() => handleBall(4)}>4</Button>
                        <Button className="h-14 text-2xl font-black bg-blue-600 hover:bg-blue-700 border-b-4 border-blue-900" disabled={isProcessingCommand} onClick={() => handleBall(6)}>6</Button>
                        <Button className="h-14 text-2xl font-black bg-red-600 hover:bg-red-700 border-b-4 border-red-900" disabled={isProcessingCommand} onClick={() => handleBall(0, true)}>W</Button>
                        <Button variant="outline" className="h-14 bg-slate-900 border-slate-700 font-black text-xs uppercase" disabled={isProcessingCommand} onClick={handleUndo}>UNDO</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" className="h-12 bg-amber-600 hover:bg-amber-700 font-black uppercase text-xs tracking-widest text-white border-b-4 border-amber-900" disabled={isProcessingCommand} onClick={() => handleBall(0, false, 'wide')}>WD (+1)</Button>
                        <Button variant="secondary" className="h-12 bg-amber-600 hover:bg-amber-700 font-black uppercase text-xs tracking-widest text-white border-b-4 border-amber-900" disabled={isProcessingCommand} onClick={() => handleBall(0, false, 'noball')}>NB (+1)</Button>
                    </div>
                </div>

                <Button variant="secondary" className="w-full h-14 bg-slate-800 font-black uppercase text-xs tracking-widest hover:bg-slate-700 border-slate-700 border" onClick={() => setIsPlayerSelectOpen(true)} disabled={isProcessingCommand}>
                    {isProcessingCommand ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2"/>}
                    Lineup & State Proxy
                </Button>
            </main>

            <Dialog open={isPlayerSelectOpen} onOpenChange={setIsPlayerSelectOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-[95vw] sm:max-w-md rounded-3xl overflow-hidden p-0">
                    <DialogHeader className="p-6 bg-slate-800/50">
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter">Lineup Proxy</DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs font-bold uppercase">Commit active roles to Firebase state</DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-blue-400 text-[10px] uppercase font-black tracking-[0.2em]">Striker</Label>
                                <Select onValueChange={setModalStrikerId} value={modalStrikerId || undefined}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 h-14 rounded-2xl font-bold"><SelectValue placeholder="Select Striker" /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        {battingRoster.map(p => (
                                            <SelectItem key={p.student_id} value={String(p.student_id)} className="font-bold uppercase text-xs">{p.Student?.name || p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">Non-Striker</Label>
                                <Select onValueChange={setModalNonStrikerId} value={modalNonStrikerId || undefined}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 h-14 rounded-2xl font-bold"><SelectValue placeholder="Select Non-Striker" /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        {battingRoster.map(p => (
                                            <SelectItem key={p.student_id} value={String(p.student_id)} className="font-bold uppercase text-xs">{p.Student?.name || p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-emerald-400 text-[10px] uppercase font-black tracking-[0.2em]">Bowler</Label>
                                <Select onValueChange={setModalBowlerId} value={modalBowlerId || undefined}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 h-14 rounded-2xl font-bold"><SelectValue placeholder="Select Bowler" /></SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        {bowlingRoster.map(p => (
                                            <SelectItem key={p.student_id} value={String(p.student_id)} className="font-bold uppercase text-xs">{p.Student?.name || p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-6">
                        <Button onClick={handleSavePlayers} disabled={isProcessingCommand} className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-black uppercase text-lg">
                            {isProcessingCommand ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                            Sync Lineup to Fans
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EndMatchDialog isOpen={isEndMatchDialogOpen} onClose={() => setIsEndMatchDialogOpen(false)} match={initialMatch} onEndMatch={onBack} />
        </div>
    )
}
