import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Metadata } from 'next';
import Link from "next/link";

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about the Chevalier Dr. G.S. Pillay Memorial Tournament "ENERGY 2026", organized by the EGS Pillay Group of Institutions.',
};


export default function AboutPage() {
    return (
        <div className="container py-8 md:py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">About ENERGY 2026</CardTitle>
                    <CardDescription>The Chevalier Dr. G.S. Pillay Memorial Inter-College Sports Meet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground">
                    <p>ENERGY 2026 is the premier inter-college sports meet organized by the Department of Physical Education, E.G.S. Pillay Group of Institutions, Nagapattinam. This event is held in memory of our esteemed founder, Chevalier Dr. G.S. Pillay, to foster sportsmanship, talent, and camaraderie among students.</p>
                    <p>We invite colleges from all over to participate and compete for the prestigious "Overall Championship Trophy".</p>
                    <p>For any inquiries, please visit our <Link href="/energy/2026/contact" className="text-primary hover:underline font-medium">Contact Page</Link>.</p>
                </CardContent>
            </Card>
        </div>
    );
}
