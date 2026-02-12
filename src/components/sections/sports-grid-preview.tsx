import { type ApiSport } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSportIcon } from "@/lib/icons";

export function SportsGridPreview({ sports }: { sports: ApiSport[] }) {
    const uniqueSports = Array.from(new Map(sports.map(item => [item.name, item])).values());
    const featuredSports = uniqueSports.slice(0, 4);

    return (
        <section>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold font-headline">Featured Sports</h2>
                <p className="text-muted-foreground mt-2">Explore some of the exciting sports you can participate in.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSports.map((sport) => {
                    const SportIcon = getSportIcon(sport.name);
                    return (
                        <Card key={sport.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <SportIcon className="h-8 w-8 text-accent" />
                                    <span className='font-headline text-xl'>{sport.name}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-grow">
                            <div className="space-y-2 mb-4 flex-grow">
                                <p className="text-sm text-muted-foreground">Type: <span className="font-semibold text-foreground">{sport.type}</span></p>
                            </div>
                                <Button asChild className="w-full mt-auto" variant="outline">
                                    <Link href={`/energy/2026/registration?sport=${sport.id}`}>
                                        Register <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
            <div className="text-center mt-8">
                <Button asChild>
                    <Link href="/energy/2026/sports">View All Sports</Link>
                </Button>
            </div>
        </section>
    );
}
