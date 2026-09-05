import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: "Nuru Energy — Solar Panels, Inverters, Lithium Batteries & Generators in Kenya",
    template: "%s | Nuru Energy",
  },
  description:
    "Kenya’s trusted single-store provider for Tier-1 solar panels, lithium & gel batteries, hybrid power inverters, silent diesel generators, solar borehole pumps, and farm machinery.",
  keywords: [
    "Nuru Energy",
    "Solar panels Kenya",
    "Lithium battery Kenya",
    "Hybrid inverter Nairobi",
    "Solar power backup system",
    "Borehole solar water pump",
    "Diesel generators Nairobi",
    "Jinko Solar panel Kenya",
    "Must hybrid inverter",
    "Felicity Solar batteries",
    "Solar equipment Nairobi",
    "Power backup store Kenya",
    "Solar quotation Kenya",
  ].join(", "),
  authors: [{ name: "Nuru Energy", url: env.SITE_URL }],
  creator: "Nuru Energy",
  publisher: "Nuru Energy",
  applicationName: "Nuru Energy Store",
  category: "Solar & Power Equipment",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: env.SITE_URL,
    title: "Nuru Energy — Kenya's Premier Solar, Power & Machinery Store",
    description:
      "Shop Tier-1 solar panels, lithium power backups, hybrid inverters, diesel generators, and solar borehole pumps with countrywide delivery across Kenya.",
    siteName: "Nuru Energy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nuru Energy — Kenya's Premier Solar & Power Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nuru Energy — Solar, Power & Machinery in Kenya",
    description:
      "Tier-1 solar panels, lithium batteries, hybrid inverters & generators with fast delivery across Kenya.",
    images: ["/twitter-image.jpg"],
    creator: "@nuruenergy",
    site: "@nuruenergy",
  },
  alternates: {
    canonical: env.SITE_URL,
  },
  verification: {
    google: "google-site-verification-code",
  },
  other: {
    "application-name": "Nuru Energy",
    "apple-mobile-web-app-title": "Nuru Energy",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
    "theme-color": "#eab308",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon", sizes: "32x32", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#eab308",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
