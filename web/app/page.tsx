"use client";

import React, { useState } from "react";

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

export default function HomePage() {
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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            GEO / AEO Agent Trace Lab
          </h1>
          <p className="text-sm text-slate-600">
            Ask a question to test how the AI searches, reads pages, and
            answers—then inspect every step.
          </p>
        </header>

        {/* Question Form */}
        <form
          onSubmit={handleAsk}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-slate-700 mb-1"
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
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="targetUrl"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Target Website URL (optional, for GEO/AEO visibility tracking)
            </label>
            <input
              id="targetUrl"
              type="text"
              placeholder="https://yourwebsite.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Running Agent..." : "Ask AI"}
            </button>
          </div>
        </form>

        {/* Error Alert */}
        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Searching the web, extracting relevant page sections, and generating
            an answer...
          </div>
        )}

        {/* Final Answer */}
        {run && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 className="text-lg font-semibold">AI Answer</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                  {run.status}
                </span>
                <span>Steps: {run.step_count ?? steps.length}</span>
                {run.target_domain && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                    Target: {run.target_domain}
                  </span>
                )}
              </div>
            </div>

            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {run.final_answer || "(No answer returned)"}
            </div>
          </section>
        )}

        {/* Recorded Tool Steps */}
        {steps.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">
              Recorded Process ({steps.length} steps)
            </h2>

            <div className="space-y-3">
              {steps.map((step) => {
                const isOpen = expandedStep === step.seq;
                const tel = step.telemetry || {};
                const isSearch = step.tool_name === "web_search";

                return (
                  <div
                    key={step.id || step.seq}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                          {step.seq}
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-800">
                          {step.tool_name}
                        </span>
                        {tel.matches_target && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            Target Match
                          </span>
                        )}
                        {tel.error && (
                          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            Error
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {typeof tel.duration_ms === "number" && (
                          <span>{tel.duration_ms} ms</span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedStep(isOpen ? null : step.seq)
                          }
                          className="font-medium text-slate-700 hover:text-slate-950"
                        >
                          {isOpen ? "Hide Details" : "Inspect Details"}
                        </button>
                      </div>
                    </div>

                    {/* Step Summary */}
                    {isSearch ? (
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-700">
                          <span className="font-medium">Query:</span>{" "}
                          <span className="font-mono text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {String(step.arguments?.query || tel.query || "")}
                          </span>{" "}
                          <span className="text-slate-500">
                            ({tel.result_count ?? 0} results
                            {typeof tel.target_hit_count === "number"
                              ? `, ${tel.target_hit_count} target hits`
                              : ""}
                            )
                          </span>
                        </p>

                        {Array.isArray(tel.results) &&
                          tel.results.length > 0 && (
                            <ul className="space-y-1.5 pl-3 border-l-2 border-slate-200">
                              {tel.results.map((r, idx) => (
                                <li key={idx} className="text-xs">
                                  <span className="font-semibold text-slate-600">
                                    #{r.rank ?? idx + 1}{" "}
                                  </span>
                                  <a
                                    href={r.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-blue-700 hover:underline"
                                  >
                                    {r.title || r.href}
                                  </a>
                                  {r.matches_target && (
                                    <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                      Target
                                    </span>
                                  )}
                                  {r.body && (
                                    <p className="text-slate-600 mt-0.5 line-clamp-2">
                                      {r.body}
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm text-slate-700">
                        <p className="break-all">
                          <span className="font-medium">URL:</span>{" "}
                          <a
                            href={String(step.arguments?.url || tel.url || "#")}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-700 hover:underline"
                          >
                            {String(step.arguments?.url || tel.url || "")}
                          </a>
                        </p>
                        {Boolean(step.arguments?.topic || tel.topic) && (
                          <p className="text-xs text-slate-600">
                            <span className="font-medium">Topic:</span>{" "}
                            {String(step.arguments?.topic || tel.topic)}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-0.5">
                          {tel.status_code != null && (
                            <span>HTTP {tel.status_code}</span>
                          )}
                          {(tel.full_extracted_chars ?? tel.extracted_chars) !=
                            null && (
                            <span>
                              Page chars:{" "}
                              {tel.full_extracted_chars ?? tel.extracted_chars}
                            </span>
                          )}
                          {tel.focused_output_chars != null && (
                            <span>
                              Focused chars: {tel.focused_output_chars}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expandable Raw Payload */}
                    {isOpen && (
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">
                            Output Sent to LLM
                          </p>
                          <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 whitespace-pre-wrap">
                            {step.model_output}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">
                            Telemetry
                          </p>
                          <pre className="max-h-64 overflow-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-800 whitespace-pre-wrap">
                            {JSON.stringify(tel, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
