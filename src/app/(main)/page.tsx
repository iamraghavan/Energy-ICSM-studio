import { Hero } from '@/components/sections/hero';
import { QuickAccess } from '@/components/sections/quick-access';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-background">
      <Hero />
      <QuickAccess />
       <div className="container py-16 text-center">
        <h2 className="text-3xl font-bold font-headline mb-4">Explore the Events</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover the wide range of sports and events, find your favorite teams and follow their journey to victory.
        </p>
        <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
                <Link href="/sports">All Sports</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
                <Link href="/fixtures">View Fixtures</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
