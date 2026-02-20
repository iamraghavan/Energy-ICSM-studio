
'use client';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveScoring } from "./scorer/LiveScoring";
import { MatchScheduler } from "./scorer/MatchScheduler";
import { LineupManager } from "./scorer/LineupManager";
import { CompletedMatches } from "./scorer/CompletedMatches";
import { Clapperboard, Calendar, History, Users, Trophy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSports, type ApiSport } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export function ScorerDashboard() {
    const [sports, setSports] = useState<ApiSport[]>([]);
    const [selectedSportId, setSelectedSportId] = useState<string | undefined>();
    const [isLoadingSports, setIsLoadingSports] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSports = async () => {
            setIsLoadingSports(true);
            try {
                const sportData = await getSports();
                setSports(sportData);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch sports list.' });
            } finally {
                setIsLoadingSports(false);
            }
        };
        fetchSports();
    }, [toast]);

    return (
        <div className="container py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold font-headline">Scorer Dashboard</h1>
                <p className="text-muted-foreground">Manage live scoring, schedules, and team lineups.</p>
            </div>
            
             <Tabs defaultValue="live" className="w-full">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
                        <TabsTrigger value="live"><Clapperboard className="mr-2" />Live</TabsTrigger>
                        <TabsTrigger value="schedule"><Calendar className="mr-2" />Schedule</TabsTrigger>
                        <TabsTrigger value="lineup"><Users className="mr-2" />Lineups</TabsTrigger>
                        <TabsTrigger value="history"><History className="mr-2" />History</TabsTrigger>
                    </TabsList>
                     <div className="w-full sm:w-64">
                         {isLoadingSports ? (
                            <Skeleton className="h-10 w-full" />
                         ) : (
                            <Select onValueChange={setSelectedSportId} value={selectedSportId}>
                                <SelectTrigger>
                                    <Trophy className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Select a Sport to Manage..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {sports.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                         )}
                    </div>
                </div>
                
                <TabsContent value="live">
                    <LiveScoring />
                </TabsContent>
                <TabsContent value="schedule">
                    <MatchScheduler sportId={selectedSportId} />
                </TabsContent>
                <TabsContent value="lineup">
                    <LineupManager sportId={selectedSportId} />
                </TabsContent>
                <TabsContent value="history">
                    <CompletedMatches sportId={selectedSportId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
