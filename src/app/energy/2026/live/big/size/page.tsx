
'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApiMatch } from '@/lib/api';

/**
 * LED Score Unit: Optimized for massive readability on P3.91/P4.81 panels.
 * Using VH units to ensure content fills the screen regardless of window size.
 * Font weight is forced to maximum to compensate for broken pixel clusters.
 */
function LedScoreUnit({ 
    teamName, 
    score, 
    colorClass, 
    isSmall = false 
}: { 
    teamName: string, 
    score: string | number, 
    colorClass: string,
    isSmall?: boolean
}) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-center overflow-hidden">
            <h2 className={cn(
                "font-black uppercase tracking-tighter text-white mb-2 line-clamp-1 w-full px-4 drop-shadow-md",
                isSmall ? "text-[5vh]" : "text-[8vh]"
            )}>
                {teamName.split('-')[0].trim()}
            </h2>
            <motion.div
                key={String(score)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                    "font-black font-mono tracking-tighter tabular-nums leading-none",
                    colorClass,
                    isSmall ? "text-[28vh]" : "text-[40vh]",
                    "drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                )}
            >
                {score}
            </motion.div>
        </div>
    );
}

function LiveLedMatch({ match, matchCount }: { match: ApiMatch, matchCount: number }) {
    const { matchData } = useMatchSync(match.id);
    
    const scores = { ...(match.score_details || {}), ...(matchData?.score_details || {}) };
    const scoreA = scores[match.team_a_id] || { runs: 0, score: 0, wickets: 0 };
    const scoreB = scores[match.team_b_id] || { runs: 0, score: 0, wickets: 0 };
    
    const isCricket = match.Sport?.name?.toLowerCase().includes('cricket');
    const displayA = isCricket ? `${scoreA.runs || 0}/${scoreA.wickets || 0}` : (scoreA.score ?? 0);
    const displayB = isCricket ? `${scoreB.runs || 0}/${scoreB.wickets || 0}` : (scoreB.score ?? 0);

    const isSmall = matchCount > 1;

    return (
        <div className="flex-1 w-full grid grid-cols-[1fr,auto,1fr] items-center gap-4 bg-black px-4 overflow-hidden">
            <LedScoreUnit 
                teamName={match.TeamA?.team_name || 'TEAM A'} 
                score={displayA} 
                colorClass="text-amber-400" 
                isSmall={isSmall}
            />
            
            <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                <div className="w-3 h-[25vh] bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                <span className="text-[4vh] font-black italic text-white uppercase tracking-widest drop-shadow-lg">VS</span>
                <div className="w-3 h-[25vh] bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
            </div>

            <LedScoreUnit 
                teamName={match.TeamB?.team_name || 'TEAM B'} 
                score={displayB} 
                colorClass="text-sky-400" 
                isSmall={isSmall}
            />
        </div>
    );
}

function LedDisplayContent() {
    const searchParams = useSearchParams();
    const w = parseInt(searchParams.get('w') || '0');
    const h = parseInt(searchParams.get('h') || '0');

    const { matches, isLoading, error } = useLiveMatches();

    const liveMatches = useMemo(() => 
        matches.filter(m => (m.status || '').toLowerCase() === 'live').slice(0, 4)
    , [matches]);

    // Aspect Ratio Calculation for LED Processors
    const aspectRatioStyle = useMemo(() => {
        if (w > 0 && h > 0) {
            return {
                aspectRatio: `${w} / ${h}`,
                width: '100%',
                maxHeight: '100vh',
                margin: 'auto'
            };
        }
        return { width: '100%', height: '100vh' };
    }, [w, h]);

    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none z-[9999] h-screen w-screen">
            <div style={aspectRatioStyle} className="flex flex-col overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center bg-black"
                        >
                            <div className="h-24 w-24 border-[16px] border-t-white border-white/10 rounded-full animate-spin mb-8" />
                            <p className="text-[4vh] font-black uppercase tracking-[0.5em] text-white animate-pulse">Syncing Arena...</p>
                        </motion.div>
                    ) : liveMatches.length > 0 ? (
                        <motion.div 
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col divide-y-8 divide-white/20"
                        >
                            {liveMatches.map((match) => (
                                <LiveLedMatch 
                                    key={match.id} 
                                    match={match} 
                                    matchCount={liveMatches.length} 
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-black"
                        >
                            <Zap className="h-[25vh] w-[25vh] text-white mb-10 opacity-30 animate-pulse" />
                            <h1 className="text-[10vh] font-black uppercase tracking-[0.4em] text-white/40 leading-none">
                                ARENA<br/>STANDBY
                            </h1>
                            <p className="text-[3vh] font-bold text-white/20 mt-8 uppercase tracking-[1em]">No Active Feed</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Connectivity Status - High contrast red for instant identification */}
                {error && (
                    <div className="absolute bottom-6 right-6 flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-none font-black text-[2vh] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(220,38,38,0.5)] border-2 border-white/20 animate-bounce">
                        <Activity className="h-6 w-6" /> Signal Lost
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LedSizePage() {
    return (
        <Suspense fallback={<div className="bg-black h-screen w-screen" />}>
            <LedDisplayContent />
        </Suspense>
    );
}
