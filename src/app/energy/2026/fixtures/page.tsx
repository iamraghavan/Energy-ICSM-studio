import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fixtures, teams, sports } from "@/lib/data";
import type { Fixture } from "@/lib/types";
import { Calendar, MapPin, Clapperboard } from "lucide-react";
import { format } from 'date-fns';

const getTeam = (id: string) => teams.find(t => t.id === id);
const getSport = (id: string) => sports.find(s => s.id === id);

export default function FixturesPage() {
    const upcomingFixtures = fixtures.filter(f => f.status === 'Upcoming');
    const liveFixtures = fixtures.filter(f => f.status === 'Live');
    const completedFixtures = fixtures.filter(f => f.status === 'Completed');

    return (
        <div className="container py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Match Fixtures</h1>
                <p className="text-muted-foreground mt-2">Stay updated with the latest match schedules and results.</p>
            </div>
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="live">Live</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming">
                    <FixtureList fixtures={upcomingFixtures} title="Upcoming Matches" />
                </TabsContent>
                <TabsContent value="live">
                    <FixtureList fixtures={liveFixtures} title="Live Matches" />
                </TabsContent>
                <TabsContent value="completed">
                    <FixtureList fixtures={completedFixtures} title="Completed Matches" />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function FixtureList({ fixtures, title }: { fixtures: Fixture[], title: string }) {
    if (fixtures.length === 0) {
        return (
            <Card className="mt-4">
                <CardContent className="pt-6 text-center text-muted-foreground">
                    No {title.toLowerCase()} at the moment.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {fixtures.map(fixture => (
                <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
        </div>
    )
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
    const teamA = getTeam(fixture.teamAId);
    const teamB = getTeam(fixture.teamBId);
    const sport = getSport(fixture.sportId);

    if (!teamA || !teamB || !sport) return null;

    const renderScore = () => {
        if (fixture.status === 'Live' || fixture.status === 'Completed') {
            return (
                <div className="flex items-center font-bold text-lg">
                    <span className="w-8 text-center">{fixture.scoreA ?? '-'}</span>
                    <span className="text-muted-foreground mx-2">-</span>
                    <span className="w-8 text-center">{fixture.scoreB ?? '-'}</span>
                </div>
            );
        }
        return <span className="font-semibold text-muted-foreground">{format(fixture.dateTime, 'p')}</span>;
    };

    return (
        <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-4 bg-muted/30">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                         <sport.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-muted-foreground">{sport.name}</span>
                    </div>
                     {fixture.status === 'Live' && (
                        <div className="flex items-center gap-1.5 text-red-500">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="font-bold text-xs">LIVE</span>
                        </div>
                    )}
                     {fixture.status === 'Upcoming' && (
                        <span className="text-xs text-muted-foreground">{format(fixture.dateTime, 'MMM d, yyyy')}</span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold text-lg">{teamA.name.charAt(0)}</div>
                        <h3 className="font-semibold font-headline text-base">{teamA.name}</h3>
                    </div>
                     <span className="font-bold text-lg">{fixture.scoreA ?? ''}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold text-lg">{teamB.name.charAt(0)}</div>
                        <h3 className="font-semibold font-headline text-base">{teamB.name}</h3>
                    </div>
                     <span className="font-bold text-lg">{fixture.scoreB ?? ''}</span>
                 </div>
            </CardContent>
            <CardHeader className="p-3 bg-muted/30 text-center">
                 {renderScore()}
            </CardHeader>
        </Card>
    );
}
