'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Trophy, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Big Screen Color Config mapping sports to vibrant RGB glows
 */
const SPORT_COLORS: Record<string, { primary: string, border: string, glow: string, text: string }> = {
    'Cricket': { primary: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]', text: 'text-amber-500' },
    'Kabaddi': { primary: 'text-orange-500', border: 'border-orange-500/30', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]', text: 'text-orange-600' },
    'Volleyball': { primary: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-[0_0_30px_rgba(34,211,238,0.3)]', text: 'text-cyan-500' },
    'Basketball': { primary: 'text-red-500', border: 'border-red-500/30', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]', text: 'text-red-600' },
    'Badminton': { primary: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-[0_0_30px_rgba(52,211,153,0.3)]', text: 'text-emerald-500' },
    'default': { primary: 'text-white', border: 'border-slate-700', glow: 'shadow-none', text: 'text-white' }
};

const getColors = (sportName: string) => SPORT_COLORS[sportName] || SPORT_COLORS.default;

/**
 * Massive Score Unit for LED visibility
 */
function MassiveScore({ value, subValue, colors }: { value: string | number, subValue?: string, colors: any }) {
    return (
        <div className="flex flex-col items-center">
            <motion.span 
                key={String(value)}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn("text-[10rem] sm:text-[15rem] font-black font-mono tracking-tighter leading-none", colors.primary)}
                style={{ textShadow: '0 0 30px currentColor' }}
            >
                {value}
            </motion.span>
            {subValue && (
                <span className="text-2xl sm:text-4xl font-black font-mono opacity-50 uppercase tracking-[0.2em] mt-2">
                    {subValue}
                </span>
            )}
        </div>
    );
}

/**
 * Standard Match Board for the grid
 */
function BigMatchBoard({ match, isPrimary = false }: { match: ApiMatch, isPrimary?: boolean }) {
    const { matchData } = useMatchSync(match.id);
    const colors = getColors(match.Sport?.name);
    
    const scores = { ...(match.score_details || {}), ...(matchData?.score_details || {}) };
    const scoreA = scores[match.team_a_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    const scoreB = scores[match.team_b_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    
    const isCricket = match.Sport?.name === 'Cricket';
    const displayA = isCricket ? scoreA.runs : (scoreA.score ?? scoreA.runs ?? 0);
    const displayB = isCricket ? scoreB.runs : (scoreB.score ?? scoreB.runs ?? 0);

    return (
        <div className={cn(
            "relative h-full flex flex-col items-center justify-center p-10 border-4 bg-slate-950 overflow-hidden",
            colors.border, colors.glow,
            isPrimary ? "flex-1" : ""
        )}>
            {/* LED Status Bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-900 overflow-hidden">
                <motion.div 
                    animate={{ x: ['-100%', '100%'] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className={cn("h-full w-1/3 blur-sm", colors.primary.replace('text', 'bg'))}
                />
            </div>

            {/* Sport Header */}
            <div className="absolute top-10 flex items-center gap-4">
                <div className={cn("p-2 border-2 rounded-none", colors.border)}>
                    <Trophy className={cn("h-8 w-8", colors.primary)} />
                </div>
                <span className={cn("font-black text-3xl uppercase tracking-[0.4em] italic", colors.primary)}>
                    {match.Sport?.name}
                </span>
            </div>

            {/* Main Scoreboard */}
            <div className="w-full grid grid-cols-[1fr,auto,1fr] items-center gap-12 mt-12">
                <div className="text-center space-y-8">
                    <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight line-clamp-2 leading-none text-white/90">
                        {match.TeamA?.team_name}
                    </h2>
                    <MassiveScore 
                        value={displayA} 
                        subValue={isCricket ? `WKT: ${scoreA.wickets || 0}` : undefined} 
                        colors={colors} 
                    />
                </div>

                <div className="flex flex-col items-center gap-8">
                    <div className="h-32 w-[2px] bg-slate-800" />
                    <span className={cn("text-3xl font-black italic tracking-widest px-8 py-3 bg-slate-900 border-2", colors.border, colors.primary)}>VS</span>
                    <div className="h-32 w-[2px] bg-slate-800" />
                </div>

                <div className="text-center space-y-8">
                    <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight line-clamp-2 leading-none text-white/90">
                        {match.TeamB?.team_name}
                    </h2>
                    <MassiveScore 
                        value={displayB} 
                        subValue={isCricket ? `WKT: ${scoreB.wickets || 0}` : undefined} 
                        colors={colors} 
                    />
                </div>
            </div>

            {/* Secondary Intel */}
            {isCricket && (
                <div className="absolute bottom-12 flex gap-12">
                    <div className="text-center">
                        <p className="text-slate-500 font-black text-sm uppercase tracking-widest mb-1">Innings Progress</p>
                        <p className={cn("text-4xl font-black font-mono", colors.primary)}>
                            {parseFloat(String(scoreA.overs || 0)).toFixed(1)} <span className="text-sm opacity-50">OV</span>
                        </p>
                    </div>
                    {matchData?.match_state?.target_score && (
                        <div className="text-center bg-slate-900 px-10 py-3 border-2 border-slate-800">
                            <p className="text-slate-500 font-black text-xs uppercase tracking-widest mb-1">Target Score</p>
                            <p className="text-4xl font-black font-mono text-amber-500">
                                {matchData.match_state.target_score}
                            </p>
                        </div>
                    )}
                </div>
            )}
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

    // Layout Decision Engine
    const renderLayout = () => {
        if (liveMatches.length === 0) {
            return (
                <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse">
                    <Activity className="h-32 w-32 text-slate-800" />
                    <h1 className="text-4xl font-black uppercase tracking-[0.5em] text-slate-800">Arena Offline</h1>
                    <p className="text-slate-600 font-bold italic">Waiting for live broadcast broadcast link...</p>
                </div>
            );
        }

        if (cricketMatches.length > 0 && otherMatches.length > 0) {
            return (
                <div className="h-full grid grid-cols-[2.5fr,1fr] gap-4">
                    <BigMatchBoard match={cricketMatches[0]} isPrimary />
                    <div className="grid grid-rows-2 gap-4">
                        {otherMatches.slice(0, 2).map(m => (
                            <BigMatchBoard key={m.id} match={m} />
                        ))}
                    </div>
                </div>
            );
        }

        const gridCols = liveMatches.length === 1 ? 'grid-cols-1' : 'grid-cols-2';
        const gridRows = liveMatches.length > 2 ? 'grid-rows-2' : 'grid-rows-1';

        return (
            <div className={cn("h-full grid gap-4", gridCols, gridRows)}>
                {liveMatches.slice(0, 4).map(m => (
                    <BigMatchBoard key={m.id} match={m} />
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black text-white p-4 flex flex-col overflow-hidden select-none cursor-none z-[9999]">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="h-full flex items-center justify-center"
                    >
                        <div className="h-20 w-20 animate-spin text-slate-800 border-4 border-t-blue-500 rounded-full" />
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="h-full"
                    >
                        {renderLayout()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
