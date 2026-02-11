import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fixtures, teams, sports } from "@/lib/data";
import type { Fixture } from "@/lib/types";
import { Calendar, MapPin, Clapperboard } from "lucide-react";
import { format } from 'date-fns';

const getTeam = (id: string) => teams.find(t => t.id === id);
const getSport = (id: string) => sports.find(s => s.id === id);

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
                    </div>

                    <div className="text-center w-1/3">
                        <p className="text-2xl font-bold font-headline">VS</p>
                        <p className="text-sm text-muted-foreground mt-2">{format(fixture.dateTime, 'p')}</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center gap-2 w-1/3">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center font-bold text-xl">{teamB.name.charAt(0)}</div>
                        <h3 className="font-bold font-headline text-lg">{teamB.name}</h3>
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

export function UpcomingFixtures() {
    const upcomingFixtures = fixtures.filter(f => f.status === 'Upcoming').slice(0, 3);
    
    return (
        <section>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold font-headline">Upcoming Fixtures</h2>
                <p className="text-muted-foreground mt-2">Check out the upcoming matches and cheer for your favorite teams.</p>
            </div>
            {upcomingFixtures.length > 0 ? (
                 <div className="space-y-6">
                    {upcomingFixtures.map(fixture => (
                        <FixtureCard key={fixture.id} fixture={fixture} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No upcoming fixtures at the moment.
                    </CardContent>
                </Card>
            )}
            <div className="text-center mt-8">
                <Button asChild>
                    <Link href="/fixtures">View All Fixtures</Link>
                </Button>
            </div>
        </section>
    )
}
