'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function MatchSchedulerPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Match Scheduler</CardTitle>
                    <CardDescription>Global match scheduling and overview.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">Match scheduler module is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
