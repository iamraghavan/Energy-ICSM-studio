
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { endMatch, getScorerTeamDetails, type ApiMatch, type StudentTeamMember } from '@/lib/api';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useMatchSync } from '@/hooks/useMatchSync';

interface EndMatchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    match: ApiMatch;
    onEndMatch: () => void;
}

export function EndMatchDialog({ isOpen, onClose, match, onEndMatch }: EndMatchDialogProps) {
    const { matchData } = useMatchSync(match.id);
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [mvpId, setMvpId] = useState<string | null>(null);
    const [players, setPlayers] = useState<StudentTeamMember[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const { toast } = useToast();

    // Guided Logic: Check if the score matches the winner selection
    const scores = matchData?.score_details || match.score_details || {};
    const scoreA = scores[match.team_a_id]?.runs ?? scores[match.team_a_id]?.score ?? 0;
    const scoreB = scores[match.team_b_id]?.runs ?? scores[match.team_b_id]?.score ?? 0;

    const suggestedWinnerId = scoreA > scoreB ? match.team_a_id : scoreB > scoreA ? match.team_b_id : null;

    useEffect(() => {
        if (isOpen) {
            setIsLoadingPlayers(true);
            Promise.all([
                getScorerTeamDetails(match.team_a_id),
                getScorerTeamDetails(match.team_b_id)
            ]).then(([teamA, teamB]) => {
                setPlayers([...teamA.members, ...teamB.members]);
                if (suggestedWinnerId) setWinnerId(suggestedWinnerId);
            }).catch(() => {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load player list.' });
            }).finally(() => {
                setIsLoadingPlayers(false);
            });
        } else {
            setShowVerification(false);
        }
    }, [isOpen, match.team_a_id, match.team_b_id, toast, suggestedWinnerId]);

    const handleSubmit = async () => {
        if (!winnerId) {
            toast({ variant: 'destructive', title: 'Winner Required', description: 'Please select the winning team.' });
            return;
        }
        setIsSubmitting(true);
        try {
            await endMatch(match.id, winnerId, mvpId);
            toast({ title: 'Match Finalized', description: 'Match data archived and results published.' });
            onEndMatch();
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to close match.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Finalize Match</DialogTitle>
                    <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        Declare the winner and publish final statistics.
                    </DialogDescription>
                </DialogHeader>

                {!showVerification ? (
                    <div className="py-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-blue-400 text-[10px] uppercase font-black tracking-widest">Winning Team</Label>
                            <Select onValueChange={setWinnerId} value={winnerId ?? undefined}>
                                <SelectTrigger className="bg-slate-950 border-slate-800 h-12 rounded-xl font-bold uppercase text-xs">
                                    <SelectValue placeholder="Select Winner" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    <SelectItem value={match.team_a_id} className="font-bold uppercase text-[10px]">{match.TeamA.team_name} ({scoreA})</SelectItem>
                                    <SelectItem value={match.team_b_id} className="font-bold uppercase text-[10px]">{match.TeamB.team_name} ({scoreB})</SelectItem>
                                </SelectContent>
                            </Select>
                            {winnerId && winnerId !== suggestedWinnerId && suggestedWinnerId && (
                                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">Warning: Selection differs from score-based winner.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-emerald-400 text-[10px] uppercase font-black tracking-widest">Man of the Match (MVP)</Label>
                            <Select onValueChange={setMvpId} value={mvpId ?? undefined} disabled={isLoadingPlayers}>
                                <SelectTrigger className="bg-slate-950 border-slate-800 h-12 rounded-xl font-bold uppercase text-xs">
                                    <SelectValue placeholder={isLoadingPlayers ? "Loading Players..." : "Select MVP"} />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    {players.map(p => (
                                        <SelectItem key={p.student_id} value={p.student_id} className="font-bold uppercase text-[10px]">
                                            {p.Student?.name || p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="py-10 text-center space-y-4">
                        <div className="mx-auto h-16 w-16 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/30">
                            <ShieldCheck className="h-8 w-8 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black uppercase italic tracking-tight">Are you sure?</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Ending match will lock all scoring.</p>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {!showVerification ? (
                        <>
                            <DialogClose asChild><Button variant="ghost" className="rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</Button></DialogClose>
                            <Button 
                                onClick={() => setShowVerification(true)} 
                                disabled={!winnerId}
                                className="bg-blue-600 hover:bg-blue-700 rounded-xl font-black uppercase text-[10px] tracking-widest h-10"
                            >
                                Verify Result
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => setShowVerification(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest">Edit Result</Button>
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black uppercase text-[10px] tracking-widest h-10 px-8"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                Finalize & Archive
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
