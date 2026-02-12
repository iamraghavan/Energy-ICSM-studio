import Link from 'next/link';

const quickAccessLinks = [
    { href: '/sports', label: 'Sports' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/live', label: 'Live' },
    { href: '/medals', label: 'Medals' },
    { href: '/teams', label: 'Teams' },
    { href: '/accommodation', label: 'Accommodation' },
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
