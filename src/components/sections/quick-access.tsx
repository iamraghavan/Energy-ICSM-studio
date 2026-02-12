import Link from 'next/link';

const quickAccessLinks = [
    { href: '/energy/2026/sports', label: 'Sports' },
    { href: '/energy/2026/schedule', label: 'Schedule' },
    { href: '/energy/2026/medals', label: 'Medals' },
    { href: '/energy/2026/teams', label: 'Teams' },
    { href: '/energy/2026/players', label: 'Players' },
    { href: '/energy/2026/accommodation', label: 'Accommodation' },
];

export function QuickAccess() {
    return (
        <section className="border-y bg-muted/40">
            <div className="container py-3">
                <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2">
                    {quickAccessLinks.map((link) => (
                        <Link
                            href={link.href}
                            key={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
