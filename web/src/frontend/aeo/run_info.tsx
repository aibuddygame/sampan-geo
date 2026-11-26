import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RunRecord, TraceStep } from "@/interface/aeo";
import { motion } from "framer-motion";
import { Sparkles, Target } from "lucide-react";

const RunInfo: React.FC<{ run: RunRecord; steps: TraceStep[] }> = function ({
  run,
  steps,
}) {
  return (
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

      {run.final_answer ? (
        <div className="space-y-3 text-sm leading-relaxed text-slate-200 sm:text-base">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h3 className="pt-2 text-lg font-bold text-white">
                  {children}
                </h3>
              ),
              h2: ({ children }) => (
                <h3 className="pt-2 text-base font-bold text-white">
                  {children}
                </h3>
              ),
              h3: ({ children }) => (
                <h4 className="pt-1.5 text-sm font-semibold text-white">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="leading-relaxed text-slate-200">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="list-disc space-y-1.5 pl-5 text-slate-200">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal space-y-1.5 pl-5 text-slate-200">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-300 underline decoration-emerald-500/40 underline-offset-2 transition hover:text-emerald-200"
                >
                  {children}
                </a>
              ),
              code: ({ children, className }) => {
                const isBlock = Boolean(className);
                if (isBlock) {
                  return (
                    <code className="block overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-emerald-200">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                    {children}
                  </code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-emerald-500/50 pl-3.5 italic text-slate-300">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border-b border-slate-800 bg-slate-950/90 px-3.5 py-2 font-semibold text-slate-200">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-b border-slate-800/70 px-3.5 py-2 text-slate-300">
                  {children}
                </td>
              ),
            }}
          >
            {run.final_answer}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-slate-400">(No answer returned)</p>
      )}
    </motion.section>
  );
};

export default RunInfo;
