import { Button } from '@/components/ui/button';
import { Award, Calendar, Handshake, Medal, Users, User, BedDouble } from 'lucide-react';
import Link from 'next/link';

const quickAccessLinks = [
    { href: '/energy/2026/sports', label: 'Sports', icon: Award },
    { href: '/energy/2026/schedule', label: 'Schedule', icon: Calendar },
    { href: '/energy/2026/fixtures', label: 'Fixtures', icon: Handshake },
    { href: '/energy/2026/medals', label: 'Medals', icon: Medal },
    { href: '/energy/2026/teams', label: 'Teams', icon: Users },
    { href: '/energy/2026/players', label: 'Players', icon: User },
    { href: '/energy/2026/accommodation', label: 'Accommodation', icon: BedDouble },
];

export function QuickAccess() {
    return (
        <section className="bg-muted/50 py-12 md:py-16">
            <div className="container">
                 <div className="text-center mb-8">
                    <h2 className="text-3xl font-headline font-bold">Quick Access</h2>
                    <p className="text-muted-foreground">Find what you're looking for.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {quickAccessLinks.map((link) => (
                        <Link href={link.href} key={link.href}>
                            <div className="group flex flex-col items-center justify-center gap-2 h-28 p-4 rounded-lg bg-card border hover:bg-primary hover:text-primary-foreground transition-all">
                                <link.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                                <span className="text-sm font-semibold text-center text-foreground group-hover:text-white transition-colors">{link.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
