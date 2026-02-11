import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center text-white">
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/stadium-track/1800/1200"
          alt="Tamil Nadu's Biggest Inter-College Sports Meet"
          fill
          className="object-cover"
          data-ai-hint="stadium running track athletes"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/70 to-transparent" />
        <div className="absolute inset-0 bg-primary/40" />
      </div>
      <div className="relative z-10 text-center p-4 flex flex-col items-center">
        <h1 className="font-headline text-4xl md:text-7xl font-bold tracking-tight drop-shadow-lg text-white uppercase">
          Tamil Nadu's Biggest <br /> Inter-College Sports Meet
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-neutral-200 drop-shadow">
          December 15-22, 2025 | Chennai, Tamil Nadu
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/energy/2026/registration">Register Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Link href="/energy/2026/fixtures">View Fixtures</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
