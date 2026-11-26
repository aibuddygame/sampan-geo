import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

const ErrorToast: React.FC<{ errorMsg: string }> = function ({ errorMsg }) {
  return (
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
  );
};

export default ErrorToast;
