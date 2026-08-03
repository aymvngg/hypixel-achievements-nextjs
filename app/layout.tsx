import type { Metadata } from 'next';
import { Inter, VT323 } from 'next/font/google';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import './globals.css';

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
});

const vt323 = VT323({
  variable: '--font-pixel',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hypixel Achievements',
  description: 'Browse, compare, and break down Hypixel player achievements',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${vt323.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <SiteHeader />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
