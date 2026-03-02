'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Zap, Calendar, AlertCircle, Shield, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApiMatch } from '@/lib/api';

function ScoreUnitVertical({ label, value, colorClass, isMultiple }: { label: string, value: string | number, colorClass: string, isMultiple: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center w-full py-2 text-center overflow-hidden">
            <span className={cn(
                "font-black uppercase tracking-[0.2em] text-slate-500 mb-1 px-4 leading-tight w-full line-clamp-1",
                isMultiple ? "text-sm sm:text-base" : "text-lg md:text-xl"
            )}>
                {label}
            </span>
            <motion.span 
                key={String(value)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "font-black font-mono tracking-tighter tabular-nums leading-none", 
                    colorClass,
                    isMultiple ? "text-[15vw] sm:text-7xl" : "text-[22vw] md:text-9xl"
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
            <div className="w-full flex flex-col justify-center gap-4 md:gap-8">
                <ScoreUnitVertical 
                    label={match.TeamA?.team_name || 'Team A'} 
                    value={displayA} 
                    colorClass="text-white" 
                    isMultiple={isMultiple}
                />
                
                <div className="flex items-center justify-center gap-4 opacity-20 shrink-0">
                    <div className="h-[1px] flex-1 bg-white" />
                    <span className={cn("font-black italic text-white uppercase tracking-widest", isMultiple ? "text-xs" : "text-xl")}>VS</span>
                    <div className="h-[1px] flex-1 bg-white" />
                </div>

                <ScoreUnitVertical 
                    label={match.TeamB?.team_name || 'Team B'} 
                    value={displayB} 
                    colorClass="text-white" 
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
            className="flex-1 flex flex-col p-6 sm:p-10 space-y-8 bg-black overflow-hidden h-full"
        >
            <div className="flex items-center gap-4 border-b-2 border-white/10 pb-4 shrink-0">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white truncate">Upcoming {sportName}</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                {matches.length > 0 ? matches.map((m) => (
                    <div key={m.id} className="bg-slate-950 border border-white/5 p-5 rounded-none shadow-2xl transition-all hover:border-white/20">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600">
                                <span>{m.venue}</span>
                                <span className="px-2 py-0.5 border border-slate-800 text-slate-500">Scheduled</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-lg sm:text-xl font-black text-white uppercase leading-tight truncate">{m.TeamA.team_name}</p>
                                <p className="text-[8px] sm:text-[10px] font-bold text-slate-700 italic">VS</p>
                                <p className="text-lg sm:text-xl font-black text-white uppercase leading-tight truncate">{m.TeamB.team_name}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-10">
                        <Swords className="h-16 w-16 mb-4 text-white" />
                        <p className="font-black uppercase tracking-widest text-white text-center">No Matches<br/>Scheduled</p>
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
                            <div className="h-10 w-10 border-2 border-t-white border-white/5 rounded-full animate-spin" />
                        </motion.div>
                    ) : dataMode === 'fixtures' ? (
                        <VerticalFixturesView matches={scheduledMatches} sportName={gameQuery || 'All Sports'} />
                    ) : liveMatches.length > 0 ? (
                        <div className="flex-1 flex flex-col divide-y divide-white/10 h-full overflow-hidden">
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
                            <h2 className="text-base font-black uppercase tracking-[0.3em] text-slate-900">Arena Standby</h2>
                            <p className="text-[10px] font-bold text-slate-800 mt-4 uppercase tracking-widest">Waiting for {gameQuery || 'sports'} signal...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Vertical Broadcast Polish */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-600/50 rounded-full text-[7px] font-black uppercase tracking-widest text-red-500 shadow-2xl">
                            <AlertCircle className="h-3 w-3" /> {error}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function VerticalDisplayPage() {
    return (
        <Suspense fallback={<div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white h-[100dvh]">
            <div className="h-8 w-8 border-2 border-t-white border-white/10 rounded-full animate-spin mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Broadcast</span>
        </div>}>
            <VerticalDisplayContent />
        </Suspense>
    );
}
