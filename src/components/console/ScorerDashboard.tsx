'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  getScorerMatches,
  type ApiMatch,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clapperboard, Calendar, History, Trophy } from 'lucide-react';
import { MatchCard } from './scorer/MatchCard';
import { CreateMatchDialog } from './scorer/CreateMatchDialog';

export function ScorerDashboard() {
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const allMatches = await getScorerMatches();
      setMatches(allMatches);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Fetching Matches',
        description: 'Could not load your assigned matches. Please try again later.',
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

  const renderMatchList = (matchList: ApiMatch[], title: string, icon: React.ReactNode, emptyMessage: string) => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          {icon}
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{matchList.length} match(es)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          [...Array(2)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : matchList.length > 0 ? (
          matchList.map(match => (
            <MatchCard key={match.id} match={match} onUpdate={fetchMatches} />
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline">Scorer Dashboard</h1>
          <p className="text-muted-foreground">Manage live scoring, schedules, and team lineups for your assigned matches.</p>
        </div>
        <CreateMatchDialog onMatchCreated={fetchMatches} />
      </div>

      <div className="space-y-6">
        {renderMatchList(liveMatches, 'Live Matches', <Clapperboard className="h-8 w-8 text-destructive" />, 'No matches are currently live.')}
        {renderMatchList(scheduledMatches, 'Scheduled Matches', <Calendar className="h-8 w-8 text-primary" />, 'No upcoming matches.')}
        {renderMatchList(completedMatches, 'Match History', <History className="h-8 w-8 text-muted-foreground" />, 'No matches have been completed yet.')}
      </div>
    </div>
  );
}
