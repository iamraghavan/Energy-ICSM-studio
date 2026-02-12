import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh]">
      <Image
        src="/energy_web_banner.webp"
        alt="Energy Sports Meet"
        fill
        className="object-cover"
        priority
      />
    </section>
  );
}
