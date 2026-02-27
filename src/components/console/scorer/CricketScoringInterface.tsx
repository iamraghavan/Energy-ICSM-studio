
'use client';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    getScorerTeamDetails, 
    updateMatchState, 
    submitCricketBall, 
    undoLastBall, 
    type ApiMatch, 
    type StudentTeamMember 
} from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { ArrowLeft, User, Loader2, Info, Trophy, ChevronRight, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter, 
    DialogDescription,
    DialogClose
} from '@/components/ui/dialog';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EndMatchDialog } from './EndMatchDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const BatsmanCard = ({ player, onStrike, stats }: { player: any, onStrike: boolean, stats: any }) => {
    const name = stats?.name || player?.Student?.name || player?.name || 'Assign Striker';
    return (
        <Card className={cn(
            "border-slate-700 p-4 transition-all duration-300 relative overflow-hidden", 
            onStrike ? 'bg-blue-600 ring-4 ring-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.5)] scale-105 z-10 text-white' : 'bg-slate-800 opacity-80 text-slate-300'
        )}>
            {onStrike && <div className="absolute top-0 right-0 p-1"><Trophy className="h-3 w-3 text-white/50" /></div>}
            <h4 className="font-black text-[10px] uppercase tracking-tighter truncate mb-2">
                {name}{onStrike && ' *'}
            </h4>
            <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black font-mono tracking-tighter">{stats?.runs ?? 0}</p>
                <p className={cn("text-[10px] font-bold uppercase", onStrike ? "text-white/60" : "text-slate-500")}>
                    ({stats?.balls ?? 0})
                </p>
            </div>
            <div className="flex gap-2 mt-1">
                <p className={cn("text-[8px] uppercase font-black", onStrike ? "text-white/40" : "text-slate-600")}>4s: {stats?.fours ?? 0}</p>
                <p className={cn("text-[8px] uppercase font-black", onStrike ? "text-white/40" : "text-slate-600")}>6s: {stats?.sixes ?? 0}</p>
            </div>
        </Card>
    )
}

const BowlerCard = ({ player, stats }: { player: any, stats: any }) => {
    const name = stats?.name || player?.Student?.name || player?.name || 'Select Bowler';
    const overs = parseFloat(String(stats?.overs || 0)).toFixed(1);
    return (
        <Card className="bg-slate-900 border-slate-700 text-white p-4 shadow-xl">
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
                    <p className="text-2xl font-black font-mono tracking-tighter text-emerald-400">
                        {stats?.wickets ?? 0}/{stats?.runs_conceded ?? 0}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                        {overs} OV
                    </p>
                 </div>
            </div>
        </Card>
    )
}

export function CricketScoringInterface({ match: initialMatch, onBack }: { match: ApiMatch, onBack: () => void }) {
    const { matchData, isLoading: isSyncing } = useMatchSync(initialMatch.id);
    const { toast } = useToast();
    
    // --- State Management ---
    const [teamARoster, setTeamARoster] = useState<StudentTeamMember[]>([]);
    const [teamBRoster, setTeamBRoster] = useState<StudentTeamMember[]>([]);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- UI Modals ---
    const [isPlayerSelectOpen, setIsPlayerSelectOpen] = useState(false);
    const [isEndMatchDialogOpen, setIsEndMatchDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: 'W' | 'WD' | 'NB', runs?: number } | null>(null);

    // --- Modal Selection State ---
    const [modalStrikerId, setModalStrikerId] = useState<string | null>(null);
    const [modalNonStrikerId, setModalNonStrikerId] = useState<string | null>(null);
    const [modalBowlerId, setModalBowlerId] = useState<string | null>(null);

    // --- Synchronized Data ---
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
                toast({ variant: 'destructive', title: 'Roster Error', description: 'Could not fetch team players.' });
            } finally {
                setIsLoadingInitial(false);
            }
        };
        fetchRosters();
    }, [initialMatch.team_a_id, initialMatch.team_b_id, toast]);

    // Update modal defaults when sync data changes
    useEffect(() => {
        if (state.striker_id) setModalStrikerId(String(state.striker_id));
        if (state.non_striker_id) setModalNonStrikerId(String(state.non_striker_id));
        if (state.bowler_id) setModalBowlerId(String(state.bowler_id));
    }, [state]);

    const battingRoster = battingTeamId === String(initialMatch.team_a_id) ? teamARoster : teamBRoster;
    const bowlingRoster = bowlingTeamId === String(initialMatch.team_a_id) ? teamARoster : teamBRoster;

    const striker = battingRoster.find(p => String(p.student_id) === String(state.striker_id));
    const nonStriker = battingRoster.find(p => String(p.student_id) === String(state.non_striker_id));
    const activeBowler = bowlingRoster.find(p => String(p.student_id) === String(state.bowler_id));

    const currentStrikerStats = batsmenStats[String(state.striker_id)] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
    const currentNonStrikerStats = batsmenStats[String(state.non_striker_id)] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
    const currentBowlerStats = bowlerStats[String(state.bowler_id)] || { runs_conceded: 0, wickets: 0, overs: 0 };

    // --- Core Actions ---

    const handleSavePlayers = async () => {
        if (!modalStrikerId || !modalNonStrikerId || !modalBowlerId) {
            toast({ variant: 'destructive', title: 'Incomplete Lineup', description: 'Please assign all active players.' });
            return;
        }
        setIsProcessing(true);
        try {
            await updateMatchState(initialMatch.id, {
                striker_id: modalStrikerId,
                non_striker_id: modalNonStrikerId,
                bowler_id: modalBowlerId,
                batting_team_id: battingTeamId,
                current_innings: state.current_innings || 1
            });
            setIsPlayerSelectOpen(false);
            toast({ title: 'Field Updated' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.response?.data?.message || 'Server error.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBall = async (runs: number, isWicket: boolean = false, extraType: string | null = null) => {
        if (!state.striker_id || !state.bowler_id) {
            toast({ variant: 'destructive', title: 'Assign Players First', description: 'Set striker and bowler before scoring.' });
            setIsPlayerSelectOpen(true);
            return;
        }
        setIsProcessing(true);
        try {
            await submitCricketBall(initialMatch.id, {
                batting_team_id: battingTeamId,
                striker_id: String(state.striker_id),
                non_striker_id: String(state.non_striker_id),
                bowler_id: String(state.bowler_id),
                runs: runs,
                extras: (extraType === 'wide' || extraType === 'noball') ? 1 : 0,
                extra_type: extraType,
                is_wicket: isWicket,
                wicket_type: isWicket ? 'bowled' : null
            });
            
            if (isWicket) {
                toast({ title: 'Wicket Recorded!', description: 'Please assign the new batsman.' });
                setIsPlayerSelectOpen(true); // Automatically prompt for new batsman
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: 'Failed to record ball.' });
        } finally {
            setIsProcessing(false);
            setConfirmAction(null);
        }
    };

    const handleUndo = async () => {
        setIsProcessing(true);
        try {
            await undoLastBall(initialMatch.id);
            toast({ title: 'Last Ball Undone' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Undo Failed' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSwitchInnings = async () => {
        setIsProcessing(true);
        try {
            const currentTotal = score[battingTeamId]?.runs || 0;
            await updateMatchState(initialMatch.id, {
                batting_team_id: bowlingTeamId, // Swap teams
                current_innings: (state.current_innings || 1) + 1,
                target_score: currentTotal + 1,
                striker_id: null,
                non_striker_id: null,
                bowler_id: null
            });
            toast({ title: 'Innings Completed', description: `2nd Innings started. Target: ${currentTotal + 1}` });
            setIsPlayerSelectOpen(true);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Operation Failed' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoadingInitial) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
                <p className="font-black uppercase tracking-widest text-[10px]">Booting Match Hub...</p>
            </div>
        )
    }

    const teamScore = score[battingTeamId] || { runs: 0, wickets: 0, overs: 0 };
    const currentOversFloat = parseFloat(String(teamScore.overs || 0));
    const isOverEnd = currentOversFloat > 0 && Math.round((currentOversFloat * 10) % 10) === 0;

    return (
        <div className="bg-slate-950 text-white min-h-screen flex flex-col font-body selection:bg-blue-500/30">
            {/* Header */}
            <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 shadow-2xl">
                <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-800 text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5"/></Button>
                <div className="text-center">
                    <h1 className="font-black text-[10px] tracking-[0.25em] uppercase text-blue-400">Energy Scorer Hub</h1>
                    <div className="flex items-center gap-1.5 justify-center mt-0.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", isSyncing ? "bg-amber-500 animate-pulse" : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]")} />
                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{isSyncing ? 'Synchronizing' : 'RTDB Ready'}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 font-black uppercase text-[10px] h-8 hidden sm:flex" onClick={handleSwitchInnings} disabled={isProcessing}>Switch Innings</Button>
                    <Button variant="destructive" size="sm" className="font-black uppercase text-[10px] h-8 shadow-lg" onClick={() => setIsEndMatchDialogOpen(true)}>End Match</Button>
                </div>
            </header>

            <main className="p-4 space-y-4 max-w-md mx-auto w-full flex-1 pb-24">
                {/* Unified Score Board */}
                <Card className="bg-slate-900 border-slate-800 text-white p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="h-20 w-20" /></div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 relative z-10">
                        <span className={cn("transition-colors duration-500", battingTeamId === String(initialMatch.team_a_id) ? "text-blue-400 font-black underline underline-offset-4 decoration-2" : "text-slate-400")}>
                            {initialMatch.TeamA.team_name}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-800 rounded-full text-[8px] border border-slate-700">VS</span>
                            <Badge variant="outline" className="text-[8px] bg-slate-950 border-slate-800 text-slate-500">INN {state.current_innings || 1}</Badge>
                        </div>
                        <span className={cn("transition-colors duration-500", battingTeamId === String(initialMatch.team_b_id) ? "text-blue-400 font-black underline underline-offset-4 decoration-2" : "text-slate-400")}>
                            {initialMatch.TeamB.team_name}
                        </span>
                    </div>
                    <div className="text-center relative z-10">
                        <div className="flex items-baseline justify-center gap-1">
                            <p className="text-8xl font-black tracking-tighter text-white drop-shadow-2xl">{teamScore.runs ?? 0}</p>
                            <p className="text-4xl font-black text-slate-700">/{teamScore.wickets ?? 0}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-black tracking-widest px-5 py-1.5 text-xs shadow-lg">
                                {currentOversFloat.toFixed(1)} OVERS
                            </Badge>
                            {state.target_score && (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black tracking-widest px-5 py-1.5 text-xs">
                                    TARGET {state.target_score}
                                </Badge>
                            )}
                        </div>
                    </div>
                </Card>

                {isOverEnd && (
                    <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-500 py-3 animate-in slide-in-from-top duration-500">
                        <Info className="h-4 w-4 stroke-amber-500" />
                        <AlertTitle className="font-black uppercase text-[10px] tracking-widest">Innings Break / Over End</AlertTitle>
                        <AlertDescription className="text-[11px] font-bold">Select a new bowler or finalize current innings.</AlertDescription>
                    </Alert>
                )}

                {/* Player Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <BatsmanCard player={striker} onStrike={true} stats={currentStrikerStats} />
                    <BatsmanCard player={nonStriker} onStrike={false} stats={currentNonStrikerStats} />
                </div>
                
                <BowlerCard player={activeBowler} stats={currentBowlerStats} />

                {/* Precision Controls */}
                <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map(r => (
                            <Button key={r} className="h-14 text-2xl font-black bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-950 active:translate-y-1 transition-all" disabled={isProcessing} onClick={() => handleBall(r)}>{r}</Button>
                        ))}
                        <Button className="h-14 text-2xl font-black bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-900 active:translate-y-1" disabled={isProcessing} onClick={() => handleBall(4)}>4</Button>
                        <Button className="h-14 text-2xl font-black bg-blue-600 hover:bg-blue-700 border-b-4 border-blue-900 active:translate-y-1" disabled={isProcessing} onClick={() => handleBall(6)}>6</Button>
                        <Button className="h-14 text-2xl font-black bg-red-600 hover:bg-red-700 border-b-4 border-red-900 active:translate-y-1" disabled={isProcessing} onClick={() => setConfirmAction({ type: 'W' })}>W</Button>
                        <Button variant="outline" className="h-14 bg-slate-900 border-slate-700 font-black text-xs uppercase hover:bg-slate-800 text-slate-400 active:bg-blue-500 active:text-white" disabled={isProcessing} onClick={handleUndo}>
                            <RotateCcw className="h-4 w-4 mr-1"/> UNDO
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" className="h-12 bg-amber-600 hover:bg-amber-700 font-black uppercase text-xs tracking-widest text-white border-b-4 border-amber-900 shadow-lg" disabled={isProcessing} onClick={() => setConfirmAction({ type: 'WD' })}>WD (+1)</Button>
                        <Button variant="secondary" className="h-12 bg-amber-600 hover:bg-amber-700 font-black uppercase text-xs tracking-widest text-white border-b-4 border-amber-900 shadow-lg" disabled={isProcessing} onClick={() => setConfirmAction({ type: 'NB' })}>NB (+1)</Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="secondary" className="h-12 bg-slate-800 font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 border-slate-700 border text-slate-300" onClick={() => setIsPlayerSelectOpen(true)} disabled={isProcessing}>
                        <User className="w-3 h-3 mr-2 text-blue-400"/> Assign Lineup
                    </Button>
                    <Button variant="secondary" className="h-12 bg-slate-800 font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 border-slate-700 border text-slate-300" onClick={handleSwitchInnings} disabled={isProcessing}>
                        <RotateCcw className="w-3 h-3 mr-2 text-amber-400"/> New Innings
                    </Button>
                </div>
            </main>

            {/* Confirmation Dialog for Extras/Wickets */}
            <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-2xl font-black uppercase italic italic tracking-tighter">
                            <AlertCircle className="h-6 w-6 text-amber-500" />
                            Verify Action
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400 font-bold uppercase text-xs tracking-wide">
                            Are you sure you want to record a <span className="text-white font-black">{confirmAction?.type === 'W' ? 'WICKET' : confirmAction?.type === 'WD' ? 'WIDE' : 'NO BALL'}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className={cn(
                                "rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6",
                                confirmAction?.type === 'W' ? "bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "bg-amber-600 hover:bg-amber-700 shadow-[0_0_20px_rgba(217,119,6,0.4)]"
                            )}
                            onClick={() => {
                                if (confirmAction?.type === 'W') handleBall(0, true);
                                else if (confirmAction?.type === 'WD') handleBall(0, false, 'wide');
                                else if (confirmAction?.type === 'NB') handleBall(0, false, 'noball');
                            }}
                        >
                            Confirm Action
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Lineup Manager Dialog */}
            <Dialog open={isPlayerSelectOpen} onOpenChange={setIsPlayerSelectOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-[95vw] sm:max-w-md rounded-[2.5rem] overflow-hidden p-0 shadow-2xl">
                    <DialogHeader className="p-8 bg-slate-900/50 border-b border-slate-800">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Assignment Hub</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs font-black uppercase tracking-[0.1em]">Assign active batter and bowler</DialogDescription>
                    </DialogHeader>
                    <div className="p-8 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-blue-400 text-[10px] uppercase font-black tracking-[0.3em] ml-1">Striker (Batting)</Label>
                                <Select onValueChange={setModalStrikerId} value={modalStrikerId || undefined}>
                                    <SelectTrigger className="bg-slate-900 border-slate-800 h-16 rounded-3xl font-black uppercase tracking-tight text-sm shadow-inner"><SelectValue placeholder="Assign Striker" /></SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
                                        {battingRoster.map(p => (
                                            <SelectItem key={p.student_id} value={String(p.student_id)} className="font-black uppercase text-[10px] py-3 tracking-widest">{p.Student?.name || p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] ml-1">Non-Striker</Label>
                                <Select onValueChange={setModalNonStrikerId} value={modalNonStrikerId || undefined}>
                                    <SelectTrigger className="bg-slate-900 border-slate-800 h-16 rounded-3xl font-black uppercase tracking-tight text-sm shadow-inner"><SelectValue placeholder="Assign Non-Striker" /></SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
                                        {battingRoster.map(p => (
                                            <SelectItem key={p.student_id} value={String(p.student_id)} className="font-black uppercase text-[10px] py-3 tracking-widest">{p.Student?.name || p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                <Label className="text-emerald-400 text-[10px] uppercase font-black tracking-[0.3em] ml-1">Current Bowler</Label>
                                <Select onValueChange={setModalBowlerId} value={modalBowlerId || undefined}>
                                    <SelectTrigger className="bg-slate-900 border-slate-800 h-16 rounded-3xl font-black uppercase tracking-tight text-sm shadow-inner"><SelectValue placeholder="Select Bowler" /></SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
                                        {bowlingRoster.map(p => (
                                            <SelectItem key={p.student_id} value={String(p.student_id)} className="font-black uppercase text-[10px] py-3 tracking-widest">{p.Student?.name || p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-8 bg-slate-900/30">
                        <Button onClick={handleSavePlayers} disabled={isProcessing} className="w-full h-16 bg-blue-600 hover:bg-blue-700 font-black uppercase text-base tracking-widest rounded-3xl shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
                            {isProcessing ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2"/>}
                            Apply Lineup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EndMatchDialog isOpen={isEndMatchDialogOpen} onClose={() => setIsEndMatchDialogOpen(false)} match={initialMatch} onEndMatch={onBack} />
        </div>
    )
}
