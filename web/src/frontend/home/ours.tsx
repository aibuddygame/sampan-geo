"use client";

import { motion } from "framer-motion";
import {
  Compass,
  FileText,
  HelpCircle,
  Link2,
  Quote,
  Sparkles,
} from "lucide-react";

const FETCHABLE_ITEMS = [
  {
    label: "Pages & URLs",
    points: ["Entry links AI agents reach", "Clean crawl paths"],
    Icon: Link2,
    tag: "SEO",
  },
  {
    label: "Direct Answers",
    points: ["Clear Q&A and definitions", "Easy-to-scan summaries"],
    Icon: HelpCircle,
    tag: "GEO / AEO",
  },
  {
    label: "Facts & Specs",
    points: ["Pricing, features, and specs", "Structured details"],
    Icon: FileText,
    tag: "GEO / AEO",
  },
  {
    label: "Proof & Citations",
    points: ["Trustworthy claims and data", "Sources AI can quote"],
    Icon: Quote,
    tag: "GEO / AEO",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
};

const OursSection: React.FC<{ onSEO: () => void; onAEO: () => void }> =
  function ({ onAEO, onSEO }) {
    return (
      <section className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="max-w-2xl space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            02 / Visibility Pillars
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            How to Optimize for AI Answers
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            AI agents pull building blocks from your site during a search, while
            two core pillars—SEO and GEO / AEO—determine how well you get found
            and cited.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: "some" }}
          className="space-y-10 rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-950 to-emerald-950/25 p-6 sm:p-8 shadow-xl"
        >
          {/* Top: 2x2 Grid of Fetchable Items */}
          <motion.div
            variants={itemVariants}
            className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/85 p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>What AI Can Fetch in a Search</span>
              </div>
              <span className="text-xs text-slate-400">
                Pulled from your site per query
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {FETCHABLE_ITEMS.map((item) => {
                const IconComponent = item.Icon;
                const isSeo = item.tag === "SEO";

                return (
                  <motion.div
                    key={item.label}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.18 }}
                    className="rounded-xl border border-slate-800/90 bg-slate-900/75 p-4 transition hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            isSeo
                              ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-semibold text-white sm:text-sm">
                          {item.label}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ${
                          isSeo
                            ? "bg-sky-500/10 text-sky-300"
                            : "bg-emerald-500/10 text-emerald-300"
                        }`}
                      >
                        {item.tag}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                      {item.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-1.5">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Bottom: Two Slimmer, Well-Spaced Pillars */}
          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 sm:grid-cols-2">
            {/* Pillar 1: SEO */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="mx-auto flex w-full max-w-65 flex-col items-center"
            >
              {/* Pillar Capital */}
              <div className="w-full rounded-t-2xl border border-b-0 border-sky-400/35 bg-linear-to-b from-sky-500/20 to-slate-900/90 px-4 py-3 text-center shadow-md">
                <div className="flex items-center justify-center gap-1.5">
                  <Compass className="h-4 w-4 text-sky-300" />
                  <span className="text-base font-bold tracking-wide text-white">
                    SEO PILLAR
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-sky-300">
                  Visibility to AI Agents
                </p>
              </div>

              {/* Slimmer Pillar Shaft */}
              <div className="flex w-[82%] flex-1 flex-col justify-between border-x border-sky-500/25 bg-[repeating-linear-gradient(90deg,rgba(14,165,233,0.07)_0px,rgba(14,165,233,0.07)_2px,transparent_2px,transparent_18px)] bg-slate-900/80 px-4 py-5">
                <ul className="space-y-2.5 text-xs leading-relaxed text-slate-200">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                    <span>Helps AI agents discover and reach your pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                    <span>Puts your site into the candidate pool early</span>
                  </li>
                </ul>

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={onSEO}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/45 bg-sky-500/15 px-3.5 py-2 text-xs font-semibold text-sky-200 transition hover:border-sky-400 hover:bg-sky-500/25 hover:text-white"
                  >
                    <Compass className="h-3.5 w-3.5 text-sky-300" />
                    <span>Check your site</span>
                  </button>
                </div>
              </div>

              {/* Pillar Base */}
              <div className="w-[92%] rounded-b-xl border border-t border-sky-500/30 bg-slate-900 px-3 py-2 text-center text-[11px] text-slate-400">
                Base: <strong className="text-white">Get found</strong>
              </div>
              <div className="h-2 w-full rounded-b-2xl border border-t-0 border-slate-800 bg-slate-950" />
            </motion.div>

            {/* Pillar 2: GEO / AEO */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="mx-auto flex w-full max-w-65 flex-col items-center"
            >
              {/* Pillar Capital */}
              <div className="w-full rounded-t-2xl border border-b-0 border-emerald-400/40 bg-linear-to-b from-emerald-500/20 to-slate-900/90 px-4 py-3 text-center shadow-md">
                <div className="flex items-center justify-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-300" />
                  <span className="text-base font-bold tracking-wide text-white">
                    GEO / AEO PILLAR
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                  What AI Knows About You
                </p>
              </div>

              {/* Slimmer Pillar Shaft */}
              <div className="flex w-[82%] flex-1 flex-col justify-between border-x border-emerald-500/30 bg-[repeating-linear-gradient(90deg,rgba(16,185,129,0.07)_0px,rgba(16,185,129,0.07)_2px,transparent_2px,transparent_18px)] bg-slate-900/80 px-4 py-5">
                <ul className="space-y-2.5 text-xs leading-relaxed text-slate-200">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span>
                      Makes facts, answers, and comparisons easy to read
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span>Builds trust so AI cites your site in answers</span>
                  </li>
                </ul>

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={onAEO}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-950/50 transition hover:bg-emerald-300"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Check your site</span>
                  </button>
                </div>
              </div>

              {/* Pillar Base */}
              <div className="w-[92%] rounded-b-xl border border-t border-emerald-500/30 bg-slate-900 px-3 py-2 text-center text-[11px] text-slate-400">
                Base:{" "}
                <strong className="text-emerald-300">
                  Be understood &amp; cited
                </strong>
              </div>
              <div className="h-2 w-full rounded-b-2xl border border-t-0 border-slate-800 bg-slate-950" />
            </motion.div>
          </div>
        </motion.div>
      </section>
    );
  };

export default OursSection;
