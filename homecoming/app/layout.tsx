import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-homecoming",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PROJECT: HOMECOMING",
  description: "Verified global arrival order. Stay early.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
