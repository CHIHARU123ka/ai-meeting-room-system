import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AI Meeting Room System',
    template: '%s | AI Meeting Room System'
  },
  description: 'Intelligent meeting room management system with AI-powered recommendations and analytics',
  keywords: ['meeting room', 'booking', 'AI', 'analytics', 'workspace management'],
  authors: [{ name: 'AI Meeting Room Team' }],
  creator: 'AI Meeting Room Team',
  publisher: 'AI Meeting Room Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/',
    title: 'AI Meeting Room System',
    description: 'Intelligent meeting room management system with AI-powered recommendations and analytics',
    siteName: 'AI Meeting Room System',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Meeting Room System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Meeting Room System',
    description: 'Intelligent meeting room management system with AI-powered recommendations and analytics',
    images: ['/og-image.png'],
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
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-gradient-to-br from-background via-background to-muted/20`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              <div className="relative min-h-screen">
                {/* Background Pattern */}
                <div className="fixed inset-0 -z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
                </div>
                
                {children}
                
                <Toaster />
              </div>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
