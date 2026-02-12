import { getSports, type ApiSport } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSportIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";

export default async function SportsPage() {
    const sports = await getSports().catch(() => []);

    const sportsByCategory = sports.reduce((acc, sport) => {
        const category = sport.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(sport);
        return acc;
    }, {} as Record<string, ApiSport[]>);

    return (
        <div className="container py-8 md:py-12">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold font-headline">All Sports</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Browse all available sports and register for the events. Click on any card to start the registration process.</p>
            </div>
            <div className="space-y-12">
            {Object.keys(sportsByCategory).sort().map(category => (
                <div key={category}>
                    <h2 className="text-3xl font-bold font-headline mb-6 text-center">{category} Sports</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sportsByCategory[category].map((sport) => {
                            const SportIcon = getSportIcon(sport.name);
                            return (
                                <Card key={sport.id} className="group relative flex flex-col overflow-hidden text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                    <CardContent className="flex flex-1 flex-col items-center p-6">
                                        <div className="mb-4 rounded-full bg-primary/10 p-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                                            <SportIcon className="h-10 w-10 text-primary" />
                                        </div>
                                        <CardTitle className="mb-2 font-headline text-xl">{sport.name}</CardTitle>
                                        
                                        <div className="w-full space-y-3 text-sm mt-4">
                                            <div className="flex justify-between border-t pt-3">
                                                <span className="text-muted-foreground">Type</span>
                                                <Badge variant="secondary">{sport.type}</Badge>
                                            </div>
                                            <div className="flex justify-between border-t pt-3">
                                                <span className="text-muted-foreground">Max Players</span>
                                                <span className="font-semibold">{sport.max_players}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-3">
                                                <span className="text-muted-foreground">Fee</span>
                                                <span className="font-semibold">₹{sport.amount}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <Button asChild size="lg">
                                            <Link href={`/energy/2026/registration?sport=${sport.id}`}>
                                                Register Now
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            ))}
            {sports.length === 0 && (
                <div className="text-center py-16 text-muted-foreground border rounded-lg">
                    <p>No sports are available for registration at the moment.</p>
                </div>
            )}
            </div>
        </div>
    );
}
