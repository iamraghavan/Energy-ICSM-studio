
'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  getScorerMatches,
  type ApiMatch,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clapperboard, Calendar, History, Trophy, AlertTriangle } from 'lucide-react';
import { MatchCard } from './scorer/MatchCard';
import { CreateMatchDialog } from './scorer/CreateMatchDialog';
import { Badge } from '@/components/ui/badge';

export function ScorerDashboard() {
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const allMatches = await getScorerMatches();
      setMatches(allMatches);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Fetching Matches',
        description: error.response?.status === 502 || error.response?.status === 503 
            ? 'The backend service is currently offline. Please try again in a few minutes.'
            : 'Could not load your assigned matches. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const liveMatches = matches.filter(m => m.status === 'live');
  const scheduledMatches = matches.filter(m => m.status === 'scheduled');
  const completedMatches = matches.filter(m => m.status === 'completed');

  const activeLiveMatch = liveMatches[0];

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline">Scorer Dashboard</h1>
          <p className="text-muted-foreground">Manage live scoring and team lineups for your assigned matches.</p>
        </div>
        <CreateMatchDialog onMatchCreated={fetchMatches} />
      </div>

      {activeLiveMatch && (
          <Card className="border-destructive bg-destructive/5 overflow-hidden">
              <CardHeader className="bg-destructive/10">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="animate-pulse">LIVE NOW</Badge>
                          <span className="font-semibold text-destructive">{activeLiveMatch.Sport.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{activeLiveMatch.venue}</span>
                  </div>
              </CardHeader>
              <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                      <div className="text-center space-y-2">
                          <p className="text-xl font-bold">{activeLiveMatch.TeamA.team_name}</p>
                          <p className="text-5xl font-black">{activeLiveMatch.score_details?.[activeLiveMatch.team_a_id]?.score ?? activeLiveMatch.score_details?.[activeLiveMatch.team_a_id]?.runs ?? 0}</p>
                      </div>
                      <div className="text-4xl font-bold text-muted-foreground italic">VS</div>
                      <div className="text-center space-y-2">
                          <p className="text-xl font-bold">{activeLiveMatch.TeamB.team_name}</p>
                          <p className="text-5xl font-black">{activeLiveMatch.score_details?.[activeLiveMatch.team_b_id]?.score ?? activeLiveMatch.score_details?.[activeLiveMatch.team_b_id]?.runs ?? 0}</p>
                      </div>
                  </div>
              </CardContent>
          </Card>
      )}

      <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Clapperboard className="h-8 w-8 text-destructive" />
                    <div>
                        <CardTitle>Live Matches</CardTitle>
                        <CardDescription>{liveMatches.length} currently active</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    [...Array(1)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
                ) : liveMatches.length > 0 ? (
                    liveMatches.map(match => (
                        <MatchCard key={match.id} match={match} onUpdate={fetchMatches} />
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No matches are currently live.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle>Upcoming Matches</CardTitle>
                        <CardDescription>{scheduledMatches.length} matches scheduled</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    [...Array(2)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
                ) : scheduledMatches.length > 0 ? (
                    scheduledMatches.map(match => (
                        <MatchCard key={match.id} match={match} onUpdate={fetchMatches} />
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No upcoming matches.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <History className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <CardTitle>Completed Matches</CardTitle>
                        <CardDescription>{completedMatches.length} finished</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    [...Array(1)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
                ) : completedMatches.length > 0 ? (
                    completedMatches.map(match => (
                        <MatchCard key={match.id} match={match} onUpdate={fetchMatches} />
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No matches have been completed yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
