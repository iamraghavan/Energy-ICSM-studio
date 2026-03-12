
'use client';

import { useMemo, Suspense } from 'react';
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApiMatch } from '@/lib/api';

/**
 * LED Score Unit: Optimized for massive readability on P3.91/P4.81 panels.
 * Using VH units to ensure content fills the screen regardless of window size.
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
                "font-black uppercase tracking-tighter text-white mb-2 line-clamp-1 w-full px-4",
                isSmall ? "text-[4vh]" : "text-[6vh]"
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
                    isSmall ? "text-[25vh]" : "text-[35vh]"
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
        <div className="flex-1 w-full grid grid-cols-[1fr,auto,1fr] items-center gap-4 bg-black px-4">
            <LedScoreUnit 
                teamName={match.TeamA?.team_name || 'TEAM A'} 
                score={displayA} 
                colorClass="text-amber-400" 
                isSmall={isSmall}
            />
            
            <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                <div className="w-2 h-[20vh] bg-white" />
                <span className="text-[3vh] font-black italic text-white uppercase tracking-widest">VS</span>
                <div className="w-2 h-[20vh] bg-white" />
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
    const { matches, isLoading, error } = useLiveMatches();

    const liveMatches = useMemo(() => 
        matches.filter(m => (m.status || '').toLowerCase() === 'live').slice(0, 4)
    , [matches]);

    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none z-[9999] h-screen w-screen">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center"
                    >
                        <div className="h-20 w-20 border-[12px] border-t-white border-white/10 rounded-full animate-spin mb-8" />
                        <p className="text-[3vh] font-black uppercase tracking-[0.5em] text-white animate-pulse">Syncing Arena...</p>
                    </motion.div>
                ) : liveMatches.length > 0 ? (
                    <motion.div 
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col divide-y-8 divide-white/10"
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
                        className="flex-1 flex flex-col items-center justify-center text-center p-20"
                    >
                        <Zap className="h-[20vh] w-[20vh] text-white mb-10 opacity-20" />
                        <h1 className="text-[8vh] font-black uppercase tracking-[0.4em] text-white/30 leading-none">
                            ARENA<br/>STANDBY
                        </h1>
                        <p className="text-[2vh] font-bold text-white/10 mt-8 uppercase tracking-[1em]">Awaiting Live Feed</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Micro Connectivity Status (Very small to avoid pixel issues) */}
            {error && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest animate-bounce">
                    <Activity className="h-3 w-3" /> Connection Link Interrupted
                </div>
            )}
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
