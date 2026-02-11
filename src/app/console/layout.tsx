'use client';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDecodedToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { DecodedToken } from "@/lib/auth";

function ConsoleHeader() {
    const router = useRouter();
    const [user, setUser] = useState<DecodedToken | null>(null)

    useEffect(() => {
        setUser(getDecodedToken())
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        router.push('/auth/session');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-card p-4">
            <div className="container flex items-center justify-between">
                <Link href="/energy/2026" className="flex items-center gap-2">
                    <Logo />
                    <span className="font-semibold hidden sm:inline-block">Console</span>
                </Link>
                <div className="flex items-center gap-4">
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

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ConsoleHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
