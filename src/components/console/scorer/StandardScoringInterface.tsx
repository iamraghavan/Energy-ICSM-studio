'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    getScorerTeamDetails, 
    type ApiMatch, 
    type FullSportsHeadTeam, 
    type StudentTeamMember,
    getMatchEvents
} from "@/lib/api";
import { ArrowLeft, Timer as TimerIcon, Play, Pause, Goal, Square, Info, MessageSquare, RotateCcw, SendHorizonal } from 'lucide-react';
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
import { EndMatchDialog } from './EndMatchDialog';

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
    const { score: liveScore, submitAction, isConnected, events: liveEvents } = useMatchSocket(match.id, match);
    
    const [score, setScore] = useState(match.score_details || {});
    const [events, setEvents] = useState<any[]>(match.match_events || []);
    const [isEndMatchOpen, setIsEndMatchOpen] = useState(false);
    const [teamA, setTeamA] = useState<FullSportsHeadTeam | null>(null);
    const [teamB, setTeamB] = useState<FullSportsHeadTeam | null>(null);
    const [isCardModalOpen, setCardModalOpen] = useState(false);
    const [cardType, setCardType] = useState<'yellow' | 'red' | null>(null);
    const [commentary, setCommentary] = useState("");

    const { toast } = useToast();

    useEffect(() => {
        if(liveScore) setScore(liveScore);
    }, [liveScore]);

     useEffect(() => {
        if(liveEvents) setEvents(liveEvents);
    }, [liveEvents]);

    useEffect(() => {
        Promise.all([
            getScorerTeamDetails(match.team_a_id),
            getScorerTeamDetails(match.team_b_id)
        ]).then(([teamAData, teamBData]) => {
            setTeamA(teamAData);
            setTeamB(teamBData);
        });
        
    }, [match.team_a_id, match.team_b_id]);

    const handleScoreEvent = async (teamId: string, points: number) => {
        try {
            await submitAction("submit_standard_score", { points, team_id: teamId, event_type: 'point' });
            toast({ title: "Point Synced!", description: `${points > 0 ? `+${points}`: points} point for ${teamId === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name}` });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: String(error) });
        }
    };

    const handleUndo = async () => {
        try {
            await submitAction('undo_event', {});
            toast({ title: "Last Action Undone" });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Undo Failed', description: String(error) });
        }
    }

    const handleIssueCard = (type: 'yellow' | 'red') => {
        setCardType(type);
        setCardModalOpen(true);
    };

    const onPlayerSelectedForCard = async (playerId: string, teamId: string) => {
        if (!cardType) return;
        try {
            await submitAction('issue_card', {
                player_id: playerId,
                team_id: teamId,
                card_type: cardType
            });
            toast({ title: `${cardType.charAt(0).toUpperCase() + cardType.slice(1)} Card Issued` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not issue card.' });
        }
    };

     const handleAddCommentary = async () => {
        if (!commentary.trim()) return;
        try {
            await submitAction('add_commentary', { text: commentary });
            setCommentary("");
            toast({ title: "Commentary Added" });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not add commentary.' });
        }
    }
    
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
                             <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-500" : ""}>{isConnected ? "Connected" : "Offline"}</Badge>
                             <Button size="sm" variant="destructive" onClick={() => setIsEndMatchOpen(true)}>End Match</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid lg:grid-cols-3 gap-6">
                    {/* Scoring Section */}
                    <div className="lg:col-span-2 space-y-6">
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
                        <div className="grid grid-cols-3 gap-4">
                            <Button variant="secondary" onClick={() => handleIssueCard('yellow')}><Square className="mr-2 fill-yellow-400 text-yellow-400" /> Issue Yellow</Button>
                            <Button variant="secondary" onClick={() => handleIssueCard('red')}><Square className="mr-2 fill-red-500 text-red-500"/> Issue Red</Button>
                            <Button variant="outline" onClick={handleUndo}><RotateCcw className="mr-2"/> Undo Last</Button>
                        </div>
                    </div>
                    {/* Events & Commentary */}
                     <div className="lg:col-span-1 space-y-4">
                        <Card className="flex flex-col h-full">
                            <CardHeader><CardTitle>Live Events</CardTitle></CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                 <ScrollArea className="flex-1 h-64 pr-4 -mr-4 mb-4">
                                    <div className="space-y-4">
                                        {events.length > 0 ? events.map(e => <EventItem key={e.id} event={e} match={match}/>) : <p className="text-muted-foreground text-sm text-center py-8">No events yet...</p>}
                                    </div>
                                 </ScrollArea>
                                <div className="flex gap-2">
                                    <Textarea placeholder="Add commentary..." value={commentary} onChange={(e) => setCommentary(e.target.value)} rows={1} className="resize-none"/>
                                    <Button size="icon" onClick={handleAddCommentary}><SendHorizonal/></Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

             <PlayerSelectionDialog 
                isOpen={isCardModalOpen}
                onClose={() => setCardModalOpen(false)}
                teamA={teamA}
                teamB={teamB}
                onPlayerSelect={onPlayerSelectedForCard}
            />

            <EndMatchDialog 
                isOpen={isEndMatchOpen}
                onClose={() => setIsEndMatchOpen(false)}
                match={match}
                onEndMatch={onBack}
            />
        </>
    );
}

const EventItem = ({ event, match }: { event: any, match: ApiMatch }) => {
    const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const teamName = event.team_id === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name;

    switch(event.event_type) {
        case 'point':
            return <div className="flex items-center gap-3 text-sm"><Goal className="w-4 h-4 text-green-500" /><p><span className="font-semibold">{teamName}</span> scored a point.</p><span className="ml-auto text-xs text-muted-foreground">{time}</span></div>
        case 'yellow_card':
            return <div className="flex items-center gap-3 text-sm"><Square className="w-4 h-4 fill-yellow-400 text-yellow-400" /><p>Yellow card for <span className="font-semibold">{event.player?.name}</span> ({teamName}).</p><span className="ml-auto text-xs text-muted-foreground">{time}</span></div>
        case 'red_card':
            return <div className="flex items-center gap-3 text-sm"><Square className="w-4 h-4 fill-red-500 text-red-500" /><p>Red card for <span className="font-semibold">{event.player?.name}</span> ({teamName}).</p><span className="ml-auto text-xs text-muted-foreground">{time}</span></div>
        case 'commentary':
            return <div className="flex items-start gap-3 text-sm"><MessageSquare className="w-4 h-4 mt-0.5" /><p className="flex-1">"{event.text}"</p><span className="text-xs text-muted-foreground">{time}</span></div>
        default:
            return <div className="flex items-center gap-3 text-sm"><Info className="w-4 h-4" /><p>Event: {event.event_type}</p><span className="ml-auto text-xs text-muted-foreground">{time}</span></div>
    }
}

// Kept for compatibility with other components that might still use it.
// Consider refactoring them to use useMatchSocket.
export { StandardScoringInterface };
