'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Zap, Calendar, AlertCircle, Shield, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/shared/logo';
import type { ApiMatch } from '@/lib/api';

function ScoreUnitVertical({ label, value, colorClass }: { label: string, value: string | number, colorClass: string }) {
    return (
        <div className="flex flex-col items-center justify-center w-full py-8 text-center border-b border-white/10 last:border-0">
            <span className="text-xl font-black uppercase tracking-[0.3em] text-slate-500 mb-4 px-4 leading-tight">
                {label}
            </span>
            <motion.span 
                key={String(value)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "font-black font-mono tracking-tighter tabular-nums leading-none text-8xl md:text-9xl", 
                    colorClass
                )}
            >
                {value}
            </motion.span>
        </div>
    );
}

function VerticalMatchBoard({ match }: { match: ApiMatch }) {
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
            className="flex-1 flex flex-col items-center justify-between py-12"
        >
            <div className="flex-1 w-full flex flex-col justify-center gap-12">
                <ScoreUnitVertical 
                    label={match.TeamA?.team_name || 'Team A'} 
                    value={displayA} 
                    colorClass="text-white" 
                />
                
                <div className="flex items-center justify-center gap-6 opacity-30">
                    <div className="h-[2px] w-12 bg-white" />
                    <span className="text-2xl font-black italic text-white uppercase tracking-widest">VERSUS</span>
                    <div className="h-[2px] w-12 bg-white" />
                </div>

                <ScoreUnitVertical 
                    label={match.TeamB?.team_name || 'Team B'} 
                    value={displayB} 
                    colorClass="text-white" 
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
            className="flex-1 flex flex-col p-8 space-y-8"
        >
            <div className="flex items-center gap-4 border-b-2 border-primary pb-4">
                <Calendar className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-black uppercase tracking-tighter">Upcoming {sportName}</h2>
            </div>

            <div className="space-y-6">
                {matches.length > 0 ? matches.map((m) => (
                    <div key={m.id} className="bg-slate-900 border border-slate-800 p-6 rounded-none">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>{m.venue}</span>
                                <span className="px-2 py-0.5 border border-slate-700 text-slate-400">Scheduled</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-xl font-black text-white uppercase leading-none truncate">{m.TeamA.team_name}</p>
                                <p className="text-[10px] font-bold text-slate-600 italic">VS</p>
                                <p className="text-xl font-black text-white uppercase leading-none truncate">{m.TeamB.team_name}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 opacity-20">
                        <Swords className="h-20 w-20 mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest">No Matches Scheduled</p>
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

    const activeLiveMatch = useMemo(() => 
        filteredMatches.find(m => (m.status || '').toLowerCase() === 'live')
    , [filteredMatches]);

    const scheduledMatches = useMemo(() => 
        filteredMatches.filter(m => (m.status || '').toLowerCase() === 'scheduled')
    , [filteredMatches]);

    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none z-[9999]">
            <header className="p-8 border-b border-white/5 bg-slate-950 flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-500 italic flex items-center gap-2">
                        <Zap className="h-6 w-6 fill-current" />
                        Arena Broadcast
                    </h1>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mt-1">Live Feed Synchronization</span>
                </div>
                {activeLiveMatch && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-600/10 border border-red-600/50 rounded-full">
                        <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-red-500">Live Arena</span>
                    </div>
                )}
            </header>

            <main className="flex-1 flex flex-col min-h-0 relative">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center">
                            <div className="h-12 w-12 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin" />
                        </motion.div>
                    ) : dataMode === 'fixtures' ? (
                        <VerticalFixturesView matches={scheduledMatches} sportName={gameQuery || 'All Sports'} />
                    ) : activeLiveMatch ? (
                        <VerticalMatchBoard match={activeLiveMatch} />
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <Shield className="h-24 w-24 text-slate-900 mb-8" />
                            <h2 className="text-xl font-black uppercase tracking-[0.3em] text-slate-800">Arena Standby</h2>
                            <p className="text-xs font-bold text-slate-600 mt-4 uppercase tracking-widest">Waiting for {gameQuery || 'sports'} signal...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="absolute top-4 right-4 z-50">
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-600 border border-red-500 rounded-full text-[8px] font-black uppercase tracking-widest shadow-2xl">
                            <AlertCircle className="h-3 w-3" /> {error}
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-12 bg-slate-950 border-t border-white/5 flex flex-col items-center justify-center shrink-0">
                <Logo className="h-16 w-48 mb-4 scale-125 opacity-80" />
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 mt-6">EGS Pillay Group of Institutions</p>
            </footer>
        </div>
    );
}

export default function VerticalDisplayPage() {
    return (
        <Suspense fallback={<div className="fixed inset-0 bg-black flex items-center justify-center text-white">Initializing Broadcast...</div>}>
            <VerticalDisplayContent />
        </Suspense>
    );
}
