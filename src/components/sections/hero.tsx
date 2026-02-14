import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden flex items-center justify-center">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/IMG_2835.mov" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-4">
        <h1 className="text-4xl md:text-6xl font-bold font-headline drop-shadow-lg">
          ENERGY 2026
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl drop-shadow-md">
          The Chevalier Dr. G.S. Pillay Memorial Inter-College Sports Meet.
          Join us for a celebration of sportsmanship and talent.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
                <Link href="/energy/2026/registration">Register Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Link href="/energy/2026/schedule">View Schedule</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
