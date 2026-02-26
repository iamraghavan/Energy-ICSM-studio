
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getScorerTeamDetails, updateMatchState, type ApiMatch, type StudentTeamMember } from "@/lib/api";
import { ArrowLeft, User, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMatchSocket } from '@/hooks/useMatchSync';
import { EndMatchDialog } from './EndMatchDialog';

const BatsmanCard = ({ player, onStrike }: { player: StudentTeamMember | undefined, onStrike: boolean }) => {
    if (!player) return <Card className="bg-slate-800/50 border-slate-700 p-4 min-h-[100px] flex items-center justify-center"><p className="text-slate-400 text-sm">Select Batsman</p></Card>;
    return (
        <Card className={cn("border-slate-700 text-white p-4 transition-colors", onStrike ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-slate-800')}>
            <h4 className="font-bold text-sm truncate">{player.Student?.name || player.name || 'Unnamed Player'}{onStrike && ' *'}</h4>
            <div className="flex items-baseline gap-1 mt-1">
                <p className="text-3xl font-bold">0</p>
                <p className="text-slate-300 text-xs">(0)</p>
            </div>
        </Card>
    )
}

const BowlerCard = ({ player }: { player: StudentTeamMember | undefined }) => {
    if (!player) return <Card className="bg-slate-800/50 border-slate-700 p-4 flex items-center justify-center"><p className="text-slate-400 text-sm">Select Bowler</p></Card>;
    return (
        <Card className="bg-slate-800 border-slate-700 text-white p-4 mt-2">
             <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold text-sm flex items-center gap-2"><User className="w-3 h-3 text-slate-400"/> {player.Student?.name || player.name || 'Unnamed Player'}</p>
                </div>
                 <div className="text-right">
                    <p className="text-xl font-bold font-mono">0/0</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">0.0 Overs</p>
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

    const [isPlayerSelectOpen, setIsPlayerSelectOpen] = useState(false);
    const [isEndMatchDialogOpen, setIsEndMatchDialogOpen] = useState(false);

    // Form states for the modal
    const [modalStrikerId, setModalStrikerId] = useState<string | null>(null);
    const [modalNonStrikerId, setModalNonStrikerId] = useState<string | null>(null);
    const [modalBowlerId, setModalBowlerId] = useState<string | null>(null);

    const { toast } = useToast();
    
    const score = liveScore || initialMatch.score_details || {};
    const state = matchState || initialMatch.match_state || {};
    
    useEffect(() => {
        const fetchRosters = async () => {
            setIsLoading(true);
            try {
                const [teamA, teamB] = await Promise.all([
                    getScorerTeamDetails(initialMatch.team_a_id),
                    getScorerTeamDetails(initialMatch.team_b_id),
                ]);
                setTeamARoster(Array.isArray(teamA.members) ? teamA.members : []);
                setTeamBRoster(Array.isArray(teamB.members) ? teamB.members : []);
                
                // Initialize modal state from current match state
                if (state.striker_id) setModalStrikerId(state.striker_id);
                if (state.non_striker_id) setModalNonStrikerId(state.non_striker_id);
                if (state.bowler_id) setModalBowlerId(state.bowler_id);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch team rosters.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchRosters();
    }, [initialMatch.team_a_id, initialMatch.team_b_id, toast, state.striker_id, state.non_striker_id, state.bowler_id]);

    const battingTeamId = state.batting_team_id || initialMatch.team_a_id;
    const battingTeam = battingTeamId === initialMatch.team_a_id ? initialMatch.TeamA : initialMatch.TeamB;
    const bowlingTeam = battingTeamId === initialMatch.team_a_id ? initialMatch.TeamB : initialMatch.TeamA;
    
    const battingRoster = battingTeamId === initialMatch.team_a_id ? teamARoster : teamBRoster;
    const bowlingRoster = battingTeamId === initialMatch.team_a_id ? teamBRoster : teamARoster;

    const striker = battingRoster.find(p => p.student_id === state.striker_id);
    const nonStriker = battingRoster.find(p => p.student_id === state.non_striker_id);
    const bowler = bowlingRoster.find(p => p.student_id === state.bowler_id);

    const handleSavePlayers = async () => {
        if (!modalStrikerId || !modalNonStrikerId || !modalBowlerId) {
            toast({ variant: 'destructive', title: 'Selection Missing', description: 'Please select all players.' });
            return;
        }
        try {
            await updateMatchState(initialMatch.id, {
                striker_id: modalStrikerId,
                non_striker_id: modalNonStrikerId,
                bowler_id: modalBowlerId,
                batting_team_id: battingTeamId
            });
            toast({ title: 'Players Updated' });
            setIsPlayerSelectOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save player selection.' });
        }
    };

    const handleRotateStriker = async () => {
        if (!state.striker_id || !state.non_striker_id) return;
        try {
            await updateMatchState(initialMatch.id, {
                striker_id: state.non_striker_id,
                non_striker_id: state.striker_id,
                bowler_id: state.bowler_id,
                batting_team_id: battingTeamId
            });
            toast({ title: 'Strikers Rotated' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Rotation Failed' });
        }
    };

    const handleBall = async (runs: number, extra: boolean = false) => {
        if (!state.striker_id || !state.bowler_id) {
            toast({ variant: 'destructive', title: 'Selection Required', description: 'Select players first.' });
            setIsPlayerSelectOpen(true);
            return;
        }
        try {
            await submitAction('submit_cricket_ball', {
                runs,
                striker_id: state.striker_id,
                bowler_id: state.bowler_id,
                is_wicket: extra // In this basic logic, extra means wicket
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: String(error) });
        }
    };

    const handleUndo = async () => {
        try {
            await submitAction('undo_event', {});
            toast({ title: 'Last Action Undone' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Undo Failed' });
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin mr-2" /> Loading match console...</div>

    const teamScore = score[battingTeamId] || { runs: 0, wickets: 0, overs: 0 };

    return (
        <div className="bg-slate-950 text-white min-h-screen flex flex-col">
            <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5"/></Button>
                <div className="text-center">
                    <h1 className="font-bold text-sm tracking-tight">CRICKET CONSOLE</h1>
                    <div className="flex items-center gap-1.5 justify-center mt-0.5">
                        <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
                        <span className="text-[10px] uppercase font-medium text-slate-400">{isConnected ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setIsEndMatchDialogOpen(true)}>End</Button>
            </header>

            <main className="p-4 space-y-4 max-w-md mx-auto w-full flex-1">
                <Card className="bg-slate-900 border-slate-800 text-white p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><User size={80}/></div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                        <span className="text-blue-400">{battingTeam.team_name}</span>
                        <span>VS</span>
                        <span>{bowlingTeam.team_name}</span>
                    </div>
                    <div className="text-center">
                        <div className="flex items-baseline justify-center gap-1">
                            <p className="text-7xl font-black">{teamScore.runs || 0}</p>
                            <p className="text-4xl font-bold text-slate-500">/{teamScore.wickets || 0}</p>
                        </div>
                        <Badge variant="secondary" className="bg-slate-800 text-slate-300 font-mono mt-2 px-3">
                            {(teamScore.overs || 0).toFixed(1)} Overs
                        </Badge>
                    </div>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                    <BatsmanCard player={striker} onStrike={true} />
                    <BatsmanCard player={nonStriker} onStrike={false} />
                </div>
                
                <BowlerCard player={bowler} />

                <div className="grid grid-cols-4 gap-2 pt-4">
                    {[0, 1, 2, 3].map(r => (
                        <Button key={r} className="h-14 text-xl font-bold bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-950" onClick={() => handleBall(r)}>{r}</Button>
                    ))}
                    <Button className="h-14 text-xl font-bold bg-green-600 hover:bg-green-500 border-b-4 border-green-800" onClick={() => handleBall(4)}>4</Button>
                    <Button className="h-14 text-xl font-bold bg-blue-600 hover:bg-blue-500 border-b-4 border-blue-800" onClick={() => handleBall(6)}>6</Button>
                    <Button className="h-14 text-xl font-bold bg-red-600 hover:bg-red-500 border-b-4 border-red-800" onClick={() => handleBall(0, true)}>W</Button>
                    <Button variant="outline" className="h-14 bg-slate-900 border-slate-700" onClick={handleUndo}>Undo</Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="secondary" className="h-12 bg-slate-800" onClick={() => setIsPlayerSelectOpen(true)}>Change Players</Button>
                    <Button variant="secondary" className="h-12 bg-slate-800" onClick={handleRotateStriker}>Rotate Striker</Button>
                </div>
            </main>

            <Dialog open={isPlayerSelectOpen} onOpenChange={setIsPlayerSelectOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-[90vw] sm:max-w-md rounded-2xl">
                    <DialogHeader><DialogTitle className="text-xl font-bold">Select Active Players</DialogTitle></DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">Batting Team</Label>
                            <Badge variant="outline" className="text-blue-400 border-blue-400/30">{battingTeam.team_name}</Badge>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">On Strike (Batsman 1)</Label>
                            <Select onValueChange={setModalStrikerId} value={modalStrikerId || undefined}>
                                <SelectTrigger className="bg-slate-800 border-slate-700 h-12 rounded-xl"><SelectValue placeholder="Select Striker" /></SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    {battingRoster.length > 0 ? battingRoster.map(p => (
                                        <SelectItem key={p.student_id} value={p.student_id}>
                                            {p.Student?.name || p.name || 'Unknown Player'}
                                        </SelectItem>
                                    )) : <div className="p-2 text-sm text-muted-foreground">No players found</div>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">Non-Strike (Batsman 2)</Label>
                            <Select onValueChange={setModalNonStrikerId} value={modalNonStrikerId || undefined}>
                                <SelectTrigger className="bg-slate-800 border-slate-700 h-12 rounded-xl"><SelectValue placeholder="Select Non-Striker" /></SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    {battingRoster.length > 0 ? battingRoster.map(p => (
                                        <SelectItem key={p.student_id} value={p.student_id}>
                                            {p.Student?.name || p.name || 'Unknown Player'}
                                        </SelectItem>
                                    )) : <div className="p-2 text-sm text-muted-foreground">No players found</div>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs uppercase font-bold tracking-wider">Current Bowler ({bowlingTeam.team_name})</Label>
                            <Select onValueChange={setModalBowlerId} value={modalBowlerId || undefined}>
                                <SelectTrigger className="bg-slate-800 border-slate-700 h-12 rounded-xl"><SelectValue placeholder="Select Bowler" /></SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    {bowlingRoster.length > 0 ? bowlingRoster.map(p => (
                                        <SelectItem key={p.student_id} value={p.student_id}>
                                            {p.Student?.name || p.name || 'Unknown Player'}
                                        </SelectItem>
                                    )) : <div className="p-2 text-sm text-muted-foreground">No players found</div>}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleSavePlayers} className="w-full h-12 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-bold">Save Selection</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <EndMatchDialog isOpen={isEndMatchDialogOpen} onClose={() => setIsEndMatchDialogOpen(false)} match={initialMatch} onEndMatch={onBack} />
        </div>
    )
}
