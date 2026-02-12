import { getSports, type ApiSport } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

    const defaultTab = Object.keys(sportsByCategory).sort()[0] || "Boys";

    return (
        <div className="container py-8 md:py-12">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold font-headline">All Sports</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Browse all available sports and register for the events. Click on any card to start the registration process.</p>
            </div>
            
            {sports.length > 0 ? (
                 <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
                        {Object.keys(sportsByCategory).sort().map(category => (
                            <TabsTrigger key={category} value={category}>{category} Sports</TabsTrigger>
                        ))}
                    </TabsList>
                     {Object.keys(sportsByCategory).sort().map(category => (
                        <TabsContent key={category} value={category} className="mt-8">
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sportsByCategory[category].map((sport) => {
                                    return (
                                        <Card key={sport.id} className="group relative flex flex-col overflow-hidden text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                            <CardHeader className="pt-6">
                                                <CardTitle className="font-headline text-2xl min-h-[3rem] flex items-center justify-center">{sport.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex flex-1 flex-col justify-center p-6 pt-0">
                                                <div className="w-full space-y-3 text-sm">
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
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <div className="text-center py-16 text-muted-foreground border rounded-lg">
                    <p>No sports are available for registration at the moment.</p>
                </div>
            )}
        </div>
    );
}
