"use client";

import AEOPage from "@/src/frontend/aeo";
import { HomePage } from "@/src/frontend/home/home";
import SEOPage from "@/src/frontend/seo";
import { ActivePage } from "@/src/interface/page";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const NAV_ITEMS: { id: ActivePage; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "seo", label: "SEO Helper" },
  { id: "aeo", label: "GEO / AEO Helper" },
];

export default function AppPage() {
  const [activePage, setActivePage] = useState<ActivePage>("home");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Common Top Menu Bar */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={() => setActivePage("home")}
            className="group flex items-center gap-3 text-left transition"
          >
            <Image
              src="/logo.png"
              alt="AnswerTrace logo"
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 object-contain p-1 transition group-hover:border-emerald-500/50"
            />
            <span className="text-base font-bold tracking-tight text-white transition group-hover:text-emerald-300">
              AnswerTrace
            </span>
          </button>

          <nav
            aria-label="Main navigation"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900/80 p-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  className={`relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "text-emerald-300"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavPill"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/40"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Active View Component */}
      <main className="mx-auto max-w-5xl px-6 py-10 overflow-x-clip">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {activePage === "home" && <HomePage />}
            {activePage === "seo" && <SEOPage />}
            {activePage === "aeo" && <AEOPage />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
