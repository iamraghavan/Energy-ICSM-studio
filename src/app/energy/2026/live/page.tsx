import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Matches',
  description: 'Follow live scores and updates from the ENERGY 2026 sports meet.',
};

export default function LivePage() {
    return (
        <div className="container py-8 md:py-12">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Live Matches</CardTitle>
                    <CardDescription>Live scores and updates from ongoing matches.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-10">
                        Live match updates will be available here once the tournament starts.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
