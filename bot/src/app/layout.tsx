import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { Providers } from '@/components/Providers';
import { authOptions } from '@/lib/auth';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tippy - Conflux eSpace tipping in Discord',
  description:
    'Tip CFX and ERC-20 tokens, earn project points, and manage rewards - on Conflux eSpace.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'Tippy',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${manrope.variable} ${inter.variable} min-h-screen antialiased`}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
