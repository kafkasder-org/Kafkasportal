import type { Metadata } from 'next';
import { Inter, Poppins, Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { cn } from '@/lib/utils';
import { lazyLoadComponent } from '@/lib/performance';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

// Optimized font loading with subset optimization
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap', // Swap to fallback font immediately, then swap to web font
  preload: true, // Preload for better performance
  fallback: ['system-ui', 'arial'], // Fallback fonts
  adjustFontFallback: true, // Adjust font metrics for better CLS
});

// Lazy load secondary fonts for better initial load performance
const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading-alt',
  display: 'swap',
  preload: false, // Don't preload secondary font
  fallback: ['system-ui', 'sans-serif'] as string[],
  adjustFontFallback: true,
});

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-heading',
  display: 'swap',
  preload: false, // Don't preload secondary font
  fallback: ['system-ui', 'sans-serif'] as string[],
  adjustFontFallback: true,
});

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
          <LazyWebVitalsTracker />
          {children}
        </Providers>
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
