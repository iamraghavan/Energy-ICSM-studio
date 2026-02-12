import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Important Rules',
  description: 'Important rules and regulations for the ENERGY 2026 sports meet.',
};

export default function RulesPage() {
    return (
        <div className="container py-8 md:py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Important Rules</CardTitle>
                    <CardDescription>Rules and regulations for all events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This page is under construction. Detailed rules for each sport will be available soon.</p>
                </CardContent>
            </Card>
        </div>
    );
}
