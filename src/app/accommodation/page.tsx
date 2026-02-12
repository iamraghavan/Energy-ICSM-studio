import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accommodation',
  description: 'Information about accommodation for participants of the ENERGY 2026 sports meet.',
};

export default function AccommodationPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Accommodation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Accommodation details for participants. This page is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
