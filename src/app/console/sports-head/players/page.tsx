
'use client';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SportsHeadPlayersPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Player Management</CardTitle>
                    <CardDescription>View all players registered for your assigned sport.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">Player management module is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
