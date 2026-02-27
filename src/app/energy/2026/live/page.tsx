'use client';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Trophy, Goal, Square, Info, MapPin, Activity, ChevronRight, Zap, Radio } from 'lucide-react';
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

    const getInitialScores = () => {
        let base = initialMatch.score_details;
        if (typeof base === 'string') {
            try { base = JSON.parse(base); } catch(e) { base = {}; }
        }
        return base || {};
    };

    const mergedScores = {
        ...getInitialScores(),
        ...(matchData?.score_details || {})
    };

    const match = {
        ...initialMatch,
        ...(matchData || {}),
        score_details: mergedScores,
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

    const getStat = (id: any, source: any) => {
        if (!id || !source) return null;
        const sid = String(id);
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
    const { matchData } = useMatchSync(match.id);
    
    const getLiveScores = () => {
        let base = match.score_details;
        if (typeof base === 'string') {
            try { base = JSON.parse(base); } catch(e) { base = {}; }
        }
        return { ...(base || {}), ...(matchData?.score_details || {}) };
    };

    const scores = getLiveScores();
    const { TeamA, TeamB, Sport, status, venue } = match;
    const isCricket = Sport?.name === 'Cricket';
    const scoreA = scores[match.team_a_id] || { runs: 0, score: 0, wickets: 0 };
    const scoreB = scores[match.team_b_id] || { runs: 0, score: 0, wickets: 0 };

    return (
        <Card onClick={onSelect} className="cursor-pointer group relative overflow-hidden border-0 bg-slate-950 rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/20">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-10" />
            
            {/* Dynamic Background */}
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="h-32 w-32 text-primary rotate-12" />
            </div>

            <div className="relative z-20 p-6 md:p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                            <Zap className="h-3 w-3 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{Sport?.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">
                            <MapPin className="h-3 w-3" /> {venue}
                        </div>
                    </div>
                    
                    <Badge variant={status === 'live' ? 'destructive' : 'outline'} className={cn(
                        "h-7 px-4 rounded-full font-black text-[10px] tracking-[0.2em] uppercase border-2",
                        status === 'live' ? "animate-pulse bg-red-600 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "bg-slate-900 border-slate-800 text-slate-400"
                    )}>
                        <Radio className="h-3 w-3 mr-1.5" /> {status}
                    </Badge>
                </div>

                {/* Scoreboard Grid */}
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                    {/* Team A */}
                    <div className="text-center space-y-3">
                        <div className="relative mx-auto w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-2xl text-slate-400 shadow-inner group-hover:border-primary/50 transition-colors">
                            {TeamA?.team_name?.charAt(0)}
                        </div>
                        <p className="font-black text-[11px] uppercase leading-tight min-h-[2.5rem] flex items-center justify-center text-slate-300 group-hover:text-white transition-colors tracking-tight">
                            {TeamA?.team_name}
                        </p>
                        <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-white tabular-nums">
                            {isCricket ? (
                                <>{Number(scoreA.runs ?? 0)}<span className="text-xl md:text-2xl text-slate-600">/{Number(scoreA.wickets ?? 0)}</span></>
                            ) : (Number(scoreA.score ?? 0))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-800 to-transparent" />
                        <span className="text-[9px] font-black text-slate-700 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">VS</span>
                        <div className="h-12 w-px bg-gradient-to-t from-transparent via-slate-800 to-transparent" />
                    </div>

                    {/* Team B */}
                    <div className="text-center space-y-3">
                        <div className="relative mx-auto w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-2xl text-slate-400 shadow-inner group-hover:border-primary/50 transition-colors">
                            {TeamB?.team_name?.charAt(0)}
                        </div>
                        <p className="font-black text-[11px] uppercase leading-tight min-h-[2.5rem] flex items-center justify-center text-slate-300 group-hover:text-white transition-colors tracking-tight">
                            {TeamB?.team_name}
                        </p>
                        <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-white tabular-nums">
                            {isCricket ? (
                                <>{Number(scoreB.runs ?? 0)}<span className="text-xl md:text-2xl text-slate-600">/{Number(scoreB.wickets ?? 0)}</span></>
                            ) : (Number(scoreB.score ?? 0))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="relative z-20 px-8 py-4 bg-slate-900/50 border-t border-slate-800/50 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">Real-time Sync Active</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary group-hover:translate-x-1 transition-transform tracking-widest">
                    Enter Match Center <ChevronRight className="h-4 w-4" />
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
                    <Radio className="h-4 w-4 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Stadium Live Bridge</span>
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-foreground uppercase italic leading-none">
                    Arena <span className="text-primary">Live</span>
                </h1>
            </div>

            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => <Card key={i} className="h-80 w-full animate-pulse bg-muted rounded-[3rem]" />)}
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