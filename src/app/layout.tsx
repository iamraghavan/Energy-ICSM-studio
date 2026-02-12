import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: {
    default: 'ENERGY 2026 - Chevalier Dr. G.S. Pillay Memorial Inter-College Sports Meet',
    template: '%s | ENERGY 2026',
  },
  description: "Join ENERGY 2026, the premier inter-college sports meet organized by EGS Pillay Group of Institutions, Nagapattinam. Compete for the Chevalier Dr. G.S. Pillay Memorial Overall Championship Trophy.",
  keywords: [
    'ENERGY 2026',
    'EGS Pillay',
    'Chevalier Dr. G.S. Pillay',
    'inter-college sports meet',
    'sports tournament',
    'Nagapattinam',
    'college sports',
    'Cricket tournament',
    'Football tournament',
    'Basketball tournament',
    'Volleyball tournament',
    'D. Velavan',
    'K. Nelson',
    'S. Senthil Kumar',
  ],
  authors: [
    { name: 'EGS Pillay Group of Institutions' }
  ],
  creator: 'EGS Pillay Group of Institutions',
  openGraph: {
    title: 'ENERGY 2026 - Chevalier Dr. G.S. Pillay Memorial Inter-College Sports Meet',
    description: 'Join the ultimate college sports competition organized by EGS Pillay Group of Institutions.',
    url: 'https://www.energy2026.com', // Placeholder URL
    siteName: 'ENERGY 2026',
    images: [
      {
        url: '/energy_web_banner.webp',
        width: 1280,
        height: 640,
        alt: 'ENERGY 2026 Sports Meet Banner',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ENERGY 2026 - Chevalier Dr. G.S. Pillay Memorial Inter-College Sports Meet',
    description: 'Join the ultimate college sports competition organized by EGS Pillay Group of Institutions.',
    images: ['/energy_web_banner.webp'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyDfUl7G2CIfkJdCRwakYUQeen2o5cCzcVE&libraries=places`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
