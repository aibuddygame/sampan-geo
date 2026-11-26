"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  Loader2,
  Mail,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Target,
  X,
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

const AEOPage: React.FC = function () {
  const [question, setQuestion] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [run, setRun] = useState<RunRecord | null>(null);
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Contact our professionals modal state
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  async function handleAsk(e: React.SubmitEvent) {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading) return;

    setLoading(true);
    setErrorMsg(null);
    setRun(null);
    setSteps([]);
    setExpandedStep(null);
    setContactSubmitted(false);

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

  function handleOpenContact() {
    setContactSubmitted(false);
    setContactError(null);
    setContactOpen(true);
  }

  async function handleContactSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!contactInfo.trim() || submittingContact) return;

    setSubmittingContact(true);
    setContactError(null);

    try {
      const res = await fetch("/api/aeo-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim(),
          contact: contactInfo.trim(),
          notes: contactNotes.trim(),
          run,
          steps,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to send your details.");
      }

      setContactSubmitted(true);
    } catch (err) {
      setContactError(
        err instanceof Error ? err.message : "Unexpected error occurred.",
      );
    } finally {
      setSubmittingContact(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero & Buyer Question Simulator */}
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
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                GEO / AEO Buyer Question Simulator
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                See How AI Answers Your Potential Customers
              </h1>

              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Type a question a potential customer would ask AI. We simulate
                the AI agent searching the web, opening pages, and putting
                together an answer—so you can see what AI finds and whether your
                site shows up.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenContact}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/25 hover:text-white lg:self-auto"
            >
              <MessageSquare className="h-4 w-4 text-emerald-300" />
              <span>Contact Our Experts</span>
            </button>
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
                Customer Question
              </label>
              <textarea
                id="question"
                rows={3}
                required
                placeholder="e.g., What is the best project management tool for a small remote team?"
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
                Your Website URL{" "}
                <span className="font-normal normal-case text-slate-400">
                  (optional—we&apos;ll highlight if the AI finds or reads your
                  site)
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

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-slate-400">
                Simulates web searches and webpage visits for this question.
              </p>

              <motion.button
                type="submit"
                whileTap={{ scale: loading || !question.trim() ? 1 : 0.98 }}
                disabled={loading || !question.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Simulating AI Agent...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Simulate AI Answer
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
              <p className="font-semibold text-rose-200">
                Simulation Could Not Complete
              </p>
              <p className="mt-0.5 text-rose-300/90">{errorMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Agent Progress */}
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
              AI agent is searching the web and reading relevant pages to
              prepare an answer...
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="h-16 animate-pulse rounded-xl border border-slate-800/80 bg-slate-950/60" />
              <div className="h-16 animate-pulse rounded-xl border border-slate-800/80 bg-slate-950/60" />
            </div>
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
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Simulated AI Answer
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Question: &ldquo;{run.question}&rdquo;
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-slate-300">
                  {steps.length} actions taken
                </span>
                {run.target_domain && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-300">
                    <Target className="h-3.5 w-3.5" />
                    Checking: {run.target_domain}
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

      {/* Plain-English Agent Trace: Web Search & Read Webpage */}
      {steps.length > 0 && (
        <section className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">
                What the AI Agent Did ({steps.length} steps)
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Web searches and webpages read during this run
            </span>
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
              const pageUrl = String(step.arguments?.url || tel.url || "");
              const queryText = String(
                step.arguments?.query || tel.query || "",
              );

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

                      {isSearch ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300">
                          <Search className="h-3.5 w-3.5" />
                          Web Search
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                          <FileText className="h-3.5 w-3.5" />
                          Read Webpage
                        </span>
                      )}

                      {tel.matches_target && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Your Site Found
                        </span>
                      )}

                      {tel.error && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Couldn&apos;t Load
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedStep(isOpen ? null : step.seq)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
                    >
                      <span>{isOpen ? "Less Detail" : "More Detail"}</span>
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

                  {/* Friendly Step Summary */}
                  {isSearch ? (
                    <div className="space-y-2.5 text-sm">
                      <p className="text-slate-300">
                        Searched the web for{" "}
                        <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 font-medium text-white">
                          &ldquo;{queryText}&rdquo;
                        </span>{" "}
                        <span className="text-xs text-slate-400">
                          — found {tel.result_count ?? 0} pages
                          {typeof tel.target_hit_count === "number" &&
                          tel.target_hit_count > 0
                            ? ` (${tel.target_hit_count} from your site)`
                            : ""}
                        </span>
                      </p>

                      {Array.isArray(tel.results) && tel.results.length > 0 && (
                        <ul className="space-y-2 border-l-2 border-sky-500/30 pl-3.5">
                          {tel.results.map((r, idx) => (
                            <li key={idx} className="text-xs">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-slate-500">
                                  {r.rank ?? idx + 1}.
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
                                    Your Site
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
                        Opened and read webpage:{" "}
                        <a
                          href={pageUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-emerald-300 hover:text-emerald-200 hover:underline"
                        >
                          <span>{tel.title || pageUrl}</span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      </p>
                      {pageUrl && tel.title && (
                        <p className="break-all font-mono text-xs text-slate-400">
                          {pageUrl}
                        </p>
                      )}
                      {Boolean(step.arguments?.topic || tel.topic) && (
                        <p className="text-xs text-slate-400">
                          Looked for details on:{" "}
                          <span className="text-slate-200">
                            {String(step.arguments?.topic || tel.topic)}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Optional Deeper Details */}
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
                        <div className="space-y-3 border-t border-slate-800 pt-4 text-xs">
                          {(tel.focused_extract || tel.extracted_preview) && (
                            <div>
                              <p className="mb-1.5 font-semibold text-slate-300">
                                Excerpt Read by the AI
                              </p>
                              <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-emerald-200">
                                {tel.focused_extract || tel.extracted_preview}
                              </pre>
                            </div>
                          )}

                          <div>
                            <p className="mb-1.5 font-semibold text-slate-300">
                              Agent Summary Notes
                            </p>
                            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-slate-300">
                              {step.model_output}
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

      {/* CTA Banner: Contact Our Professionals */}
      {run && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-linear-to-r from-slate-900 via-slate-900 to-emerald-950/30 p-6 shadow-lg sm:flex-row sm:items-center"
        >
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Want your site cited more often in AI answers?
            </h3>
            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Contact our professionals and we&apos;ll help structure your pages
              so AI assistants find and reference them clearly.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenContact}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-950/50 transition hover:bg-emerald-300"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Contact Our Professionals</span>
          </button>
        </motion.section>
      )}

      {/* Contact Professionals Modal */}
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
                    GEO / AEO Guidance
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    Contact Our Professionals
                  </h2>
                  {run?.question && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                      Question: &ldquo;{run.question}&rdquo;
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  aria-label="Close contact dialog"
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
                      Details Sent to Our Team
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                      We&apos;ve saved{" "}
                      <span className="font-medium text-slate-200">
                        {contactInfo}
                      </span>{" "}
                      and will follow up with guidance on your AI visibility.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContactOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="aeo-contact-name"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Your Name
                    </label>
                    <input
                      id="aeo-contact-name"
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Alex Chan"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="aeo-contact-info"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Work Email or Phone{" "}
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="aeo-contact-info"
                        type="text"
                        required
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="aeo-contact-notes"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Goals or Questions
                    </label>
                    <textarea
                      id="aeo-contact-notes"
                      rows={3}
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      placeholder="Tell us about your site or the customer questions you care about..."
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
                      disabled={submittingContact || !contactInfo.trim()}
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
};

export default AEOPage;
