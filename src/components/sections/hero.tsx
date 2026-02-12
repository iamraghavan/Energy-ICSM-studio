import Image from 'next/image';

export function Hero() {
  return (
    <section className="w-full">
      <Image
        src="/energy_web_banner.webp"
        alt="Energy Sports Meet"
        width={720}
        height={300}
        className="w-full h-auto"
        quality={100}
        priority
      />
    </section>
  );
}
