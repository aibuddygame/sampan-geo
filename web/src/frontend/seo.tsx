"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  AuditApiResponse,
  AuditReport,
  IssueSeverity,
  SeoCategory,
  SeoCheckItem,
} from "@/interface/report";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: "easeOut" as const,
    },
  },
};

export default function SEOPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [activeCategory, setActiveCategory] = useState<SeoCategory | "all">(
    "all",
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setActiveCategory("all");

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json: AuditApiResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Failed to audit website.");
      }

      setReport(json.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopySnippet = async (id: string, code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setReport(null);
    setUrl("");
    setError(null);
    setActiveCategory("all");
  };

  const filteredChecks =
    report?.checks.filter((check) =>
      activeCategory === "all" ? true : check.category === activeCategory,
    ) ?? [];

  return (
    <div className="space-y-8">
      {/* Hero & URL Search Bar */}
      <motion.section
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`relative overflow-hidden ${
          report
            ? "rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl"
            : "rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/35 p-8 sm:p-12 shadow-2xl"
        }`}
      >
        {!report && (
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
        )}

        <div className={report ? "space-y-4" : "relative max-w-2xl space-y-5"}>
          {!report ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Technical &amp; On-Page SEO Auditor
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl sm:leading-[1.15]">
                Audit any website. Fix SEO with AI.
              </h1>

              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Enter a URL to inspect meta tags, headings, structured data, and
                links—complete with ready-to-paste code fixes.
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                  SEO Audit Report
                </p>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Website Diagnostic &amp; Fixes
                </h1>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                New Audit
              </button>
            </motion.div>
          )}

          <form
            onSubmit={handleAudit}
            className="flex flex-col gap-3 sm:flex-row w-full"
          >
            <div className="relative flex-1">
              <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/90 py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-60"
                required
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: loading || !url.trim() ? 1 : 0.98 }}
              disabled={loading || !url.trim()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Run Audit
                </>
              )}
            </motion.button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-left text-sm text-rose-300"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                <div>
                  <p className="font-semibold text-rose-200">Audit Failed</p>
                  <p className="mt-0.5 text-rose-300/90">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Loading Skeleton */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 animate-pulse"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="h-52 rounded-2xl border border-slate-800 bg-slate-900/70" />
            <div className="h-52 rounded-2xl border border-slate-800 bg-slate-900/70 md:col-span-2" />
          </div>
          <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900/70" />
        </motion.div>
      )}

      {/* Audit Dashboard Results */}
      {!loading && report && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Top Overview Grid: Overall Score + Executive Summary + Sub-Scores */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Overall Score Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center shadow-lg">
              <ScoreRing score={report.overallScore} grade={report.grade} />
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-slate-200 transition hover:text-emerald-400"
              >
                <span className="truncate">{report.url}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
              <p className="mt-1.5 font-mono text-xs text-slate-400">
                HTTP {report.rawMetadata.statusCode} ·{" "}
                {report.rawMetadata.responseTimeMs}ms ·{" "}
                {report.rawMetadata.wordCount} words
              </p>
            </div>

            {/* AI Executive Summary + Category Breakdown */}
            <div className="flex flex-col justify-between gap-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg lg:col-span-2">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  Executive Summary
                </div>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                  {report.executiveSummary}
                </p>
              </div>

              {/* Category Sub-Items Progress Bars */}
              <div className="grid grid-cols-1 gap-4 border-t border-slate-800/80 pt-5 sm:grid-cols-2">
                {report.categoryScores.map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-200">{cat.label}</span>
                      <span className="font-mono text-slate-400">
                        {cat.score}/{cat.maxScore} pts ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 0.65, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          cat.percentage >= 80
                            ? "bg-emerald-400"
                            : cat.percentage >= 50
                              ? "bg-amber-400"
                              : "bg-rose-500"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`relative rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                activeCategory === "all"
                  ? "font-semibold text-emerald-300"
                  : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {activeCategory === "all" && (
                <motion.span
                  layoutId="seoCategoryTab"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/40"
                />
              )}
              <span className="relative z-10">
                All Checks ({report.checks.length})
              </span>
            </button>

            {report.categoryScores.map((cat) => {
              const isSelected = activeCategory === cat.category;
              return (
                <button
                  type="button"
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`relative rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? "font-semibold text-emerald-300"
                      : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="seoCategoryTab"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/40"
                    />
                  )}
                  <span className="relative z-10">
                    {cat.label} ({cat.score}/{cat.maxScore})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Audit Checks & AI Recommendations */}
          <motion.div
            key={activeCategory}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredChecks.map((check) => (
              <CheckItemCard
                key={check.id}
                check={check}
                isCopied={copiedId === check.id}
                onCopy={(code) => handleCopySnippet(check.id, code)}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function ScoreRing({
  score,
  grade,
}: {
  score: number;
  grade: AuditReport["grade"];
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 85
      ? "text-emerald-400"
      : score >= 65
        ? "text-amber-400"
        : "text-rose-500";

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-800"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeLinecap="round"
          className={colorClass}
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="text-3xl font-extrabold text-white">{score}</span>
        <span className={`text-xs font-bold uppercase ${colorClass}`}>
          Grade {grade}
        </span>
      </motion.div>
    </div>
  );
}

function CheckItemCard({
  check,
  isCopied,
  onCopy,
}: {
  check: SeoCheckItem;
  isCopied: boolean;
  onCopy: (code: string) => void;
}) {
  const severityConfig: Record<
    IssueSeverity,
    { icon: React.ReactNode; badge: string; border: string }
  > = {
    pass: {
      icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />,
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
      border: "border-slate-800 hover:border-slate-700",
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />,
      badge: "bg-amber-500/10 text-amber-300 border-amber-500/25",
      border: "border-amber-500/30 hover:border-amber-500/45",
    },
    critical: {
      icon: <XCircle className="h-5 w-5 shrink-0 text-rose-400" />,
      badge: "bg-rose-500/10 text-rose-300 border-rose-500/25",
      border: "border-rose-500/30 hover:border-rose-500/45",
    },
  };

  const config = severityConfig[check.severity];

  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-2xl border bg-slate-900/80 p-5 shadow-md transition ${config.border}`}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{config.icon}</div>
          <div>
            <h3 className="font-semibold text-white">{check.name}</h3>
            <p className="mt-0.5 break-all text-sm text-slate-400">
              {check.currentValue}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${config.badge}`}
          >
            {check.severity}
          </span>
          <span className="rounded-lg border border-slate-800 bg-slate-950/90 px-2.5 py-1 font-mono text-xs text-slate-300">
            {check.score}/{check.maxScore} pts
          </span>
        </div>
      </div>

      {/* Suggested Fix Block */}
      {check.recommendation && (
        <div className="mt-4 space-y-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Suggested Fix
            </span>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Impact:{" "}
              <strong className="text-slate-200">
                {check.recommendation.estimatedImpact}
              </strong>
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-300">
            {check.recommendation.summary}
          </p>

          {check.recommendation.codeSnippet && (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-slate-400">
                <span className="font-mono uppercase">
                  {check.recommendation.language || "html"}
                </span>
                <button
                  type="button"
                  onClick={() => onCopy(check.recommendation!.codeSnippet!)}
                  className="inline-flex items-center gap-1.5 text-slate-300 transition hover:text-emerald-400"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Fix</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-emerald-300">
                <code>{check.recommendation.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
