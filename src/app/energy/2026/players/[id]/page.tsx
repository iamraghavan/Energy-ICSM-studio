import { players, sports } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import { BarChart, CheckCircle, XCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlayerDetailsPage({ params }: { params: { id: string } }) {
    const player = players.find(p => p.id === params.id);

    if (!player) {
        notFound();
    }
    
    const sport = sports.find(s => s.id === player.sportId);

    const winRate = player.matchesPlayed > 0 ? ((player.wins / player.matchesPlayed) * 100).toFixed(0) : 0;

    return (
        <div className="container py-8">
            <Card>
                <CardContent className="pt-6 grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center md:col-span-1">
                        <Avatar className="h-40 w-40 border-4 border-primary/50 mb-4">
                            <AvatarImage src={player.photoUrl} alt={player.name} data-ai-hint={player.imageHint} />
                            <AvatarFallback className="text-4xl">{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <h1 className="text-3xl font-bold font-headline">{player.name}</h1>
                        <p className="text-muted-foreground">{player.college}</p>
                        {sport && (
                             <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                <sport.icon className="w-5 h-5" />
                                <span>{sport.name}</span>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold font-headline mb-4">Player Statistics</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard icon={BarChart} label="Matches Played" value={player.matchesPlayed} />
                            <StatCard icon={CheckCircle} label="Wins" value={player.wins} className="text-green-600" />
                            <StatCard icon={XCircle} label="Losses" value={player.losses} className="text-red-600" />
                            <StatCard icon={Trophy} label="Win Rate" value={`${winRate}%`} />
                        </div>

                        <h2 className="text-2xl font-bold font-headline mt-8 mb-4">Recent Activity</h2>
                        <Card className="bg-muted/50">
                            <CardContent className="pt-6">
                                <p className="text-muted-foreground text-center">No recent match data available.</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


function StatCard({ icon: Icon, label, value, className }: { icon: React.ElementType, label: string, value: string | number, className?: string }) {
    return (
        <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                <Icon className={cn("h-8 w-8 text-muted-foreground", className)} />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
        </Card>
    )
}
