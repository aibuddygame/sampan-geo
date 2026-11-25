"use client";

import { motion } from "framer-motion";

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

export function HomePage() {
  const steps = [
    {
      num: "01",
      title: "Understand & Search",
      desc: "The AI breaks down what you are asking and searches the web to spot pages that match your topic.",
    },
    {
      num: "02",
      title: "Read & Gather Facts",
      desc: "It opens promising pages and pulls out the key facts, comparisons, and details relevant to your question.",
    },
    {
      num: "03",
      title: "Check & Follow Up",
      desc: "If something is still missing or unclear, it checks another source to fill in the gaps before deciding.",
    },
    {
      num: "04",
      title: "Write the Answer",
      desc: "It combines what it found into a clear, helpful response—often highlighting the sources it trusted most.",
    },
  ];

  const pillars = [
    {
      tag: "Search Rankings",
      title: "SEO",
      subtitle: "Get discovered where search begins",
      desc: "Helps your pages appear when people search for topics, products, or solutions your business offers.",
      accent: "border-sky-500/30 bg-sky-500/5 text-sky-300",
    },
    {
      tag: "Direct Answers",
      title: "AEO",
      subtitle: "Answer Engine Optimization",
      desc: "Focuses on giving clear, direct, and easy-to-read answers to the specific questions your customers ask.",
      accent: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
    },
    {
      tag: "AI Citations & Mentions",
      title: "GEO",
      subtitle: "Generative Engine Optimization",
      desc: "Focuses on clear structure, accurate facts, and helpful depth so AI assistants can trust and cite your site.",
      accent: "border-violet-500/30 bg-violet-500/5 text-violet-300",
    },
  ];

  const benefits = [
    {
      title: "See If You Show Up",
      desc: "Find out whether AI research points to your website or highlights competitors instead.",
    },
    {
      title: "Check Clarity & Structure",
      desc: "See if key details—like pricing, features, or answers—are easy to read or buried on the page.",
    },
    {
      title: "Spot Missing Gaps",
      desc: "Identify questions your audience asks that your site does not yet answer clearly enough.",
    },
    {
      title: "Take Practical Action",
      desc: "Turn findings into straightforward page updates that help both human visitors and AI assistants.",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-8 sm:p-12 shadow-2xl"
      >
        <motion.div
          aria-hidden="true"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl"
        />

        <div className="relative max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Search &amp; Answer Visibility
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.12]">
            How AI Answers Questions — and How Your Site Gets Chosen
          </h1>

          <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
            More people ask AI assistants for advice, comparisons, and answers
            every day. Learn how an AI research agent finds information online
            and how GEO and AEO help your website become a trusted source.
          </p>
        </div>
      </motion.section>

      {/* Section 1: How an AI Agent Works */}
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="max-w-2xl space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            01 / The Research Process
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            How an AI Agent Answers a Question
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            Think of an AI research agent like a fast assistant doing homework
            before giving you a recommendation—searching, reading, checking
            details, and summarizing what matters.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: "some" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-emerald-500/40 hover:bg-slate-900"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-emerald-400">
                    STEP {step.num}
                  </span>
                  {index < steps.length - 1 && (
                    <span className="hidden text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-400/70 lg:inline">
                      →
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Section 2: SEO vs AEO vs GEO */}
      <section className="space-y-6">
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
            How GEO &amp; AEO Work Alongside SEO
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            Ranking in search links is only part of the picture today. Your
            content also needs clear answers and reliable facts that AI tools
            can easily understand and reference.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: "some" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.title}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 transition hover:border-slate-700"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">
                  {pillar.title}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${pillar.accent}`}
                >
                  {pillar.tag}
                </span>
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {pillar.subtitle}
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Section 3: What This Means for Your Website */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: "some" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              03 / Practical Value
            </p>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              What You Can Improve on Your Website
            </h2>
          </div>
          <p className="text-xs text-slate-400 sm:text-sm">
            Use the menu above whenever you are ready to explore.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: "some" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {benefits.map((item) => (
            <motion.div
              key={item.title}
              variants={cardVariants}
              className="flex items-start gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 transition hover:border-slate-700/80"
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
    </div>
  );
}
