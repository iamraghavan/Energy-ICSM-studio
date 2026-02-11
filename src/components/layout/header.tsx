import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/sports', label: 'Sports' },
  { href: '/fixtures', label: 'Fixtures' },
  { href: '/teams', label: 'Teams' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Nav Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 pt-12">
            <Link href="/" className="flex items-center space-x-2 px-4">
              <Logo />
            </Link>
            <div className="flex flex-col space-y-2 pt-6">
              {navLinks.map((link) => (
                <Link
                  key={`mobile-${link.href}`}
                  href={link.href}
                  className="px-4 py-2 text-foreground rounded-md hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Mobile Logo */}
        <div className="flex justify-center md:hidden flex-1">
             <Link href="/" className="flex items-center space-x-2">
                <Logo />
            </Link>
        </div>


        <div className="flex items-center justify-end space-x-4 md:flex-1">
          <nav className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <UserCircle2 className="h-8 w-8" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Guest User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      guest@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="#">Profile</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild className="hidden sm:inline-flex">
              <Link href="/register">Register Now</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
