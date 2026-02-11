import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Inter-College Sports Meet 2024. All rights reserved.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 col-span-1 md:col-span-3 gap-8">
            <div>
              <h3 className="font-semibold mb-2 font-headline">Navigation</h3>
              <ul className="space-y-2">
                <li><Link href="/sports" className="text-sm text-muted-foreground hover:text-primary">Sports</Link></li>
                <li><Link href="/fixtures" className="text-sm text-muted-foreground hover:text-primary">Fixtures</Link></li>
                <li><Link href="/teams" className="text-sm text-muted-foreground hover:text-primary">Teams</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 font-headline">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 font-headline">Connect</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Facebook</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Twitter</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Instagram</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SportZone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
