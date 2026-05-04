import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-homecoming",
  subsets: ["latin"],
  display: "swap",
});

const homingOrigin =
  process.env.NEXT_PUBLIC_HOMECOMING_URL ?? "https://homecoming.tipzy.fun";

export const metadata: Metadata = {
  metadataBase: new URL(homingOrigin.endsWith("/") ? homingOrigin : `${homingOrigin}/`),
  title: "Tipzy.fun · Homecoming",
  description:
    "Reserve your Tipzy.fun Homecoming rank before BountyFi ships. Tipzy.fun is scaling AI-assisted bounties and payout rails on Conflux eSpace. Homecoming freezes your arrival order on-chain so you stay ahead once rewards go live.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tipzy.fun · Homecoming",
    description:
      "Secure your verified arrival slot for BountyFi on Conflux eSpace. Early Tipzy.fun Homecoming ranks unlock priority signaling when campaigns open.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Tipzy.fun · Homecoming",
    description:
      "Freeze your Tipzy.fun Homecoming rank ahead of BountyFi. Built on Conflux eSpace.",
  },
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
