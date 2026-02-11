import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-banner");

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] flex items-center justify-center text-white">
      <div className="absolute inset-0">
        <Image
          src={heroImage?.imageUrl || "https://picsum.photos/seed/1/1800/1000"}
          alt={heroImage?.description || "Energetic athletes competing"}
          fill
          className="object-cover"
          data-ai-hint="sports competition"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>
      <div className="relative z-10 text-center p-4">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight drop-shadow-lg">
          SportZone: Where Champions Are Made
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-neutral-200 drop-shadow">
          The ultimate platform for college sports. Follow your favorite teams, track live scores, and witness the making of legends.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/register">Register Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10 backdrop-blur-sm">
            <Link href="/fixtures">View Fixtures</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
