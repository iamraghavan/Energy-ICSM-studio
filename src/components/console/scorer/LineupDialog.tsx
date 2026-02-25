
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScorerTeamDetails, getLineup, saveLineup, type ApiMatch, type FullSportsHeadTeam, type StudentTeamMember } from '@/lib/api';
import { Loader2, UserCheck, UserX } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface LineupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    match: ApiMatch;
}

function PlayerCheckbox({ player, isSelected, onSelect, disabled }: { player: StudentTeamMember, isSelected: boolean, onSelect: (id: string) => void, disabled: boolean }) {
    return (
        <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
            <Checkbox
                id={`player-${player.student_id}`}
                checked={isSelected}
                onCheckedChange={() => onSelect(player.student_id)}
                disabled={disabled && !isSelected}
            />
            <Label htmlFor={`player-${player.student_id}`} className="w-full cursor-pointer">
                {player.Student?.name || player.name}
            </Label>
        </div>
    )
}

export function LineupDialog({ isOpen, onClose, match }: LineupDialogProps) {
    const { toast } = useToast();
    const [teamA, setTeamA] = useState<FullSportsHeadTeam | null>(null);
    const [teamB, setTeamB] = useState<FullSportsHeadTeam | null>(null);
    const [teamASelection, setTeamASelection] = useState<string[]>([]);
    const [teamBSelection, setTeamBSelection] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const maxPlayers = match.Sport.max_players;

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            Promise.all([
                getScorerTeamDetails(match.team_a_id),
                getScorerTeamDetails(match.team_b_id),
                getLineup(match.id),
            ]).then(([teamAData, teamBData, lineupData]) => {
                setTeamA(teamAData);
                setTeamB(teamBData);
                
                // Initialize selection with players already in the lineup
                const lineupIds = new Set(lineupData.map((p: any) => p.student_id));
                const initialA = teamAData.members.filter(m => lineupIds.has(m.student_id)).map(m => m.student_id);
                const initialB = teamBData.members.filter(m => lineupIds.has(m.student_id)).map(m => m.student_id);

                setTeamASelection(initialA);
                setTeamBSelection(initialB);

            }).catch(err => {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load team or lineup details.' });
                console.error(err);
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [isOpen, match.id, match.team_a_id, match.team_b_id, toast]);

    const handleSelectPlayer = (team: 'A' | 'B', playerId: string) => {
        const selection = team === 'A' ? teamASelection : teamBSelection;
        const setSelection = team === 'A' ? setTeamASelection : setTeamBSelection;
        
        if (selection.includes(playerId)) {
            setSelection(prev => prev.filter(id => id !== playerId));
        } else {
            if (selection.length < maxPlayers) {
                setSelection(prev => [...prev, playerId]);
            } else {
                toast({ variant: 'destructive', title: 'Player Limit Reached', description: `You can only select up to ${maxPlayers} players per team.` });
            }
        }
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const lineup = [
                ...teamASelection.map(id => ({ player_id: id, is_substitute: false })),
                ...teamBSelection.map(id => ({ player_id: id, is_substitute: false }))
            ];
            await saveLineup(match.id, lineup);
            toast({ title: 'Lineup Saved', description: 'The playing lineup has been updated successfully.' });
            onClose();
        } catch (error) {
             toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the lineup.' });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Set Match Lineup</DialogTitle>
                    <DialogDescription>
                        Select the {maxPlayers} starting players for each team. Unselected players will be considered substitutes.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8"><Skeleton className="h-48 w-full"/></div>
                ) : (
                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div>
                            <h3 className="font-semibold mb-2">{teamA?.team_name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">Selected: {teamASelection.length} / {maxPlayers}</p>
                            <ScrollArea className="h-64 border rounded-md p-4">
                                {teamA?.members.map(player => (
                                    <PlayerCheckbox 
                                        key={player.student_id}
                                        player={player}
                                        isSelected={teamASelection.includes(player.student_id)}
                                        onSelect={() => handleSelectPlayer('A', player.student_id)}
                                        disabled={teamASelection.length >= maxPlayers}
                                    />
                                ))}
                            </ScrollArea>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">{teamB?.team_name}</h3>
                             <p className="text-sm text-muted-foreground mb-4">Selected: {teamBSelection.length} / {maxPlayers}</p>
                            <ScrollArea className="h-64 border rounded-md p-4">
                                {teamB?.members.map(player => (
                                      <PlayerCheckbox 
                                        key={player.student_id}
                                        player={player}
                                        isSelected={teamBSelection.includes(player.student_id)}
                                        onSelect={() => handleSelectPlayer('B', player.student_id)}
                                        disabled={teamBSelection.length >= maxPlayers}
                                    />
                                ))}
                            </ScrollArea>
                        </div>
                    </div>
                )}


                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleSave} disabled={isLoading || isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Lineup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
