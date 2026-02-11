'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LineupManager() {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Lineups</CardTitle>
                <CardDescription>View and manage player lineups for each team.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                    <p>Lineup management module is under construction.</p>
                    <p className="text-sm">This section will allow you to select a match and manage the starting players and substitutes for each team.</p>
                </div>
            </CardContent>
        </Card>
    );
}
