import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Important Rules',
  description: 'Detailed rules and regulations for each sport at the ENERGY 2026 sports meet, including Volleyball, Badminton, Basketball, Cricket, Table Tennis, Kabaddi, Football, and Chess.',
};

const rulesData = [
    { 
        sport: "Volleyball (M & W)", 
        rules: [
            "Tournament will be conducted on a knockout basis.",
            "Maximum of 12 players per team.",
            "Current FIVB rules will be followed.",
            "All matches will be conducted on best of 3 formats."
        ] 
    },
    { 
        sport: "Badminton (M & W)", 
        rules: [
            "Team consists of 4 players only.",
            "Singles, Doubles & Reverse-singles will be followed.",
            "Best of 3 sets will be considered to decide winners.",
            "Only MAVIS 350 Shuttle Cock will be used.",
            "Non-marking shoes are mandatory."
        ] 
    },
    { 
        sport: "Basketball (M)", 
        rules: [
            "Tournament will be conducted on a knockout basis.",
            "Maximum of 12 players per team.",
            "There will be 4 quarters of 10 minutes each."
        ] 
    },
    { 
        sport: "Cricket (M)", 
        rules: [
            "Tournament will be conducted on a knockout basis.",
            "Maximum of 15 players per team.",
            "Number of overs may change depending on the weather.",
            "Umpire’s decision will be final."
        ] 
    },
    { 
        sport: "Table Tennis (M & W)", 
        rules: [
            "Tournament will be conducted in ABC – XYZ format, on a knockout basis.",
            "Maximum of 4 players and minimum of 3 players per team.",
            "Matches will be played for 11 points, 3 sets per match.",
            "Match order: A vs X, B vs Y, C vs Z.",
            "If neither team wins all 3 matches: A vs Y, B vs X will be played (team to win 3 matches wins).",
            "Order of preference must be given to the referee before the match."
        ] 
    },
    { 
        sport: "Kabaddi (M)", 
        rules: [
            "Team consists of 12 players only.",
            "Duration of game time: 10–5–10."
        ] 
    },
    { 
        sport: "Football (M)", 
        rules: [
            "Tournament will be conducted on a knockout basis.",
            "Maximum of 12 players per team and 5 substitutes allowed.",
            "In case of tie, winner will be decided by penalty shootout.",
            "Current FIFA rules will be followed."
        ] 
    },
    { 
        sport: "Chess (M & W)", 
        rules: [
            "Own chess board must be brought."
        ] 
    }
];


export default function RulesPage() {
    return (
        <div className="container py-8 md:py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Important Rules</CardTitle>
                    <CardDescription>Select a sport to view its specific rules and regulations.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Tabs defaultValue={rulesData[0].sport} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                             {rulesData.map(item => (
                                <TabsTrigger key={item.sport} value={item.sport}>{item.sport}</TabsTrigger>
                            ))}
                        </TabsList>
                        {rulesData.map(item => (
                             <TabsContent key={item.sport} value={item.sport} className="mt-6">
                                <div className="p-6 bg-muted/50 rounded-lg border">
                                    <h3 className="text-xl font-semibold font-headline text-foreground mb-4">{item.sport}</h3>
                                     <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                        {item.rules.map((rule, index) => (
                                            <li key={index}>{rule}</li>
                                        ))}
                                    </ul>
                                </div>
                            </TabsContent>
                        ))}
                   </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
