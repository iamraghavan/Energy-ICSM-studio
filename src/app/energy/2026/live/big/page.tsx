'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Big Screen Color Config mapping sports to vibrant primary colors
 */
const SPORT_COLORS: Record<string, { primary: string, border: string, bg: string }> = {
    'Cricket': { primary: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
    'Kabaddi': { primary: 'text-orange-500', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
    'Volleyball': { primary: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' },
    'Basketball': { primary: 'text-red-500', border: 'border-red-500/20', bg: 'bg-red-500/5' },
    'Badminton': { primary: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
    'default': { primary: 'text-white', border: 'border-slate-800', bg: 'bg-slate-900/5' }
};

const getColors = (sportName: string) => SPORT_COLORS[sportName] || SPORT_COLORS.default;

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
 * Simplified Match Board for Big Screen Signage
 */
function BigMatchBoard({ match, isPrimary = false }: { match: ApiMatch, isPrimary?: boolean }) {
    const { matchData } = useMatchSync(match.id);
    const colors = getColors(match.Sport?.name);
    
    // Merge RTDB data with initial REST data
    const scores = { ...(match.score_details || {}), ...(matchData?.score_details || {}) };
    const matchState = { ...(match.match_state || {}), ...(matchData?.match_state || {}) };
    
    const scoreA = scores[match.team_a_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    const scoreB = scores[match.team_b_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    
    const isCricket = match.Sport?.name === 'Cricket';
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
        <div className={cn(
            "relative h-full flex flex-col items-center justify-between p-6 sm:p-10 border-2 bg-slate-950 overflow-hidden",
            colors.border, colors.bg,
            isPrimary ? "flex-1" : ""
        )}>
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
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">Match in Progress</span>
                )}
            </div>
        </div>
    );
}

export default function BigScreenLive() {
    const [liveMatches, setLiveMatches] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isFetchingRef = useRef(false);

    const fetchMatches = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            const matches = await getLiveMatches();
            setLiveMatches(matches);
        } catch (error) {
            console.error("Big Screen Fetch error:", error);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchMatches();
        const intervalId = setInterval(fetchMatches, 30000);
        return () => clearInterval(intervalId);
    }, [fetchMatches]);

    const cricketMatches = liveMatches.filter(m => m.Sport?.name === 'Cricket');
    const otherMatches = liveMatches.filter(m => m.Sport?.name !== 'Cricket');

    const renderLayout = () => {
        if (liveMatches.length === 0) {
            return (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <Activity className="h-20 w-20 text-slate-900" />
                    <h1 className="text-2xl font-bold uppercase tracking-[0.5em] text-slate-800">Arena Offline</h1>
                    <p className="text-slate-700 text-sm font-medium italic">Waiting for live data...</p>
                </div>
            );
        }

        if (cricketMatches.length > 0 && otherMatches.length > 0) {
            return (
                <div className="h-full flex flex-col lg:flex-row gap-4">
                    <div className="flex-[2]">
                        <BigMatchBoard match={cricketMatches[0]} isPrimary />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 overflow-hidden">
                        {otherMatches.slice(0, 3).map(m => (
                            <BigMatchBoard key={m.id} match={m} />
                        ))}
                    </div>
                </div>
            );
        }

        const gridCols = liveMatches.length === 1 ? 'grid-cols-1' : 
                         liveMatches.length === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2';
        
        return (
            <div className={cn("h-full grid gap-4", gridCols)}>
                {liveMatches.slice(0, 4).map(m => (
                    <BigMatchBoard key={m.id} match={m} />
                ))}
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
                        className="h-full flex items-center justify-center"
                    >
                        <div className="h-12 w-12 animate-spin text-slate-800 border-2 border-t-blue-500 rounded-full" />
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="h-full"
                    >
                        {renderLayout()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
