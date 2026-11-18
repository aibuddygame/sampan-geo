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
    default: "SEO AI — Instant AI-Powered Website SEO Auditor",
    template: "%s | SEO AI",
  },
  description:
    "Analyze any website URL for technical, on-page, and content SEO issues. Get an instant breakdown score and actionable AI-generated code fixes.",
  keywords: [
    "SEO audit",
    "AI SEO tool",
    "website analyzer",
    "meta tags checker",
    "technical SEO",
  ],
  openGraph: {
    title: "SEO AI — Instant AI-Powered Website SEO Auditor",
    description:
      "Evaluate website SEO health and generate ready-to-use AI fixes in seconds.",
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
