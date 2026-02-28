
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Calendar, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

/**
 * Big Screen Color Config mapping sports to vibrant primary colors
 */
const SPORT_COLORS: Record<string, { primary: string, border: string, bg: string }> = {
    'cricket': { primary: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
    'kabaddi': { primary: 'text-orange-500', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
    'volleyball': { primary: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' },
    'basketball': { primary: 'text-red-500', border: 'border-red-500/20', bg: 'bg-red-500/5' },
    'badminton': { primary: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
    'default': { primary: 'text-white', border: 'border-slate-800', bg: 'bg-slate-900/5' }
};

const getColors = (sportName: string = '') => {
    const name = sportName.toLowerCase();
    if (name.includes('cricket')) return SPORT_COLORS.cricket;
    if (name.includes('kabaddi')) return SPORT_COLORS.kabaddi;
    if (name.includes('volleyball')) return SPORT_COLORS.volleyball;
    if (name.includes('basketball')) return SPORT_COLORS.basketball;
    if (name.includes('badminton')) return SPORT_COLORS.badminton;
    return SPORT_COLORS.default;
};

/**
 * Clean Score Unit for public visibility
 */
function ScoreUnit({ value, subValue, colors, label, isDense = false }: { value: string | number, subValue?: string, colors: any, label: string, isDense?: boolean }) {
    const isLongText = typeof value === 'string' && value.length > 7;
    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-center px-2">
            <span className={cn(
                "font-bold uppercase tracking-wider text-white mb-2 line-clamp-2 flex items-center justify-center leading-tight",
                isDense ? "text-xs min-h-[2rem]" : "text-base min-h-[3rem]"
            )}>
                {label}
            </span>
            <motion.span 
                key={String(value)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "font-bold font-mono tracking-tighter tabular-nums leading-none", 
                    colors.primary,
                    isLongText 
                        ? (isDense ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl md:text-6xl")
                        : (isDense ? "text-5xl sm:text-6xl" : "text-7xl sm:text-8xl md:text-9xl")
                )}
            >
                {value}
            </motion.span>
            {subValue && (
                <span className={cn(
                    "font-bold font-mono text-slate-400 mt-2 px-3 py-0.5 bg-slate-900 border border-slate-800 rounded",
                    isDense ? "text-xs sm:text-sm" : "text-lg sm:text-2xl"
                )}>
                    {subValue}
                </span>
            )}
        </div>
    );
}

/**
 * Simplified Match Board for Big Screen Signage - Focus on LIVE status
 */
function BigMatchBoard({ match, isDense = false, onCompleted }: { match: ApiMatch, isDense?: boolean, onCompleted?: (id: string) => void }) {
    const { matchData } = useMatchSync(match.id);
    const colors = getColors(match.Sport?.name);
    
    const currentStatus = (matchData?.status || match.status || '').toLowerCase();

    useEffect(() => {
        if (currentStatus === 'completed' && onCompleted) {
            onCompleted(match.id);
        }
    }, [currentStatus, match.id, onCompleted]);

    if (currentStatus === 'completed' || currentStatus === 'scheduled') return null;

    const getInitialScores = () => {
        let base = match.score_details;
        if (typeof base === 'string') {
            try { base = JSON.parse(base); } catch(e) { base = {}; }
        }
        return base || {};
    };

    const scores = { ...getInitialScores(), ...(matchData?.score_details || {}) };
    const matchState = { ...(match.match_state || {}), ...(matchData?.match_state || {}) };
    
    const scoreA = scores[match.team_a_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    const scoreB = scores[match.team_b_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    
    const isCricket = match.Sport?.name?.toLowerCase().includes('cricket');
    const currentInnings = matchState.current_innings || 1;
    const battingTeamId = matchState.batting_team_id;

    let displayA: string | number = scoreA.score ?? scoreA.runs ?? 0;
    let displayB: string | number = scoreB.score ?? scoreB.runs ?? 0;

    if (isCricket) {
        displayA = `${scoreA.runs || 0}/${scoreA.wickets || 0}`;
        displayB = `${scoreB.runs || 0}/${scoreB.wickets || 0}`;

        if (currentInnings === 1) {
            if (battingTeamId === match.team_a_id) {
                displayB = "YET TO BAT";
            } else if (battingTeamId === match.team_b_id) {
                displayA = "YET TO BAT";
            }
        }
    }

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={cn(
                "relative h-full flex flex-col items-center justify-between border-2 bg-slate-950 overflow-hidden shrink-0",
                isDense ? "p-4 sm:p-6" : "p-6 sm:p-10",
                colors.border, colors.bg
            )}
        >
            {/* Top Indicator */}
            <div className={cn(
                "w-full flex justify-between items-center border-b border-slate-900 pb-2 mb-2",
                isDense ? "mb-2" : "mb-4"
            )}>
                <span className={cn(
                    "font-bold uppercase tracking-[0.2em] italic", 
                    colors.primary,
                    isDense ? "text-sm sm:text-lg" : "text-lg sm:text-2xl"
                )}>
                    {match.Sport?.name}
                </span>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">LIVE</span>
                </div>
            </div>

            {/* Main Scoreboard Area */}
            <div className="flex-1 w-full grid grid-cols-[1fr,auto,1fr] items-center gap-2 sm:gap-6">
                <ScoreUnit 
                    label={match.TeamA?.team_name || 'Team A'}
                    value={displayA} 
                    colors={colors} 
                    isDense={isDense}
                />

                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-8 w-[1px] bg-slate-800" />
                    <span className="text-sm font-bold italic text-slate-700 uppercase">VS</span>
                    <div className="h-8 w-[1px] bg-slate-800" />
                </div>

                <ScoreUnit 
                    label={match.TeamB?.team_name || 'Team B'}
                    value={displayB} 
                    colors={colors} 
                    isDense={isDense}
                />
            </div>

            {/* Bottom Meta Info */}
            <div className={cn(
                "w-full flex justify-center items-center pt-2 border-t border-slate-900",
                isDense ? "mt-2" : "mt-6"
            )}>
                {isCricket ? (
                    <div className="flex gap-8">
                        <div className="text-center">
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block mb-0.5">Batting Overs</span>
                            <span className={cn("font-bold font-mono text-white", isDense ? "text-lg" : "text-2xl")}>
                                {parseFloat(String(battingTeamId === match.team_b_id ? scoreB.overs : scoreA.overs || 0)).toFixed(1)}
                            </span>
                        </div>
                        {matchState?.target_score && (
                            <div className="text-center">
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block mb-0.5">Target</span>
                                <span className={cn("font-bold font-mono text-amber-500", isDense ? "text-lg" : "text-2xl")}>
                                    {matchState.target_score}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em]">
                        Match in Progress
                    </span>
                )}
            </div>
        </motion.div>
    );
}

/**
 * Technical Table for Scheduled Matches
 */
function ScheduledMatchesTable({ matches }: { matches: ApiMatch[] }) {
    if (matches.length === 0) return null;
    return (
        <div className="w-full border-t border-slate-800 bg-slate-950 p-4 sm:p-6 space-y-4 shrink-0 max-h-[30vh] overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <h2 className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em]">Upcoming Showdowns</h2>
                </div>
                <Badge variant="outline" className="border-slate-800 text-slate-500 rounded-none uppercase text-[8px] tracking-widest">Tournament Feed</Badge>
            </div>
            
            <div className="overflow-auto border border-slate-900 rounded-sm bg-slate-950/50">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 border-b border-slate-800 sticky top-0 z-10">
                        <tr>
                            <th className="p-3">Sporting Event</th>
                            <th className="p-3">Competitors</th>
                            <th className="p-3">Arena Venue</th>
                            <th className="p-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                        {matches.map(m => (
                            <tr key={m.id} className="text-white hover:bg-slate-900/30 transition-all duration-300">
                                <td className="p-3">
                                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">{m.Sport?.name}</span>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
                                        <span className="text-white truncate max-w-[120px]">{m.TeamA?.team_name}</span>
                                        <div className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[8px] text-slate-600 italic">VS</div>
                                        <span className="text-white truncate max-w-[120px]">{m.TeamB?.team_name}</span>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{m.venue}</span>
                                </td>
                                <td className="p-3 text-right">
                                    <div className="inline-flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-slate-700" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Scheduled</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function BigScreenLive() {
    const [liveMatches, setLiveMatches] = useState<ApiMatch[]>([]);
    const [scheduledMatches, setScheduledMatches] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasNetworkError, setHasNetworkError] = useState(false);
    const isInitialFetchDone = useRef(false);

    const fetchMatches = useCallback(async () => {
        try {
            const matches = await getLiveMatches();
            const live = matches.filter(m => (m.status || '').toLowerCase() === 'live');
            const scheduled = matches.filter(m => (m.status || '').toLowerCase() === 'scheduled');
            
            setLiveMatches(live);
            setScheduledMatches(scheduled);
            setHasNetworkError(false);
            setIsLoading(false);
            isInitialFetchDone.current = true;
        } catch (error) {
            console.error("Initial Fetch error:", error);
            setHasNetworkError(true);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial load
        fetchMatches();

        // Establish SSE connection for real-time updates
        const sseUrl = `https://energy-sports-meet-backend.vercel.app/api/v1/matches/live?stream=true`;
        const eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (event) => {
            try {
                const matches: ApiMatch[] = JSON.parse(event.data);
                const live = matches.filter(m => (m.status || '').toLowerCase() === 'live');
                const scheduled = matches.filter(m => (m.status || '').toLowerCase() === 'scheduled');
                
                setLiveMatches(live);
                setScheduledMatches(scheduled);
                setHasNetworkError(false);
                setIsLoading(false);
            } catch (error) {
                console.error("SSE Parse Error:", error);
            }
        };

        eventSource.onerror = (error) => {
            console.error("SSE Connection Error:", error);
            setHasNetworkError(true);
        };

        return () => {
            eventSource.close();
        };
    }, [fetchMatches]);

    const handleMatchCompleted = (id: string) => {
        setLiveMatches(prev => prev.filter(m => m.id !== id));
    };

    // Density Engine: If more than 2 games, shrink typography and padding
    const isDense = liveMatches.length > 2;

    const renderLiveGrid = () => {
        if (liveMatches.length === 0) return null;

        // Evenly split layout
        const gridCols = liveMatches.length === 1 ? 'grid-cols-1' : 
                         liveMatches.length === 2 ? 'grid-cols-2' : 
                         liveMatches.length === 3 ? 'grid-cols-3' :
                         liveMatches.length === 4 ? 'grid-cols-2' : 'grid-cols-3';
        
        return (
            <div className={cn("flex-1 min-h-0 grid gap-4 overflow-hidden", gridCols)}>
                <AnimatePresence>
                    {liveMatches.slice(0, 6).map(m => (
                        <BigMatchBoard 
                            key={m.id} 
                            match={m} 
                            isDense={isDense}
                            onCompleted={handleMatchCompleted}
                        />
                    ))}
                </AnimatePresence>
            </div>
        );
    };

    const renderEmptyState = () => {
        if (isLoading || liveMatches.length > 0 || scheduledMatches.length > 0) return null;
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <Zap className="h-20 w-20 text-slate-900" />
                <h1 className="text-2xl font-bold uppercase tracking-[0.5em] text-slate-800">Arena Hub Idle</h1>
                <p className="text-slate-700 text-sm font-medium italic">Waiting for tournament activity...</p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black text-white p-4 flex flex-col overflow-hidden select-none z-[9999]">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        key="loader"
                        className="flex-1 flex items-center justify-center"
                    >
                        <div className="h-12 w-12 animate-spin text-slate-800 border-2 border-t-blue-500 rounded-full" />
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        key="content"
                        className="flex-1 flex flex-col gap-4 min-h-0"
                    >
                        {renderLiveGrid()}
                        {renderEmptyState()}
                        <ScheduledMatchesTable matches={scheduledMatches} />
                        
                        {/* Status Error Indicator */}
                        {hasNetworkError && (
                            <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-600/50 rounded-full text-[8px] font-black uppercase tracking-widest text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                Link Interrupted
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
