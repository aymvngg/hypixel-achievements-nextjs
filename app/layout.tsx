import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { CornerNav } from '@/components/layout/CornerNav';
import './globals.css';

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const minecraft = localFont({
  src: [
    {
      path: './fonts/minecraft.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/minecraft.woff',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-pixel',
  display: 'swap',
  fallback: ['monospace'],
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
    <html lang="en" className={`${inter.variable} ${minecraft.variable}`}>
      <body className="min-h-dvh flex flex-col bg-background text-foreground font-sans antialiased">
        <CornerNav />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
