
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLiveMatches, endMatch, postMatchEvent, type ApiMatch } from "@/lib/api";
import { io, type Socket } from 'socket.io-client';
import { ArrowLeft, Send, Timer as TimerIcon, Play, Pause, Futbol, Replace, Square, Info, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchCard } from './MatchCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const SOCKET_URL = 'https://energy-sports-meet-backend.onrender.com';

function MatchTimer({ startTime, status }: { startTime: string, status: 'live' | 'scheduled' | 'completed' }) {
    const [elapsedTime, setElapsedTime] = useState('00:00');
    
    useEffect(() => {
        if (status !== 'live') {
            setElapsedTime('00:00');
            return;
        };

        const matchStartTime = new Date(startTime).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - matchStartTime;

            if (diff < 0) {
                setElapsedTime('00:00');
                return;
            }

            const minutes = Math.floor(diff / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setElapsedTime(
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [status, startTime]);

    return (
        <div className="text-5xl font-bold font-mono text-center">{elapsedTime}</div>
    );
}


function ScoringInterface({ match, onBack }: { match: ApiMatch, onBack: () => void }) {
    const [score, setScore] = useState(match.score_details || {});
    const [events, setEvents] = useState<any[]>([]);
    const [selectedTeamForEvent, setSelectedTeamForEvent] = useState<string>(match.team_a_id);
    const { toast } = useToast();
    const [isEndMatchDialogOpen, setIsEndMatchDialogOpen] = useState(false);
    const [winnerId, setWinnerId] = useState<string | null>(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);

        newSocket.on('connect', () => {
            newSocket.emit('join_match', match.id);
        });

        newSocket.on('match_event', (data) => {
            if (data.matchId === match.id) {
                setScore(data.score);
                setEvents(prev => [data.event, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            }
        });

        newSocket.on('score_updated', (data) => {
             if (data.matchId === match.id) {
                setScore(data.score_details);
            }
        })

        return () => {
            newSocket.disconnect();
        };
    }, [match.id, toast]);
    
    const handleEvent = async (eventType: string, teamId: string, details: any = {}) => {
        const eventData: any = {
            event_type: eventType,
            team_id: teamId,
            details
        };
        
        if (eventType === 'goal') {
            eventData.key = 'goals';
            eventData.value = 1;
        }

        try {
            await postMatchEvent(match.id, eventData);
            toast({ title: "Event Sent!", description: `${eventType} logged for ${teamId === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name}` });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to send event.' });
        }
    };


    const handleEndMatch = async () => {
        if (!winnerId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a winner or draw.' });
            return;
        }
        try {
            await endMatch(match.id, winnerId === 'draw' ? null : winnerId);
            toast({ title: 'Match Ended', description: 'The match has been moved to completed status.' });
            setIsEndMatchDialogOpen(false);
            onBack();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to end the match.' });
        }
    };
    
    const scoreA = (score[match.team_a_id] as any)?.goals ?? score.team_a ?? 0;
    const scoreB = (score[match.team_b_id] as any)?.goals ?? score.team_b ?? 0;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <CardTitle>Live Scoring: {match.Sport.name}</CardTitle>
                            <CardDescription>{match.referee_name ? `Referee: ${match.referee_name}` : 'No referee assigned'}</CardDescription>
                        </div>
                        <Badge className="ml-auto animate-pulse">LIVE</Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="pt-6 grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                                <div className="text-center space-y-2">
                                     <Avatar className="mx-auto h-16 w-16 mb-2">
                                        <AvatarFallback>{match.TeamA.team_name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-bold text-2xl">{match.TeamA.team_name}</h3>
                                    <p className="text-6xl font-bold">{scoreA}</p>
                                    <Button size="lg" onClick={() => handleEvent('goal', match.team_a_id)}>+ Goal</Button>
                                </div>
                                <p className="text-4xl font-bold text-muted-foreground">vs</p>
                                <div className="text-center space-y-2">
                                     <Avatar className="mx-auto h-16 w-16 mb-2">
                                        <AvatarFallback>{match.TeamB.team_name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-bold text-2xl">{match.TeamB.team_name}</h3>
                                    <p className="text-6xl font-bold">{scoreB}</p>
                                    <Button size="lg" onClick={() => handleEvent('goal', match.team_b_id)}>+ Goal</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Quick Log Event</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="mb-2 block">Select Team for Event</Label>
                                    <RadioGroup value={selectedTeamForEvent} onValueChange={setSelectedTeamForEvent} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value={match.team_a_id} id={`team-a-${match.id}-event`} />
                                            <Label htmlFor={`team-a-${match.id}-event`}>{match.TeamA.team_name}</Label>
                                        </div>
                                         <div className="flex items-center space-x-2">
                                            <RadioGroupItem value={match.team_b_id} id={`team-b-${match.id}-event`} />
                                            <Label htmlFor={`team-b-${match.id}-event`}>{match.TeamB.team_name}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" onClick={() => handleEvent('yellow_card', selectedTeamForEvent)}>
                                        <Square className="mr-2 text-yellow-400 fill-current" /> Yellow Card
                                    </Button>
                                    <Button variant="outline" onClick={() => handleEvent('red_card', selectedTeamForEvent)}>
                                        <Square className="mr-2 text-red-500 fill-current" /> Red Card
                                    </Button>
                                    <Button variant="outline" onClick={() => handleEvent('substitution', selectedTeamForEvent)}>
                                        <Replace className="mr-2" /> Substitution
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Match Time</CardTitle>
                                <TimerIcon className="h-4 w-4 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <MatchTimer startTime={match.start_time} status={match.status} />
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Button variant="outline" size="icon" disabled><Pause className="h-4 w-4"/></Button>
                                    <Button variant="outline" size="icon" disabled><Play className="h-4 w-4"/></Button>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader><CardTitle>Match Timeline</CardTitle></CardHeader>
                            <CardContent className="h-[300px] overflow-y-auto space-y-4 pr-2">
                                {events.length === 0 && <p className="text-muted-foreground text-center pt-10">No events logged yet.</p>}
                                {events.map((event, i) => <TimelineEvent key={i} event={event} match={match} />)}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button variant="destructive" onClick={() => setIsEndMatchDialogOpen(true)}>End Match</Button>
                </CardFooter>
            </Card>

            <Dialog open={isEndMatchDialogOpen} onOpenChange={setIsEndMatchDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>End Match & Select Winner</DialogTitle>
                        <DialogDescription>
                            Select the winning team to finalize the match. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <RadioGroup onValueChange={setWinnerId} className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={match.team_a_id} id={`team-a-${match.id}`} />
                                <Label htmlFor={`team-a-${match.id}`}>{match.TeamA.team_name}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={match.team_b_id} id={`team-b-${match.id}`} />
                                <Label htmlFor={`team-b-${match.id}`}>{match.TeamB.team_name}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="draw" id={`draw-${match.id}`} />
                                <Label htmlFor={`draw-${match.id}`}>Match Draw</Label>
                            </div>
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

const TimelineEvent = ({ event, match }: { event: any, match: ApiMatch }) => {
    const getEventDetails = (e: any) => {
        switch(e.event_type) {
            case 'goal':
                return { icon: Futbol, color: 'text-green-500 bg-green-500/10', title: 'Goal' };
            case 'yellow_card':
                return { icon: Square, color: 'text-yellow-400 bg-yellow-400/10', title: 'Yellow Card' };
            case 'red_card':
                return { icon: Square, color: 'text-red-500 bg-red-500/10', title: 'Red Card' };
            case 'substitution':
                return { icon: Replace, color: 'text-blue-500 bg-blue-500/10', title: 'Substitution' };
            default:
                return { icon: Info, color: 'text-gray-500 bg-gray-500/10', title: e.event_type };
        }
    };

    const { icon: Icon, color, title } = getEventDetails(event);
    const teamName = event.team_id === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name;
    const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex items-start gap-3">
            <div className="text-xs text-muted-foreground pt-1.5">{time}</div>
            <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center", color)}>
                <Icon className="h-4 w-4" fill={['yellow_card', 'red_card'].includes(event.event_type) ? 'currentColor' : 'none'} />
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{teamName}</p>
            </div>
        </div>
    );
};


export function LiveScoring() {
    const [liveFixtures, setLiveFixtures] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<ApiMatch | null>(null);
    const { toast } = useToast();

    const fetchLiveMatches = async () => {
        setIsLoading(true);
        try {
            const matches = await getLiveMatches();
            setLiveFixtures(matches);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch live matches.' });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchLiveMatches();
    }, []);

    if (selectedMatch) {
        return <ScoringInterface match={selectedMatch} onBack={() => {
            setSelectedMatch(null);
            fetchLiveMatches();
        }} />;
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle>Live Matches</CardTitle>
                <CardDescription>Select a match to start live scoring.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                {!isLoading && liveFixtures.length > 0 ? (
                    liveFixtures.map(match => (
                       <MatchCard key={match.id} match={match}>
                           <Button onClick={() => setSelectedMatch(match)}>Start Scoring</Button>
                       </MatchCard>
                    ))
                ) : (
                    !isLoading && <p className="text-muted-foreground text-center py-8">No matches are currently live.</p>
                )}
            </CardContent>
        </Card>
    );
}
