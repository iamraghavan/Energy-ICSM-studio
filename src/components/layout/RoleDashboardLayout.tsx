'use client';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getUserSession } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { UserSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

function RoleDashboardHeader({ allowedRoles, title }: { allowedRoles: string[], title: string }) {
    const router = useRouter();
    const [user, setUser] = useState<UserSession | null>(null)

    useEffect(() => {
        const session = getUserSession();
        // A small delay to allow login page to process its own session check and redirect
        setTimeout(() => {
            const currentSession = getUserSession();
            if (!currentSession || !allowedRoles.includes(currentSession.role)) {
                router.replace('/auth/session');
            } else {
                setUser(currentSession);
            }
        }, 500);
    }, [router, allowedRoles])

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('assigned_sport_id');
        router.push('/auth/session');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex items-center">
                    <Link href="/energy/2026" className="mr-6 flex items-center space-x-2">
                        <Logo />
                    </Link>
                    <h1 className="text-lg font-semibold">{title}</h1>
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

export default function RoleDashboardLayout({
  children,
  allowedRoles,
  title
}: {
  children: React.ReactNode;
  allowedRoles: string[];
  title: string;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <RoleDashboardHeader allowedRoles={allowedRoles} title={title} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
