import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { cn } from '@/lib/utils';
import { lazyLoadComponent } from '@/lib/performance';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { NetworkStatusIndicator } from '@/components/pwa/NetworkStatusIndicator';

// Font configuration with fallback for restricted environments
// Uses system fonts as fallback when Google Fonts unavailable (e.g., CI/CD)
const fontConfig = {
  variable: '--font-body --font-heading --font-heading-alt',
  className: '',
};

// Check if we can load Google Fonts (not in restricted environment)
const canLoadGoogleFonts = process.env.SKIP_GOOGLE_FONTS !== 'true';

let inter = fontConfig;
let poppins = fontConfig;
let montserrat = fontConfig;

if (canLoadGoogleFonts) {
  try {
    const { Inter, Poppins, Montserrat } = require('next/font/google');
    
    // Optimized font loading with subset optimization
    inter = Inter({
      subsets: ['latin'],
      variable: '--font-body',
      display: 'swap',
      preload: true,
      fallback: ['system-ui', 'arial'],
      adjustFontFallback: true,
    });

    // Lazy load secondary fonts for better initial load performance
    poppins = Poppins({
      subsets: ['latin', 'latin-ext'],
      weight: ['400', '500', '600', '700', '800'],
      variable: '--font-heading-alt',
      display: 'swap',
      preload: false,
      fallback: ['system-ui', 'sans-serif'] as string[],
      adjustFontFallback: true,
    });

    montserrat = Montserrat({
      subsets: ['latin', 'latin-ext'],
      weight: ['500', '600', '700', '800', '900'],
      variable: '--font-heading',
      display: 'swap',
      preload: false,
      fallback: ['system-ui', 'sans-serif'] as string[],
      adjustFontFallback: true,
    });
  } catch {
    // Silently fall back to system fonts
  }
}

// Lazy load analytics components for better initial page load
const LazyGoogleAnalytics = lazyLoadComponent(
  () =>
    import('@/components/analytics/GoogleAnalytics').then((mod) => ({
      default: mod.GoogleAnalytics,
    })),
  () => <div>Loading analytics...</div>
);

const LazyWebVitalsTracker = lazyLoadComponent(
  () =>
    import('@/components/analytics/WebVitalsTracker').then((mod) => ({
      default: mod.WebVitalsTracker,
    })),
  () => <div>Loading performance tracker...</div>
);

export const metadata: Metadata = {
  title: 'Dernek Yönetim Sistemi',
  description: 'Modern dernek yönetim sistemi',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kafkasder',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' }],
  },
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <LazyGoogleAnalytics />
      </head>
      <body className={cn(inter.variable, poppins.variable, montserrat.variable, inter.className)}>
        <Providers>
          <ServiceWorkerRegister />
          <LazyWebVitalsTracker />
          {children}
        </Providers>
        <NetworkStatusIndicator />
        {process.env.NODE_ENV === 'production' && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
      </body>
    </html>
  );
}
