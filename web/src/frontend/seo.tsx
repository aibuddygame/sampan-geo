"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  X,
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
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | "all">(
    "all",
  );

  // Contact form state
  const [contactOpen, setContactOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleAudit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setActiveCategory("all");
    setSeverityFilter("all");
    setContactSubmitted(false);

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

  // Placeholder contact submit — backend implementation will be added later
  const handleContactSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email.trim() || submittingContact) return;

    setSubmittingContact(true);
    setContactError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: email.trim(),
          notes: notes.trim(),
          report,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to send inquiry.");
      }

      setContactSubmitted(true);
    } catch (err) {
      setContactError(
        err instanceof Error ? err.message : "Failed to send inquiry.",
      );
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleOpenContact = () => {
    setContactSubmitted(false);
    setContactError(null);
    setContactOpen(true);
  };

  const handleReset = () => {
    setReport(null);
    setUrl("");
    setError(null);
    setActiveCategory("all");
    setSeverityFilter("all");
    setContactOpen(false);
    setContactSubmitted(false);
  };

  const filteredChecks =
    report?.checks.filter((check) => {
      const matchesCategory =
        activeCategory === "all" ? true : check.category === activeCategory;
      const matchesSeverity =
        severityFilter === "all" ? true : check.severity === severityFilter;
      return matchesCategory && matchesSeverity;
    }) ?? [];

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
            ? "rounded-2xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl"
            : "rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-sky-950/30 p-8 sm:p-12 shadow-2xl"
        }`}
      >
        {!report && (
          <motion.div
            aria-hidden="true"
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl"
          />
        )}

        <div className={report ? "space-y-4" : "relative max-w-2xl space-y-5"}>
          {!report ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-medium text-sky-300">
                <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
                Quick Page Visibility &amp; SEO Score
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl sm:leading-[1.15]">
                Check how discoverable your page is.
              </h1>

              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Enter a URL for an instant SEO score across meta tags, content,
                technical signals, links, and structured data—or talk with our
                team to improve it.
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
                  SEO Quick Score
                </p>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Page Visibility Breakdown
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenContact}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Contact Our Experts</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New Check
                </button>
              </div>
            </motion.div>
          )}

          <form
            onSubmit={handleAudit}
            className="flex w-full flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/90 py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-sky-500/60 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:opacity-60"
                required
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: loading || !url.trim() ? 1 : 0.98 }}
              disabled={loading || !url.trim()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scoring...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Score Page
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
                  <p className="font-semibold text-rose-200">Check Failed</p>
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-56 rounded-2xl border border-slate-800 bg-slate-900/70" />
            <div className="h-56 rounded-2xl border border-slate-800 bg-slate-900/70 lg:col-span-2" />
          </div>
          <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900/70" />
        </motion.div>
      )}

      {/* Quick Scoring Dashboard */}
      {!loading && report && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Top Overview Grid: Score Ring + Category Bars + Page Snapshot */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Overall Score Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center shadow-lg">
              <ScoreRing score={report.overallScore} grade={report.grade} />

              <a
                href={report.rawMetadata.finalUrl || report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-slate-200 transition hover:text-sky-400"
              >
                <span className="truncate">
                  {report.rawMetadata.finalUrl || report.url}
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>

              <p className="mt-1.5 font-mono text-xs text-slate-400">
                HTTP {report.rawMetadata.statusCode} ·{" "}
                {report.rawMetadata.responseTimeMs}ms ·{" "}
                {report.rawMetadata.wordCount} words
              </p>

              <p className="mt-1 text-[11px] text-slate-500">
                Checked {new Date(report.auditedAt).toLocaleString()}
              </p>
            </div>

            {/* Category Scores & Raw Page Signals */}
            <div className="flex flex-col justify-between gap-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg lg:col-span-2">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
                    Category Score Breakdown
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {report.checks.length} total checks
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {report.categoryScores.map((cat) => (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-200">{cat.label}</span>
                        <span className="font-mono text-slate-400">
                          {cat.score}/{cat.maxScore} ({cat.percentage}%)
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
                      <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                        <span className="text-emerald-400/90">
                          {cat.passedCount} pass
                        </span>
                        <span className="text-amber-400/90">
                          {cat.warningCount} warn
                        </span>
                        <span className="text-rose-400/90">
                          {cat.criticalCount} crit
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Extracted Signals Strip */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-800/90 bg-slate-950/75 px-3 py-2.5">
                  <p className="text-[11px] text-slate-400">H1 Headings</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-white">
                    {report.rawMetadata.headings.h1.length}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800/90 bg-slate-950/75 px-3 py-2.5">
                  <p className="text-[11px] text-slate-400">
                    Images Missing Alt
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-white">
                    {report.rawMetadata.images.missingAlt}/
                    {report.rawMetadata.images.total}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800/90 bg-slate-950/75 px-3 py-2.5">
                  <p className="text-[11px] text-slate-400">Internal / Ext</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-white">
                    {report.rawMetadata.links.internal}/
                    {report.rawMetadata.links.external}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800/90 bg-slate-950/75 px-3 py-2.5">
                  <p className="text-[11px] text-slate-400">JSON-LD Blocks</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-white">
                    {report.rawMetadata.structuredDataCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar: Category Tabs + Segmented Severity Control */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-4 xl:flex-row xl:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`relative whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                  activeCategory === "all"
                    ? "font-semibold text-sky-300"
                    : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {activeCategory === "all" && (
                  <motion.span
                    layoutId="seoCategoryTab"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-sky-500/15 ring-1 ring-sky-500/40"
                  />
                )}
                <span className="relative z-10">
                  All Checks{" "}
                  <span className="ml-1 font-mono text-[11px] opacity-80">
                    {report.checks.length}
                  </span>
                </span>
              </button>

              {report.categoryScores.map((cat) => {
                const isSelected = activeCategory === cat.category;
                return (
                  <button
                    type="button"
                    key={cat.category}
                    onClick={() => setActiveCategory(cat.category)}
                    className={`relative whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                      isSelected
                        ? "font-semibold text-sky-300"
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
                        className="absolute inset-0 rounded-xl bg-sky-500/15 ring-1 ring-sky-500/40"
                      />
                    )}
                    <span className="relative z-10">
                      {cat.label}{" "}
                      <span className="ml-1 font-mono text-[11px] opacity-75">
                        {cat.score}/{cat.maxScore}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Segmented Severity Filter */}
            <div className="inline-flex w-fit shrink-0 items-center rounded-xl border border-slate-800 bg-slate-950/90 p-1">
              {(["all", "critical", "warning", "pass"] as const).map((sev) => {
                const active = severityFilter === sev;
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverityFilter(sev)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                      active
                        ? "bg-slate-800 font-semibold text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scored Checks List */}
          <motion.div
            key={`${activeCategory}-${severityFilter}`}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3.5"
          >
            {filteredChecks.length > 0 ? (
              filteredChecks.map((check) => (
                <CheckItemCard key={check.id} check={check} />
              ))
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
                No checks match the selected category and severity filter.
              </div>
            )}
          </motion.div>

          {/* Bottom Contact CTA Bar */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:flex-row sm:items-center">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-white">
                Want help improving this score?
              </p>
              <p className="text-xs text-slate-400">
                Leave your contact details and our team will review{" "}
                <span className="font-mono text-slate-300">{report.url}</span>{" "}
                with you.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenContact}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Contact Our Experts</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Contact Modal / Drawer */}
      <AnimatePresence>
        {contactOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                    Get in Touch
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    Contact Our Experts
                  </h2>
                  {report && (
                    <p className="mt-0.5 font-mono text-xs text-slate-400">
                      {report.url} · Score {report.overallScore}/100 (Grade{" "}
                      {report.grade})
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  aria-label="Close contact form"
                  className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-400 transition hover:border-slate-700 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {contactSubmitted ? (
                <div className="space-y-4 py-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">
                      Contact Details Received
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                      We&apos;ve noted{" "}
                      <span className="font-medium text-slate-200">
                        {email}
                      </span>{" "}
                      and will reach out regarding your SEO check.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContactOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Back to Report
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Chan"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Work Email or Phone{" "}
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="contact-email"
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-notes"
                      className="block text-xs font-medium text-slate-300"
                    >
                      What would you like help with?
                    </label>
                    <textarea
                      id="contact-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional: goals, timeline, or questions about your score..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    />
                  </div>

                  {contactError && (
                    <p className="text-xs text-rose-400">{contactError}</p>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setContactOpen(false)}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingContact || !email.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingContact ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Send Contact Info</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

function CheckItemCard({ check }: { check: SeoCheckItem }) {
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
      className={`rounded-2xl border bg-slate-900/80 p-4 sm:p-5 shadow-md transition ${config.border}`}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{config.icon}</div>
          <div>
            <h3 className="font-semibold text-white">{check.name}</h3>
            <p className="mt-0.5 break-all text-sm text-slate-400">
              {check.currentValue || "—"}
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
    </motion.div>
  );
}
