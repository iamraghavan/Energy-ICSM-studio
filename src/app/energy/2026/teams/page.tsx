import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSports, getTeamsBySport } from "@/lib/api";
import { ArrowRight } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { getSportIcon } from "@/lib/icons";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Participating Teams',
  description: 'Explore all the college teams participating in the ENERGY 2026 sports meet. View rosters and team details.',
};

export default async function TeamsPage() {
    const sportsData = await getSports();
    
    const teamPromises = sportsData.map(sport =>
        getTeamsBySport(String(sport.id)).catch(() => [])
    );
    const allTeamsArrays = await Promise.all(teamPromises);
    const teamsData = allTeamsArrays.flat();

    const sports = sportsData.map(sport => ({ ...sport, icon: getSportIcon(sport.name) }));

    const defaultTab = sports.find(s => teamsData.some(t => String(t.sport_id) === String(s.id)))?.id.toString() || sports[0]?.id.toString();

    return (
        <div className="container py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Participating Teams</h1>
                <p className="text-muted-foreground mt-2">Explore all the teams competing in Energy Sports Meet.</p>
            </div>
            
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="overflow-x-auto whitespace-nowrap h-auto p-2 justify-start w-full md:w-auto md:inline-flex">
                    {sports.map(sport => (
                        <TabsTrigger key={sport.id} value={sport.id.toString()}>{sport.name}</TabsTrigger>
                    ))}
                </TabsList>
                {sports.map(sport => {
                    const sportTeams = teamsData.filter(team => String(team.sport_id) === String(sport.id));
                    return (
                        <TabsContent key={sport.id} value={sport.id.toString()}>
                            <div className="mt-4">
                                {sportTeams.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sportTeams.map(team => (
                                            <Card key={team.id} className="hover:shadow-lg transition-shadow flex flex-col">
                                                <CardHeader className="flex-row items-center gap-4">
                                                     <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center font-bold text-2xl shrink-0">{team.team_name.charAt(0)}</div>
                                                     <div>
                                                        <CardTitle className="font-headline text-xl">{team.team_name}</CardTitle>
                                                        {team.Captain?.name && <CardDescription>Captain: {team.Captain.name}</CardDescription>}
                                                     </div>
                                                </CardHeader>
                                                <CardContent className="flex-grow flex items-end">
                                                    <Button asChild variant="outline" className="w-full">
                                                        <Link href={`/energy/2026/teams/${team.id}`}>
                                                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-16 border rounded-lg">
                                        <p>No teams have registered for {sport.name} yet.</p>
                                        <Button asChild variant="secondary" className="mt-4">
                                            <Link href="/energy/2026/registration">Be the first to register!</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    )
                })}
            </Tabs>
        </div>
    );
}
