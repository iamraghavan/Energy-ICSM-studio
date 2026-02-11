import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/venues', label: 'Venues' },
  { href: '/sports', label: 'Sports' },
  { href: '/fixtures', label: 'Fixtures' },
  { href: '/teams', label: 'Teams' },
  { href: '/players', label: 'Players' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
            <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary"
            >
                {link.label}
            </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/register">Register Now</Link>
            </Button>
            
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs pr-0 pt-12">
                <Link href="/" className="flex items-center space-x-2 px-4">
                    <Logo />
                </Link>
                <div className="flex flex-col space-y-2 pt-6">
                {navLinks.map((link) => (
                    <Link
                    key={`mobile-${link.href}`}
                    href={link.href}
                    className="px-4 py-2 rounded-md hover:bg-muted"
                    >
                    {link.label}
                    </Link>
                ))}
                <div className='px-4 pt-4'>
                    <Button asChild className="w-full">
                        <Link href="/register">Register Now</Link>
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
