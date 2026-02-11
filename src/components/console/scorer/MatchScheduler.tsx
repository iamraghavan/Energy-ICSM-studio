'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fixtures } from "@/lib/data";
import { MatchCard } from "./MatchCard";

export function MatchScheduler() {
    const upcomingFixtures = fixtures.filter(f => f.status === 'Upcoming');

    const handleStartMatch = (fixtureId: string) => {
        console.log(`Starting match ${fixtureId}`);
        alert(`Match ${fixtureId} would be moved to 'Live' now. (Simulation)`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Match Scheduler</CardTitle>
                <CardDescription>A list of scheduled matches yet to begin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {upcomingFixtures.length > 0 ? (
                    upcomingFixtures.map(fixture => (
                       <MatchCard key={fixture.id} fixture={fixture}>
                           <Button onClick={() => handleStartMatch(fixture.id)}>Start Match</Button>
                       </MatchCard>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-8">No upcoming matches scheduled.</p>
                )}
            </CardContent>
        </Card>
    );
}
