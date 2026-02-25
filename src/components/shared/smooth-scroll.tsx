'use client';

import Lenis from '@studio-freight/lenis';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;

    const update = (time: number) => {
      lenis.raf(time * 1000);
    }
    
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    
    return () => {
        gsap.ticker.remove(update);
        lenis.destroy();
        lenisRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return children;
}

export default SmoothScroll;
