"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import AgentLoading from "./loading";
import ContactForm from "./contact";
import { RunRecord, TraceStep } from "@/interface/aeo";
import AEOHero from "./hero";
import ErrorToast from "./error";
import RunInfo from "./run_info";
import StepsInfo from "./steps";

const AEOPage: React.FC = function () {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [run, setRun] = useState<RunRecord | null>(null);
  const [steps, setSteps] = useState<TraceStep[]>([]);

  // Contact our professionals modal state
  const [contactOpen, setContactOpen] = useState(false);

  function handleOpenContact() {
    setContactOpen(true);
  }

  return (
    <div className="space-y-8">
      {/* Hero & Buyer Question Simulator */}
      <AEOHero
        handleOpenContact={handleOpenContact}
        loading={loading}
        setLoading={setLoading}
        setErrorMsg={setErrorMsg}
        setRun={setRun}
        setSteps={setSteps}
      />

      {/* Error Alert */}
      <AnimatePresence>
        {errorMsg && <ErrorToast errorMsg={errorMsg} />}
      </AnimatePresence>

      {/* Simulated Agent Progress */}
      <AnimatePresence>{loading && <AgentLoading />}</AnimatePresence>

      {/* Final Answer */}
      <AnimatePresence>
        {run && <RunInfo run={run} steps={steps} />}
      </AnimatePresence>

      {/* Plain-English Agent Trace: Web Search & Read Webpage */}
      {steps.length > 0 && <StepsInfo steps={steps} />}

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
          <ContactForm
            question={run?.question}
            bye={() => setContactOpen(false)}
            run={run}
            steps={steps}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AEOPage;
