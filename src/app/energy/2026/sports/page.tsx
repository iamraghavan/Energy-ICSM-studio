import { sports } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SportsPage() {
    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">All Sports</h1>
                <p className="text-muted-foreground mt-2">Browse all available sports and register for events.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sports.map((sport) => (
                    <Card key={sport.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <sport.icon className="h-10 w-10 text-accent" />
                                <span className='font-headline text-2xl'>{sport.name}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-grow">
                           <div className="space-y-2 mb-4 flex-grow">
                             <p className="text-sm text-muted-foreground">Type: <span className="font-semibold text-foreground">{sport.type}</span></p>
                             <p className="text-sm text-muted-foreground">Total Slots: <span className="font-semibold text-foreground">{sport.slots}</span></p>
                             <p className="text-sm text-muted-foreground">Slots Left: <span className="font-semibold text-foreground">{sport.slotsLeft}</span></p>
                           </div>
                            <Button asChild className="w-full mt-auto">
                                <Link href={`/energy/2026/registration?sport=${sport.id}`}>
                                    Register Now <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
