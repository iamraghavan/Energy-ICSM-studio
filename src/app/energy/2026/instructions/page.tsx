import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'General Instructions',
  description: 'General instructions for all participants of the ENERGY 2026 sports meet.',
};

export default function InstructionsPage() {
    return (
        <div className="container py-8 md:py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">General Instructions</CardTitle>
                    <CardDescription>Important guidelines for all participants.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>This page is under construction. Please check back later for detailed instructions.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>All participants must carry their college ID card at all times.</li>
                        <li>Reporting time for all events is 30 minutes prior to the scheduled start.</li>
                        <li>The organizing committee's decision is final in all matters.</li>
                        <li>Lunch will be provided to all participants.</li>
                        <li>Accommodation will be provided on request for outstation teams.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
