'use client';
import { useMemo } from 'react';
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Calendar, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { ApiMatch } from '@/lib/api';

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

function ScoreUnit({ value, colors, label, isDense = false }: { value: string | number, colors: any, label: string, isDense?: boolean }) {
    const isLongText = typeof value === 'string' && value.length > 7;
    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-center px-2">
            <span className={cn(
                "font-black uppercase tracking-wider text-white mb-2 line-clamp-2 flex items-center justify-center leading-tight",
                isDense ? "text-sm min-h-[2.5rem]" : "text-base min-h-[3rem]"
            )}>
                {label}
            </span>
            <motion.span 
                key={String(value)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "font-black font-mono tracking-tighter tabular-nums leading-none", 
                    colors.primary,
                    isLongText 
                        ? (isDense ? "text-xl" : "text-3xl")
                        : (isDense ? "text-5xl sm:text-6xl" : "text-7xl sm:text-8xl")
                )}
            >
                {value}
            </motion.span>
        </div>
    );
}

function BigMatchBoard({ match, isDense = false }: { match: ApiMatch, isDense?: boolean }) {
    const { matchData } = useMatchSync(match.id);
    const colors = getColors(match.Sport?.name);
    
    const scores = { ...(match.score_details || {}), ...(matchData?.score_details || {}) };
    const matchState = { ...(match.match_state || {}), ...(matchData?.match_state || {}) };
    
    const scoreA = scores[match.team_a_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    const scoreB = scores[match.team_b_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    
    const isCricket = match.Sport?.name?.toLowerCase().includes('cricket');
    const currentInnings = matchState.current_innings || 1;
    const battingTeamId = matchState.batting_team_id;

    let displayA: string | number = scoreA.score ?? scoreA.runs ?? 0;
    let displayB: string | number = scoreB.score ?? scoreB.runs ?? 0;

    if (isCricket) {
        displayA = `${scoreA.runs || 0}/${scoreA.wickets || 0}`;
        displayB = `${scoreB.runs || 0}/${scoreB.wickets || 0}`;

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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "relative h-full flex flex-col items-center justify-between border bg-slate-950 overflow-hidden",
                isDense ? "p-3" : "p-6",
                colors.border, colors.bg
            )}
        >
            <div className="w-full flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
                <span className={cn("font-black uppercase tracking-widest italic", colors.primary, isDense ? "text-[10px]" : "text-xs")}>
                    {match.Sport?.name}
                </span>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">LIVE</span>
                </div>
            </div>

            <div className="flex-1 w-full grid grid-cols-[1fr,auto,1fr] items-center gap-2 sm:gap-4">
                <ScoreUnit 
                    label={match.TeamA?.team_name || 'Team A'}
                    value={displayA} 
                    colors={colors} 
                    isDense={isDense}
                />
                <div className="flex flex-col items-center justify-center gap-2 opacity-20">
                    <div className="h-12 w-[1px] bg-slate-100" />
                    <span className="text-[10px] font-black italic text-white uppercase tracking-widest">VS</span>
                    <div className="h-12 w-[1px] bg-slate-100" />
                </div>
                <ScoreUnit 
                    label={match.TeamB?.team_name || 'Team B'}
                    value={displayB} 
                    colors={colors} 
                    isDense={isDense}
                />
            </div>

            <div className="w-full flex justify-center items-center pt-2 border-t border-slate-900 mt-2">
                {isCricket ? (
                    <div className="flex gap-8">
                        <div className="text-center">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Overs</span>
                            <span className={cn("font-black font-mono text-white", isDense ? "text-sm" : "text-lg")}>
                                {parseFloat(String(battingTeamId === match.team_b_id ? scoreB.overs : scoreA.overs || 0)).toFixed(1)}
                            </span>
                        </div>
                        {matchState?.target_score && (
                            <div className="text-center">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Target</span>
                                <span className={cn("font-black font-mono text-amber-500", isDense ? "text-sm" : "text-lg")}>
                                    {matchState.target_score}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">Broadcast Engine Active</span>
                )}
            </div>
        </motion.div>
    );
}

function ScheduledMatchesTable({ matches }: { matches: ApiMatch[] }) {
    if (matches.length === 0) return null;
    return (
        <div className="w-full border-t-2 border-slate-800 bg-slate-950 p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <h2 className="text-amber-500 font-black text-xs uppercase tracking-[0.4em]">Arena Schedule</h2>
                </div>
                <Badge variant="outline" className="border-slate-800 text-slate-600 rounded-none uppercase text-[8px] tracking-widest">Real-time Feed</Badge>
            </div>
            
            <div className="overflow-hidden border border-slate-900 rounded-sm bg-slate-950/50">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">
                        <tr>
                            <th className="p-3 pl-6">Sport</th>
                            <th className="p-3">Competitors</th>
                            <th className="p-3 text-right pr-6">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                        {matches.map(m => (
                            <tr key={m.id} className="text-white">
                                <td className="p-3 pl-6"><span className="font-black text-xs uppercase tracking-wider text-slate-400">{m.Sport?.name}</span></td>
                                <td className="p-3">
                                    <div className="flex items-center gap-4 text-sm font-black uppercase tracking-tight">
                                        <span className="truncate max-w-[200px]">{m.TeamA?.team_name}</span>
                                        <span className="text-[10px] text-slate-600 italic">VS</span>
                                        <span className="truncate max-w-[200px]">{m.TeamB?.team_name}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-right pr-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 px-2 py-1 border border-slate-800 rounded">Upcoming</span>
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
    const { matches, error, isLoading } = useLiveMatches();

    const liveMatches = useMemo(() => 
        matches.filter(m => (m.status || '').toLowerCase() === 'live').slice(0, 6)
    , [matches]);

    const scheduledMatches = useMemo(() => 
        matches.filter(m => (m.status || '').toLowerCase() === 'scheduled').slice(0, 5)
    , [matches]);

    const getGridConfig = () => {
        const count = liveMatches.length;
        if (count <= 1) return "grid-cols-1 grid-rows-1";
        if (count === 2) return "grid-cols-2 grid-rows-1";
        if (count === 3) return "grid-cols-3 grid-rows-1";
        if (count === 4) return "grid-cols-2 grid-rows-2"; // 2x2 Even Split
        return "grid-cols-3 grid-rows-2";
    };

    const isDense = liveMatches.length > 2;

    return (
        <div className="fixed inset-0 bg-black text-white p-2 flex flex-col overflow-hidden select-none z-[9999]">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="loader" className="flex-1 flex items-center justify-center">
                        <div className="h-12 w-12 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin" />
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="content" className="flex-1 flex flex-col gap-2 min-h-0">
                        {liveMatches.length > 0 ? (
                            <div className={cn("flex-1 min-h-0 grid gap-2 overflow-hidden", getGridConfig())}>
                                <AnimatePresence mode="popLayout">
                                    {liveMatches.map(m => (
                                        <BigMatchBoard key={m.id} match={m} isDense={isDense} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <Zap className="h-16 w-16 text-slate-900 mb-6" />
                                <h1 className="text-xl font-black uppercase tracking-[0.5em] text-slate-800">Arena Standby</h1>
                            </div>
                        )}
                        
                        <ScheduledMatchesTable matches={scheduledMatches} />
                        
                        {error && (
                            <div className="absolute top-4 right-4 flex items-center gap-3 px-4 py-2 bg-red-600 border-2 border-red-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-2xl z-50">
                                <AlertCircle className="h-4 w-4" /> {error}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
