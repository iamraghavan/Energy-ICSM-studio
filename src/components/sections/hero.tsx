'use client';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/201.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </motion.section>
  );
}
