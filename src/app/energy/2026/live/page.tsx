
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Activity, Radio, Trophy, ExternalLink, Zap, Swords, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Clean, industrial player stat row for high-density broadcast data.
 */
function PlayerStatRow({ name, primary, secondary, highlight = false }: { name: string, primary: string | number, secondary?: string, highlight?: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-between p-4 transition-all duration-300 border-b last:border-0 border-white/10", 
            highlight ? "bg-primary/20" : "bg-transparent"
        )}>
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={cn("h-2 w-2 rounded-full shrink-0", highlight ? "bg-primary animate-pulse" : "bg-white/20")} />
                <span className="font-black text-[11px] uppercase tracking-wider truncate text-white/90">{name || 'Player'}</span>
            </div>
            <div className="flex items-baseline gap-2 shrink-0">
                <span className="font-black text-sm font-mono text-white">{primary}</span>
                {secondary && <span className="text-[10px] text-white/40 font-bold uppercase">{secondary}</span>}
            </div>
        </div>
    );
}

/**
 * Streamlined Match Hub Modal focused on live scoring and core stats.
 */
function MatchDetailsDialog({ initialMatch, isOpen, onClose }: { initialMatch: ApiMatch | null, isOpen: boolean, onClose: () => void }) {
    const { matchData } = useMatchSync(initialMatch?.id || '');
    
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
            <DialogContent className="max-w-[95vw] sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-none bg-white">
                <DialogHeader className="sr-only">
                    <DialogTitle>{TeamA?.team_name} vs {TeamB?.team_name}</DialogTitle>
                    <DialogDescription>Live Arena Hub</DialogDescription>
                </DialogHeader>

                {/* Broadcast Header */}
                <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b-4 border-primary">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-none border border-primary/30"><Trophy className="h-5 w-5 text-primary" /></div>
                        <div>
                            <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] leading-none">{Sport?.name}</h3>
                        </div>
                    </div>
                    <div className={cn("px-3 py-1 font-black text-[9px] tracking-[0.2em] uppercase rounded-none border", status === 'live' ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700')}>
                        {status === 'live' ? 'Live' : status}
                    </div>
                </div>

                {/* Score Hub */}
                <div className="p-8 sm:p-12 border-b border-slate-100">
                    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-10">
                        <div className="text-center space-y-4">
                            <p className="font-headline font-bold text-[10px] sm:text-xs uppercase tracking-tight leading-tight min-h-[3rem] flex items-center justify-center text-slate-600 px-2">{TeamA?.team_name}</p>
                            <div className="space-y-1">
                                <p className="text-5xl sm:text-7xl font-black font-mono tracking-tighter text-slate-950">
                                    {teamAScore}{isCricket && <span className="text-2xl sm:text-3xl text-slate-300">/{teamAScoreData.wickets || 0}</span>}
                                </p>
                                {isCricket && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">({teamAOvers} OV)</p>}
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-10 w-[2px] bg-slate-100" />
                            <span className="text-[10px] font-black text-primary uppercase italic tracking-widest px-3 py-1 bg-primary/5 border border-primary/10">VS</span>
                            <div className="h-10 w-[2px] bg-slate-100" />
                        </div>
                        <div className="text-center space-y-4">
                            <p className="font-headline font-bold text-[10px] sm:text-xs uppercase tracking-tight leading-tight min-h-[3rem] flex items-center justify-center text-slate-600 px-2">{TeamB?.team_name}</p>
                            <div className="space-y-1">
                                <p className="text-5xl sm:text-7xl font-black font-mono tracking-tighter text-slate-950">
                                    {teamBScore}{isCricket && <span className="text-2xl sm:text-3xl text-slate-300">/{teamBScoreData.wickets || 0}</span>}
                                </p>
                                {isCricket && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">({teamBOvers} OV)</p>}
                            </div>
                        </div>
                    </div>
                    {isCricket && state.target_score && (
                        <div className="mt-8 text-center">
                            <div className="inline-block bg-amber-50 border-2 border-amber-100 px-6 py-2 font-black text-[10px] tracking-[0.2em] uppercase text-amber-700 italic">
                                Target: {state.target_score} | Needed: {Number(state.target_score) - (state.batting_team_id === TeamA.id ? teamAScore : teamBScore)} runs
                            </div>
                        </div>
                    )}
                </div>

                {/* Industrial Stats Section */}
                {isCricket && (
                    <div className="bg-slate-900 p-0 overflow-hidden">
                        <div className="px-6 py-3 bg-slate-950 border-b border-white/5 flex items-center gap-2">
                            <Swords className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Match Statistics</span>
                        </div>
                        <div className="grid grid-cols-1">
                            {state.bowler_id ? (() => {
                                const stats = getStat(state.bowler_id, bowlerStats);
                                return (
                                    <PlayerStatRow 
                                        name={stats?.name || 'Active Bowler'} 
                                        primary={`${stats?.wickets ?? 0}/${stats?.runs_conceded ?? stats?.runs ?? 0}`} 
                                        secondary={`(${parseFloat(String(stats?.overs || 0)).toFixed(1)} OV)`} 
                                        highlight={true}
                                    />
                                );
                            })() : (
                                <div className="p-8 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Waiting for bowler assignment...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Fixed Footer Actions */}
                <div className="p-6 bg-slate-50 border-t flex items-center justify-center">
                    <Button 
                        variant="default" 
                        size="sm" 
                        onClick={onClose} 
                        className="rounded-none font-black text-[10px] uppercase tracking-[0.2em] h-10 px-8 shadow-lg"
                    >
                        Exit Arena
                    </Button>
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
            className="cursor-pointer hover:bg-muted/50 transition-colors group border-b border-slate-100"
        >
            <TableCell className="py-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Sport?.name}</span>
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", status === 'live' ? "bg-red-600 animate-pulse" : "bg-slate-200")} />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", status === 'live' ? "text-red-600" : "text-slate-400")}>
                            {status === 'live' ? 'Live Now' : status}
                        </span>
                    </div>
                </div>
            </TableCell>
            <TableCell className="font-bold">
                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-8">
                    <div className="text-right uppercase tracking-tight text-sm text-slate-700">
                        {TeamA?.team_name}
                    </div>
                    <div className="flex items-center justify-center px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-400 rounded-none border italic">VS</div>
                    <div className="text-left uppercase tracking-tight text-sm text-slate-700">
                        {TeamB?.team_name}
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="inline-flex items-center gap-4 bg-slate-950 text-white px-6 py-2 rounded-none font-mono font-black text-2xl tracking-tighter shadow-lg transform group-hover:scale-105 transition-transform">
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

function MobileMatchItem({ match, onSelect }: { match: ApiMatch, onSelect: () => void }) {
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

    const scoreADisplay = isCricket ? `${scoreA.runs ?? 0}/${scoreA.wickets ?? 0}` : (scoreA.score ?? scoreA.runs ?? 0);
    const scoreBDisplay = isCricket ? `${scoreB.runs ?? 0}/${scoreB.wickets ?? 0}` : (scoreB.score ?? scoreB.runs ?? 0);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onSelect}
            className="bg-white border-2 border-slate-200 p-5 space-y-5 active:scale-[0.98] transition-all"
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{Sport?.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={cn("h-1.5 w-1.5 rounded-full", status === 'live' ? "bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" : "bg-slate-300")} />
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.15em]", status === 'live' ? "text-red-600" : "text-slate-400")}>
                            {status === 'live' ? 'Live Broadcast' : status}
                        </span>
                    </div>
                </div>
                <div className="bg-slate-100 px-3 py-1 text-[9px] font-black text-slate-500 uppercase tracking-widest italic border">VS Match</div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-black uppercase tracking-tight text-slate-800 flex-1 leading-tight">{TeamA?.team_name}</span>
                    <span className="text-2xl font-mono font-black text-slate-950 tabular-nums">{scoreADisplay}</span>
                </div>
                <div className="h-[2px] bg-slate-100 w-full relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                        <Zap className="h-3 w-3 text-slate-200" />
                    </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-black uppercase tracking-tight text-slate-800 flex-1 leading-tight">{TeamB?.team_name}</span>
                    <span className="text-2xl font-mono font-black text-slate-950 tabular-nums">{scoreBDisplay}</span>
                </div>
            </div>

            {isCricket && (
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center bg-slate-50 py-2 border-y dashed">
                    Progress: {parseFloat(String(scoreA.overs || 0)).toFixed(1)} OV vs {parseFloat(String(scoreB.overs || 0)).toFixed(1)} OV
                </div>
            )}
            
            <Button variant="outline" size="sm" className="w-full rounded-none font-black text-[10px] uppercase tracking-widest h-10 border-2 active:bg-primary active:text-white">
                Open Match Hub <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
        </motion.div>
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
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Energy Bridge Live</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-slate-900 uppercase italic leading-none">
                        Energy`26 <span className="text-primary">Live</span>
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
                        <>
                            {/* Mobile View: High-Density List */}
                            <div className="md:hidden space-y-4">
                                {liveMatches.map((match) => (
                                    <MobileMatchItem 
                                        key={match.id} 
                                        match={match} 
                                        onSelect={() => setSelectedMatch(match)} 
                                    />
                                ))}
                            </div>

                            {/* Desktop View: Industrial Table */}
                            <div className="hidden md:block bg-white border-2 border-slate-200 shadow-xl rounded-none overflow-hidden">
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
                        </>
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
