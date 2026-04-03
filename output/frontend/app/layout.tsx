import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Meeting Room Manager',
  description: 'Intelligent meeting room management system with AI-powered recommendations',
  keywords: ['meeting room', 'AI', 'booking', 'management', 'enterprise'],
  authors: [{ name: 'AI Meeting Room Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f23' },
  ],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://meeting-room-ai.com',
    title: 'AI Meeting Room Manager',
    description: 'Intelligent meeting room management system with AI-powered recommendations',
    siteName: 'AI Meeting Room Manager',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Meeting Room Manager',
    description: 'Intelligent meeting room management system with AI-powered recommendations',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Meeting Room" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
