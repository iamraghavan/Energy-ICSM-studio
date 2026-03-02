'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, ChevronRight, ChevronLeft, Zap, Trophy, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoryPage {
  title: string;
  description: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  icon?: any;
}

const STORY_CONTENT: Record<string, StoryPage[]> = {
  'intro': [
    {
      title: "ENERGY 2026",
      description: "Welcome to the Chevalier Dr. G.S. Pillay Memorial Inter-College Sports Meet.",
      image: "https://images.unsplash.com/photo-1762341582157-20d9e1430f9a?q=80&w=1080",
      icon: Zap
    },
    {
      title: "The Arena Awaits",
      description: "Compete across 12+ disciplines for the Overall Championship Trophy.",
      image: "https://images.unsplash.com/photo-1551763337-e05b91996d32?q=80&w=1080",
      icon: Trophy
    },
    {
      title: "Join the Legacy",
      description: "Register now and represent your college on the grand stage.",
      image: "https://images.unsplash.com/photo-1535725213980-3cddc939d616?q=80&w=1080",
      ctaText: "Register Now",
      ctaLink: "/energy/2026/registration",
      icon: Users
    }
  ],
  'cricket-highlights': [
    {
      title: "Pitch Perfect",
      description: "High-octane cricket action from the Main Ground.",
      image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1080",
      icon: MapPin
    },
    {
      title: "Live Action",
      description: "Follow ball-by-ball updates from every cricket match in real-time.",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1080",
      ctaText: "Go Live",
      ctaLink: "/energy/2026/live",
      icon: Zap
    }
  ]
};

export default function StoryViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const pages = STORY_CONTENT[id] || [];
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);

  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
      setProgress(0);
    } else {
      router.push('/energy/2026/stories');
    }
  }, [currentPage, pages.length, router]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setProgress(0);
    }
  }, [currentPage]);

  // Handle the progress timer independently
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 50); // 5 seconds total (50ms * 100)

    return () => clearInterval(timer);
  }, [currentPage]);

  // Trigger page change when progress finishes, outside of the render/updater cycle
  useEffect(() => {
    if (progress >= 100) {
      nextPage();
    }
  }, [progress, nextPage]);

  if (pages.length === 0) return null;

  const current = pages[currentPage];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] overflow-hidden select-none touch-none">
      <div className="relative w-full max-w-md aspect-[9/16] h-[100dvh] bg-slate-900 shadow-2xl">
        
        {/* Progress Bars */}
        <div className="absolute top-4 left-0 right-0 z-50 flex gap-1 px-4">
          {pages.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ 
                  width: i < currentPage ? '100%' : i === currentPage ? `${progress}%` : '0%' 
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="absolute top-8 left-4 right-4 z-50 flex justify-between items-center text-white">
          <Button variant="ghost" size="icon" onClick={() => router.push('/energy/2026/stories')} className="hover:bg-white/10 rounded-full">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Story Pages */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="absolute inset-0"
          >
            <Image
              src={current.image}
              alt={current.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-10 space-y-6 text-white text-center pb-20">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex justify-center"
              >
                {Icon && (
                    <div className="h-16 w-16 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 mb-4">
                        <Icon className="h-8 w-8 text-white" />
                    </div>
                )}
              </motion.div>
              
              <div className="space-y-2">
                <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-black uppercase tracking-tighter italic"
                >
                    {current.title}
                </motion.h2>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/80 font-medium leading-relaxed italic"
                >
                    {current.description}
                </motion.p>
              </div>

              {current.ctaLink && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button asChild className="w-full h-14 rounded-2xl bg-white text-black hover:bg-slate-100 font-black uppercase tracking-widest text-xs">
                        <a href={current.ctaLink}>{current.ctaText}</a>
                    </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Tap Areas */}
        <div className="absolute inset-0 z-40 flex">
          <div className="flex-1 h-full cursor-pointer" onClick={prevPage} />
          <div className="flex-1 h-full cursor-pointer" onClick={nextPage} />
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="hidden md:block">
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-[-80px] top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                onClick={prevPage}
                disabled={currentPage === 0}
            >
                <ChevronLeft className="h-10 w-10" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-[-80px] top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                onClick={nextPage}
            >
                <ChevronRight className="h-10 w-10" />
            </Button>
        </div>
      </div>
    </div>
  );
}
