'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
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
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Scorer Dashboard</h1>
                <p className="text-muted-foreground">Live Score Entry and Match Management</p>
            </div>
            <div className="mb-6 max-w-sm">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium mb-2">Select a Sport</p>
                         {isLoadingSports ? (
                            <Skeleton className="h-10 w-full" />
                         ) : (
                            <Select onValueChange={setSelectedSportId} value={selectedSportId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a sport to manage..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {sports.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                         )}
                    </CardContent>
                </Card>
            </div>
             <Tabs defaultValue="live" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="live">
                        <Clapperboard className="mr-2 h-4 w-4" />
                        Live Scoring
                    </TabsTrigger>
                    <TabsTrigger value="scheduler" disabled={!selectedSportId}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Scheduler
                    </TabsTrigger>
                    <TabsTrigger value="lineups" disabled={!selectedSportId}>
                        <Users className="mr-2 h-4 w-4" />
                        Lineups
                    </TabsTrigger>
                    <TabsTrigger value="history" disabled={!selectedSportId}>
                        <History className="mr-2 h-4 w-4" />
                        History
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="live">
                    <LiveScoring />
                </TabsContent>
                <TabsContent value="scheduler">
                    <MatchScheduler sportId={selectedSportId} />
                </TabsContent>
                <TabsContent value="lineups">
                    <LineupManager sportId={selectedSportId} />
                </TabsContent>
                <TabsContent value="history">
                    <CompletedMatches sportId={selectedSportId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
