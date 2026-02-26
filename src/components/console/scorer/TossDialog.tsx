'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { submitTossResult, startMatch, type ApiMatch } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TossDialogProps {
    isOpen: boolean;
    onClose: () => void;
    match: ApiMatch;
    onTossDecided: () => void;
}

export function TossDialog({ isOpen, onClose, match, onTossDecided }: TossDialogProps) {
    const [tossWinnerId, setTossWinnerId] = useState<string | null>(null);
    const [decision, setDecision] = useState<'bat' | 'field' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!tossWinnerId || !decision) {
            toast({ variant: 'destructive', title: 'Please complete the toss details.' });
            return;
        }
        setIsSubmitting(true);

        const winnerName = tossWinnerId === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name;
        const details = `${winnerName} won the toss and elected to ${decision}.`;

        try {
            // Commands: Toss REST -> Start REST
            await submitTossResult(match.id, {
                winner_id: tossWinnerId,
                decision,
                details,
            });

            await startMatch(match.id);
            
            toast({ title: 'Match is Live!', description: 'Results recorded and match started.' });
            onTossDecided();
            onClose();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Could not start match.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Toss & Start Match</DialogTitle>
                    <DialogDescription>
                        Record the toss result to begin the match. The state will sync to Firebase automatically.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="toss-winner">Toss Winner</Label>
                        <Select onValueChange={setTossWinnerId} value={tossWinnerId ?? undefined}>
                            <SelectTrigger id="toss-winner">
                                <SelectValue placeholder="Select the team that won the toss" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={match.team_a_id}>{match.TeamA.team_name}</SelectItem>
                                <SelectItem value={match.team_b_id}>{match.TeamB.team_name}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {tossWinnerId && (
                        <div className="space-y-2">
                            <Label>Decision</Label>
                            <RadioGroup onValueChange={(value) => setDecision(value as 'bat' | 'field')} value={decision ?? undefined}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="bat" id="decision-bat" />
                                    <Label htmlFor="decision-bat">Bat First</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="field" id="decision-field" />
                                    <Label htmlFor="decision-field">Bowl First</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !tossWinnerId || !decision}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Go Live
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
