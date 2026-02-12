import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medal Standings',
  description: 'Live medal standings for the ENERGY 2026 sports meet. Track which college is leading the leaderboard.',
};

export default function MedalsPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Medals</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Live medal standings will be displayed here. This page is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
