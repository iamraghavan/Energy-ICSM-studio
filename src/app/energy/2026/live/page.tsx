
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Clapperboard, MapPin, Trophy, Goal, Square, Replace, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';


function TimelineEvent({ event, match }: { event: any, match: ApiMatch }) {
    const getEventDetails = (e: any) => {
        switch(e.event_type) {
            case 'goal':
            case 'point':
                return { icon: Goal, color: 'text-green-500 bg-green-500/10', title: 'Point Scored' };
            case 'yellow_card':
                return { icon: Square, color: 'text-yellow-400 bg-yellow-400/10', title: 'Yellow Card' };
            case 'red_card':
                return { icon: Square, color: 'text-red-500 bg-red-500/10', title: 'Red Card' };
            case 'substitution':
                return { icon: Replace, color: 'text-blue-500 bg-blue-500/10', title: 'Substitution' };
            case 'delivery':
                let title = `${e.runs || 0} run${e.runs !== 1 ? 's' : ''}`;
                if (e.is_wicket) title = 'WICKET!';
                if (e.extras > 0) title = `${e.extras} ${e.extra_type || 'extra'}`;
                return { icon: Trophy, color: 'text-gray-500 bg-gray-500/10', title: title, commentary: e.commentary };
            default:
                return { icon: Info, color: 'text-gray-500 bg-gray-500/10', title: e.event_type };
        }
    };

    const { icon: Icon, color, title, commentary } = getEventDetails(event);
    
    let teamName = '';
    if (event.team_id) {
        teamName = event.team_id === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name;
    } else if (event.batting_team_id) {
        teamName = event.batting_team_id === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name;
    }
    
    const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex items-start gap-3">
            <div className="text-xs text-muted-foreground pt-1.5">{time}</div>
            <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center", color)}>
                <Icon className="h-4 w-4" fill={['yellow_card', 'red_card'].includes(event.event_type) ? 'currentColor' : 'none'} />
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{commentary || teamName}</p>
            </div>
        </div>
    );
};

function DetailedLiveView({ matchId, initialMatches }: { matchId: string | null, initialMatches: ApiMatch[] }) {
    const [match, setMatch] = useState<ApiMatch | null>(null);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const selectedMatch = initialMatches.find(m => m.id === matchId) || null;
        setMatch(selectedMatch);

        if (!selectedMatch) {
            setEvents([]);
            return;
        }

        const initialEvents = selectedMatch.match_events || [];
        setEvents(Array.isArray(initialEvents) ? [...initialEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);

        if (socket.connected) {
            socket.emit("join_match", selectedMatch.id);
        } else {
            socket.on("connect", () => socket.emit("join_match", selectedMatch.id));
        }

        const handleScoreUpdate = (data: any) => {
            if (data.matchId === selectedMatch.id) {
                setMatch(prev => prev ? { ...prev, score_details: data.score } : null);
                if (data.event) {
                    setEvents(prev => [data.event, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                }
            }
        };

        const handleCricketUpdate = (data: any) => {
            if (data.matchId === selectedMatch.id) {
                setMatch(prev => prev ? { ...prev, score_details: data.score } : null);
                if (data.last_ball) {
                    setEvents(prev => [data.last_ball, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                }
            }
        };

        socket.on('score_updated', handleScoreUpdate);
        socket.on('cricket_score_update', handleCricketUpdate);

        return () => {
            if(selectedMatch.id) {
                socket.emit("leave_match", selectedMatch.id);
            }
            socket.off('score_updated', handleScoreUpdate);
            socket.off('cricket_score_update', handleCricketUpdate);
        };
    }, [matchId, initialMatches]);

    if (!match) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8 border rounded-lg bg-muted/50 min-h-[60vh]">
                <Clapperboard className="h-12 w-12 mb-4" />
                <p className="font-medium">Select a match to view details</p>
                <p className="text-sm">Live scores and events will appear here.</p>
            </div>
        );
    }

    const { TeamA, TeamB, Sport, status } = match;
    const isCricket = Sport.name === 'Cricket';
    const teamAScoreDetails = match.score_details?.[match.team_a_id];
    const teamBScoreDetails = match.score_details?.[match.team_b_id];

    const teamAScore = teamAScoreDetails?.runs ?? teamAScoreDetails?.score ?? 0;
    const teamBScore = teamBScoreDetails?.runs ?? teamBScoreDetails?.score ?? 0;
    
    const teamAScoreDisplay = `${teamAScore}${isCricket && teamAScoreDetails?.wickets !== undefined ? `/${teamAScoreDetails.wickets}` : ''}`;
    const teamBScoreDisplay = `${teamBScore}${isCricket && teamBScoreDetails?.wickets !== undefined ? `/${teamBScoreDetails.wickets}` : ''}`;

    const getResultText = () => {
        if (status === 'live') return 'Match is currently live';
        if (status === 'completed') {
            const winner = teamAScore > teamBScore ? TeamA.team_name : TeamB.team_name;
            const margin = Math.abs(teamAScore - teamBScore);
            return `${winner} won by ${margin} ${isCricket ? 'runs' : 'points'}`;
        }
        return 'Match scheduled';
    }


    return (
        <Card className="h-full flex flex-col">
            <CardContent className="pt-6 flex-1 flex flex-col min-h-0">
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{status}</p>
                <p className="text-sm text-muted-foreground">{Sport.name} - {match.venue}</p>

                <div className="my-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border"><AvatarFallback>{TeamA.team_name.slice(0,2)}</AvatarFallback></Avatar>
                            <span className="text-2xl font-bold">{TeamA.team_name}</span>
                        </div>
                        <div className="text-4xl font-bold font-mono">{teamAScoreDisplay}</div>
                    </div>
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border"><AvatarFallback>{TeamB.team_name.slice(0,2)}</AvatarFallback></Avatar>
                            <span className="text-2xl font-bold">{TeamB.team_name}</span>
                        </div>
                        <div className="text-4xl font-bold font-mono">{teamBScoreDisplay}</div>
                    </div>
                    {isCricket && (
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>({teamAScoreDetails?.overs?.toFixed(1) || '0.0'} ov)</span>
                             <span>({teamBScoreDetails?.overs?.toFixed(1) || '0.0'} ov)</span>
                        </div>
                    )}
                </div>

                 <p className="text-center font-semibold text-primary mb-6">{getResultText()}</p>

                <Tabs defaultValue="timeline" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="w-full">
                        <TabsTrigger value="timeline" className="flex-1">Live Timeline</TabsTrigger>
                        <TabsTrigger value="scorecard" className="flex-1" disabled>Scorecard</TabsTrigger>
                    </TabsList>
                    <TabsContent value="timeline" className="flex-1 mt-4 -mx-6 overflow-hidden">
                        <ScrollArea className="h-full px-6">
                            <div className="space-y-4">
                                {events.length > 0 ? (
                                    events.map((event, i) => <TimelineEvent key={i} event={event} match={match} />)
                                ) : (
                                    <p className="text-muted-foreground text-center py-8 text-sm">No match events logged yet...</p>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function SmallMatchCard({ match, onSelect, isSelected }: { match: ApiMatch, isSelected: boolean, onSelect: () => void }) {
    const isCricket = match.Sport.name === 'Cricket';
    const teamAScoreDetails = match.score_details?.[match.team_a_id];
    const teamBScoreDetails = match.score_details?.[match.team_b_id];

    const teamAScore = teamAScoreDetails?.runs ?? teamAScoreDetails?.score ?? 0;
    const teamBScore = teamBScoreDetails?.runs ?? teamBScoreDetails?.score ?? 0;
    
    const teamAScoreDisplay = `${teamAScore}${isCricket && teamAScoreDetails?.wickets !== undefined ? `/${teamAScoreDetails.wickets}` : ''}`;
    const teamBScoreDisplay = `${teamBScore}${isCricket && teamBScoreDetails?.wickets !== undefined ? `/${teamBScoreDetails.wickets}` : ''}`;

    return (
        <button
            onClick={onSelect}
            className={cn(
                "w-full h-full text-left p-3 rounded-lg transition-colors border",
                isSelected ? "ring-2 ring-primary bg-primary/5" : "bg-card hover:bg-muted/50"
            )}
        >
            <p className="text-xs text-muted-foreground">{match.Sport.name}</p>
            <div className="flex justify-between items-center mt-2 gap-2">
                <div className="space-y-1 flex-1">
                    <p className="font-semibold truncate flex items-center gap-2"><Avatar className="h-5 w-5 text-xs"><AvatarFallback>{match.TeamA.team_name.slice(0,2)}</AvatarFallback></Avatar>{match.TeamA.team_name}</p>
                    <p className="font-semibold truncate flex items-center gap-2"><Avatar className="h-5 w-5 text-xs"><AvatarFallback>{match.TeamB.team_name.slice(0,2)}</AvatarFallback></Avatar>{match.TeamB.team_name}</p>
                </div>
                 <div className="space-y-1 text-right font-mono font-semibold">
                    <p>{teamAScoreDisplay}</p>
                    <p>{teamBScoreDisplay}</p>
                </div>
            </div>
        </button>
    );
}

export default function LivePage() {
    const [liveMatches, setLiveMatches] = useState<ApiMatch[]>([]);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchLiveMatches = async () => {
        setIsLoading(true);
        try {
            const matches = await getLiveMatches();
            setLiveMatches(matches);
            if (!selectedMatchId || !matches.some(m => m.id === selectedMatchId)) {
                setSelectedMatchId(matches[0]?.id || null);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch live matches.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchLiveMatches();
        
        if (socket.connected) {
             socket.emit('join_room', 'live_overview');
        } else {
            socket.on('connect', () => socket.emit('join_room', 'live_overview'));
        }

        const onUpdate = (data: any) => {
            fetchLiveMatches();
        };
        
        socket.on('overview_update', onUpdate);
        socket.on('match_status_change', onUpdate);
        
        return () => {
            socket.emit('leave_room', 'live_overview');
            socket.off('overview_update', onUpdate);
            socket.off('match_status_change', onUpdate);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="container py-8 md:py-12 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Live Matches</CardTitle>
                    <CardDescription>Live scores and updates from ongoing matches.</CardDescription>
                </CardHeader>
                 <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-32 w-full" />
                    ) : liveMatches.length > 0 ? (
                         <Carousel
                            opts={{ align: "start" }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-2">
                                {liveMatches.map((match) => (
                                    <CarouselItem key={match.id} className="md:basis-1/2 lg:basis-1/3 pl-2">
                                        <div className="p-1">
                                            <SmallMatchCard 
                                                match={match} 
                                                onSelect={() => setSelectedMatchId(match.id)} 
                                                isSelected={selectedMatchId === match.id} 
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="ml-12" />
                            <CarouselNext className="mr-12" />
                        </Carousel>
                    ) : (
                         <div className="text-center py-16 text-muted-foreground border rounded-lg bg-muted/50">
                            <Clapperboard className="h-12 w-12 mx-auto mb-4" />
                            <p className="font-medium">No matches are currently live.</p>
                            <p className="text-sm">Check back soon for real-time updates!</p>
                        </div>
                    )}
                 </CardContent>
            </Card>
            
            <div className="min-h-[70vh]">
                 {isLoading ? (
                    <Skeleton className="h-[70vh] w-full" />
                 ) : liveMatches.length > 0 ? (
                    <DetailedLiveView matchId={selectedMatchId} initialMatches={liveMatches} />
                 ) : null}
            </div>
        </div>
    );
}
