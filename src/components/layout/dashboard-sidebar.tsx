"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  Home,
  Package,
  Users2,
  LineChart,
  Settings,
  Swords,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { Logo } from "../shared/logo";

const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/registrations', label: 'Registrations', icon: Users2 },
    { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
    { href: '/dashboard/teams', label: 'Teams', icon: Package },
    { href: '/dashboard/fixtures', label: 'Fixtures', icon: Swords },
    { href: '/dashboard/scores', label: 'Scores', icon: BarChart },
    { href: '/dashboard/reports', label: 'Reports', icon: LineChart },
];


export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link href="/" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
                    <Logo className="!text-accent !text-xl"/>
                    <span className="sr-only">Energy</span>
                </Link>
                {navLinks.map(link => {
                     const isActive = link.href === '/dashboard' ? pathname === link.href : pathname.startsWith(link.href);
                     return (
                        <Tooltip key={link.href}>
                            <TooltipTrigger asChild>
                                <Link href={link.href} className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                    isActive ? 'bg-accent text-accent-foreground' : ''
                                )}>
                                    <link.icon className="h-5 w-5" />
                                    <span className="sr-only">{link.label}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{link.label}</TooltipContent>
                        </Tooltip>
                     )
                })}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/dashboard/settings" className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                            pathname.startsWith('/dashboard/settings') ? 'bg-accent text-accent-foreground' : ''
                        )}>
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">Settings</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
            </nav>
        </TooltipProvider>
    </aside>
  );
}
