'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Clapperboard, MapPin, Trophy, Goal, Square, Replace, Info, Radio } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// --- Timeline Event Component (from existing code, seems fine) ---
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

// --- Detailed View inside a Dialog ---
function MatchDetailsDialog({ match: initialMatch, isOpen, onClose }: { match: ApiMatch | null, isOpen: boolean, onClose: () => void }) {
    const [match, setMatch] = useState<ApiMatch | null>(initialMatch);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        if (!initialMatch) return;
        
        setMatch(initialMatch);
        const initialEvents = initialMatch.match_events || [];
        setEvents(Array.isArray(initialEvents) ? [...initialEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);

        if (socket.connected) {
            socket.emit("join_match", initialMatch.id);
        } else {
            socket.on("connect", () => socket.emit("join_match", initialMatch.id));
        }

        const handleScoreUpdate = (data: any) => {
            if (data.matchId === initialMatch.id) {
                setMatch(prev => prev ? { ...prev, score_details: data.score } : null);
                if (data.event) {
                    setEvents(prev => [data.event, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                }
            }
        };

        const handleCricketUpdate = (data: any) => {
            if (data.matchId === initialMatch.id) {
                setMatch(prev => prev ? { ...prev, score_details: data.score } : null);
                if (data.last_ball) {
                    setEvents(prev => [data.last_ball, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                }
            }
        };

        socket.on('score_updated', handleScoreUpdate);
        socket.on('cricket_score_update', handleCricketUpdate);

        return () => {
            if(initialMatch.id) {
                socket.emit("leave_match", initialMatch.id);
            }
            socket.off('score_updated', handleScoreUpdate);
            socket.off('cricket_score_update', handleCricketUpdate);
        };
    }, [initialMatch]);

    if (!isOpen || !match) {
        return null;
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                 <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">{TeamA.team_name} vs {TeamB.team_name}</DialogTitle>
                    <DialogDescription>{Sport.name} - {match.venue}</DialogDescription>
                 </DialogHeader>

                <div className="grid grid-cols-2 gap-4 items-center text-center my-4">
                     <div>
                        <Avatar className="h-16 w-16 mx-auto border-2 border-primary"><AvatarFallback>{TeamA.team_name.slice(0,2)}</AvatarFallback></Avatar>
                        <p className="font-semibold mt-2">{TeamA.team_name}</p>
                    </div>
                     <div>
                        <Avatar className="h-16 w-16 mx-auto border-2 border-primary"><AvatarFallback>{TeamB.team_name.slice(0,2)}</AvatarFallback></Avatar>
                        <p className="font-semibold mt-2">{TeamB.team_name}</p>
                    </div>
                </div>

                <div className="flex items-center justify-around bg-muted p-4 rounded-lg">
                    <div className="text-4xl font-bold font-mono">{teamAScoreDisplay}</div>
                    <div className="text-center">
                        <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                         <p className="text-xs text-muted-foreground mt-1">{getResultText()}</p>
                    </div>
                    <div className="text-4xl font-bold font-mono">{teamBScoreDisplay}</div>
                </div>

                {isCricket && (
                    <div className="flex justify-between items-center text-sm text-muted-foreground px-4">
                        <span>({teamAScoreDetails?.overs?.toFixed(1) || '0.0'} ov)</span>
                        <span>({teamBScoreDetails?.overs?.toFixed(1) || '0.0'} ov)</span>
                    </div>
                )}

                <Tabs defaultValue="timeline" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="w-full">
                        <TabsTrigger value="timeline" className="flex-1">Live Timeline</TabsTrigger>
                        <TabsTrigger value="scorecard" className="flex-1" disabled>Scorecard</TabsTrigger>
                    </TabsList>
                    <TabsContent value="timeline" className="mt-4">
                        <ScrollArea className="h-64 pr-4">
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
            </DialogContent>
        </Dialog>
    );
}

// --- New Live Match Card Component ---
function LiveMatchCard({ match, onSelect }: { match: ApiMatch, onSelect: () => void }) {
    const isCricket = match.Sport.name === 'Cricket';
    const teamAScoreDetails = match.score_details?.[match.team_a_id];
    const teamBScoreDetails = match.score_details?.[match.team_b_id];

    const teamAScore = teamAScoreDetails?.runs ?? teamAScoreDetails?.score ?? 0;
    const teamBScore = teamBScoreDetails?.runs ?? teamBScoreDetails?.score ?? 0;
    
    const teamAScoreDisplay = `${teamAScore}${isCricket && teamAScoreDetails?.wickets !== undefined ? `/${teamAScoreDetails.wickets}` : ''}`;
    const teamBScoreDisplay = `${teamBScore}${isCricket && teamBScoreDetails?.wickets !== undefined ? `/${teamBScoreDetails.wickets}` : ''}`;

    return (
        <Card onClick={onSelect} className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-normal text-muted-foreground">{match.Sport.name}</CardTitle>
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <Radio className="h-3 w-3 animate-pulse" />
                        LIVE
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">{match.TeamA.team_name}</span>
                        <span className="font-bold font-mono">{teamAScoreDisplay}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="font-semibold">{match.TeamB.team_name}</span>
                        <span className="font-bold font-mono">{teamBScoreDisplay}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


// --- Main Page Component ---
export default function LivePage() {
    const [liveMatches, setLiveMatches] = useState<ApiMatch[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<ApiMatch | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchLiveMatches = async () => {
        setIsLoading(true);
        try {
            const matches = await getLiveMatches();
            setLiveMatches(matches);
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
        <>
            <div className="container py-8 md:py-12 space-y-8">
                <Card className="bg-primary/5">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Live Matches</CardTitle>
                        <CardDescription>Live scores and updates from ongoing matches. Click on a card to see details.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        {isLoading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                            </div>
                        ) : liveMatches.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {liveMatches.map((match) => (
                                    <LiveMatchCard 
                                        key={match.id} 
                                        match={match} 
                                        onSelect={() => setSelectedMatch(match)} 
                                    />
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Clapperboard className="h-12 w-12 mx-auto mb-4" />
                                <p className="font-medium">No matches are currently live.</p>
                                <p className="text-sm">Check back soon for real-time updates!</p>
                            </div>
                        )}
                     </CardContent>
                </Card>
            </div>
            
             <MatchDetailsDialog 
                isOpen={!!selectedMatch}
                match={selectedMatch}
                onClose={() => setSelectedMatch(null)}
             />
        </>
    );
}
