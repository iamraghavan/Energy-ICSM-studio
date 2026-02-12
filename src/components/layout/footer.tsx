import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Energy Sports Meet. All rights reserved.
      </div>
    </footer>
  );
}
