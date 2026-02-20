
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


function MatchListItem({ match, isSelected, onSelect }: { match: ApiMatch, isSelected: boolean, onSelect: () => void }) {
    const teamAScore = match.score_details?.[match.team_a_id]?.score ?? match.score_details?.[match.team_a_id]?.runs ?? 0;
    const teamBScore = match.score_details?.[match.team_b_id]?.score ?? match.score_details?.[match.team_b_id]?.runs ?? 0;
    const isCricket = match.Sport.name === 'Cricket';
    
    return (
        <button
            onClick={onSelect}
            className={cn(
                "w-full text-left border p-3 rounded-lg transition-colors hover:bg-muted/80",
                isSelected && "bg-muted ring-2 ring-primary"
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold truncate">{match.TeamA.team_name} vs {match.TeamB.team_name}</p>
                    <p className="text-xs text-muted-foreground">{match.Sport.name}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-bold font-mono text-lg">{teamAScore} - {teamBScore}</p>
                    <Badge className="animate-pulse h-5">LIVE</Badge>
                </div>
            </div>
        </button>
    );
}

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

        setEvents(selectedMatch.match_events?.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || []);

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
            socket.emit("leave_match", selectedMatch.id);
            socket.off('score_updated', handleScoreUpdate);
            socket.off('cricket_score_update', handleCricketUpdate);
        };
    }, [matchId, initialMatches]);

    if (!match) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8 border rounded-lg bg-muted/50">
                <Clapperboard className="h-12 w-12 mb-4" />
                <p className="font-medium">Select a match to view details</p>
                <p className="text-sm">Live scores and events will appear here.</p>
            </div>
        );
    }

    const { TeamA, TeamB, Sport } = match;
    const isCricket = Sport.name === 'Cricket';
    const teamAScore = match.score_details?.[match.team_a_id];
    const teamBScore = match.score_details?.[match.team_b_id];

    return (
        <div className="border rounded-lg h-full flex flex-col">
            <div className="p-4 border-b">
                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                    <div className="text-center space-y-1">
                        <h3 className="font-bold text-lg">{TeamA.team_name}</h3>
                        <p className="text-4xl font-bold">{teamAScore?.runs ?? teamAScore?.score ?? 0}{isCricket && teamAScore?.wickets !== undefined ? `/${teamAScore.wickets}` : ''}</p>
                        {isCricket && <p className="text-xs text-muted-foreground">({teamAScore?.overs?.toFixed(1) || '0.0'} Overs)</p>}
                    </div>
                     <p className="text-2xl font-bold text-muted-foreground">vs</p>
                    <div className="text-center space-y-1">
                        <h3 className="font-bold text-lg">{TeamB.team_name}</h3>
                        <p className="text-4xl font-bold">{teamBScore?.runs ?? teamBScore?.score ?? 0}{isCricket && teamBScore?.wickets !== undefined ? `/${teamBScore.wickets}` : ''}</p>
                         {isCricket && <p className="text-xs text-muted-foreground">({teamBScore?.overs?.toFixed(1) || '0.0'} Overs)</p>}
                    </div>
                </div>
                 <div className="flex items-center justify-center gap-x-4 text-sm text-muted-foreground mt-3">
                     <div className="flex items-center gap-2"><Trophy className="w-4 h-4" /><span>{Sport.name}</span></div>
                     <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{match.venue}</span></div>
                 </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                 <h4 className="font-semibold mb-4">Match Timeline</h4>
                 <div className="space-y-4">
                    {events.length > 0 ? (
                        events.map((event, i) => <TimelineEvent key={i} event={event} match={match} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-8 text-sm">No match events logged yet...</p>
                    )}
                 </div>
            </div>
        </div>
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
            // If no match is selected, or selected match is no longer live, select the first one.
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
        <div className="container py-8 md:py-12">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Live Matches</CardTitle>
                    <CardDescription>Live scores and updates from ongoing matches.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-[60vh] w-full" />
                    ) : liveMatches.length > 0 ? (
                        <div className="grid lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-1 space-y-3 lg:h-[65vh] lg:overflow-y-auto pr-2">
                                {liveMatches.map(match => (
                                    <MatchListItem
                                        key={match.id}
                                        match={match}
                                        isSelected={selectedMatchId === match.id}
                                        onSelect={() => setSelectedMatchId(match.id)}
                                    />
                                ))}
                            </div>
                            <div className="lg:col-span-2 lg:h-[65vh]">
                                <DetailedLiveView matchId={selectedMatchId} initialMatches={liveMatches} />
                            </div>
                        </div>
                    ) : (
                         <div className="text-center py-24 text-muted-foreground border rounded-lg bg-muted/50">
                            <Clapperboard className="h-12 w-12 mx-auto mb-4" />
                            <p className="font-medium">No matches are currently live.</p>
                            <p className="text-sm">Check back soon for real-time updates!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

