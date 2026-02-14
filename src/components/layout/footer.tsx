import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { Phone, MapPin } from 'lucide-react';

const quickLinks = [
  { href: '/energy/2026', label: 'Home' },
  { href: '/energy/2026/schedule', label: 'Schedule' },
  { href: '/energy/2026/sports', label: 'Sports' },
  { href: '/energy/2026/teams', label: 'Teams' },
];

const resourceLinks = [
  { href: '/energy/2026/instructions', label: 'Instructions' },
  { href: '/energy/2026/rules', label: 'Rules' },
  { href: '/energy/2026/gallery', label: 'Gallery' },
  { href: '/energy/2026/contact', label: 'Contact Us' },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
        <div className="md:col-span-1 space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground">
            The Chevalier Dr. G.S. Pillay Memorial Inter-College Sports Meet organized by E.G.S. Pillay Group of Institutions.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {quickLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <ul className="space-y-2">
            {resourceLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
           <h4 className="font-semibold mb-4">Get in Touch</h4>
           <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <p>E.G.S. Pillay Engineering College, Nagapattinam – 611 002.</p>
                </div>
                <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                        <a href="tel:9942997667" className="hover:text-primary">D. Velavan: 9942997667</a><br/>
                        <a href="tel:9655260429" className="hover:text-primary">K. Nelson: 9655260429</a>
                    </div>
                </div>
           </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Energy Sports Meet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
