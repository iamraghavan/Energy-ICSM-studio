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
 * Features multi-line team names and high-intensity colors.
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
        <div className="flex flex-col items-center justify-center w-full py-4 text-center overflow-hidden">
            {/* Team Name: Multi-line enabled with vibrant colors */}
            <span className={cn(
                "font-black uppercase tracking-tighter mb-2 px-6 leading-[0.9] w-full break-words text-wrap",
                labelColor,
                isMultiple ? "text-3xl sm:text-4xl" : "text-5xl sm:text-7xl"
            )}>
                {label}
            </span>
            
            {/* Score: Oversized Monospaced digits */}
            <motion.span 
                key={String(value)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "font-black font-mono tracking-tighter tabular-nums leading-none text-white", 
                    isMultiple ? "text-[20vw] sm:text-8xl" : "text-[32vw] md:text-[14rem]"
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
            className="flex-1 flex flex-col items-center justify-center bg-black w-full min-h-0 p-6"
        >
            <div className="w-full flex flex-col justify-center gap-8 md:gap-12">
                {/* Team A - Amber/Gold for high visibility */}
                <ScoreUnitVertical 
                    label={match.TeamA?.team_name || 'Team A'} 
                    value={displayA} 
                    labelColor="text-amber-400" 
                    isMultiple={isMultiple}
                />
                
                {/* Visual Divider */}
                <div className="flex items-center justify-center gap-6 px-10 opacity-30 shrink-0">
                    <div className="h-[4px] flex-1 bg-white" />
                    <span className={cn("font-black italic text-white uppercase tracking-widest", isMultiple ? "text-xl" : "text-3xl")}>VS</span>
                    <div className="h-[4px] flex-1 bg-white" />
                </div>

                {/* Team B - Sky Blue for contrast */}
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
            className="flex-1 flex flex-col p-8 sm:p-12 space-y-10 bg-black overflow-hidden h-full"
        >
            <div className="flex items-center gap-6 border-b-4 border-white/10 pb-6 shrink-0">
                <Calendar className="h-10 w-10 text-white" />
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white truncate">Upcoming {sportName}</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                {matches.length > 0 ? matches.map((m) => (
                    <div key={m.id} className="bg-slate-900 border-l-8 border-amber-500 p-8 rounded-none shadow-2xl transition-all hover:bg-slate-800/50">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                                <span>{m.venue}</span>
                                <span className="px-3 py-1 bg-slate-800 text-amber-500">Scheduled</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-2xl sm:text-4xl font-black text-white uppercase leading-none break-words">{m.TeamA.team_name}</p>
                                <p className="text-xs font-black text-slate-600 italic tracking-widest">VERSUS</p>
                                <p className="text-2xl sm:text-4xl font-black text-white uppercase leading-none break-words">{m.TeamB.team_name}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-10">
                        <Swords className="h-24 w-24 mb-6 text-white" />
                        <p className="font-black uppercase tracking-[0.4em] text-white text-center text-xl">Arena<br/>Cleared</p>
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
                            <div className="h-12 w-12 border-4 border-t-white border-white/10 rounded-full animate-spin" />
                        </motion.div>
                    ) : dataMode === 'fixtures' ? (
                        <VerticalFixturesView matches={scheduledMatches} sportName={gameQuery || 'All Sports'} />
                    ) : liveMatches.length > 0 ? (
                        <div className="flex-1 flex flex-col divide-y-4 divide-white/10 h-full overflow-hidden">
                            {liveMatches.map(match => (
                                <VerticalMatchBoard 
                                    key={match.id} 
                                    match={match} 
                                    isMultiple={liveMatches.length > 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
                            <Shield className="h-32 w-32 text-slate-900 mb-8" />
                            <h2 className="text-xl font-black uppercase tracking-[0.5em] text-slate-900">Standby Mode</h2>
                            <p className="text-xs font-bold text-slate-800 mt-6 uppercase tracking-[0.3em]">Waiting for {gameQuery || 'sports'} broadcast...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Vertical Broadcast Polish - Gradients for depth */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-10 opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-10 opacity-80" />

                {error && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
                        <div className="flex items-center gap-3 px-4 py-2 bg-red-600/20 border-2 border-red-600/50 rounded-full text-[8px] font-black uppercase tracking-[0.4em] text-red-500 shadow-2xl">
                            <AlertCircle className="h-4 w-4" /> Signal Lost
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
                <div className="h-10 w-10 border-4 border-t-white border-white/10 rounded-full animate-spin mb-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing Broadcast Link</span>
            </div>
        }>
            <VerticalDisplayContent />
        </Suspense>
    );
}
