
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { STORIES } from '@/lib/stories-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function StoriesStrip() {
  return (
    <section className="bg-background py-4 md:py-8 border-b overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-6 md:gap-12 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory justify-start md:justify-center">
          {STORIES.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-3 shrink-0 group snap-center"
            >
              <Link href={`/energy/2026/stories/${story.id}`} className="relative p-1">
                {/* Instagram-style Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 animate-pulse group-hover:scale-110 transition-transform" />
                <div className="absolute inset-[3px] rounded-full bg-background" />
                
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-background relative z-10 transition-transform group-hover:scale-95">
                  <AvatarImage src={story.thumbnail} alt={story.title} className="object-cover" />
                  <AvatarFallback className={cn("text-white font-black", story.color)}>
                    {story.title[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors truncate max-w-[80px] md:max-w-[120px] text-center">
                {story.title.split(' ')[0]}
              </span>
            </motion.div>
          ))}
          
          <Link 
            href="/energy/2026/stories" 
            className="flex flex-col items-center gap-3 shrink-0 group snap-center"
          >
            <div className="relative p-1">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary transition-colors group-hover:bg-muted/50">
                    <span className="text-[10px] md:text-xs font-black text-muted-foreground group-hover:text-primary tracking-widest">ALL</span>
                </div>
            </div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Gallery</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
