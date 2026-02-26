
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Clapperboard, MapPin, Trophy, Goal, Square, Replace, Info, Radio, Shield, Clock, ArrowRight, Activity } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- Timeline Event Component ---
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
                
                // Enhanced cricket commentary
                let commentary = e.commentary;
                if (!commentary && e.striker_name && e.bowler_name) {
                    commentary = `${e.striker_name} scores ${e.runs} run${e.runs !== 1 ? 's' : ''} off ${e.bowler_name}`;
                    if (e.is_wicket) commentary = `${e.striker_name} is OUT! Bowled by ${e.bowler_name}`;
                }
                
                return { icon: Trophy, color: 'text-blue-500 bg-blue-500/10', title: title, commentary };
            default:
                return { icon: Info, color: 'text-gray-500 bg-gray-500/10', title: e.event_type || 'Match Update' };
        }
    };

    const { icon: Icon, color, title, commentary } = getEventDetails(event);
    
    let teamName = '';
    if (event.team_id) {
        teamName = event.team_id === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name;
    } else if (event.batting_team_id) {
        teamName = event.batting_team_id === match.team_a_id ? match.TeamA.team_name : match.TeamB.team_name;
    }
    
    const time = event.timestamp ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"
        >
            <div className="text-[10px] font-mono text-muted-foreground pt-1.5 w-12 shrink-0">{time}</div>
            <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center", color)}>
                <Icon className="h-4 w-4" fill={['yellow_card', 'red_card'].includes(event.event_type) ? 'currentColor' : 'none'} />
            </div>
            <div className="flex-grow">
                <p className="text-sm font-bold leading-tight">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{commentary || teamName}</p>
            </div>
        </motion.div>
    );
};

// --- Detailed View inside a Dialog ---
function MatchDetailsDialog({ match: initialMatch, isOpen, onClose }: { match: ApiMatch | null, isOpen: boolean, onClose: () => void }) {
    const [match, setMatch] = useState<ApiMatch | null>(initialMatch);
    const [events, setEvents] = useState<any[]>([]);
    const socket = getSocket();

    const processNewEvents = useCallback((newEventData: any | any[]) => {
        if (!newEventData) return;
        setEvents(prev => {
            const currentEvents = Array.isArray(prev) ? prev : [];
            const newEventsArr = Array.isArray(newEventData) ? newEventData : [newEventData];
            
            const validNewEvents = newEventsArr.filter(e => e && typeof e === 'object');
            if (validNewEvents.length === 0) return currentEvents;

            const existingMap = new Map(currentEvents.map(e => [e.id || `${e.timestamp}-${e.event_type}`, e]));
            validNewEvents.forEach(e => existingMap.set(e.id || `${e.timestamp}-${e.event_type}`, e));
            
            return Array.from(existingMap.values()).sort((a,b) => {
                const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return timeB - timeA;
            });
        });
    }, []);

    useEffect(() => {
        if (!initialMatch || !isOpen) return;
        
        setMatch(initialMatch);
        const initialEvents = Array.isArray(initialMatch.match_events) ? initialMatch.match_events : [];
        setEvents(initialEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

        const onConnect = () => socket.emit("join_match", initialMatch.id);
        
        if (socket.connected) onConnect();
        else socket.on("connect", onConnect);

        const handleScoreUpdate = (data: any) => {
            if (data.matchId === initialMatch.id) {
                setMatch(prev => prev ? { ...prev, score_details: data.score || data.scoreDetails } : null);
                if (data.event) processNewEvents(data.event);
            }
        };

        const handleCricketUpdate = (data: any) => {
            if (data.matchId === initialMatch.id) {
                setMatch(prev => prev ? { 
                    ...prev, 
                    score_details: data.score || data.scoreDetails,
                    match_state: data.state || prev.match_state
                } : null);
                if (data.last_ball) processNewEvents(data.last_ball);
            }
        };

        socket.on('score_updated', handleScoreUpdate);
        socket.on('cricket_score_update', handleCricketUpdate);

        return () => {
            if(initialMatch.id) socket.emit("leave_match", initialMatch.id);
            socket.off('score_updated', handleScoreUpdate);
            socket.off('cricket_score_update', handleCricketUpdate);
            socket.off("connect", onConnect);
        };
    }, [initialMatch, isOpen, socket, processNewEvents]);

    if (!isOpen || !match) return null;

    const { TeamA, TeamB, Sport, status } = match;
    const isCricket = Sport.name === 'Cricket';
    const scoreDetails = match.score_details || {};
    const teamAScoreData = scoreDetails[match.team_a_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    const teamBScoreData = scoreDetails[match.team_b_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };

    const teamAScore = teamAScoreData.runs ?? teamAScoreData.score ?? 0;
    const teamBScore = teamBScoreData.runs ?? teamBScoreData.score ?? 0;
    
    const getResultText = () => {
        if (status === 'live') return 'Match In Progress';
        if (status === 'completed') {
            const winner = teamAScore > teamBScore ? TeamA.team_name : TeamB.team_name;
            const margin = Math.abs(teamAScore - teamBScore);
            return `${winner} won by ${margin} ${isCricket ? 'runs' : 'points'}`;
        }
        return 'Match scheduled';
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>{TeamA.team_name} vs {TeamB.team_name} - {Sport.name}</DialogTitle>
                    <DialogDescription>Live Match Center for {TeamA.team_name} vs {TeamB.team_name}. Ball-by-ball updates and scores.</DialogDescription>
                </DialogHeader>

                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl"><Trophy className="h-5 w-5 text-white" /></div>
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase tracking-widest leading-none">{Sport.name}</h3>
                            <div className="flex items-center gap-1.5 text-white/60 text-[10px] mt-1 font-bold uppercase">
                                <MapPin className="h-3 w-3" /> {match.venue}
                            </div>
                        </div>
                    </div>
                    {status === 'live' ? (
                        <Badge variant="destructive" className="animate-pulse px-3 py-1 font-black text-[10px] tracking-widest">LIVE</Badge>
                    ) : (
                        <Badge variant="outline" className="text-white border-white/20 px-3 py-1 font-black text-[10px] tracking-widest uppercase">{status}</Badge>
                    )}
                </div>

                <div className="bg-muted/30 p-6 sm:p-10 border-b">
                    <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-8">
                            <div className="text-center space-y-4">
                                <p className="font-black text-xs sm:text-sm uppercase tracking-tight text-balance leading-tight min-h-[2.5rem] flex items-center justify-center">{TeamA.team_name}</p>
                                <div className="space-y-1">
                                    <p className="text-4xl sm:text-6xl font-black font-mono tracking-tighter">
                                        {teamAScore}{isCricket && <span className="text-2xl sm:text-3xl text-muted-foreground">/{teamAScoreData.wickets ?? 0}</span>}
                                    </p>
                                    {isCricket && <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">({(teamAScoreData.overs ?? 0.0).toFixed(1)} Ov)</p>}
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2"><div className="h-12 w-[2px] bg-border" /><span className="text-[10px] font-black text-muted-foreground uppercase bg-background px-2 py-1 rounded-full border">VS</span><div className="h-12 w-[2px] bg-border" /></div>
                            <div className="text-center space-y-4">
                                <p className="font-black text-xs sm:text-sm uppercase tracking-tight text-balance leading-tight min-h-[2.5rem] flex items-center justify-center">{TeamB.team_name}</p>
                                <div className="space-y-1">
                                    <p className="text-4xl sm:text-6xl font-black font-mono tracking-tighter">
                                        {teamBScore}{isCricket && <span className="text-2xl sm:text-3xl text-muted-foreground">/{teamBScoreData.wickets ?? 0}</span>}
                                    </p>
                                    {isCricket && <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">({(teamBScoreData.overs ?? 0.0).toFixed(1)} Ov)</p>}
                                </div>
                            </div>
                        </div>
                        <div className="bg-background rounded-2xl border-2 p-3 text-center">
                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary italic">{getResultText()}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <Tabs defaultValue="timeline" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-2xl h-12">
                            <TabsTrigger value="timeline" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:shadow-lg">Action Timeline</TabsTrigger>
                            <TabsTrigger value="info" className="rounded-xl font-bold text-xs uppercase tracking-widest">Match Info</TabsTrigger>
                        </TabsList>
                        <TabsContent value="timeline" className="mt-6">
                            <ScrollArea className="h-64 pr-4">
                                <div className="space-y-2">
                                    <AnimatePresence initial={false}>
                                    {events.length > 0 ? (
                                        events.map((event, i) => <TimelineEvent key={event.id || `${event.timestamp}-${i}`} event={event} match={match} />)
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-3">
                                            <Activity className="h-8 w-8 opacity-20 animate-pulse" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Waiting for first action...</p>
                                        </div>
                                    )}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="info" className="mt-6 space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-xl bg-muted/50">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Venue</p>
                                    <p className="font-bold">{match.venue}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-muted/50">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Time</p>
                                    <p className="font-bold">{format(new Date(match.start_time), 'p')}</p>
                                </div>
                            </div>
                            {match.referee_name && (
                                <div className="p-3 rounded-xl bg-muted/50">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Match Official</p>
                                    <p className="font-bold">{match.referee_name}</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// LiveMatchCard component
function LiveMatchCard({ match, onSelect }: { match: ApiMatch, onSelect: () => void }) {
    const { TeamA, TeamB, Sport, status, venue, score_details, match_events } = match;
    const isCricket = Sport.name === 'Cricket';

    const scoreA = score_details?.[match.team_a_id];
    const scoreB = score_details?.[match.team_b_id];
    
    // Get last action for display on card
    const lastEvent = Array.isArray(match_events) && match_events.length > 0 ? match_events[0] : null;

    const renderScore = (score: any) => {
        if (isCricket) {
            return (
                <div className="flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black font-mono">{score?.runs ?? 0}</span>
                        <span className="text-sm text-muted-foreground font-bold">/{score?.wickets ?? 0}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">({(score?.overs ?? 0.0).toFixed(1)} Ov)</span>
                </div>
            );
        }
        return <div className="text-3xl font-black font-mono">{score?.score ?? score?.runs ?? 0}</div>;
    };

    return (
        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
            <Card onClick={onSelect} className="cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl bg-card/50 backdrop-blur-sm group">
                <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1.5 rounded-md"><Trophy className="h-4 w-4 text-primary" /></div>
                            <span className="font-bold text-xs uppercase tracking-widest text-primary">{Sport.name}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] gap-1 px-2 border-muted-foreground/20"><MapPin className="h-3 w-3" /> {venue}</Badge>
                    </div>

                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center mb-4">
                        <div className="space-y-3 text-center">
                            <p className="font-black text-[11px] uppercase leading-tight min-h-[2.5rem] flex items-center justify-center px-1">{TeamA.team_name}</p>
                            {renderScore(scoreA)}
                        </div>
                        <div className="flex flex-col items-center gap-1"><div className="h-10 w-[1px] bg-border" /><span className="text-[9px] font-black text-muted-foreground uppercase">VS</span><div className="h-10 w-[1px] bg-border" /></div>
                        <div className="space-y-3 text-center">
                            <p className="font-black text-[11px] uppercase leading-tight min-h-[2.5rem] flex items-center justify-center px-1">{TeamB.team_name}</p>
                            {renderScore(scoreB)}
                        </div>
                    </div>
                    
                    {lastEvent && status === 'live' && (
                        <div className="bg-muted/50 rounded-lg p-2 flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-bottom-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                            <p className="text-[10px] font-bold text-muted-foreground truncate italic">
                                Last Action: {lastEvent.event_type === 'delivery' ? `${lastEvent.runs} runs` : lastEvent.event_type}
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-5 py-3 border-t bg-muted/30 flex justify-between items-center group-hover:bg-primary/[0.03] transition-colors">
                    <div className="flex items-center gap-2">
                        {status === 'live' ? (
                            <div className="flex items-center gap-1.5 text-destructive font-black text-[10px] tracking-widest">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                                </span>
                                LIVE
                            </div>
                        ) : (
                            <div className="text-muted-foreground font-black text-[10px] tracking-widest uppercase flex items-center gap-1"><Clock className="h-3 w-3" /> {status}</div>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground group-hover:text-primary transition-colors">Match Center <ArrowRight className="h-3 w-3" /></div>
                </div>
            </Card>
        </motion.div>
    );
}

// --- Main Page Component ---
export default function LivePage() {
    const [liveMatches, setLiveMatches] = useState<ApiMatch[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<ApiMatch | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const socket = getSocket();

    const fetchLiveMatches = async () => {
        try {
            const matches = await getLiveMatches();
            setLiveMatches(matches);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch matches.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchLiveMatches();
        
        const onConnect = () => socket.emit('join_room', 'live_overview');
        if (socket.connected) onConnect();
        else socket.on("connect", onConnect);

        const onUpdate = () => fetchLiveMatches();
        
        socket.on('overview_update', onUpdate);
        socket.on('match_status_change', onUpdate);
        socket.on('score_updated', onUpdate);
        socket.on('cricket_score_update', onUpdate);
        
        return () => {
            socket.emit('leave_room', 'live_overview');
            socket.off('overview_update', onUpdate);
            socket.off('match_status_change', onUpdate);
            socket.off('score_updated', onUpdate);
            socket.off('cricket_score_update', onUpdate);
            socket.off('connect', onConnect);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className="container py-8 md:py-16 space-y-12 text-foreground">
                 <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <Badge className="px-4 py-1 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                        <Radio className="h-3 w-3 mr-2 animate-pulse" /> Live Now
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-primary uppercase italic">Match Center</h1>
                    <p className="text-lg text-muted-foreground">Get real-time scores, ball-by-ball updates, and instant notifications from Energy 2026 matches.</p>
                </div>

                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
                        </div>
                    ) : liveMatches.length > 0 ? (
                         <AnimatePresence>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {liveMatches.map((match) => (
                                    <LiveMatchCard key={match.id} match={match} onSelect={() => setSelectedMatch(match)} />
                                ))}
                            </div>
                         </AnimatePresence>
                    ) : (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/20">
                            <Activity className="h-16 w-16 mx-auto mb-6 text-muted-foreground/40" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-2">No Active Battles</h3>
                            <p className="max-w-xs mx-auto text-sm">Matches will appear here as soon as they go live. Stay tuned for the action!</p>
                        </motion.div>
                    )}
                </div>
            </div>
            
             <MatchDetailsDialog isOpen={!!selectedMatch} match={selectedMatch} onClose={() => setSelectedMatch(null)} />
        </>
    );
}
