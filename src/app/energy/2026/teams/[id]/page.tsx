import { getTeam, getSports } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Trophy as TrophyIcon } from "lucide-react";
import Image from "next/image";
import { getSportIcon } from "@/lib/icons";
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const team = await getTeam(params.id).catch(() => null);

  if (!team) {
    return {
      title: 'Team Not Found'
    }
  }
  
  const allSportsData = await getSports();
  const sport = allSportsData.find(s => s.id === team.sport_id);

  return {
    title: `${team.team_name} (${sport?.name || 'Team'})`,
    description: `View the player roster and team info for ${team.team_name} from ${team.college.name}, competing in ENERGY 2026.`,
  };
}

export default async function TeamDetailsPage({ params }: { params: { id: string } }) {
    const team = await getTeam(params.id).catch(() => null);

    if (!team) {
        notFound();
    }

    const allSportsData = await getSports();
    const sport = allSportsData.find(s => s.id === team.sport_id);
    const SportIcon = sport ? getSportIcon(sport.name) : getSportIcon('');
    
    const teamPlayers = team.Members || [];

    return (
        <div className="container py-8">
            <Card>
                <CardHeader className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center font-bold text-4xl mb-4 border">{team.team_name.charAt(0)}</div>
                    <CardTitle className="font-headline text-4xl">{team.team_name}</CardTitle>
                    <CardDescription className="text-lg">{team.college.name}</CardDescription>
                    {sport && (
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <SportIcon className="w-5 h-5" />
                            <span>{sport.name}</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                             <h3 className="text-2xl font-bold font-headline mb-4">Player Roster</h3>
                             {teamPlayers.length > 0 ? (
                                <div className="space-y-4">
                                {teamPlayers.map(player => (
                                    <Link key={player.id} href={`/energy/2026/players/${player.id}`}>
                                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors border">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={`https://picsum.photos/seed/${player.id}/200/200`} alt={player.name} data-ai-hint="athlete portrait" />
                                                <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{player.name}</p>
                                                <p className="text-sm text-muted-foreground">{player.College?.name || player.other_college}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                </div>
                             ) : (
                                <div className="text-center py-10 border rounded-lg bg-muted/50">
                                    <p className="text-muted-foreground">This team hasn't added any players yet.</p>
                                </div>
                             )}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold font-headline mb-4">Team Info</h3>
                            <Card className="bg-muted/50">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <TrophyIcon className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Sport</p>
                                            <p className="font-semibold">{sport?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Players</p>
                                            <p className="font-semibold">{teamPlayers.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
