import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "MyPickleball | Pickleball Club Management Software",
    template: "%s | MyPickleball",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "pickleball club management software",
    "pickleball court booking",
    "pickleball open play queue",
    "pickleball scheduling app",
    "pickleball facility software",
    "pickleball league management",
    "court reservation system",
  ],
  authors: [{ name: "MyPickleball" }],
  creator: "MyPickleball",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/",
    title: "MyPickleball | Pickleball Club Management Software",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    site: "@mypickleball",
    title: "MyPickleball | Pickleball Club Management Software",
    description: site.description,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  category: "software",
};

export const viewport: Viewport = {
  themeColor: "#07090a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
