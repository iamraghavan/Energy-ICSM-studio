
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { endMatch, getScorerTeamDetails, type ApiMatch, type StudentTeamMember } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface EndMatchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    match: ApiMatch;
    onEndMatch: () => void;
}

export function EndMatchDialog({ isOpen, onClose, match, onEndMatch }: EndMatchDialogProps) {
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [mvpId, setMvpId] = useState<string | null>(null);
    const [players, setPlayers] = useState<StudentTeamMember[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setIsLoadingPlayers(true);
            Promise.all([
                getScorerTeamDetails(match.team_a_id),
                getScorerTeamDetails(match.team_b_id)
            ]).then(([teamA, teamB]) => {
                setPlayers([...teamA.members, ...teamB.members]);
            }).catch(() => {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load players for MVP selection.' });
            }).finally(() => {
                setIsLoadingPlayers(false);
            });
        }
    }, [isOpen, match.team_a_id, match.team_b_id, toast]);

    const handleSubmit = async () => {
        if (!winnerId) {
            toast({ variant: 'destructive', title: 'Please select a winner.' });
            return;
        }
        setIsSubmitting(true);
        try {
            await endMatch(match.id, winnerId, mvpId);
            toast({ title: 'Match Ended', description: 'The match has been marked as completed.' });
            onEndMatch();
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not end the match.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>End Match & Declare Winner</DialogTitle>
                    <DialogDescription>
                        Finalize the match results. This action is permanent.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="winner-select">Winning Team</Label>
                        <Select onValueChange={setWinnerId} value={winnerId ?? undefined}>
                            <SelectTrigger id="winner-select">
                                <SelectValue placeholder="Select winner" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={match.team_a_id}>{match.TeamA.team_name}</SelectItem>
                                <SelectItem value={match.team_b_id}>{match.TeamB.team_name}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mvp-select">Man of the Match (MVP)</Label>
                        <Select onValueChange={setMvpId} value={mvpId ?? undefined} disabled={isLoadingPlayers}>
                            <SelectTrigger id="mvp-select">
                                <SelectValue placeholder={isLoadingPlayers ? "Loading players..." : "Select MVP"} />
                            </SelectTrigger>
                            <SelectContent>
                                {players.map(p => (
                                    <SelectItem key={p.student_id} value={p.student_id}>
                                        {p.Student?.name || p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !winnerId}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Finalize Match
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
