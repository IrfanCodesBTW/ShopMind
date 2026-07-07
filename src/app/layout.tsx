// ============================================================================
// Root Layout — Task 2: Font System via next/font
// Source: new_Design_plan.md Task 2, Design.md §Typography
// ============================================================================

import type { Metadata, Viewport } from 'next';
import { Figtree, Fraunces, Noto_Sans_Devanagari, Noto_Sans_Telugu } from 'next/font/google';
import './globals.css';

// ── Primary UI Font (Figtree) ──────────────────────────────────────────────
const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// ── Editorial Serif (marketing pages only) ─────────────────────────────────
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// ── Hindi / Devanagari script ──────────────────────────────────────────────
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-deva',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// ── Telugu script ──────────────────────────────────────────────────────────
const notoTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  variable: '--font-telugu',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ShopMind — Voice-First Business Assistant',
  description:
    'Multilingual voice-first business operations assistant for shop owners. Record transactions by speaking, track sales, expenses, and credit effortlessly.',
  keywords: ['ShopMind', 'voice transactions', 'kirana', 'business assistant', 'Hindi voice bookkeeping'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F7F5' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0E10' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${figtree.variable} ${fraunces.variable} ${notoDevanagari.variable} ${notoTelugu.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
