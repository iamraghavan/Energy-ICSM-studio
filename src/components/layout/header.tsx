'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, User } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getStudentSession, type StudentSession } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

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
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const checkSession = () => {
      setStudentSession(getStudentSession());
    };
    checkSession();
    
    window.addEventListener('storage', checkSession);
    return () => window.removeEventListener('storage', checkSession);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    setStudentSession(null);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/energy/2026');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background text-foreground">
      <div className="container flex h-20 items-center justify-between">
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
             {isClient && studentSession ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{studentSession.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{studentSession.name}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/energy/2026/student/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button asChild size="sm" className="hidden md:inline-flex bg-primary hover:bg-primary/90">
                    <Link href="/energy/2026/registration">Register</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                    <Link href="/energy/2026/auth?action=login">Login</Link>
                  </Button>
                </>
              )}
            
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-0">
                 <SheetHeader className="p-4 border-b">
                    <SheetTitle asChild>
                        <Link href="/energy/2026" className="flex items-center space-x-2">
                            <Logo />
                        </Link>
                    </SheetTitle>
                    <SheetDescription className="sr-only">Mobile Navigation Menu</SheetDescription>
                 </SheetHeader>
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
                <div className='pt-4 space-y-2'>
                    {isClient && studentSession ? (
                      <Button asChild className="w-full">
                        <Link href="/energy/2026/student/dashboard">Go to Dashboard</Link>
                      </Button>
                    ) : (
                      <>
                        <Button asChild className="w-full">
                            <Link href="/energy/2026/registration">Register Now</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/energy/2026/auth?action=login">Login</Link>
                        </Button>
                      </>
                    )}
                </div>
                </div>
            </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
