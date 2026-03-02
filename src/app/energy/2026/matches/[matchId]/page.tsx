
'use client';

import { use, useEffect, useState } from 'react';
import { getMatchById, type ApiMatch } from '@/lib/api';
import { useMatchSync } from '@/hooks/useMatchSync';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, MapPin, Clock, Activity, History, Users, ArrowLeft, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function MatchDetailContent({ matchId }: { matchId: string }) {
    const [initialMatch, setInitialMatch] = useState<ApiMatch | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { matchData, isLoading: isSyncing } = useMatchSync(matchId);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const data = await getMatchById(matchId);
                setInitialMatch(data);
            } catch (err) {
                console.error("Match fetch error:", err);
                setError("Could not load match details. It might be private or doesn't exist.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitial();
    }, [matchId]);

    if (isLoading) {
        return (
            <div className="container py-8 space-y-6">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-[400px] w-full rounded-2xl" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (error || !initialMatch) {
        return (
            <div className="container py-20 text-center space-y-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
                    <Zap className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold font-headline">Match Not Found</h1>
                <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
                <Button asChild className="mt-6">
                    <Link href="/energy/2026/live">View Live Games</Link>
                </Button>
            </div>
        );
    }

    // Merge RTDB data with initial data for real-time reactivity
    const match = initialMatch;
    const scores = { ...(match.score_details || {}), ...(matchData?.score_details || {}) };
    const state = { ...(match.match_state || {}), ...(matchData?.match_state || {}) };
    const history = matchData?.match_history || [];

    const isCricket = match.Sport?.name?.toLowerCase().includes('cricket');
    const scoreA = scores[match.team_a_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };
    const scoreB = scores[match.team_b_id] || { runs: 0, score: 0, wickets: 0, overs: 0 };

    const scoreADisplay = isCricket ? `${scoreA.runs ?? 0}/${scoreA.wickets ?? 0}` : (scoreA.score ?? 0);
    const scoreBDisplay = isCricket ? `${scoreB.runs ?? 0}/${scoreB.wickets ?? 0}` : (scoreB.score ?? 0);

    return (
        <div className="container py-8 space-y-8 animate-in fade-in duration-700">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="gap-2 -ml-4 hover:bg-slate-100 rounded-xl">
                    <Link href="/energy/2026/live">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Live
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", match.status === 'live' ? "bg-red-600 animate-pulse" : "bg-slate-300")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", match.status === 'live' ? "text-red-600" : "text-slate-500")}>
                        {match.status}
                    </span>
                </div>
            </div>

            {/* Immersive Scoreboard Hero */}
            <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[2rem]">
                <div className="p-8 md:p-12 space-y-12 relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Activity className="h-64 w-64" />
                    </div>

                    {/* Meta Header */}
                    <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-blue-400 font-black tracking-[0.3em] py-1 px-4 uppercase">
                            {match.Sport?.name}
                        </Badge>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-500" /> {match.venue}</div>
                            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> {format(new Date(match.start_time), 'PPP p')}</div>
                        </div>
                    </div>

                    {/* Main Score Area */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-8 md:gap-16 relative z-10">
                        <div className="text-center md:text-right space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">{match.TeamA.team_name}</h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{match.TeamA.Captain?.College?.name || 'Competing Squad'}</p>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-baseline gap-6 bg-white/5 px-10 py-6 rounded-[2.5rem] border border-white/10 backdrop-blur shadow-inner">
                                <span className="text-7xl md:text-9xl font-black font-mono tracking-tighter tabular-nums text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{scoreADisplay}</span>
                                <span className="text-2xl font-black text-slate-700 italic">VS</span>
                                <span className="text-7xl md:text-9xl font-black font-mono tracking-tighter tabular-nums text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{scoreBDisplay}</span>
                            </div>
                            {isCricket && state.target_score && (
                                <Badge variant="secondary" className="bg-amber-500 text-black font-black tracking-widest px-6 py-1.5 rounded-full text-xs animate-bounce">
                                    TARGET: {state.target_score}
                                </Badge>
                            )}
                        </div>

                        <div className="text-center md:text-left space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">{match.TeamB.team_name}</h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{match.TeamB.Captain?.College?.name || 'Competing Squad'}</p>
                        </div>
                    </div>

                    {/* Dynamic Situational Bar */}
                    {isCricket && (
                        <div className="flex justify-center gap-12 pt-8 border-t border-white/5">
                            <div className="text-center">
                                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Overs</span>
                                <span className="text-2xl font-black font-mono text-blue-400">{parseFloat(String(state.batting_team_id === match.team_b_id ? scoreB.overs : scoreA.overs || 0)).toFixed(1)}</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Innings Phase</span>
                                <span className="text-2xl font-black font-mono text-white">{state.current_innings || 1}st INN</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Secondary Center Column */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2rem] border-slate-100 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
                            <div className="flex items-center gap-3">
                                <Activity className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Match Command Center</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isCricket ? (
                                <div className="divide-y divide-slate-100">
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-6 rounded-[1.5rem] bg-blue-50/50 border border-blue-100 relative group overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Activity className="h-12 w-12" /></div>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">On Strike</p>
                                                <p className="text-xl font-black tracking-tight">{matchData?.current_batsmen_stats?.[state.striker_id]?.name || 'Position Open'}</p>
                                            </div>
                                            <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Non-Striker</p>
                                                <p className="text-xl font-black tracking-tight">{matchData?.current_batsmen_stats?.[state.non_striker_id]?.name || 'Position Open'}</p>
                                            </div>
                                            <div className="p-6 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Bowling</p>
                                                <p className="text-xl font-black tracking-tight">{matchData?.current_bowler_stats?.[state.bowler_id]?.name || 'Attack TBD'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-20 text-center space-y-4">
                                    <Activity className="h-12 w-12 text-slate-200 mx-auto" />
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Awaiting situational statistical feed</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline Feed */}
                    <Card className="rounded-[2rem] border-slate-100 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
                            <div className="flex items-center gap-3">
                                <History className="h-5 w-5 text-slate-600" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Action Timeline</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            {history.length > 0 ? (
                                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                                    {history.map((event: any, i: number) => (
                                        <div key={i} className="relative flex items-center gap-6 group">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm z-10">
                                                <Zap className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm bg-white hover:border-blue-200 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(event.timestamp), 'HH:mm:ss')}</span>
                                                    {event.type && <Badge variant="outline" className="text-[8px] font-black uppercase bg-slate-50">{event.type}</Badge>}
                                                </div>
                                                <div className="font-black text-slate-900 uppercase tracking-tight">{event.description || `${event.points || event.runs} Point Event`}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                    <Clock className="h-12 w-12 text-slate-100 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Timeline standby... awaiting first ball</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Vertical Sidebar: Summary & Result */}
                <div className="space-y-8">
                    <Card className="rounded-[2rem] border-slate-100 shadow-xl overflow-hidden bg-white">
                        <CardHeader className={cn("py-8 text-center text-white", match.status === 'completed' ? "bg-emerald-600" : "bg-blue-600")}>
                            <CardTitle className="text-xs font-black uppercase tracking-[0.3em]">Official Result</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 text-center space-y-6">
                            {match.status === 'completed' ? (
                                <>
                                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 shadow-inner">
                                        <Star className="h-10 w-10 fill-current" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">
                                            {match.TeamA.id === state.winner_id ? match.TeamA.team_name : match.TeamB.team_name}
                                        </h3>
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Match Winners</p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Official MVP</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black">
                                                <Users className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <span className="font-bold text-sm">Player Stats Pending</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="py-12 space-y-6">
                                    <div className="h-16 w-16 border-4 border-t-blue-600 border-slate-100 rounded-full animate-spin mx-auto shadow-sm" />
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Arena Active</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live from {match.venue}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-slate-100 shadow-xl bg-slate-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Match Officials</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
                                <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-black uppercase tracking-tight text-sm">{match.referee_name || 'TBA'}</p>
                                    <p className="text-[10px] uppercase font-black text-blue-600 tracking-widest">Ground Referee</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
    const { matchId } = use(params);
    return <MatchDetailContent matchId={matchId} />;
}
