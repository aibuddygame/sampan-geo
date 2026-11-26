import { RunRecord, TraceStep } from "@/interface/aeo";
import { motion } from "framer-motion";
import { Globe, Loader2, MessageSquare, Search, Sparkles } from "lucide-react";
import { useState } from "react";

const AEOHero: React.FC<{
  handleOpenContact: () => void;
  loading: boolean;
  setLoading: (x: boolean) => void;
  setErrorMsg: (x: string | null) => void;
  setRun: (x: RunRecord | null) => void;
  setSteps: (x: TraceStep[]) => void;
}> = function ({
  handleOpenContact,
  loading,
  setLoading,
  setErrorMsg,
  setRun,
  setSteps,
}) {
  const [question, setQuestion] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  async function handleAsk(e: React.SubmitEvent) {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading) return;

    setLoading(true);
    setErrorMsg(null);
    setRun(null);
    setSteps([]);

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
              Type a question a potential customer would ask AI. We simulate the
              AI agent searching the web, opening pages, and putting together an
              answer—so you can see what AI finds and whether your site shows
              up.
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
              placeholder="e.g., What is the best ergonomic chair under $400 with free shipping and easy returns?"
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
              Simulate a potential customer asking the AI.
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
  );
};

export default AEOHero;
