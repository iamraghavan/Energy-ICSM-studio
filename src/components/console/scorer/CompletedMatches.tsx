'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fixtures } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "./MatchCard";

export function CompletedMatches() {
    const completedFixtures = fixtures.filter(f => f.status === 'Completed');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Completed Matches</CardTitle>
                <CardDescription>A record of finished matches and their final scores.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {completedFixtures.length > 0 ? (
                    completedFixtures.map(fixture => (
                       <MatchCard key={fixture.id} fixture={fixture}>
                           <div className="text-right">
                                <p className="text-xl font-bold">{fixture.scoreA} - {fixture.scoreB}</p>
                                <Badge variant="secondary">Completed</Badge>
                           </div>
                       </MatchCard>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-8">No completed matches yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
