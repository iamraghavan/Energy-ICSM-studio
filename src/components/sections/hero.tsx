import Image from 'next/image';

export function Hero() {
  return (
    <section className="w-full">
      <Image
        src="/energy_web_banner.webp"
        alt="Energy Sports Meet"
        width={1920}
        height={800}
        className="w-full h-auto"
        priority
      />
    </section>
  );
}
