import { players, sports } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlayersPage() {
    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">All Players</h1>
                <p className="text-muted-foreground mt-2">Browse all the talented athletes participating in the event.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {players.map(player => {
                    const sport = sports.find(s => s.id === player.sportId);
                    return (
                        <Card key={player.id} className="hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
                            <CardContent className="pt-6 flex flex-col items-center text-center">
                                <Avatar className="h-24 w-24 border-2 border-primary/20 mb-4">
                                    <AvatarImage src={player.photoUrl} alt={player.name} data-ai-hint={player.imageHint} />
                                    <AvatarFallback className="text-2xl">{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <h3 className="font-bold font-headline text-lg">{player.name}</h3>
                                <p className="text-sm text-muted-foreground">{player.college}</p>
                                {sport && (
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <sport.icon className="w-3 h-3" />
                                        <span>{sport.name}</span>
                                    </div>
                                )}
                                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                                    <Link href={`/energy/2026/players/${player.id}`}>
                                        View Profile <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
