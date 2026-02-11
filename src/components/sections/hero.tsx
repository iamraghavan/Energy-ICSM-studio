import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-white bg-primary">
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/sports-league/1800/1000"
          alt="Tamil Nadu Biggest Sports League"
          fill
          className="object-cover opacity-20"
          data-ai-hint="sports competition crowd"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
      </div>
      <div className="relative z-10 text-center p-4 flex flex-col items-center">
        <div className="mb-4">
            <Image src="https://picsum.photos/seed/cm-photo/150/150" alt="CM" width={120} height={120} className="rounded-full border-4 border-accent" data-ai-hint="male politician portrait" />
        </div>
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight drop-shadow-lg text-accent uppercase">
          Tamilnadu Biggest <br /> Sports League
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-2xl md:text-4xl text-neutral-200 drop-shadow font-headline">
          THE CM TROPHY 2025
        </p>
      </div>
    </section>
  );
}
