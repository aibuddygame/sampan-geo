import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const AgentLoading: React.FC = function () {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-emerald-300">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
        AI agent is searching the web and reading relevant pages to prepare an
        answer...
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-16 animate-pulse rounded-xl border border-slate-800/80 bg-slate-950/60" />
        <div className="h-16 animate-pulse rounded-xl border border-slate-800/80 bg-slate-950/60" />
      </div>
    </motion.div>
  );
};

export default AgentLoading;
