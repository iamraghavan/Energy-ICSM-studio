import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Match Fixtures',
  description: 'View upcoming, live, and completed match fixtures for all sports at the ENERGY 2026 tournament.',
};

export default function FixturesPage() {
    return (
        <div className="container py-8 md:py-12">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Match Fixtures</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-10">
                        Match fixtures will be available here soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
