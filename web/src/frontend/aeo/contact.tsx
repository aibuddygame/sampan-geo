import { RunRecord, TraceStep } from "@/interface/aeo";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, Send, X } from "lucide-react";
import { useState } from "react";

const ContactForm: React.FC<{
  question: string | undefined;
  bye: () => void;
  run: RunRecord | null;
  steps: TraceStep[];
}> = function ({ question, bye, run, steps }) {
  const [contactName, setContactName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [submittingContact, setSubmittingContact] = useState(false);

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
            {question && (
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                Question: &ldquo;{question}&rdquo;
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={bye}
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
              onClick={bye}
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
                Work Email or Phone <span className="text-rose-400">*</span>
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
                onClick={bye}
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
  );
};

export default ContactForm;
