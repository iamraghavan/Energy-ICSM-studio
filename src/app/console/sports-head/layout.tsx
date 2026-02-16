
'use client';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getUserSession } from "@/lib/auth";
import { getSports } from "@/lib/api";
import { useEffect, useState } from "react";
import type { UserSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Trophy, CalendarCog } from "lucide-react";
import type { ApiSport } from "@/lib/api";

const navLinks = [
    { href: '/console/sports-head/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/console/sports-head/teams', label: 'Teams', icon: Trophy },
    { href: '/console/sports-head/matches', label: 'Matches', icon: CalendarCog },
    { href: '/console/sports-head/players', label: 'Players', icon: Users },
]

function SportsHeadHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserSession | null>(null);
    const [sportName, setSportName] = useState<string>('');

    useEffect(() => {
        const session = getUserSession();
        if (!session || session.role !== 'sports_head') {
            setTimeout(() => {
                const currentSession = getUserSession();
                 if (!currentSession || currentSession.role !== 'sports_head') {
                    router.replace('/auth/session');
                }
            }, 500);
        } else {
            setUser(session);
            if(session.assigned_sport_id) {
                // This is not ideal, but we'll fetch all sports to find the name
                // In a real app, this might come from the session itself
                getSports().then(sports => {
                    const sport = sports.find(s => String(s.id) === session.assigned_sport_id);
                    if(sport) setSportName(sport.name);
                })
            }
        }
    }, [router]);

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
                     {sportName && (
                        <span className="text-sm text-primary font-semibold hidden sm:inline-block">
                           Managing: {sportName}
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

export default function SportsHeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SportsHeadHeader />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
