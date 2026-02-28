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

  return (
    <div className="flex min-h-screen flex-col bg-background">
        {!isBigScreen && <Header />}
        <AnimatePresence mode="wait">
            <motion.main
                key={pathname}
                initial={isBigScreen ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={isBigScreen ? { opacity: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={cn("flex-1", isBigScreen && "p-0")}
            >
                {children}
            </motion.main>
        </AnimatePresence>
        {!isBigScreen && <Footer />}
    </div>
  );
}
