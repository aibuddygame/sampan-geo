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

export const metadata: Metadata = {
  title: {
    default: "AnswerTrace — GEO, AEO & SEO Visibility Auditor",
    template: "%s | AnswerTrace",
  },
  description:
    "See how AI agents search and read your site to answer real user questions. Trace retrieval steps, spot visibility gaps, and generate practical fixes for SEO, AEO, and GEO.",
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
      "See how AI agents search and read your site to answer real user questions. Trace retrieval steps, spot visibility gaps, and generate practical fixes for SEO, AEO, and GEO.",
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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
