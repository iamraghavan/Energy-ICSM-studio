import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fixtures, teams, sports } from "@/lib/data";
import type { Fixture } from "@/lib/types";
import { format } from 'date-fns';

const getTeam = (id: string) => teams.find(t => t.id === id);
const getSport = (id: string) => sports.find(s => s.id === id);

function FixtureItem({ fixture }: { fixture: Fixture }) {
    const teamA = getTeam(fixture.teamAId);
    const teamB = getTeam(fixture.teamBId);
    const sport = getSport(fixture.sportId);

    if (!teamA || !teamB || !sport) return null;

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-lg">{teamA.name.charAt(0)}</div>
                    <span className="font-semibold">{teamA.name}</span>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-lg">{teamB.name.charAt(0)}</div>
                    <span className="font-semibold">{teamB.name}</span>
                </div>
            </div>
            <div className="text-right">
                <p className="font-mono text-sm text-muted-foreground">{format(fixture.dateTime, 'p')}</p>
                <p className="text-xs text-muted-foreground">{fixture.venue}</p>
            </div>
        </div>
    );
}

export function UpcomingFixtures() {
    const upcomingFixtures = fixtures.filter(f => f.status === 'Upcoming').slice(0, 3);
    
    return (
        <section>
            <div className="mb-8">
                <h2 className="text-3xl font-bold font-headline">Upcoming Fixtures</h2>
                <p className="text-muted-foreground mt-1">Check out the next matches on the schedule.</p>
            </div>
            {upcomingFixtures.length > 0 ? (
                 <div className="space-y-4">
                    {upcomingFixtures.map(fixture => (
                        <FixtureItem key={fixture.id} fixture={fixture} />
                    ))}
                </div>
            ) : (
                <div className="p-8 border rounded-lg text-center text-muted-foreground">
                    No upcoming fixtures at the moment.
                </div>
            )}
            <div className="text-center mt-8">
                <Button asChild variant="outline">
                    <Link href="/energy/2026/fixtures">View All Fixtures</Link>
                </Button>
            </div>
        </section>
    )
}
