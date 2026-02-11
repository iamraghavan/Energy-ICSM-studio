import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/venues', label: 'Venues' },
  { href: '/sports', label: 'Sports' },
  { href: '/medal-tally', label: 'Medal Tally' },
  { href: '/winners', label: 'Winners' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About Us' },
  { href: '/fixtures', label: 'Fixtures' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-foreground/10 bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="text-accent" />
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
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

        <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden md:inline-flex bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/player-profile"><UserCircle2 className="mr-2"/> Access Player Profile</Link>
            </Button>
            
            {/* Mobile Nav */}
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-black/20">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs pr-0 pt-12 bg-primary text-primary-foreground border-l-0">
                <Link href="/" className="flex items-center space-x-2 px-4">
                    <Logo className="text-accent" />
                </Link>
                <div className="flex flex-col space-y-2 pt-6">
                {navLinks.map((link) => (
                    <Link
                    key={`mobile-${link.href}`}
                    href={link.href}
                    className="px-4 py-2 rounded-md hover:bg-black/20"
                    >
                    {link.label}
                    </Link>
                ))}
                <div className='px-4 pt-4'>
                    <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="/player-profile"><UserCircle2 className="mr-2"/> Access Player Profile</Link>
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
