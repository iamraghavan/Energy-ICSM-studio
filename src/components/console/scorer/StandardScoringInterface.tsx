
'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getScorerTeamDetails, type ApiMatch, type FullSportsHeadTeam, type StudentTeamMember } from "@/lib/api";
import { ArrowLeft, Timer as TimerIcon, Play, Pause, Goal, Replace, Square, Info, MessageSquare, RotateCcw, SendHorizone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMatchSync } from '@/hooks/useMatchSync';
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


function MatchTimer({ matchId, startTime, status, timerData, onTimerAction }: { matchId: string, startTime: string, status: 'live' | 'scheduled' | 'completed', timerData: any, onTimerAction: (action: 'start' | 'pause' | 'reset') => void }) {
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const serverStartTimeRef = useRef<number>(0);
    const serverCurrentTimeRef = useRef<number>(0);
    
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (timerData?.action === 'start') {
            serverStartTimeRef.current = timerData.timestamp;
            serverCurrentTimeRef.current = timerData.currentTime;
            
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const diff = now - serverStartTimeRef.current;
                const totalSeconds = serverCurrentTimeRef.current + Math.floor(diff / 1000);
                
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                setElapsedTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }, 1000);

        } else if (timerData?.action === 'pause' || timerData?.action === 'reset') {
             const totalSeconds = timerData.currentTime || 0;
             const minutes = Math.floor(totalSeconds / 60);
             const seconds = totalSeconds % 60;
             setElapsedTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        } else if (status !== 'live') {
            setElapsedTime('00:00');
        }

        return () => { if (timerRef.current) clearInterval(timerRef.current) };
    }, [timerData, status, startTime]);

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Match Time</CardTitle>
                <TimerIcon className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <div className="text-5xl font-bold font-mono text-center">{elapsedTime}</div>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <Button variant="outline" size="icon" onClick={() => onTimerAction('start')}><Play className="h-4 w-4"/></Button>
                    <Button variant="outline" size="icon" onClick={() => onTimerAction('pause')}><Pause className="h-4 w-4"/></Button>
                </div>
            </CardContent>
        </Card>
    );
}

function TimelineEvent({ event, match }: { event: any, match: ApiMatch }) {
    const getEventDetails = (e: any) => {
        const playerName = e.player?.name || 'Unknown Player';
        
        switch(e.event_type) {
            case 'goal':
            case 'point':
                return { icon: Goal, color: 'text-green-500 bg-green-500/10', title: 'Point Scored' };
            case 'card_issued':
                const isYellow = e.card_type === 'yellow';
                return { 
                    icon: Square, 
                    color: isYellow ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-500 bg-red-500/10', 
                    title: `${isYellow ? 'Yellow' : 'Red'} Card for ${playerName}`,
                    fill: true
                };
            case 'commentary_added':
                return { icon: MessageSquare, color: 'text-gray-500 bg-gray-500/10', title: 'Commentary', text: e.text };
            case 'substitution':
                 return { icon: Replace, color: 'text-blue-500 bg-blue-500/10', title: 'Substitution' };
            default:
                return { icon: Info, color: 'text-gray-500 bg-gray-500/10', title: e.event_type || 'General Event' };
        }
    };

    const { icon: Icon, color, title, text, fill } = getEventDetails(event);
    const teamName = event.team_id === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name;
    const time = new Date(event.timestamp || event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex items-start gap-3">
            <div className="text-xs text-muted-foreground pt-1.5">{time}</div>
            <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center", color)}>
                <Icon className="h-4 w-4" fill={fill ? 'currentColor' : 'none'} />
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{text || teamName}</p>
            </div>
        </div>
    );
};

export function StandardScoringInterface({ match, onBack }: { match: ApiMatch, onBack: () => void }) {
    const { syncedData, sendEvent } = useMatchSync(match.id);
    
    const [score, setScore] = useState(match.score_details || {});
    const [events, setEvents] = useState<any[]>(Array.isArray(match.match_events) ? [...match.match_events].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);
    const [timerData, setTimerData] = useState(null);
    
    const [teamA, setTeamA] = useState<FullSportsHeadTeam | null>(null);
    const [teamB, setTeamB] = useState<FullSportsHeadTeam | null>(null);
    const [rostersLoading, setRostersLoading] = useState(true);

    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [cardToIssue, setCardToIssue] = useState<'yellow' | 'red' | null>(null);
    const [commentary, setCommentary] = useState("");
    const [isSubmittingCommentary, setIsSubmittingCommentary] = useState(false);

    const [isEndMatchDialogOpen, setIsEndMatchDialogOpen] = useState(false);
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchRosters = async () => {
            setRostersLoading(true);
            try {
                const [teamAData, teamBData] = await Promise.all([
                    getScorerTeamDetails(match.team_a_id),
                    getScorerTeamDetails(match.team_b_id)
                ]);
                setTeamA(teamAData);
                setTeamB(teamBData);
            } catch (e) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch team rosters.' });
            } finally {
                setRostersLoading(false);
            }
        };
        fetchRosters();
    }, [match.team_a_id, match.team_b_id, toast]);

    useEffect(() => {
        if(syncedData) {
            if (syncedData.score_details) setScore(syncedData.score_details);
            if (syncedData.match_events) setEvents(syncedData.match_events);
            if ((syncedData as any).timer) setTimerData((syncedData as any).timer);
        }
    }, [syncedData]);
    
    const handleScoreEvent = async (teamId: string) => {
        try {
            await sendEvent("submit_standard_score", { points: 1, team_id: teamId, event_type: 'point' });
            toast({ title: "Point Synced!", description: `+1 point for ${teamId === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name}` });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: String(error) });
        }
    };
    
    const openCardModal = (cardType: 'yellow' | 'red') => {
        setCardToIssue(cardType);
        setIsCardModalOpen(true);
    };

    const handleIssueCard = async (playerId: string, teamId: string) => {
        if (!cardToIssue) return;
        try {
            await sendEvent('issue_card', { player_id: playerId, team_id: teamId, card_type: cardToIssue });
            toast({ title: 'Card Issued', description: `Logged a ${cardToIssue} card.` });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Sync Error', description: String(error) });
        }
    };

    const handleTimerAction = async (action: 'start' | 'pause' | 'reset') => {
        try {
            await sendEvent('timer_control', { action, currentTime: 0 }); // CurrentTime to be improved
            toast({ title: `Timer: ${action}` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Timer Error', description: String(error) });
        }
    };
    
    const handleAddCommentary = async () => {
        if (!commentary.trim()) return;
        setIsSubmittingCommentary(true);
        try {
            await sendEvent('add_commentary', { text: commentary.trim() });
            setCommentary('');
        } catch(error) {
            toast({ variant: 'destructive', title: 'Commentary Error', description: String(error) });
        } finally {
            setIsSubmittingCommentary(false);
        }
    };

    const handleUndo = async () => {
        try {
            await sendEvent('undo_event', {});
            toast({ title: 'Undo Successful', description: 'The last action was reverted.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Undo Failed', description: String(error) });
        }
    };

    const handleEndMatch = async () => {
        if (!winnerId) return toast({ variant: 'destructive', title: 'Error', description: 'Please select a winner or draw.' });
        try {
            await sendEvent("update_match_status", { status: "completed", winner_id: winnerId === 'draw' ? null : winnerId });
            toast({ title: 'Match Ended!', description: 'The match has been moved to completed status.' });
            setIsEndMatchDialogOpen(false);
            onBack();
        } catch(error) {
            toast({ variant: 'destructive', title: 'Error', description: String(error) });
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
                             <Button size="sm" variant="ghost" onClick={handleUndo}><RotateCcw className="mr-2 h-4 w-4"/> Undo</Button>
                            <Badge className="animate-pulse">LIVE</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="pt-6 grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                                <div className="text-center space-y-2">
                                     <Avatar className="mx-auto h-16 w-16 mb-2"><AvatarFallback>{match.TeamA.team_name.substring(0, 2)}</AvatarFallback></Avatar>
                                    <h3 className="font-bold text-xl">{match.TeamA.team_name}</h3>
                                    <p className="text-6xl font-bold">{teamAScore}</p>
                                    <Button size="lg" onClick={() => handleScoreEvent(match.team_a_id)}>+ Point</Button>
                                </div>
                                <p className="text-4xl font-bold text-muted-foreground">vs</p>
                                <div className="text-center space-y-2">
                                     <Avatar className="mx-auto h-16 w-16 mb-2"><AvatarFallback>{match.TeamB.team_name.substring(0, 2)}</AvatarFallback></Avatar>
                                    <h3 className="font-bold text-xl">{match.TeamB.team_name}</h3>
                                    <p className="text-6xl font-bold">{teamBScore}</p>
                                    <Button size="lg" onClick={() => handleScoreEvent(match.team_b_id)}>+ Point</Button>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>Live Commentary</CardTitle></CardHeader>
                            <CardContent className="flex items-start gap-2">
                                <Textarea placeholder="What's happening in the match?" value={commentary} onChange={(e) => setCommentary(e.target.value)} />
                                <Button onClick={handleAddCommentary} disabled={isSubmittingCommentary} size="icon">
                                    {isSubmittingCommentary ? <Loader2 className="h-4 w-4 animate-spin"/> : <SendHorizone className="h-4 w-4" />}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <MatchTimer matchId={match.id} startTime={match.start_time} status={match.status} timerData={timerData} onTimerAction={handleTimerAction} />
                        <Card>
                            <CardHeader><CardTitle>Quick Log Event</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" onClick={() => openCardModal('yellow')}><Square className="mr-2 text-yellow-400 fill-current" /> Yellow Card</Button>
                                    <Button variant="outline" onClick={() => openCardModal('red')}><Square className="mr-2 text-red-500 fill-current" /> Red Card</Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Match Timeline</CardTitle></CardHeader>
                            <CardContent className="h-[300px] overflow-y-auto space-y-4 pr-2">
                                {events.length === 0 && <p className="text-muted-foreground text-center pt-10">No events logged yet.</p>}
                                {events.map((event, i) => <TimelineEvent key={event.id || i} event={event} match={match} />)}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button variant="destructive" onClick={() => setIsEndMatchDialogOpen(true)}>End Match</Button>
                </CardFooter>
            </Card>

            <PlayerSelectionDialog isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} teamA={teamA} teamB={teamB} onPlayerSelect={handleIssueCard} />
            
            <Dialog open={isEndMatchDialogOpen} onOpenChange={setIsEndMatchDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>End Match & Select Winner</DialogTitle>
                        <DialogDescription>Select the winning team to finalize the match. This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <RadioGroup onValueChange={setWinnerId} className="space-y-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value={match.team_a_id} id={`team-a-${match.id}`} /><Label htmlFor={`team-a-${match.id}`}>{match.TeamA.team_name}</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value={match.team_b_id} id={`team-b-${match.id}`} /><Label htmlFor={`team-b-${match.id}`}>{match.TeamB.team_name}</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="draw" id={`draw-${match.id}`} /><Label htmlFor={`draw-${match.id}`}>Match Draw</Label></div>
                        </RadioGroup>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button onClick={handleEndMatch} disabled={!winnerId}>Confirm & End Match</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
