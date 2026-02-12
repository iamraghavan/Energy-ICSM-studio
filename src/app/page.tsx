import { Hero } from '@/components/sections/hero';
import { QuickAccess } from '@/components/sections/quick-access';
import { SportsGridPreview } from '@/components/sections/sports-grid-preview';
import { Button } from '@/components/ui/button';
import { getSports } from '@/lib/api';
import Link from 'next/link';

export default async function Home() {
  const sports = await getSports().catch(() => []);
  
  return (
    <>
      <Hero />
      <QuickAccess />
      <div className="container py-16 space-y-16">
        <SportsGridPreview sports={sports} />
      </div>
       <div className="container py-16 text-center">
        <h2 className="text-3xl font-bold font-headline mb-4">Ready to Join the Action?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Register your team or as an individual athlete and be a part of the biggest sports meet of the year.
        </p>
        <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
                <Link href="/registration">Register as a Player</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
                <Link href="/teams">Explore Teams</Link>
            </Button>
        </div>
      </div>
    </>
  );
}
