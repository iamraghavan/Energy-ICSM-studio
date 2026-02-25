
'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getScorerTeamDetails, type ApiMatch, type FullSportsHeadTeam, type StudentTeamMember } from "@/lib/api";
import { ArrowLeft, Timer as TimerIcon, Play, Pause, Goal, Replace, Square, Info, MessageSquare, RotateCcw, SendHorizonal, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMatchSocket } from '@/hooks/useMatchSync';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

function PlayerSelectionDialog({
    isOpen,
    onClose,
    teamA,
    teamB,
    onPlayerSelect
}: {
    isOpen: boolean,
    onClose: () => void,
    teamA: FullSportsHeadTeam | null,
    teamB: FullSportsHeadTeam | null,
    onPlayerSelect: (playerId: string, teamId: string) => void
}) {
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Issue Card</DialogTitle>
                    <DialogDescription>Select the player who received the card.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-72 my-4">
                    {[teamA, teamB].map(team => (
                        team && (
                            <div key={team.id} className="mb-4">
                                <h4 className="font-semibold mb-2">{team.team_name}</h4>
                                <RadioGroup value={selectedPlayer ?? undefined} onValueChange={setSelectedPlayer} className="space-y-2">
                                    {team.members.map(player => (
                                        <div key={player.student_id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={player.student_id} id={player.student_id} />
                                            <Label htmlFor={player.student_id}>{player.Student?.name}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        )
                    ))}
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button
                        disabled={!selectedPlayer}
                        onClick={() => {
                            if (selectedPlayer) {
                                const teamId = teamA?.members.some(p => p.student_id === selectedPlayer) ? teamA.id : teamB!.id;
                                onPlayerSelect(selectedPlayer, teamId);
                                onClose();
                            }
                        }}
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function StandardScoringInterface({ match, onBack }: { match: ApiMatch, onBack: () => void }) {
    const { score: liveScore, submitAction } = useMatchSocket(match.id);
    
    const [score, setScore] = useState(match.score_details || {});
    const { toast } = useToast();

    useEffect(() => {
        if(liveScore) {
            setScore(liveScore);
        }
    }, [liveScore]);
    
    const handleScoreEvent = async (teamId: string, points: number) => {
        try {
            await submitAction("submit_standard_score", { points, team_id: teamId, event_type: 'point' });
            toast({ title: "Point Synced!", description: `${points > 0 ? `+${points}`: points} point for ${teamId === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name}` });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: String(error) });
        }
    };
    
    const teamAScore = score?.[match.team_a_id]?.score ?? 0;
    const teamBScore = score?.[match.team_b_id]?.score ?? 0;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
                        <div>
                            <CardTitle>Live Scoring: {match.Sport.name}</CardTitle>
                            <CardDescription>{match.referee_name ? `Referee: ${match.referee_name}` : 'No referee assigned'}</CardDescription>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Badge className="animate-pulse">LIVE</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                            <div className="text-center space-y-2">
                                    <Avatar className="mx-auto h-16 w-16 mb-2"><AvatarFallback>{match.TeamA.team_name.substring(0, 2)}</AvatarFallback></Avatar>
                                <h3 className="font-bold text-xl">{match.TeamA.team_name}</h3>
                                <p className="text-6xl font-bold">{teamAScore}</p>
                                <div className='flex gap-2 justify-center'>
                                    <Button size="lg" onClick={() => handleScoreEvent(match.team_a_id, 1)}>+1</Button>
                                    <Button size="lg" variant="secondary" onClick={() => handleScoreEvent(match.team_a_id, -1)}>-1</Button>
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-muted-foreground">vs</p>
                            <div className="text-center space-y-2">
                                    <Avatar className="mx-auto h-16 w-16 mb-2"><AvatarFallback>{match.TeamB.team_name.substring(0, 2)}</AvatarFallback></Avatar>
                                <h3 className="font-bold text-xl">{match.TeamB.team_name}</h3>
                                <p className="text-6xl font-bold">{teamBScore}</p>
                                 <div className='flex gap-2 justify-center'>
                                    <Button size="lg" onClick={() => handleScoreEvent(match.team_b_id, 1)}>+1</Button>
                                    <Button size="lg" variant="secondary" onClick={() => handleScoreEvent(match.team_b_id, -1)}>-1</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </>
    );
}

// Keep a version of the old one for other sports
export { StandardScoringInterface };
