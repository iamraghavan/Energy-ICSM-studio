import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative w-full h-[300px]">
      <Image
        src="/energy_web_banner.webp"
        alt="Energy Sports Meet"
        fill
        className="object-cover"
        quality={100}
        priority
      />
    </section>
  );
}
