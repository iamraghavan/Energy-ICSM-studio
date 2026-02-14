import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/energy/2026', label: 'Home' },
  { href: '/energy/2026/schedule', label: 'Schedule' },
  { href: '/energy/2026/sports', label: 'Sports' },
  { href: '/energy/2026/teams', label: 'Teams' },
  { href: '/energy/2026/live', label: 'Live' },
  { href: '/energy/2026/gallery', label: 'Gallery' },
  { href: '/energy/2026/instructions', label: 'General Instructions' },
  { href: '/energy/2026/rules', label: 'Important Rules' },
  { href: '/energy/2026/about', label: 'About' },
  { href: '/energy/2026/contact', label: 'Contact' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background text-foreground">
      <div className="container flex h-22 items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href="/energy/2026" className="flex items-center gap-2">
                <Logo />
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                {navLinks.map((link) => (
                <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                        "transition-colors hover:text-primary flex items-center"
                    )}
                >
                    {link.label}
                </Link>
                ))}
            </nav>
        </div>
        

        <div className="flex items-center gap-3">
            <Button asChild size="sm" className="hidden md:inline-flex bg-accent hover:bg-accent/80 text-accent-foreground">
              <Link href="/energy/2026/registration">Register</Link>
            </Button>
            
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-0">
                 <div className="p-4 border-b bg-background">
                    <Link href="/energy/2026" className="flex items-center space-x-2">
                        <Logo />
                    </Link>
                </div>
                <div className="flex flex-col space-y-2 p-4">
                {navLinks.map((link) => (
                    <Link
                        key={`mobile-${link.label}`}
                        href={link.href}
                        className={cn(
                            "px-4 py-2 rounded-md hover:bg-muted flex items-center justify-between"
                        )}
                    >
                        <span className={cn()}>{link.label}</span>
                    </Link>
                ))}
                <div className='pt-4'>
                    <Button asChild className="w-full">
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
