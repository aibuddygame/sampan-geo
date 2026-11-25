"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Layers,
  Loader2,
  Search,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

interface SearchResultItem {
  rank?: number;
  title?: string;
  href?: string;
  body?: string;
  matches_target?: boolean;
}

interface StepTelemetry {
  query?: string;
  result_count?: number;
  target_hit_count?: number;
  results?: SearchResultItem[];
  url?: string;
  final_url?: string | null;
  title?: string;
  topic?: string;
  matches_target?: boolean;
  status_code?: number | null;
  full_extracted_chars?: number;
  extracted_chars?: number;
  focused_output_chars?: number;
  extracted_preview?: string;
  focused_extract?: string;
  duration_ms?: number;
  error?: string | null;
}

interface TraceStep {
  id?: string;
  seq: number;
  tool_name: string;
  arguments: Record<string, unknown>;
  model_output: string;
  telemetry: StepTelemetry;
}

interface RunRecord {
  id: string;
  question: string;
  target_url?: string | null;
  target_domain?: string | null;
  model?: string;
  status: string;
  final_answer?: string | null;
  step_count?: number;
  error?: string | null;
}

const stepsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const stepCardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

export default function AEOPage() {
  const [question, setQuestion] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [run, setRun] = useState<RunRecord | null>(null);
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading) return;

    setLoading(true);
    setErrorMsg(null);
    setRun(null);
    setSteps([]);
    setExpandedStep(null);

    try {
      const createRes = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmedQuestion,
          target_url: targetUrl.trim() || null,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(
          createData.detail || `Request failed (${createRes.status})`,
        );
      }

      const runId: string = createData.run_id;
      const detailRes = await fetch(`/api/runs/${encodeURIComponent(runId)}`);
      const detailData = await detailRes.json();

      if (!detailRes.ok) {
        throw new Error(
          detailData.detail || `Failed to load run (${detailRes.status})`,
        );
      }

      setRun(detailData.run);
      setSteps(detailData.steps || []);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero & Question Runner */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/35 p-8 sm:p-10 shadow-2xl"
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

        <div className="relative space-y-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              GEO / AEO Agent Trace Lab
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trace How AI Answers &amp; Inspect Visibility
            </h1>

            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              Ask a question to simulate how the AI searches, extracts focused
              page sections, and synthesizes an answer—with full step-by-step
              visibility inspection.
            </p>
          </div>

          {/* Question Form */}
          <form
            onSubmit={handleAsk}
            className="space-y-4 rounded-2xl border border-slate-800/90 bg-slate-950/75 p-5 sm:p-6"
          >
            <div>
              <label
                htmlFor="question"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Target Question
              </label>
              <textarea
                id="question"
                rows={3}
                required
                placeholder="e.g., What are the best practices for structuring product documentation for AI answers?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label
                htmlFor="targetUrl"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Target Website URL{" "}
                <span className="font-normal normal-case text-slate-400">
                  (optional, for GEO/AEO visibility tracking)
                </span>
              </label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="targetUrl"
                  type="text"
                  placeholder="https://yourwebsite.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <motion.button
                type="submit"
                whileTap={{ scale: loading || !question.trim() ? 1 : 0.98 }}
                disabled={loading || !question.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running Agent...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Ask AI
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.section>

      {/* Error Alert */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
          >
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-semibold text-rose-200">Trace Run Failed</p>
              <p className="mt-0.5 text-rose-300/90">{errorMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-emerald-300">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              Searching the web, extracting relevant page sections, and
              generating an answer...
            </div>
            <div className="h-24 animate-pulse rounded-xl border border-slate-800/80 bg-slate-950/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Answer */}
      <AnimatePresence>
        {run && (
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">AI Answer</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-slate-700 bg-slate-800/90 px-2.5 py-1 font-mono font-medium text-slate-200">
                  {run.status}
                </span>
                <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-slate-300">
                  Steps: {run.step_count ?? steps.length}
                </span>
                {run.target_domain && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-300">
                    <Target className="h-3.5 w-3.5" />
                    Target: {run.target_domain}
                  </span>
                )}
              </div>
            </div>

            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200 sm:text-base">
              {run.final_answer || "(No answer returned)"}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Recorded Tool Steps */}
      {steps.length > 0 && (
        <section className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">
                Recorded Process ({steps.length} steps)
              </h2>
            </div>
          </motion.div>

          <motion.div
            variants={stepsContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {steps.map((step) => {
              const isOpen = expandedStep === step.seq;
              const tel = step.telemetry || {};
              const isSearch = step.tool_name === "web_search";

              return (
                <motion.div
                  key={step.id || step.seq}
                  variants={stepCardVariants}
                  className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-md transition hover:border-slate-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 font-mono text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40">
                        {step.seq}
                      </span>
                      <span className="rounded-lg border border-slate-700/80 bg-slate-950 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-300">
                        {step.tool_name}
                      </span>
                      {tel.matches_target && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Target Match
                        </span>
                      )}
                      {tel.error && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Error
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {typeof tel.duration_ms === "number" && (
                        <span className="font-mono">{tel.duration_ms} ms</span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedStep(isOpen ? null : step.seq)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
                      >
                        <span>
                          {isOpen ? "Hide Details" : "Inspect Details"}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex"
                        >
                          {isOpen ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </motion.span>
                      </button>
                    </div>
                  </div>

                  {/* Step Summary */}
                  {isSearch ? (
                    <div className="space-y-2.5 text-sm">
                      <p className="text-slate-300">
                        <span className="font-medium text-slate-200">
                          Query:
                        </span>{" "}
                        <code className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-xs text-emerald-300">
                          {String(step.arguments?.query || tel.query || "")}
                        </code>{" "}
                        <span className="font-mono text-xs text-slate-400">
                          ({tel.result_count ?? 0} results
                          {typeof tel.target_hit_count === "number"
                            ? `, ${tel.target_hit_count} target hits`
                            : ""}
                          )
                        </span>
                      </p>

                      {Array.isArray(tel.results) && tel.results.length > 0 && (
                        <ul className="space-y-2 border-l-2 border-emerald-500/30 pl-3.5">
                          {tel.results.map((r, idx) => (
                            <li key={idx} className="text-xs">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono font-semibold text-slate-400">
                                  #{r.rank ?? idx + 1}
                                </span>
                                <a
                                  href={r.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 font-medium text-emerald-300 hover:text-emerald-200 hover:underline"
                                >
                                  <span>{r.title || r.href}</span>
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                                {r.matches_target && (
                                  <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                                    Target
                                  </span>
                                )}
                              </div>
                              {r.body && (
                                <p className="mt-0.5 line-clamp-2 leading-relaxed text-slate-400">
                                  {r.body}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-sm text-slate-300">
                      <p className="break-all">
                        <span className="font-medium text-slate-200">URL:</span>{" "}
                        <a
                          href={String(step.arguments?.url || tel.url || "#")}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-emerald-300 hover:text-emerald-200 hover:underline"
                        >
                          <span>
                            {String(step.arguments?.url || tel.url || "")}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      </p>
                      {Boolean(step.arguments?.topic || tel.topic) && (
                        <p className="text-xs text-slate-400">
                          <span className="font-medium text-slate-300">
                            Topic:
                          </span>{" "}
                          {String(step.arguments?.topic || tel.topic)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 pt-1 font-mono text-xs text-slate-400">
                        {tel.status_code != null && (
                          <span className="rounded border border-slate-800 bg-slate-950/80 px-2 py-0.5">
                            HTTP {tel.status_code}
                          </span>
                        )}
                        {(tel.full_extracted_chars ?? tel.extracted_chars) !=
                          null && (
                          <span className="rounded border border-slate-800 bg-slate-950/80 px-2 py-0.5">
                            Page chars:{" "}
                            {tel.full_extracted_chars ?? tel.extracted_chars}
                          </span>
                        )}
                        {tel.focused_output_chars != null && (
                          <span className="rounded border border-slate-800 bg-slate-950/80 px-2 py-0.5">
                            Focused chars: {tel.focused_output_chars}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expandable Raw Payload */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="payload"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 border-t border-slate-800 pt-4">
                          <div>
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Output Sent to LLM
                            </p>
                            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-emerald-200">
                              {step.model_output}
                            </pre>
                          </div>
                          <div>
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Telemetry
                            </p>
                            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-slate-300">
                              {JSON.stringify(tel, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      )}
    </div>
  );
}
