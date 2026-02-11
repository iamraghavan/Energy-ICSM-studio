'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { teams, sports } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getSport = (id: string) => sports.find(s => s.id === id);

export function LineupManager() {
    const allTeams = teams;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Lineups</CardTitle>
                <CardDescription>View and manage player lineups for each team.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {allTeams.map(team => (
                        <AccordionItem value={team.id} key={team.id}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-bold text-lg">{team.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-semibold text-left">{team.name}</p>
                                        <p className="text-sm text-muted-foreground text-left">{team.college}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {team.players.length > 0 ? (
                                    <div className="space-y-3 pl-4 pt-2">
                                        <p className="text-sm font-semibold mb-2">{getSport(team.sportId)?.name} Roster</p>
                                        {team.players.map(player => (
                                            <div key={player.id} className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={player.photoUrl} alt={player.name} data-ai-hint={player.imageHint} />
                                                    <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-medium">{player.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No players in this team's lineup yet.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
