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
                <CardContent className="space-y-6 text-muted-foreground">
                    
                    <Section title="Registration & Eligibility">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Registration will be on a first-come, first-served basis.</li>
                            <li>Only bonafide and regular students are allowed to represent their respective colleges.</li>
                            <li>Participants must produce their identity cards at the time of the match.</li>
                             <li>Last date for registration is <strong>8 days before the respective event date</strong>.</li>
                        </ul>
                    </Section>
                    
                    <Section title="Player & Team Conduct">
                         <ul className="list-disc pl-5 space-y-2">
                            <li>Participants must come in proper uniforms.</li>
                             <li>The names of players along with the Coach/Manager, duly certified by the Principal/Physical Director, must be sent to the address below.</li>
                        </ul>
                        <blockquote className="mt-4 border-l-2 pl-6 italic bg-muted/50 p-4 rounded-r-lg">
                            Physical Director, Department of Physical Education,<br />
                            E.G.S. Pillay Engineering College (Autonomous),<br />
                            Old Nagore Road, Thethi, Nagapattinam – 611 002.
                        </blockquote>
                    </Section>
                    
                    <Section title="Match & Tournament Rules">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Matches will be conducted on a knockout basis.</li>
                            <li>The latest rules framed by the respective game federations will be followed.</li>
                            <li>Referee’s decision will be final and binding.</li>
                            <li>The decision of the organizing committee will be final in all matters concerning the organization and conduct of the tournament.</li>
                        </ul>
                    </Section>

                    <Section title="Prizes & Awards">
                         <ul className="list-disc pl-5 space-y-2">
                            <li>Trophies will be awarded to the I-Prize and II-Prize winners for each event.</li>
                            <li>An Overall Championship Trophy will be awarded for the Winner and Runner-up institutions based on total points.</li>
                        </ul>
                    </Section>

                    <Section title="Registration Fees">
                         <ul className="list-disc pl-5 space-y-2">
                            <li><strong>₹300 per team (Men/Women):</strong> Badminton, Chess, Table Tennis</li>
                            <li><strong>₹500 per team (Men/Women):</strong> Cricket, Football, Kabaddi, Basketball, Volleyball</li>
                        </ul>
                    </Section>

                </CardContent>
            </Card>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xl font-semibold font-headline text-foreground mb-3">{title}</h3>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}