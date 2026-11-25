"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
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
} from "@/interface/report"; // Change to "@/interface/seo" if your file is named seo.ts

export default function SeoAiSpaPage() {
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

  const filteredChecks =
    report?.checks.filter((check) =>
      activeCategory === "all" ? true : check.category === activeCategory,
    ) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="SEO AI Logo"
              className="w-9 h-9 rounded-full object-contain"
            />
            <span className="font-bold text-lg tracking-tight bg-linear-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              SEO AI
            </span>
          </div>

          {report && (
            <button
              onClick={() => {
                setReport(null);
                setUrl("");
                setError(null);
              }}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              New Audit
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Hero & URL Search Bar */}
        <section
          className={`transition-all duration-300 ${
            report ? "mb-10" : "my-16 text-center max-w-2xl mx-auto"
          }`}
        >
          {!report && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Technical & On-Page SEO Auditor
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                Audit any website.{" "}
                <span className="bg-linear-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Fix SEO with AI.
                </span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg mb-8">
                Enter a URL to inspect meta tags, headings, structured data, and
                links—complete with ready-to-paste AI code fixes.
              </p>
            </>
          )}

          <form
            onSubmit={handleAudit}
            className="flex flex-col sm:flex-row gap-3 w-full"
          >
            <div className="relative flex-1">
              <Globe className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition disabled:opacity-60"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3.5 rounded-xl font-semibold bg-linear-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Run Audit
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 text-left">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Audit Failed</p>
                <p className="text-rose-300/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </section>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 rounded-2xl bg-slate-900 border border-slate-800" />
              <div className="md:col-span-2 h-48 rounded-2xl bg-slate-900 border border-slate-800" />
            </div>
            <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800" />
          </div>
        )}

        {/* Audit Dashboard Results */}
        {!loading && report && (
          <div className="space-y-8">
            {/* Top Overview Grid: Overall Score + Executive Summary + Sub-Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Score Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center">
                <ScoreRing score={report.overallScore} grade={report.grade} />
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-emerald-400 transition max-w-full truncate"
                >
                  <span className="truncate">{report.url}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
                <p className="text-xs text-slate-500 mt-1">
                  HTTP {report.rawMetadata.statusCode} •{" "}
                  {report.rawMetadata.responseTimeMs}ms •{" "}
                  {report.rawMetadata.wordCount} words
                </p>
              </div>

              {/* AI Executive Summary + Category Breakdown */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    AI Executive Summary
                  </div>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    {report.executiveSummary}
                  </p>
                </div>

                {/* Category Sub-Items Progress Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
                  {report.categoryScores.map((cat) => (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{cat.label}</span>
                        <span className="text-slate-400">
                          {cat.score}/{cat.maxScore} pts ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            cat.percentage >= 80
                              ? "bg-emerald-400"
                              : cat.percentage >= 50
                                ? "bg-amber-400"
                                : "bg-rose-500"
                          }`}
                          style={{ width: `${cat.percentage}%` }}
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
                onClick={() => setActiveCategory("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-emerald-500 text-slate-950 font-semibold"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                All Checks ({report.checks.length})
              </button>
              {report.categoryScores.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeCategory === cat.category
                      ? "bg-emerald-500 text-slate-950 font-semibold"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {cat.label} ({cat.score}/{cat.maxScore})
                </button>
              ))}
            </div>

            {/* Detailed Audit Checks & AI Recommendations */}
            <div className="space-y-4">
              {filteredChecks.map((check) => (
                <CheckItemCard
                  key={check.id}
                  check={check}
                  isCopied={copiedId === check.id}
                  onCopy={(code) => handleCopySnippet(check.id, code)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
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
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 85
      ? "text-emerald-400"
      : score >= 65
        ? "text-amber-400"
        : "text-rose-500";

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-800"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-700`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold">{score}</span>
        <span className={`text-xs font-bold uppercase ${colorClass}`}>
          Grade {grade}
        </span>
      </div>
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
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      border: "border-slate-800",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      border: "border-amber-500/30",
    },
    critical: {
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      border: "border-rose-500/30",
    },
  };

  const config = severityConfig[check.severity];

  return (
    <div
      className={`p-5 rounded-2xl bg-slate-900/80 border ${config.border} transition`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{config.icon}</div>
          <div>
            <h3 className="font-semibold text-slate-100">{check.name}</h3>
            <p className="text-sm text-slate-400 mt-0.5 break-all">
              {check.currentValue}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${config.badge}`}
          >
            {check.severity}
          </span>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {check.score}/{check.maxScore} pts
          </span>
        </div>
      </div>

      {/* AI Recommendation Block */}
      {check.recommendation && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              AI Suggested Fix
            </span>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Impact:{" "}
              <strong className="text-slate-200">
                {check.recommendation.estimatedImpact}
              </strong>
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {check.recommendation.summary}
          </p>

          {check.recommendation.codeSnippet && (
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
                <span className="uppercase font-mono">
                  {check.recommendation.language || "html"}
                </span>
                <button
                  type="button"
                  onClick={() => onCopy(check.recommendation!.codeSnippet!)}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Fix</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                <code>{check.recommendation.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
