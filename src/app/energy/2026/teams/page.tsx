import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSports, getTeams } from "@/lib/api";
import { ArrowRight, Goal, Dribbble, Volleyball, PersonStanding, Waves, Swords, Disc, Trophy, HelpCircle } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const sportIconMap: { [key: string]: React.ElementType } = {
    'Cricket': Trophy,
    'Football': Goal,
    'Basketball': Dribbble,
    'Volleyball': Volleyball,
    '100m Dash': PersonStanding,
    'Athletics (100m)': PersonStanding,
    'Swimming': Waves,
    'Fencing': Swords,
    'Discus Throw': Disc,
};

const getSportIcon = (sportName: string) => {
    return sportIconMap[sportName] || HelpCircle;
};


export default async function TeamsPage() {
    const sportsData = await getSports();
    const teamsData = await getTeams();

    const sports = sportsData.map(sport => ({ ...sport, icon: getSportIcon(sport.name) }));

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Participating Teams</h1>
                <p className="text-muted-foreground mt-2">Explore all the teams competing in SportZone.</p>
            </div>
            
            <Tabs defaultValue={sports.find(s => teamsData.some(t => t.sport_id === s.id))?.id.toString() || sports[0]?.id.toString()} className="w-full">
                <TabsList className="overflow-x-auto whitespace-nowrap h-auto p-2 justify-start w-full">
                    {sports.map(sport => (
                        <TabsTrigger key={sport.id} value={sport.id.toString()}>{sport.name}</TabsTrigger>
                    ))}
                </TabsList>
                {sports.map(sport => {
                    const sportTeams = teamsData.filter(team => team.sport_id === sport.id);
                    return (
                        <TabsContent key={sport.id} value={sport.id.toString()}>
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <sport.icon className="h-6 w-6 text-accent" />
                                        <span>{sport.name} Teams</span>
                                    </CardTitle>
                                    <CardDescription>
                                        {sportTeams.length > 0 ? `A list of all teams registered for ${sport.name}.` : `No teams have registered for ${sport.name} yet.`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {sportTeams.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {sportTeams.map(team => (
                                                <Card key={team.id} className="hover:shadow-md transition-shadow">
                                                    <CardHeader>
                                                        <CardTitle className="font-headline">{team.team_name}</CardTitle>
                                                        <CardDescription>{team.college.name}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <Button asChild variant="outline" className="w-full">
                                                            <Link href={`/energy/2026/teams/${team.id}`}>
                                                                View Roster <ArrowRight className="ml-2 h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            Be the first to register a team!
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )
                })}
            </Tabs>
        </div>
    );
}
