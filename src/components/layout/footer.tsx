import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container py-8">
        <div className="text-center">
            <Logo className="text-accent inline-block"/>
        </div>
        <div className="mt-4 text-center text-sm text-primary-foreground/80">
          © {new Date().getFullYear()} CM TROPHY. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
