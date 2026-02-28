'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Activity, Calendar, Zap } from 'lucide-react';
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
function ScoreUnit({ value, subValue, colors, label }: { value: string | number, subValue?: string, colors: any, label: string }) {
    const isLongText = typeof value === 'string' && value.length > 7;
    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-center px-4">
            <span className="text-base font-bold uppercase tracking-wider text-white mb-4 line-clamp-2 min-h-[3rem] flex items-center justify-center leading-tight">
                {label}
            </span>
            <motion.span 
                key={String(value)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "font-bold font-mono tracking-tighter tabular-nums leading-none", 
                    colors.primary,
                    isLongText ? "text-4xl sm:text-5xl md:text-6xl" : "text-7xl sm:text-8xl md:text-9xl"
                )}
            >
                {value}
            </motion.span>
            {subValue && (
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-400 mt-4 px-4 py-1 bg-slate-900 border border-slate-800 rounded">
                    {subValue}
                </span>
            )}
        </div>
    );
}

/**
 * Simplified Match Board for Big Screen Signage - Focus on LIVE status
 */
function BigMatchBoard({ match, isPrimary = false, onCompleted }: { match: ApiMatch, isPrimary?: boolean, onCompleted?: (id: string) => void }) {
    const { matchData } = useMatchSync(match.id);
    const colors = getColors(match.Sport?.name);
    
    const currentStatus = (matchData?.status || match.status || '').toLowerCase();

    // Auto-remove logic: if the real-time status becomes 'completed', notify parent
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

    // Merge RTDB data with initial REST data
    const scores = { ...getInitialScores(), ...(matchData?.score_details || {}) };
    const matchState = { ...(match.match_state || {}), ...(matchData?.match_state || {}) };
    
    const scoreA = scores[match.team_a_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    const scoreB = scores[match.team_b_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    
    const isCricket = match.Sport?.name?.toLowerCase().includes('cricket');
    const currentInnings = matchState.current_innings || 1;
    const battingTeamId = matchState.batting_team_id;

    // Default displays for non-cricket or standard case
    let displayA: string | number = scoreA.score ?? scoreA.runs ?? 0;
    let displayB: string | number = scoreB.score ?? scoreB.runs ?? 0;

    if (isCricket) {
        // Professional format: Runs/Wickets
        displayA = `${scoreA.runs || 0}/${scoreA.wickets || 0}`;
        displayB = `${scoreB.runs || 0}/${scoreB.wickets || 0}`;

        // Cricket specific logic for 'Yet to Bat'
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
                "relative h-full flex flex-col items-center justify-between p-6 sm:p-10 border-2 bg-slate-950 overflow-hidden",
                colors.border, colors.bg,
                isPrimary ? "flex-1" : ""
            )}
        >
            {/* Top Indicator */}
            <div className="w-full flex justify-between items-center border-b border-slate-900 pb-4 mb-4">
                <span className={cn("font-bold text-lg sm:text-2xl uppercase tracking-[0.2em] italic", colors.primary)}>
                    {match.Sport?.name}
                </span>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">LIVE ARENA</span>
                </div>
            </div>

            {/* Main Scoreboard Area */}
            <div className="flex-1 w-full grid grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-10">
                <ScoreUnit 
                    label={match.TeamA?.team_name || 'Team A'}
                    value={displayA} 
                    colors={colors} 
                />

                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="h-12 w-[1px] bg-slate-800" />
                    <span className="text-xl font-bold italic text-slate-700">VS</span>
                    <div className="h-12 w-[1px] bg-slate-800" />
                </div>

                <ScoreUnit 
                    label={match.TeamB?.team_name || 'Team B'}
                    value={displayB} 
                    colors={colors} 
                />
            </div>

            {/* Bottom Meta Info */}
            <div className="w-full flex justify-center items-center mt-6 pt-4 border-t border-slate-900">
                {isCricket ? (
                    <div className="flex gap-12">
                        <div className="text-center">
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Overs</span>
                            <span className="text-2xl font-bold font-mono text-white">
                                {parseFloat(String(battingTeamId === match.team_b_id ? scoreB.overs : scoreA.overs || 0)).toFixed(1)}
                            </span>
                        </div>
                        {matchState?.target_score && (
                            <div className="text-center">
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Target</span>
                                <span className="text-2xl font-bold font-mono text-amber-500">
                                    {matchState.target_score}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">
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
        <div className="w-full border-t border-slate-800 bg-slate-950 p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-amber-500" />
                    <h2 className="text-amber-500 font-black text-xs uppercase tracking-[0.4em]">Upcoming Showdowns</h2>
                </div>
                <Badge variant="outline" className="border-slate-800 text-slate-500 rounded-none uppercase text-[9px] tracking-widest">Tournament Feed Active</Badge>
            </div>
            
            <div className="overflow-hidden border border-slate-900 rounded-sm bg-slate-950/50">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 border-b border-slate-800">
                        <tr>
                            <th className="p-4">Sporting Event</th>
                            <th className="p-4">Competitors</th>
                            <th className="p-4">Arena Venue</th>
                            <th className="p-4 text-right">Match Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                        {matches.map(m => (
                            <tr key={m.id} className="text-white hover:bg-slate-900/30 transition-all duration-300">
                                <td className="p-4">
                                    <span className="font-bold text-xs uppercase tracking-wider text-slate-400">{m.Sport?.name}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-tight">
                                        <span className="text-white">{m.TeamA?.team_name}</span>
                                        <div className="px-3 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-600 italic">VS</div>
                                        <span className="text-white">{m.TeamB?.team_name}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{m.venue}</span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="inline-flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Scheduled</span>
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
    const isFetchingRef = useRef(false);

    const fetchMatches = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            const matches = await getLiveMatches();
            
            // Categorize matches by status (robust case-insensitive handling)
            const live = matches.filter(m => (m.status || '').toLowerCase() === 'live');
            const scheduled = matches.filter(m => (m.status || '').toLowerCase() === 'scheduled');
            
            setLiveMatches(live);
            setScheduledMatches(scheduled);
        } catch (error) {
            console.error("Big Screen Fetch error:", error);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchMatches();
        // 10 second polling ensures high visibility for newly scheduled games
        const intervalId = setInterval(fetchMatches, 10000);
        return () => clearInterval(intervalId);
    }, [fetchMatches]);

    const handleMatchCompleted = (id: string) => {
        setLiveMatches(prev => prev.filter(m => m.id !== id));
    };

    const renderLiveGrid = () => {
        if (liveMatches.length === 0) return null;

        const cricketMatches = liveMatches.filter(m => m.Sport?.name?.toLowerCase().includes('cricket'));
        const nonCricketMatches = liveMatches.filter(m => !m.Sport?.name?.toLowerCase().includes('cricket'));
        
        // Priority: First live cricket match gets the hero spot
        const sidebarMatches = [...cricketMatches.slice(1), ...nonCricketMatches];

        if (cricketMatches.length > 0 && sidebarMatches.length > 0) {
            return (
                <div className="flex-1 flex flex-col lg:flex-row gap-4">
                    <div className="flex-[2]">
                        <BigMatchBoard 
                            match={cricketMatches[0]} 
                            isPrimary 
                            onCompleted={handleMatchCompleted}
                        />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 overflow-hidden">
                        <AnimatePresence>
                            {sidebarMatches.slice(0, 3).map(m => (
                                <BigMatchBoard 
                                    key={m.id} 
                                    match={m} 
                                    onCompleted={handleMatchCompleted}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            );
        }

        const gridCols = liveMatches.length === 1 ? 'grid-cols-1' : 
                         liveMatches.length === 2 ? 'grid-cols-1 lg:grid-cols-2' : 
                         liveMatches.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';
        
        return (
            <div className={cn("flex-1 grid gap-4", gridCols)}>
                <AnimatePresence>
                    {liveMatches.slice(0, 4).map(m => (
                        <BigMatchBoard 
                            key={m.id} 
                            match={m} 
                            onCompleted={handleMatchCompleted}
                        />
                    ))}
                </AnimatePresence>
            </div>
        );
    };

    const renderEmptyState = () => {
        if (liveMatches.length > 0 || scheduledMatches.length > 0) return null;
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
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
                        className="h-full flex items-center justify-center"
                    >
                        <div className="h-12 w-12 animate-spin text-slate-800 border-2 border-t-blue-500 rounded-full" />
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        key="content"
                        className="h-full flex flex-col gap-4"
                    >
                        {renderLiveGrid()}
                        {renderEmptyState()}
                        <ScheduledMatchesTable matches={scheduledMatches} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
