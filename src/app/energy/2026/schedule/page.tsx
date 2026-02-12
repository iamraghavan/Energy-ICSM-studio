import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Schedule',
  description: 'Find the full event schedule for ENERGY 2026. Dates and times for all matches and ceremonies.',
};

export default function SchedulePage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Event Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The full event schedule will be available here. This page is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
