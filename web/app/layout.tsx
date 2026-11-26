import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.vxreal.com";

export const metadata: Metadata = {
  title: {
    default: "AnswerTrace — GEO, AEO & SEO Visibility Auditor",
    template: "%s | AnswerTrace",
  },
  description:
    "See how AI agents search and read your site to answer real user questions. Trace retrieval steps, spot gaps, and fix SEO, AEO, and GEO issues.",
  keywords: [
    "AnswerTrace",
    "GEO",
    "AEO",
    "SEO audit",
    "Generative Engine Optimization",
    "Answer Engine Optimization",
    "AI search visibility",
    "website analyzer",
  ],
  openGraph: {
    title: "AnswerTrace — GEO, AEO & SEO Visibility Auditor",
    description:
      "See how AI agents search and read your site to answer real user questions. Trace retrieval steps, spot gaps, and fix SEO, AEO, and GEO issues.",
    url: siteUrl,
    siteName: "AnswerTrace",
    images: [
      {
        url: "/logo.png", // Or a dedicated 1200x630 /og-image.png
        width: 1200,
        height: 630,
        alt: "AnswerTrace — GEO, AEO & SEO Visibility Auditor",
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AnswerTrace",
    url: siteUrl,
    applicationCategory: "SEO & AI Visibility Tool",
    operatingSystem: "Web",
    description:
      "See how AI agents search and read your site to answer real user questions. Trace retrieval steps, spot gaps, and fix SEO, AEO, and GEO issues.",
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
