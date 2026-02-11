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
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Match Fixtures</h1>
                <p className="text-muted-foreground mt-2">Stay updated with the latest match schedules and results.</p>
            </div>
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
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
        <div className="space-y-6 mt-4">
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

    return (
        <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-4 bg-muted/50 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <sport.icon className="w-5 h-5 text-accent" />
                        <span className="font-semibold">{sport.name}</span>
                    </div>
                    {fixture.status === 'Live' && (
                        <div className="flex items-center gap-2 text-red-500 animate-pulse">
                            <Clapperboard className="w-5 h-5" />
                            <span className="font-bold text-sm">LIVE</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center text-center gap-2 w-1/3">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center font-bold text-xl">{teamA.name.charAt(0)}</div>
                        <h3 className="font-bold font-headline text-lg">{teamA.name}</h3>
                        <p className="text-sm text-muted-foreground">{teamA.college}</p>
                    </div>

                    <div className="text-center w-1/3">
                        {fixture.status === 'Upcoming' ? (
                             <>
                                <p className="text-2xl font-bold font-headline">VS</p>
                                <p className="text-sm text-muted-foreground mt-2">{format(fixture.dateTime, 'PPP')}</p>
                                <p className="text-sm text-muted-foreground">{format(fixture.dateTime, 'p')}</p>
                             </>
                        ) : (
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-4xl font-bold">{fixture.scoreA ?? 0}</span>
                                <span className="text-2xl text-muted-foreground">-</span>
                                <span className="text-4xl font-bold">{fixture.scoreB ?? 0}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-center text-center gap-2 w-1/3">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center font-bold text-xl">{teamB.name.charAt(0)}</div>
                        <h3 className="font-bold font-headline text-lg">{teamB.name}</h3>
                        <p className="text-sm text-muted-foreground">{teamB.college}</p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground border-t mt-6 pt-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(fixture.dateTime, 'EEE, MMM d')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{fixture.venue}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
