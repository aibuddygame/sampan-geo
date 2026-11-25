"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const Benefits = [
  {
    title: "Win AI Recommendations First",
    desc: "See whether AI agents recommend your brand—or send buyers straight to competitors.",
  },
  {
    title: "Make Key Details Impossible to Miss",
    desc: "Spot pricing, features, and answers buried in clutter so AI can read them cleanly.",
  },
  {
    title: "Capture High-Intent Questions",
    desc: "Find buyer questions your pages leave unanswered, where AI currently looks elsewhere.",
  },
  {
    title: "Turn Insights Into Quick Fixes",
    desc: "Get clear, practical improvements that boost both AI citations and human conversions.",
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

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
};

const ValueSection: React.FC<{ onSEO: () => void; onAEO: () => void }> =
  function ({ onSEO, onAEO }) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: "some" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/20 p-6 sm:p-8 space-y-6 shadow-xl"
      >
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              03 / Why It Matters
            </p>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Get Cited When Buyers Ask AI
            </h2>
            <p className="text-xs text-slate-400 sm:text-sm">
              Turn your existing pages into clear, trusted sources AI assistants
              actually reference.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onSEO}
              className="inline-flex items-center gap-1 rounded-xl border border-sky-500/35 bg-sky-500/10 px-3.5 py-2 text-xs font-semibold text-sky-200 transition hover:border-sky-400 hover:bg-sky-500/20 hover:text-white"
            >
              <span>Check SEO</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onAEO}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              <span>Improve GEO / AEO</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: "some" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {Benefits.map((item) => (
            <motion.div
              key={item.title}
              variants={cardVariants}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/65 p-4 transition hover:border-emerald-500/30 hover:bg-slate-950/85"
            >
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">
                ✓
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    );
  };

export default ValueSection;
