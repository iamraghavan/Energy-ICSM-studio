'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play } from 'lucide-react';

const stories = [
  {
    id: 'intro',
    title: 'Tournament Kickoff',
    description: 'Get ready for the biggest sports event of 2026.',
    thumbnail: 'https://images.unsplash.com/photo-1762341582157-20d9e1430f9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    color: 'bg-blue-600'
  },
  {
    id: 'cricket-highlights',
    title: 'Cricket Fever',
    description: 'Relive the best moments from the pitch.',
    thumbnail: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    color: 'bg-emerald-600'
  }
];

export default function StoriesListPage() {
  return (
    <div className="container py-12 md:py-20 max-w-4xl mx-auto">
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase italic">
          Energy <span className="text-primary">Stories</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Tap into the highlights and excitement of ENERGY 2026 through our visual web stories.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/energy/2026/stories/${story.id}`}>
              <Card className="group overflow-hidden rounded-[2rem] border-none shadow-2xl relative aspect-[9/16] max-h-[600px] mx-auto">
                <Image
                  src={story.thumbnail}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Play className="h-10 w-10 text-white fill-current ml-1" />
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-2">{story.title}</h3>
                  <p className="text-white/70 font-medium text-sm italic">{story.description}</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
