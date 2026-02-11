"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Swords, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/sports', label: 'Sports', icon: Trophy },
  { href: '/fixtures', label: 'Fixtures', icon: Swords },
  { href: '/teams', label: 'Teams', icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t flex items-center justify-around z-50">
      {navLinks.map((link) => {
        // Handle nested routes for active state
        const isActive = link.href === '/' ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-primary transition-colors w-1/4 h-full',
              isActive && 'text-primary'
            )}
          >
            <link.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
