import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Metadata } from 'next';

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
                    
                    <div>
                        <h3 className="text-xl font-semibold font-headline text-foreground mb-3">Contact Information</h3>
                        <div className="space-y-2">
                           <p><strong>D. Velavan</strong> - Senior Physical Director: <a href="tel:9942997667" className="text-primary hover:underline">99429 97667</a></p>
                           <p><strong>K. Nelson</strong> - Physical Director: <a href="tel:9655260429" className="text-primary hover:underline">96552 60429</a></p>
                           <p><strong>S. Senthil Kumar</strong> - Physical Director: <a href="tel:9965185721" className="text-primary hover:underline">99651 85721</a></p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
