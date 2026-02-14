import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Users, Gavel, Trophy, IndianRupee } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'General Instructions',
  description: 'Important guidelines, rules, and instructions for all participants of the ENERGY 2026 sports meet.',
};

const instructionSections = [
    {
        id: 'registration',
        title: "Registration & Eligibility",
        icon: ClipboardList,
        rules: [
            "Registration will be on a <strong>first-come, first-served basis</strong>.",
            "Only <strong>bonafide and regular students</strong> are allowed to represent their respective colleges.",
            "Participants must produce their <strong>identity cards</strong> at the time of the match.",
            "Last date for registration is <strong>8 days before the respective event date</strong>.",
        ]
    },
    {
        id: 'conduct',
        title: "Player & Team Conduct",
        icon: Users,
        rules: [
            "Participants must come in <strong>proper uniforms</strong>.",
            "The names of players along with the Coach/Manager, duly certified by the Principal/Physical Director, must be sent to the address below.",
        ],
        extraContent: (
            <blockquote className="mt-4 border-l-4 border-primary pl-4 italic bg-primary/10 p-4 rounded-r-lg text-sm">
                Physical Director, Department of Physical Education,<br />
                E.G.S. Pillay Engineering College (Autonomous),<br />
                Old Nagore Road, Thethi, Nagapattinam – 611 002.
            </blockquote>
        )
    },
    {
        id: 'rules',
        title: "Match & Tournament Rules",
        icon: Gavel,
        rules: [
            "Matches will be conducted on a <strong>knockout basis</strong>.",
            "The latest rules framed by the respective game federations will be followed.",
            "<strong>Referee’s decision will be final and binding.</strong>",
            "The decision of the organizing committee will be final in all matters concerning the organization and conduct of the tournament.",
        ]
    },
    {
        id: 'prizes',
        title: "Prizes & Awards",
        icon: Trophy,
        rules: [
            "Trophies will be awarded to the <strong>I-Prize</strong> and <strong>II-Prize</strong> winners for each event.",
            "An <strong>Overall Championship Trophy</strong> will be awarded for the Winner and Runner-up institutions based on total points.",
        ]
    },
    {
        id: 'fees',
        title: "Registration Fees",
        icon: IndianRupee,
        rules: [] // handled by special content
    }
];

export default function InstructionsPage() {
    return (
        <div className="container py-8 md:py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline">General Instructions</h1>
                <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">
                    Important guidelines for all participants. Please read these instructions carefully to ensure a smooth and fair competition.
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {instructionSections.map((section) => (
                        <AccordionItem value={section.id} key={section.id} className="border rounded-lg bg-card shadow-sm">
                            <AccordionTrigger className="px-6 py-4 text-lg hover:no-underline">
                                <div className="flex items-center gap-4">
                                    <section.icon className="h-6 w-6 text-primary" />
                                    {section.title}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                {section.id === 'fees' ? (
                                    <div className="space-y-3 pt-2 pl-10">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-md bg-muted">
                                            <p>Badminton, Chess, Table Tennis (Men/Women)</p>
                                            <Badge variant="secondary" className="mt-1 sm:mt-0">₹300 per team</Badge>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-md bg-muted">
                                            <p>Cricket, Football, Kabaddi, Basketball, Volleyball (Men/Women)</p>
                                            <Badge variant="secondary" className="mt-1 sm:mt-0">₹500 per team</Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <ul className="list-disc pl-10 space-y-3 text-muted-foreground">
                                        {section.rules.map((rule, i) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: rule }} />
                                        ))}
                                    </ul>
                                )}
                                {section.extraContent}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}