'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveScoring } from "./scorer/LiveScoring";
import { MatchScheduler } from "./scorer/MatchScheduler";
import { LineupManager } from "./scorer/LineupManager";
import { CompletedMatches } from "./scorer/CompletedMatches";
import { Clapperboard, Calendar, History, Users } from "lucide-react";

export function ScorerDashboard() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Scorer Dashboard</h1>
                <p className="text-muted-foreground">Live Score Entry and Match Management</p>
            </div>
             <Tabs defaultValue="live" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="live">
                        <Clapperboard className="mr-2 h-4 w-4" />
                        Live Scoring
                    </TabsTrigger>
                    <TabsTrigger value="scheduler">
                        <Calendar className="mr-2 h-4 w-4" />
                        Scheduler
                    </TabsTrigger>
                    <TabsTrigger value="lineups">
                        <Users className="mr-2 h-4 w-4" />
                        Lineups
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="mr-2 h-4 w-4" />
                        History
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="live">
                    <LiveScoring />
                </TabsContent>
                <TabsContent value="scheduler">
                    <MatchScheduler />
                </TabsContent>
                <TabsContent value="lineups">
                    <LineupManager />
                </TabsContent>
                <TabsContent value="history">
                    <CompletedMatches />
                </TabsContent>
            </Tabs>
        </div>
    );
}
