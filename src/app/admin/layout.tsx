'use client';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getUserSession } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { UserSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ListChecks, Users, CalendarCog, Trophy, Building } from "lucide-react";

// Admin-specific nav links
const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/registrations', label: 'Registrations', icon: ListChecks },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/sports', label: 'Sports', icon: Trophy },
    { href: '/admin/colleges', label: 'Colleges', icon: Building },
    { href: '/admin/matches', label: 'Matches', icon: CalendarCog },
]

function AdminHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserSession | null>(null)

    useEffect(() => {
        const session = getUserSession();
        if (!session || session.role !== 'super_admin') {
            // Allow time for initial session check on login page to redirect
            setTimeout(() => {
                const currentSession = getUserSession();
                 if (!currentSession || currentSession.role !== 'super_admin') {
                    router.replace('/auth/session');
                }
            }, 500);
        } else {
            setUser(session);
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('assigned_sport_id');
        router.push('/auth/session');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/energy/2026" className="mr-6 flex items-center space-x-2">
                        <Logo />
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navLinks.map(link => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    pathname.startsWith(link.href) ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                     {user?.role && (
                        <span className="text-sm text-muted-foreground capitalize hidden sm:inline-block">
                           Role: {user.role.replace('_', ' ')}
                        </span>
                    )}
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AdminHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
