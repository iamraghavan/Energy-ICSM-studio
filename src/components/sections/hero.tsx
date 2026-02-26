'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';

const heroVideos = [
  '/IMG_2926_MP4.mp4',
  '/IMG_3075_MP4.mp4'
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleVideoEnd = () => {
    setCurrentIndex((prev) => (prev + 1) % heroVideos.length);
  };

  return (
    <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-slate-900"
    >
      <video
        key={heroVideos[currentIndex]}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src={heroVideos[currentIndex]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Subtle overlay to soften the video transitions */}
      <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />
    </motion.section>
  );
}
