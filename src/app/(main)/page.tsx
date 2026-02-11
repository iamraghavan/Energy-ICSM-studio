import { Hero } from '@/components/sections/hero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sports } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-background">
      <Hero />
      <FeaturedSportsSection />
      <FeaturedFixturesSection />
    </div>
  );
}

function FeaturedSportsSection() {
    return (
        <section className="py-16 md:py-24">
            <div className="container">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-headline font-bold">Featured Sports</h2>
                    <Button asChild variant="ghost">
                        <Link href="/sports">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sports.slice(0, 4).map((sport) => (
                        <Card key={sport.id} className="hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <sport.icon className="h-8 w-8 text-accent" />
                                    <span className='font-headline'>{sport.name}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Type: {sport.type}</p>
                                <p className="text-sm text-muted-foreground">Slots Left: {sport.slotsLeft}</p>
                                <Button asChild variant="secondary" className="mt-4 w-full">
                                    <Link href={`/register?sport=${sport.id}`}>Register</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

function FeaturedFixturesSection() {
    return (
        <section className="py-16 md:py-24 bg-secondary/50">
            <div className="container text-center">
                <h2 className="text-3xl font-headline font-bold">Upcoming Fixtures</h2>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                    The stage is set, the rivalries are fierce. Witness the clashes that will define champions.
                </p>
                <Button asChild size="lg" className="mt-8">
                    <Link href="/fixtures">Explore Full Schedule</Link>
                </Button>
            </div>
        </section>
    )
}
