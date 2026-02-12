import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Venues',
  description: 'Find details about the venues for the ENERGY 2026 sports meet at EGS Pillay Group of Institutions.',
};

export default function VenuesPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Event Venues</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Details about the event venues. This page is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
