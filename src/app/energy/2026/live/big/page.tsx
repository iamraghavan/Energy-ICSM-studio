
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Trophy, Activity, Zap, Maximize } from 'lucide-react';
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
                className={cn("text-8xl sm:text-[12rem] font-black font-mono tracking-tighter leading-none", colors.primary)}
                style={{ textShadow: '0 0 20px currentColor' }}
            >
                {value}
            </motion.span>
            {subValue && (
                <span className="text-xl sm:text-2xl font-black font-mono opacity-50 uppercase tracking-[0.2em] mt-2">
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
                    <Trophy className={cn("h-6 w-6", colors.primary)} />
                </div>
                <span className={cn("font-black text-2xl uppercase tracking-[0.4em] italic", colors.primary)}>
                    {match.Sport?.name}
                </span>
            </div>

            {/* Main Scoreboard */}
            <div className="w-full grid grid-cols-[1fr,auto,1fr] items-center gap-12 mt-12">
                <div className="text-center space-y-6">
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight line-clamp-2 leading-none text-white/90">
                        {match.TeamA?.team_name}
                    </h2>
                    <MassiveScore 
                        value={displayA} 
                        subValue={isCricket ? `WKT: ${scoreA.wickets || 0}` : undefined} 
                        colors={colors} 
                    />
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="h-20 w-[2px] bg-slate-800" />
                    <span className={cn("text-2xl font-black italic tracking-widest px-6 py-2 bg-slate-900 border-2", colors.border, colors.primary)}>VS</span>
                    <div className="h-20 w-[2px] bg-slate-800" />
                </div>

                <div className="text-center space-y-6">
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight line-clamp-2 leading-none text-white/90">
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
                        <p className="text-slate-500 font-black text-xs uppercase tracking-widest mb-1">Innings Progress</p>
                        <p className={cn("text-3xl font-black font-mono", colors.primary)}>
                            {parseFloat(String(scoreA.overs || 0)).toFixed(1)} <span className="text-sm opacity-50">OV</span>
                        </p>
                    </div>
                    {matchData?.match_state?.target_score && (
                        <div className="text-center bg-slate-900 px-8 py-2 border-2 border-slate-800">
                            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1">Target Score</p>
                            <p className="text-3xl font-black font-mono text-amber-500">
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
        const intervalId = setInterval(fetchMatches, 15000);
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
                    <p className="text-slate-600 font-bold italic">Waiting for the next broadcast link...</p>
                </div>
            );
        }

        // Special Case: Cricket + Others (Broadcast Split)
        if (cricketMatches.length > 0 && otherMatches.length > 0) {
            return (
                <div className="h-full grid grid-cols-[2fr,1fr] gap-4">
                    <BigMatchBoard match={cricketMatches[0]} isPrimary />
                    <div className="grid grid-rows-2 gap-4">
                        {otherMatches.slice(0, 2).map(m => (
                            <BigMatchBoard key={m.id} match={m} />
                        ))}
                    </div>
                </div>
            );
        }

        // Standard Grid Case
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
        <div className="fixed inset-0 bg-black text-white p-4 flex flex-col overflow-hidden select-none cursor-none">
            {/* Master Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-900 mb-4 bg-slate-950/50 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="bg-white p-2">
                        <img src="/Energy_college_logo.svg" className="h-10 w-auto invert brightness-0" alt="Logo" />
                    </div>
                    <div className="h-10 w-[2px] bg-slate-800" />
                    <h1 className="text-4xl font-black font-headline tracking-tighter uppercase italic leading-none">
                        Energy`26 <span className="text-blue-500">Big Screen</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 border-2 border-red-600/30 bg-red-600/10">
                        <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)]" />
                        <span className="text-xl font-black uppercase tracking-[0.2em] text-red-600">Broadcast Live</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => document.documentElement.requestFullscreen()} className="text-slate-700 hover:text-white">
                        <Maximize className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Scoring Area */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="h-full flex items-center justify-center"
                        >
                            <Loader2 className="h-20 w-20 animate-spin text-slate-800" />
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

            {/* Footer ticker placeholder */}
            <div className="mt-4 py-3 bg-slate-950 border-t-2 border-slate-900 flex items-center px-6 overflow-hidden">
                <div className="whitespace-nowrap flex gap-12 animate-marquee font-black uppercase text-sm tracking-widest text-slate-500 italic">
                    <span>Overall Championship Points: Golden Team (67), Emerald Team (67), Crimson Team (67)</span>
                    <span>Energy 2026: Organized by Department of Physical Education, EGS Pillay Group of Institutions</span>
                    <span>Next Match: Football Boys Quarter-Finals @ 4:00 PM Main Ground</span>
                </div>
            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
