'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { endMatch, type ApiMatch } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface EndMatchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    match: ApiMatch;
    onEndMatch: () => void;
}

export function EndMatchDialog({ isOpen, onClose, match, onEndMatch }: EndMatchDialogProps) {
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!winnerId) {
            toast({ variant: 'destructive', title: 'Please select a winner.' });
            return;
        }
        setIsSubmitting(true);
        try {
            await endMatch(match.id, winnerId);
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>End Match & Declare Winner</DialogTitle>
                    <DialogDescription>
                        Select the winning team to finalize the match. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
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
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !winnerId}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        End Match
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
