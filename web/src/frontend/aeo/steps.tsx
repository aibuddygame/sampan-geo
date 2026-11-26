import { TraceStep } from "@/interface/aeo";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Layers,
  Search,
} from "lucide-react";
import { useState } from "react";

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

const StepsInfo: React.FC<{ steps: TraceStep[] }> = function ({ steps }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  return (
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
          const queryText = String(step.arguments?.query || tel.query || "");

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
  );
};

export default StepsInfo;
