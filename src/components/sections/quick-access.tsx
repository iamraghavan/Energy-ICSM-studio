import { Button } from '@/components/ui/button';
import { Award, Calendar, Handshake, Medal, Users, User, BedDouble } from 'lucide-react';
import Link from 'next/link';

const quickAccessLinks = [
    { href: '/sports', label: 'Sports', icon: Award },
    { href: '/schedule', label: 'Schedule', icon: Calendar },
    { href: '/fixtures', label: 'Fixtures', icon: Handshake },
    { href: '/medal-tally', label: 'Medal Tally', icon: Medal },
    { href: '/teams', label: 'Teams', icon: Users },
    { href: '/players', label: 'Players', icon: User },
    { href: '/accommodation', label: 'Accommodation', icon: BedDouble },
];

export function QuickAccess() {
    return (
        <section className="bg-background py-16">
            <div className="container">
                 <div className="text-center mb-8">
                    <h2 className="text-3xl font-headline font-bold">Quick Access</h2>
                    <p className="text-muted-foreground">Find what you're looking for.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                    {quickAccessLinks.map((link) => (
                        <Link href={link.href} key={link.href}>
                            <div className="group flex flex-col items-center justify-center gap-2 h-28 p-4 rounded-lg bg-card border hover:shadow-lg hover:-translate-y-1 transition-all">
                                <link.icon className="h-8 w-8 text-accent" />
                                <span className="text-sm font-semibold text-center">{link.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
