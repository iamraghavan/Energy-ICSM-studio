'use client';

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBigScreen = pathname.endsWith('/live/big');
  const isVerticalScreen = pathname.includes('/live/vertical');
  const isStory = pathname.includes('/stories/');
  const isStandalone = isBigScreen || isVerticalScreen || isStory;

  return (
    <div className="flex min-h-screen flex-col bg-background">
        {!isStandalone && <Header />}
        <AnimatePresence mode="wait">
            <motion.main
                key={pathname}
                initial={isStandalone ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={isStandalone ? { opacity: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={cn("flex-1", isStandalone && "p-0")}
            >
                {children}
            </motion.main>
        </AnimatePresence>
        {!isStandalone && <Footer />}
    </div>
  );
}
