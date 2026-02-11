import { Button } from '@/components/ui/button';
import { Award, Calendar, Handshake, Medal, BedDouble, Users } from 'lucide-react';
import Link from 'next/link';

const quickAccessLinks = [
    { href: '/sports', label: 'Sports', icon: Award },
    { href: '/schedule', label: 'Schedule', icon: Calendar },
    { href: '/fixtures', label: 'Fixtures', icon: Handshake },
    { href: '/medal-tally', label: 'Medal Tally', icon: Medal },
    { href: '/player-profile', label: 'Athlete Profile', icon: Users },
    { href: '/stay', label: 'Stay', icon: BedDouble },
];

export function QuickAccess() {
    return (
        <section className="bg-primary -mt-12 md:-mt-16 relative z-20 py-4">
            <div className="container">
                <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-headline font-bold text-primary-foreground">Quick Access</h2>
                        <p className="text-primary-foreground/80">Find what you're looking for</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {quickAccessLinks.map((link) => (
                            <Button asChild key={link.href} variant="secondary" className="h-24 flex-col gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/20">
                                <Link href={link.href}>
                                    <link.icon className="h-8 w-8 text-accent" />
                                    <span>{link.label}</span>
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
