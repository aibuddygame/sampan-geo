"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";

const HOOK_QUESTIONS = [
  "Can AI even see my website right now?",
  "Why are competitors getting recommended instead of me?",
  "How do I get my business into AI answers?",
];

export function HeroSection() {
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuestionIndex((prev) => (prev + 1) % HOOK_QUESTIONS.length);
    }, 4600);

    return () => clearInterval(interval);
  }, []);

  return (
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
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl"
      />

      <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        {/* Left: Short Hook + Spotlight Brand */}
        <div className="space-y-4 lg:col-span-7">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
            Don&apos;t Lose Buyers to AI Answers.
          </h1>

          <div className="pt-1">
            <motion.span
              animate={{
                textShadow: [
                  "0 0 18px rgba(52, 211, 153, 0.25)",
                  "0 0 32px rgba(52, 211, 153, 0.55)",
                  "0 0 18px rgba(52, 211, 153, 0.25)",
                ],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block bg-linear-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl"
            >
              AnswerTrace
            </motion.span>
          </div>

          <p className="max-w-md text-base text-slate-300">
            Get your site seen and chosen by AI.
          </p>
        </div>

        {/* Right: Slow Flying Question -> Risk & AnswerTrace Payoff */}
        <div className="space-y-3 lg:col-span-5">
          <div className="relative min-h-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={HOOK_QUESTIONS[questionIndex]}
                initial={{ opacity: 0, x: 36, y: 6 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: -32, y: -6 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-slate-700/80 bg-slate-950/90 px-5 py-4 shadow-lg"
              >
                <p className="text-sm font-medium text-white sm:text-base">
                  &ldquo;{HOOK_QUESTIONS[questionIndex]}&rdquo;
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/90">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Skipped by AI = missed customers.</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
            className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3.5 text-sm font-medium text-emerald-100 shadow-lg shadow-emerald-950/40"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-300" />
              <span>
                <strong className="text-base font-bold text-emerald-300">
                  AnswerTrace
                </strong>{" "}
                shows what to fix.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
