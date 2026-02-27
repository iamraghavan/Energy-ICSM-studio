'use client';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Trophy, Goal, Square, Info, MapPin, Activity, ShieldCheck, ChevronRight, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

function TimelineEvent({ event }: { event: any }) {
    const getEventDetails = (e: any) => {
        switch(e.event_type) {
            case 'goal':
            case 'point':
                return { icon: Goal, color: 'text-green-500 bg-green-500/10', title: e.details || 'Point Scored' };
            case 'wicket':
                return { icon: Square, color: 'text-red-500 bg-red-500/10', title: `WICKET! (${e.wicket_type || 'out'})`, commentary: e.details };
            case 'delivery':
                let title = `${Number(e.runs || 0)} run${e.runs !== 1 ? 's' : ''}`;
                if (e.extra_type) title = `${e.extra_type.toUpperCase()} (+${(Number(e.runs || 0)) + (Number(e.extras || 0))})`;
                return { icon: Zap, color: 'text-blue-500 bg-blue-500/10', title: title, commentary: e.details };
            default:
                return { icon: Info, color: 'text-gray-500 bg-gray-500/10', title: e.event_type?.toUpperCase() || 'Match Update', commentary: e.details };
        }
    };

    const { icon: Icon, color, title, commentary } = getEventDetails(event);
    const time = event.timestamp ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0"
        >
            <div className="text-[10px] font-mono text-muted-foreground pt-1.5 w-12 shrink-0">{time}</div>
            <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center", color)}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-grow">
                <p className="text-sm font-bold leading-tight">{title}</p>
                {commentary && <p className="text-xs text-muted-foreground mt-0.5">{commentary}</p>}
            </div>
        </motion.div>
    );
};

function PlayerStatRow({ name, primary, secondary, highlight = false }: { name: string, primary: string | number, secondary?: string, highlight?: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-between p-3 rounded-xl transition-all duration-300", 
            highlight ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20" : "bg-muted/30 border-transparent border"
        )}>
            <div className="flex items-center gap-2 overflow-hidden">
                <div className={cn("h-2 w-2 rounded-full shrink-0", highlight ? "bg-primary animate-pulse" : "bg-muted-foreground/30")} />
                <span className="font-bold text-[11px] uppercase tracking-tight truncate">{name || 'Unknown Player'}</span>
            </div>
            <div className="flex items-baseline gap-1 shrink-0">
                <span className="font-black text-sm font-mono">{primary}</span>
                {secondary && <span className="text-[10px] text-muted-foreground font-bold">{secondary}</span>}
            </div>
        </div>
    );
}

function MatchDetailsDialog({ initialMatch, isOpen, onClose }: { initialMatch: ApiMatch | null, isOpen: boolean, onClose: () => void }) {
    const { matchData, isLoading: isSyncing } = useMatchSync(initialMatch?.id || '');
    
    if (!isOpen || !initialMatch) return null;

    // Granular Merging: Preserve initial data while overlaying live score updates
    const match = {
        ...initialMatch,
        ...(matchData || {}),
        score_details: {
            ...(initialMatch.score_details || {}),
            ...(matchData?.score_details || {})
        },
        match_state: {
            ...(initialMatch.match_state || {}),
            ...(matchData?.match_state || {})
        }
    };
    
    const TeamA = match.TeamA;
    const TeamB = match.TeamB;
    const Sport = match.Sport;
    const isCricket = Sport?.name === 'Cricket';
    const status = match.status;

    const scoreDetails = match.score_details || {};
    const teamAScoreData = scoreDetails[initialMatch.team_a_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    const teamBScoreData = scoreDetails[initialMatch.team_b_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };

    const teamAScore = Number(teamAScoreData.runs ?? teamAScoreData.score ?? 0);
    const teamBScore = Number(teamBScoreData.runs ?? teamBScoreData.score ?? 0);
    
    const teamAOvers = parseFloat(String(teamAScoreData.overs || 0)).toFixed(1);
    const teamBOvers = parseFloat(String(teamBScoreData.overs || 0)).toFixed(1);

    const history = match.match_history || [];
    const bowlerStats = match.current_bowler_stats || {};
    const state = match.match_state || {};

    // Enhanced lookup for player statistics
    const getStat = (id: any, source: any) => {
        if (!id || !source) return null;
        const sid = String(id);
        // Try direct key, then student_id property, then id property
        return source[sid] || 
               Object.values(source).find((s: any) => String(s.student_id) === sid || String(s.id) === sid) || 
               null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-background">
                <DialogHeader className="sr-only">
                    <DialogTitle>{TeamA?.team_name} vs {TeamB?.team_name}</DialogTitle>
                    <DialogDescription>Live Real-time Feed</DialogDescription>
                </DialogHeader>

                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl"><Trophy className="h-5 w-5 text-white" /></div>
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase tracking-widest leading-none">{Sport?.name}</h3>
                            <div className="flex items-center gap-1.5 text-white/60 text-[10px] mt-1 font-bold uppercase">
                                <MapPin className="h-3 w-3" /> {match.venue}
                            </div>
                        </div>
                    </div>
                    <Badge variant={status === 'live' ? 'destructive' : 'outline'} className={cn(status === 'live' && "animate-pulse", "px-3 py-1 font-black text-[10px] tracking-[0.2em] uppercase")}>
                        {status}
                    </Badge>
                </div>

                <div className="bg-muted/30 p-6 sm:p-10 border-b">
                    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-8">
                        <div className="text-center space-y-4">
                            <p className="font-black text-[11px] sm:text-xs uppercase tracking-tight leading-tight min-h-[2.5rem] flex items-center justify-center">{TeamA?.team_name}</p>
                            <div className="space-y-1">
                                <p className="text-4xl sm:text-6xl font-black font-mono tracking-tighter">
                                    {teamAScore}{isCricket && <span className="text-2xl sm:text-3xl text-muted-foreground">/{teamAScoreData.wickets ?? 0}</span>}
                                </p>
                                {isCricket && <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">({teamAOvers} Ov)</p>}
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-[2px] bg-border" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase bg-background px-2 py-1 rounded-full border shadow-sm">VS</span>
                            <div className="h-12 w-[2px] bg-border" />
                        </div>
                        <div className="text-center space-y-4">
                            <p className="font-black text-[11px] sm:text-xs uppercase tracking-tight leading-tight min-h-[2.5rem] flex items-center justify-center">{TeamB?.team_name}</p>
                            <div className="space-y-1">
                                <p className="text-4xl sm:text-6xl font-black font-mono tracking-tighter">
                                    {teamBScore}{isCricket && <span className="text-2xl sm:text-3xl text-muted-foreground">/{teamBScoreData.wickets ?? 0}</span>}
                                </p>
                                {isCricket && <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">({teamBOvers} Ov)</p>}
                            </div>
                        </div>
                    </div>
                    {isCricket && state.target_score && (
                        <div className="mt-6 text-center">
                            <Badge variant="secondary" className="px-4 py-2 font-black text-[10px] tracking-[0.2em] uppercase border-2">
                                Target: {state.target_score} | Needed: {Number(state.target_score) - (state.batting_team_id === TeamA.id ? teamAScore : teamBScore)} runs
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <Tabs defaultValue={isCricket ? "stats" : "history"} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-2xl h-12">
                            {isCricket && <TabsTrigger value="stats" className="rounded-xl font-bold text-xs uppercase tracking-widest">Live Stats</TabsTrigger>}
                            <TabsTrigger value="history" className="rounded-xl font-bold text-xs uppercase tracking-widest">Commentary</TabsTrigger>
                        </TabsList>
                        
                        {isCricket && (
                            <TabsContent value="stats" className="mt-6 space-y-6">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Current Bowler</p>
                                    {state.bowler_id ? (() => {
                                        const stats = getStat(state.bowler_id, bowlerStats);
                                        return (
                                            <PlayerStatRow 
                                                name={stats?.name || 'Bowler'} 
                                                primary={`${stats?.wickets ?? 0}/${stats?.runs_conceded ?? stats?.runs ?? 0}`} 
                                                secondary={`(${parseFloat(String(stats?.overs || 0)).toFixed(1)} Ov)`} 
                                                highlight={true}
                                            />
                                        );
                                    })() : (
                                        <div className="text-center py-6 border border-dashed rounded-2xl bg-muted/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bowler pending...</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        )}

                        <TabsContent value="history" className="mt-6">
                            <ScrollArea className="h-64 pr-4">
                                <div className="space-y-1">
                                    {history.length > 0 ? (
                                        history.map((event: any, i: number) => <TimelineEvent key={event.id || `${event.timestamp}-${i}`} event={event} />)
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-3">
                                            <Activity className="h-8 w-8 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Waiting for match action...</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
                
                <div className="px-6 py-3 bg-muted/50 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", isSyncing ? "bg-amber-500 animate-pulse" : "bg-green-500")} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            {isSyncing ? "Connecting RTDB..." : "Live Connection Active"}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-[10px] font-black uppercase text-primary hover:underline">Exit Hub</button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function LiveMatchCard({ match, onSelect }: { match: ApiMatch, onSelect: () => void }) {
    const { TeamA, TeamB, Sport, status, venue, score_details } = match;
    
    let parsedScores = score_details;
    if (typeof score_details === 'string') {
        try { parsedScores = JSON.parse(score_details); } catch(e) { parsedScores = {}; }
    }

    const isCricket = Sport?.name === 'Cricket';
    const scoreA = parsedScores?.[match.team_a_id] || { runs: 0, score: 0, wickets: 0 };
    const scoreB = parsedScores?.[match.team_b_id] || { runs: 0, score: 0, wickets: 0 };

    return (
        <Card onClick={onSelect} className="cursor-pointer overflow-hidden border-2 border-primary/10 transition-all duration-300 hover:shadow-2xl bg-card/50 backdrop-blur-sm group hover:-translate-y-1 rounded-[2rem]">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-lg"><Trophy className="h-3 w-3 text-primary" /></div>
                        <span className="font-black text-[10px] uppercase tracking-[0.2em] text-primary">{Sport?.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-background font-black tracking-widest uppercase"><MapPin className="h-2.5 w-2.5 mr-1 text-muted-foreground" /> {venue}</Badge>
                </div>
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center mb-4">
                    <div className="text-center">
                        <p className="font-black text-[10px] uppercase leading-tight min-h-[2rem] flex items-center justify-center mb-2">{TeamA?.team_name}</p>
                        <div className="text-4xl font-black font-mono tracking-tighter text-foreground">
                            {isCricket ? (
                                <>{Number(scoreA.runs ?? 0)}<span className="text-xl text-muted-foreground">/{Number(scoreA.wickets ?? 0)}</span></>
                            ) : (Number(scoreA.score ?? 0))}
                        </div>
                    </div>
                    <div className="flex flex-col items-center opacity-20">
                        <div className="h-8 w-px bg-border" />
                        <span className="text-[8px] font-black my-1">VS</span>
                        <div className="h-8 w-px bg-border" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-[10px] uppercase leading-tight min-h-[2rem] flex items-center justify-center mb-2">{TeamB?.team_name}</p>
                        <div className="text-4xl font-black font-mono tracking-tighter text-foreground">
                            {isCricket ? (
                                <>{Number(scoreB.runs ?? 0)}<span className="text-xl text-muted-foreground">/{Number(scoreB.wickets ?? 0)}</span></>
                            ) : (Number(scoreB.score ?? 0))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-6 py-3 border-t bg-muted/30 flex justify-between items-center">
                <div className={cn(status === 'live' ? 'text-destructive' : 'text-muted-foreground', "font-black text-[9px] tracking-[0.3em] uppercase flex items-center gap-1.5")}>
                    {status === 'live' && <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />} {status}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground group-hover:text-primary transition-colors tracking-widest">
                    Match Center <ChevronRight className="h-3 w-3" />
                </div>
            </div>
        </Card>
    );
}

export default function LivePage() {
    const [liveMatches, setLiveMatches] = useState<ApiMatch[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<ApiMatch | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLiveMatches = async () => {
            try {
                const matches = await getLiveMatches();
                setLiveMatches(matches);
            } catch (error) {
                console.error("Fetch matches error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLiveMatches();
        const interval = setInterval(fetchLiveMatches, 15000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container py-8 md:py-16 space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4"
                >
                    <Activity className="h-4 w-4 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Stadium Live Bridge</span>
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-foreground uppercase italic leading-none">
                    Energy <span className="text-primary">2026</span> Live
                </h1>
                <p className="text-lg text-muted-foreground font-medium">Sub-second real-time scores and ball-by-ball commentary for every battle.</p>
            </div>

            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => <Card key={i} className="h-64 w-full animate-pulse bg-muted rounded-[2.5rem]" />)}
                    </div>
                ) : liveMatches.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {liveMatches.map((match) => (
                            <LiveMatchCard key={match.id} match={match} onSelect={() => setSelectedMatch(match)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-[3rem] bg-muted/20">
                        <Activity className="h-16 w-16 mx-auto mb-6 opacity-40" />
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-2">Arena Quiet</h3>
                        <p className="max-w-xs mx-auto text-sm font-medium">Check back soon for the next inter-college showdown!</p>
                    </div>
                )}
            </div>
            
            {selectedMatch && (
                <MatchDetailsDialog 
                    isOpen={!!selectedMatch} 
                    initialMatch={selectedMatch} 
                    onClose={() => setSelectedMatch(null)} 
                />
            )}
        </div>
    );
}
