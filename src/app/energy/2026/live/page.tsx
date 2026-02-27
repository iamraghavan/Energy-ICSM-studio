'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Activity, Radio, Trophy, ExternalLink, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Goal, Square, Info } from 'lucide-react';

function TimelineEvent({ event }: { event: any }) {
    const getEventDetails = (event: any) => {
        switch(event.event_type) {
            case 'goal':
            case 'point':
                return { icon: Goal, color: 'text-green-500 bg-green-500/10', title: event.details || 'Point Scored' };
            case 'wicket':
                return { icon: Square, color: 'text-red-500 bg-red-500/10', title: `WICKET! (${event.wicket_type || 'out'})`, commentary: event.details };
            case 'delivery':
                let title = `${Number(event.runs || 0)} run${event.runs !== 1 ? 's' : ''}`;
                if (event.extra_type) title = `${event.extra_type.toUpperCase()} (+${(Number(event.runs || 0)) + (Number(event.extras || 0))})`;
                return { icon: Zap, color: 'text-blue-500 bg-blue-500/10', title: title, commentary: event.details };
            default:
                return { icon: Info, color: 'text-gray-500 bg-gray-500/10', title: event.event_type?.toUpperCase() || 'Match Update', commentary: event.details };
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
            "flex items-center justify-between p-3 rounded-none transition-all duration-300", 
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
            <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-none bg-background">
                <DialogHeader className="sr-only">
                    <DialogTitle>{TeamA?.team_name} vs {TeamB?.team_name}</DialogTitle>
                    <DialogDescription>Live Real-time Feed</DialogDescription>
                </DialogHeader>

                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-none"><Trophy className="h-5 w-5 text-white" /></div>
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase tracking-widest leading-none">{Sport?.name}</h3>
                        </div>
                    </div>
                    <div className={cn("px-3 py-1 font-black text-[10px] tracking-[0.2em] uppercase rounded-none border border-white/20", status === 'live' ? 'bg-red-600 text-white animate-pulse' : 'bg-white/10 text-white/80')}>
                        {status}
                    </div>
                </div>

                <div className="bg-muted/30 p-6 sm:p-10 border-b">
                    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-8">
                        <div className="text-center space-y-4">
                            <p className="font-black text-[11px] sm:text-xs uppercase tracking-tight leading-tight min-h-[2.5rem] flex items-center justify-center break-words">{TeamA?.team_name}</p>
                            <div className="space-y-1">
                                <p className="text-4xl sm:text-6xl font-black font-mono tracking-tighter">
                                    {teamAScore}{isCricket && <span className="text-2xl sm:text-3xl text-muted-foreground">/{teamAScoreData.wickets || 0}</span>}
                                </p>
                                {isCricket && <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">({teamAOvers} Ov)</p>}
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-[2px] bg-border" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase bg-background px-2 py-1 rounded-none border shadow-sm">VS</span>
                            <div className="h-12 w-[2px] bg-border" />
                        </div>
                        <div className="text-center space-y-4">
                            <p className="font-black text-[11px] sm:text-xs uppercase tracking-tight leading-tight min-h-[2.5rem] flex items-center justify-center break-words">{TeamB?.team_name}</p>
                            <div className="space-y-1">
                                <p className="text-4xl sm:text-6xl font-black font-mono tracking-tighter">
                                    {teamBScore}{isCricket && <span className="text-2xl sm:text-3xl text-muted-foreground">/{teamBScoreData.wickets || 0}</span>}
                                </p>
                                {isCricket && <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">({teamBOvers} Ov)</p>}
                            </div>
                        </div>
                    </div>
                    {isCricket && state.target_score && (
                        <div className="mt-6 text-center">
                            <div className="inline-block bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-100 dark:border-amber-900/50 px-4 py-2 font-black text-[10px] tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400">
                                Target: {state.target_score} | Needed: {Number(state.target_score) - (state.batting_team_id === TeamA.id ? teamAScore : teamBScore)} runs
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <Tabs defaultValue={isCricket ? "stats" : "history"} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-none h-12">
                            {isCricket && <TabsTrigger value="stats" className="rounded-none font-bold text-xs uppercase tracking-widest">Live Stats</TabsTrigger>}
                            <TabsTrigger value="history" className="rounded-none font-bold text-xs uppercase tracking-widest">Commentary</TabsTrigger>
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
                                        <div className="text-center py-6 border border-dashed rounded-none bg-muted/20">
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

function LiveMatchRow({ match, onSelect }: { match: ApiMatch, onSelect: () => void }) {
    const { matchData } = useMatchSync(match.id);
    
    const getLiveScores = () => {
        let base = match.score_details;
        if (typeof base === 'string') {
            try { base = JSON.parse(base); } catch(e) { base = {}; }
        }
        return { ...(base || {}), ...(matchData?.score_details || {}) };
    };

    const scores = getLiveScores();
    const { TeamA, TeamB, Sport, status } = match;
    const isCricket = Sport?.name === 'Cricket';
    const scoreA = scores[match.team_a_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    const scoreB = scores[match.team_b_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };

    const scoreADisplay = isCricket 
        ? `${scoreA.runs ?? 0}/${scoreA.wickets ?? 0}` 
        : (scoreA.score ?? scoreA.runs ?? 0);
    
    const scoreBDisplay = isCricket 
        ? `${scoreB.runs ?? 0}/${scoreB.wickets ?? 0}` 
        : (scoreB.score ?? scoreB.runs ?? 0);

    return (
        <TableRow 
            onClick={onSelect}
            className="cursor-pointer hover:bg-muted/50 transition-colors group"
        >
            <TableCell className="py-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Sport?.name}</span>
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", status === 'live' ? "bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "bg-slate-200")} />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", status === 'live' ? "text-red-600" : "text-slate-400")}>
                            {status === 'live' ? 'Live Now' : status}
                        </span>
                    </div>
                </div>
            </TableCell>
            <TableCell className="font-bold">
                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-2 md:gap-8">
                    <div className="text-left md:text-right uppercase tracking-tight text-xs md:text-sm">
                        {TeamA?.team_name}
                    </div>
                    <div className="hidden md:flex items-center justify-center px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-400 rounded-none border italic">VS</div>
                    <div className="text-left uppercase tracking-tight text-xs md:text-sm">
                        {TeamB?.team_name}
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="inline-flex items-center gap-4 bg-slate-950 text-white px-6 py-2 rounded-none font-mono font-black text-xl md:text-2xl tracking-tighter shadow-lg transform group-hover:scale-105 transition-transform">
                    <span className="tabular-nums">{scoreADisplay}</span>
                    <span className="text-slate-600 text-sm">/</span>
                    <span className="tabular-nums">{scoreBDisplay}</span>
                </div>
                {isCricket && (
                    <div className="mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {parseFloat(String(scoreA.overs || 0)).toFixed(1)} OV vs {parseFloat(String(scoreB.overs || 0)).toFixed(1)} OV
                    </div>
                )}
            </TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm" className="rounded-none font-black text-[10px] uppercase tracking-widest border-2 hover:bg-primary hover:text-white transition-all">
                    <ExternalLink className="h-3 w-3 mr-2" /> Match Hub
                </Button>
            </TableCell>
        </TableRow>
    );
}

export default function LivePage() {
    const [liveMatches, setLiveMatches] = useState<ApiMatch[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<ApiMatch | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isFetchingRef = useRef(false);

    const fetchLiveMatches = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            const matches = await getLiveMatches();
            setLiveMatches(matches);
        } catch (error) {
            console.error("Fetch matches error:", error);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchLiveMatches();
        const intervalId = setInterval(fetchLiveMatches, 30000);
        return () => clearInterval(intervalId);
    }, [fetchLiveMatches]);

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <div className="container py-12 md:py-20 space-y-12">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-primary/10 text-primary border-2 border-primary/20 mb-4"
                    >
                        <Radio className="h-4 w-4 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Stadium Live Bridge</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-slate-900 uppercase italic leading-none">
                        Stadium <span className="text-primary">Live</span>
                    </h1>
                </div>

                <div className="max-w-6xl mx-auto">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 w-full bg-slate-100 animate-pulse rounded-none" />
                            ))}
                        </div>
                    ) : liveMatches.length > 0 ? (
                        <div className="bg-white border-2 border-slate-200 shadow-xl rounded-none overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b-2 border-slate-200">
                                    <TableRow>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Status</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Competing Teams</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4 text-center">Live Score</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {liveMatches.map((match) => (
                                        <LiveMatchRow 
                                            key={match.id} 
                                            match={match} 
                                            onSelect={() => setSelectedMatch(match)} 
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white border-2 border-slate-200 rounded-none max-w-2xl mx-auto shadow-xl">
                            <Activity className="h-16 w-16 mx-auto mb-6 text-slate-300" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">Arena Quiet</h3>
                            <p className="max-w-xs mx-auto text-sm font-medium text-slate-500 italic">Check back soon for the next inter-college showdown!</p>
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
        </div>
    );
}
