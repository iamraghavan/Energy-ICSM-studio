'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Zap, Calendar, AlertCircle, Shield, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApiMatch } from '@/lib/api';

/**
 * Enhanced Score Unit for Vertical Displays
 * Adjusted font sizes to fit perfectly within the vertical viewport.
 */
function ScoreUnitVertical({ 
    label, 
    value, 
    labelColor, 
    isMultiple 
}: { 
    label: string, 
    value: string | number, 
    labelColor: string, 
    isMultiple: boolean 
}) {
    return (
        <div className="flex flex-col items-center justify-center w-full py-2 text-center overflow-hidden">
            {/* Team Name: Reduced scale but maintained wrapping for long names */}
            <span className={cn(
                "font-black uppercase tracking-tighter mb-1 px-4 leading-tight w-full break-words text-wrap",
                labelColor,
                isMultiple ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"
            )}>
                {label}
            </span>
            
            {/* Score: Switched to vh units to ensure vertical fit */}
            <motion.span 
                key={String(value)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "font-black font-mono tracking-tighter tabular-nums leading-none text-white", 
                    isMultiple ? "text-[12vh] sm:text-7xl" : "text-[18vh] md:text-[10rem]"
                )}
            >
                {value}
            </motion.span>
        </div>
    );
}

function VerticalMatchBoard({ match, isMultiple }: { match: ApiMatch, isMultiple: boolean }) {
    const { matchData } = useMatchSync(match.id);
    const scoreA = matchData?.score_details?.[match.team_a_id] || match.score_details?.[match.team_a_id] || { score: 0, runs: 0, wickets: 0 };
    const scoreB = matchData?.score_details?.[match.team_b_id] || match.score_details?.[match.team_b_id] || { score: 0, runs: 0, wickets: 0 };
    
    const isCricket = match.Sport?.name?.toLowerCase().includes('cricket');
    
    const displayA = isCricket ? `${scoreA.runs || 0}/${scoreA.wickets || 0}` : (scoreA.score ?? 0);
    const displayB = isCricket ? `${scoreB.runs || 0}/${scoreB.wickets || 0}` : (scoreB.score ?? 0);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center bg-black w-full min-h-0 p-4"
        >
            <div className="w-full flex flex-col justify-center gap-4 md:gap-6">
                {/* Team A - Amber/Gold */}
                <ScoreUnitVertical 
                    label={match.TeamA?.team_name || 'Team A'} 
                    value={displayA} 
                    labelColor="text-amber-400" 
                    isMultiple={isMultiple}
                />
                
                {/* Visual Divider - Smaller footprint */}
                <div className="flex items-center justify-center gap-4 px-10 opacity-20 shrink-0">
                    <div className="h-[2px] flex-1 bg-white" />
                    <span className={cn("font-black italic text-white uppercase tracking-widest", isMultiple ? "text-lg" : "text-xl")}>VS</span>
                    <div className="h-[2px] flex-1 bg-white" />
                </div>

                {/* Team B - Sky Blue */}
                <ScoreUnitVertical 
                    label={match.TeamB?.team_name || 'Team B'} 
                    value={displayB} 
                    labelColor="text-sky-400" 
                    isMultiple={isMultiple}
                />
            </div>
        </motion.div>
    );
}

function VerticalFixturesView({ matches, sportName }: { matches: ApiMatch[], sportName: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col p-6 sm:p-8 space-y-6 bg-black overflow-hidden h-full"
        >
            <div className="flex items-center gap-4 border-b-2 border-white/10 pb-4 shrink-0">
                <Calendar className="h-6 w-6 text-white" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white truncate">Upcoming {sportName}</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                {matches.length > 0 ? matches.map((m) => (
                    <div key={m.id} className="bg-slate-900 border-l-4 border-amber-500 p-4 rounded-none shadow-xl">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                                <span>{m.venue}</span>
                                <span className="px-2 py-0.5 bg-slate-800 text-amber-500">Scheduled</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-lg sm:text-xl font-black text-white uppercase leading-tight break-words">{m.TeamA.team_name}</p>
                                <p className="text-[10px] font-black text-slate-600 italic tracking-widest my-0.5">VERSUS</p>
                                <p className="text-lg sm:text-xl font-black text-white uppercase leading-tight break-words">{m.TeamB.team_name}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-10">
                        <Swords className="h-16 w-16 mb-4 text-white" />
                        <p className="font-black uppercase tracking-[0.4em] text-white text-center text-sm">Arena<br/>Cleared</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function VerticalDisplayContent() {
    const searchParams = useSearchParams();
    const gameQuery = searchParams.get('game')?.toLowerCase();
    const dataMode = searchParams.get('data')?.toLowerCase();

    const { matches, isLoading, error } = useLiveMatches();

    const filteredMatches = useMemo(() => {
        if (!gameQuery) return matches;
        return matches.filter(m => m.Sport?.name?.toLowerCase().includes(gameQuery));
    }, [matches, gameQuery]);

    const liveMatches = useMemo(() => 
        filteredMatches.filter(m => (m.status || '').toLowerCase() === 'live')
    , [filteredMatches]);

    const scheduledMatches = useMemo(() => 
        filteredMatches.filter(m => (m.status || '').toLowerCase() === 'scheduled')
    , [filteredMatches]);

    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none z-[9999] h-[100dvh] w-full">
            <main className="flex-1 flex flex-col min-h-0 relative h-full">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center">
                            <div className="h-8 w-8 border-4 border-t-white border-white/10 rounded-full animate-spin" />
                        </motion.div>
                    ) : dataMode === 'fixtures' ? (
                        <VerticalFixturesView matches={scheduledMatches} sportName={gameQuery || 'All Sports'} />
                    ) : liveMatches.length > 0 ? (
                        <div className="flex-1 flex flex-col divide-y-2 divide-white/10 h-full overflow-hidden">
                            {liveMatches.map(match => (
                                <VerticalMatchBoard 
                                    key={match.id} 
                                    match={match} 
                                    isMultiple={liveMatches.length > 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
                            <Shield className="h-20 w-20 text-slate-900 mb-6" />
                            <h2 className="text-sm font-black uppercase tracking-[0.5em] text-slate-900">Standby Mode</h2>
                            <p className="text-[10px] font-bold text-slate-800 mt-4 uppercase tracking-[0.3em]">Waiting for {gameQuery || 'sports'} broadcast...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Subtle depth gradients */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent pointer-events-none z-10 opacity-60" />
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none z-10 opacity-60" />

                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 border border-red-600/50 rounded-full text-[7px] font-black uppercase tracking-[0.4em] text-red-500 shadow-2xl">
                            <AlertCircle className="h-3 w-3" /> Signal Interrupted
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function VerticalDisplayPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white h-[100dvh]">
                <div className="h-8 w-8 border-4 border-t-white border-white/10 rounded-full animate-spin mb-4" />
                <span className="text-[8px] font-black uppercase tracking-[0.5em] animate-pulse text-slate-500">Syncing Link</span>
            </div>
        }>
            <VerticalDisplayContent />
        </Suspense>
    );
}
