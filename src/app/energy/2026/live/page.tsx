
'use client';
import { useState, useEffect, useCallback } from 'react';
import { getLiveMatches, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { Radio, Trophy, ExternalLink, Activity, Zap, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

function LiveMatchRow({ match, onSelect }: { match: ApiMatch, onSelect: () => void }) {
    const { matchData } = useMatchSync(match.id);
    
    const getLiveScores = () => {
        let base = match.score_details;
        if (typeof base === 'string') {
            try { base = JSON.parse(base); } catch(e) { base = {}; }
        }
        return { ...(base || {}), ...(matchData?.score_details || {}) };
    };

    const scores = getLiveScores();
    const isCricket = match.Sport?.name === 'Cricket';
    const scoreA = scores[match.team_a_id] || { runs: 0, score: 0, wickets: 0 };
    const scoreB = scores[match.team_b_id] || { runs: 0, score: 0, wickets: 0 };

    const scoreADisplay = isCricket ? `${scoreA.runs ?? 0}/${scoreA.wickets ?? 0}` : (scoreA.score ?? 0);
    const scoreBDisplay = isCricket ? `${scoreB.runs ?? 0}/${scoreB.wickets ?? 0}` : (scoreB.score ?? 0);

    return (
        <TableRow onClick={onSelect} className="cursor-pointer hover:bg-muted/50 transition-colors border-b border-slate-100">
            <TableCell className="py-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{match.Sport?.name}</span>
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", match.status === 'live' ? "bg-red-600 animate-pulse" : "bg-slate-200")} />
                        <span className={cn("text-[9px] font-bold uppercase tracking-widest", match.status === 'live' ? "text-red-600" : "text-slate-400")}>
                            {match.status === 'live' ? 'Live' : match.status}
                        </span>
                    </div>
                </div>
            </TableCell>
            <TableCell className="font-bold">
                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-8">
                    <div className="text-right uppercase tracking-tight text-sm truncate">{match.TeamA?.team_name}</div>
                    <div className="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-400 italic border">VS</div>
                    <div className="text-left uppercase tracking-tight text-sm truncate">{match.TeamB?.team_name}</div>
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="inline-flex items-center gap-2 bg-slate-950 text-white px-4 py-1.5 font-mono font-bold text-xl tabular-nums shadow-lg">
                    <span>{scoreADisplay}</span>
                    <span className="text-slate-600">/</span>
                    <span>{scoreBDisplay}</span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm" className="font-bold text-[10px] uppercase tracking-widest h-8">
                    Hub <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
            </TableCell>
        </TableRow>
    );
}

export default function LivePage() {
    const [liveMatches, setLiveMatches] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const sseUrl = `https://energy-sports-meet-backend.vercel.app/api/v1/matches/live?stream=true`;
        const eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (event) => {
            try {
                const matches: ApiMatch[] = JSON.parse(event.data);
                setLiveMatches(matches);
                setIsLoading(false);
            } catch (err) { console.error("SSE parse error", err); }
        };

        return () => eventSource.close();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <div className="container py-12 md:py-20 space-y-12">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full mb-4">
                        <Radio className="h-4 w-4 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Broadcast</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter text-slate-900 uppercase italic">
                        Energy <span className="text-primary">Live</span>
                    </h1>
                </div>

                <div className="max-w-6xl mx-auto">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-20 w-full bg-slate-100 animate-pulse" />)}
                        </div>
                    ) : liveMatches.length > 0 ? (
                        <div className="bg-white border border-slate-200 shadow-xl overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b">
                                    <TableRow>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Status</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Competing Teams</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4 text-center">Score</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4 text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <tbody className="divide-y divide-slate-100">
                                    {liveMatches.map((match) => (
                                        <LiveMatchRow key={match.id} match={match} onSelect={() => {}} />
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white border border-slate-200 shadow-xl rounded-lg max-w-md mx-auto">
                            <Activity className="h-16 w-16 mx-auto mb-6 text-slate-300" />
                            <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900">No active matches</h3>
                            <p className="text-sm font-medium text-slate-500 italic mt-2">Check the schedule for upcoming games.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
