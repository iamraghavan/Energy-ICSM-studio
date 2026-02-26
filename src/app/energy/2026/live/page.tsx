'use client';
import { useState, useEffect } from 'react';
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
        <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3"
        >
            <div className="text-xs text-muted-foreground pt-1.5">{time}</div>
            <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center", color)}>
                <Icon className="h-4 w-4" fill={['yellow_card', 'red_card'].includes(event.event_type) ? 'currentColor' : 'none'} />
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{commentary || teamName}</p>
            </div>
        </motion.div>
    );
};

// --- Detailed View inside a Dialog ---
function MatchDetailsDialog({ match: initialMatch, isOpen, onClose }: { match: ApiMatch | null, isOpen: boolean, onClose: () => void }) {
    const [match, setMatch] = useState<ApiMatch | null>(initialMatch);
    const [events, setEvents] = useState<any[]>([]);
    const socket = getSocket();

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
    }, [initialMatch, socket]);

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
            <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                {/* Header / Info Bar */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl">
                            <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase tracking-widest leading-none">{Sport.name}</h3>
                            <div className="flex items-center gap-1.5 text-white/60 text-[10px] mt-1 font-bold uppercase">
                                <MapPin className="h-3 w-3" /> {match.venue}
                            </div>
                        </div>
                    </div>
                    {status === 'live' ? (
                        <Badge variant="destructive" className="animate-pulse px-3 py-1 font-black text-[10px] tracking-widest">
                            LIVE
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-white border-white/20 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                            {status}
                        </Badge>
                    )}
                </div>

                {/* Scoreboard Area */}
                <div className="bg-muted/30 p-6 sm:p-10 border-b">
                    <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-8">
                            {/* Team A */}
                            <div className="text-center space-y-4">
                                <p className="font-black text-xs sm:text-sm uppercase tracking-tight text-balance leading-tight min-h-[2.5rem] flex items-center justify-center">
                                    {TeamA.team_name}
                                </p>
                                <div className="space-y-1">
                                    <p className="text-4xl sm:text-6xl font-black font-mono tracking-tighter">
                                        {teamAScore}
                                        {isCricket && <span className="text-2xl sm:text-3xl text-muted-foreground">/{teamAScoreDetails?.wickets ?? 0}</span>}
                                    </p>
                                    {isCricket && (
                                        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            ({teamAScoreDetails?.overs?.toFixed(1) ?? '0.0'} Ov)
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-[2px] bg-border" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase bg-background px-2 py-1 rounded-full border">VS</span>
                                <div className="h-12 w-[2px] bg-border" />
                            </div>

                            {/* Team B */}
                            <div className="text-center space-y-4">
                                <p className="font-black text-xs sm:text-sm uppercase tracking-tight text-balance leading-tight min-h-[2.5rem] flex items-center justify-center">
                                    {TeamB.team_name}
                                </p>
                                <div className="space-y-1">
                                    <p className="text-4xl sm:text-6xl font-black font-mono tracking-tighter">
                                        {teamBScore}
                                        {isCricket && <span className="text-2xl sm:text-3xl text-muted-foreground">/{teamBScoreDetails?.wickets ?? 0}</span>}
                                    </p>
                                    {isCricket && (
                                        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            ({teamBScoreDetails?.overs?.toFixed(1) ?? '0.0'} Ov)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status / Commentary Bar */}
                        <div className="bg-background rounded-2xl border-2 p-3 text-center">
                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary italic">
                                {getResultText()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Event Feed */}
                <div className="p-6">
                    <Tabs defaultValue="timeline" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-2xl h-12">
                            <TabsTrigger value="timeline" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:shadow-lg">
                                Live Feed
                            </TabsTrigger>
                            <TabsTrigger value="scorecard" disabled className="rounded-xl font-bold text-xs uppercase tracking-widest">
                                Scorecard
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="timeline" className="mt-6">
                            <ScrollArea className="h-64 pr-4">
                                <div className="space-y-6">
                                    <AnimatePresence initial={false}>
                                    {events.length > 0 ? (
                                        events.map((event, i) => <TimelineEvent key={event.id || `${event.timestamp}-${i}`} event={event} match={match} />)
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-3">
                                            <Activity className="h-8 w-8 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Waiting for match action...</p>
                                        </div>
                                    )}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// LiveMatchCard component
function LiveMatchCard({ match, onSelect }: { match: ApiMatch, onSelect: () => void }) {
    const { TeamA, TeamB, Sport, status, venue, score_details } = match;
    const isCricket = Sport.name === 'Cricket';

    const getScore = (teamId: string) => score_details?.[teamId];
    
    const scoreA = getScore(match.team_a_id);
    const scoreB = getScore(match.team_b_id);

    const renderCricketScore = (score: any) => {
        const runs = score?.runs ?? 0;
        const wickets = score?.wickets ?? 0;
        const overs = score?.overs ?? 0;
        return (
            <div className="flex flex-col items-center">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono">{runs}</span>
                    <span className="text-xl text-muted-foreground font-bold">/{wickets}</span>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">({overs.toFixed(1)} Ov)</span>
            </div>
        );
    };

    const renderStandardScore = (score: any) => {
        const val = score?.score ?? score?.runs ?? 0;
        return (
            <div className="text-4xl font-black font-mono">{val}</div>
        );
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Card 
                onClick={onSelect} 
                className="cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl bg-card/50 backdrop-blur-sm group"
            >
                <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1.5 rounded-md">
                                <Trophy className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-bold text-xs uppercase tracking-widest text-primary">{Sport.name}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] gap-1 px-2 border-muted-foreground/20">
                            <MapPin className="h-3 w-3" /> {venue}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                        {/* Team A */}
                        <div className="space-y-3 text-center">
                            <p className="font-black text-sm uppercase leading-tight min-h-[2.5rem] flex items-center justify-center px-2">{TeamA.team_name}</p>
                            {isCricket ? renderCricketScore(scoreA) : renderStandardScore(scoreA)}
                        </div>

                        {/* Divider */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-12 w-[1px] bg-border" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase">VS</span>
                            <div className="h-12 w-[1px] bg-border" />
                        </div>

                        {/* Team B */}
                        <div className="space-y-3 text-center">
                            <p className="font-black text-sm uppercase leading-tight min-h-[2.5rem] flex items-center justify-center px-2">{TeamB.team_name}</p>
                            {isCricket ? renderCricketScore(scoreB) : renderStandardScore(scoreB)}
                        </div>
                    </div>
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
                            <div className="text-muted-foreground font-black text-[10px] tracking-widest uppercase flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {status}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground group-hover:text-primary transition-colors">
                        View Match Center <ArrowRight className="h-3 w-3" />
                    </div>
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
            <div className="container py-8 md:py-16 space-y-12 text-foreground">
                 <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <Badge className="px-4 py-1 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                        <Radio className="h-3 w-3 mr-2 animate-pulse" /> Live Now
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-primary uppercase italic">Match Center</h1>
                    <p className="text-lg text-muted-foreground">
                        Get real-time scores, detailed timelines, and instant updates from all ongoing Energy 2026 matches.
                    </p>
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
                                    <LiveMatchCard 
                                        key={match.id} 
                                        match={match} 
                                        onSelect={() => setSelectedMatch(match)} 
                                    />
                                ))}
                            </div>
                        </AnimatePresence>
                    ) : (
                         <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/20"
                        >
                            <Activity className="h-16 w-16 mx-auto mb-6 text-muted-foreground/40" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-2">No Active Battles</h3>
                            <p className="max-w-xs mx-auto text-sm">Matches will appear here as soon as they go live. Stay tuned for the action!</p>
                        </motion.div>
                    )}
                </div>
            </div>
            
             <MatchDetailsDialog 
                isOpen={!!selectedMatch}
                match={selectedMatch}
                onClose={() => setSelectedMatch(null)}
             />
        </>
    );
}
