'use client';

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <AnimatePresence mode="wait">
            <motion.main
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex-1"
            >
                {children}
            </motion.main>
        </AnimatePresence>
        <Footer />
    </div>
  );
}
