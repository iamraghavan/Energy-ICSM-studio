import { players, sports } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { ArrowRight, BarChart, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Players',
  description: 'Browse all the talented athletes participating in the ENERGY 2026 sports meet. View player profiles and statistics.',
};

export default function PlayersPage() {
    return (
        <div className="container py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">All Players</h1>
                <p className="text-muted-foreground mt-2">Browse all the talented athletes participating in the event.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {players.map(player => {
                    const sport = sports.find(s => s.id === player.sportId);
                    return (
                        <Card key={player.id} className="group overflow-hidden relative">
                             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10" />
                            <Link href={`/players/${player.id}`}>
                                <Avatar className="h-80 w-full rounded-none rounded-t-lg">
                                    <AvatarImage src={player.photoUrl} alt={player.name} data-ai-hint={player.imageHint} className="object-cover h-full w-full transition-transform duration-300 group-hover:scale-105" />
                                    <AvatarFallback className="text-4xl rounded-none">{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 left-0 p-4 z-20 text-white">
                                    <h3 className="font-bold font-headline text-xl">{player.name}</h3>
                                    <p className="text-sm opacity-80">{player.college}</p>
                                </div>
                            </Link>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
