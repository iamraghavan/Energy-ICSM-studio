import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ShoppingBag } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/energy/2026', label: 'Home' },
  { href: '/energy/2026/schedule', label: 'Schedule' },
  { href: '/energy/2026/fixtures', label: 'Fixtures' },
  { href: '/energy/2026/teams', label: 'Teams' },
  { href: '/energy/2026/players', label: 'Players' },
  { href: '/energy/2026/gallery', label: 'Gallery' },
  { href: '/energy/2026/about', label: 'About' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href="/energy/2026" className="flex items-center gap-2">
                <Logo className="text-white" />
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-accent"
                >
                    {link.label}
                </Link>
                ))}
            </nav>
        </div>
        

        <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                <Search className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                <ShoppingBag className="h-5 w-5" />
            </Button>
            <Button asChild size="sm" className="hidden md:inline-flex bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/energy/2026/registration">Register</Link>
            </Button>
            
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-0 bg-primary text-primary-foreground">
                 <div className="p-4 border-b border-primary-foreground/20">
                    <Link href="/energy/2026" className="flex items-center space-x-2">
                        <Logo className='text-white' />
                    </Link>
                </div>
                <div className="flex flex-col space-y-2 p-4">
                {navLinks.map((link) => (
                    <Link
                    key={`mobile-${link.href}`}
                    href={link.href}
                    className="px-4 py-2 rounded-md hover:bg-white/10"
                    >
                    {link.label}
                    </Link>
                ))}
                <div className='pt-4'>
                    <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="/energy/2026/registration">Register Now</Link>
                    </Button>
                </div>
                </div>
            </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
