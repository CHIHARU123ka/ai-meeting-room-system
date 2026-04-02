"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Rocket } from "lucide-react";

interface ApproveButtonProps {
  visible: boolean;
  onApprove: () => void;
  disabled?: boolean;
}

export default function ApproveButton({
  visible,
  onApprove,
  disabled,
}: ApproveButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2"
        >
          <button
            onClick={onApprove}
            disabled={disabled}
            className="group flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-8 py-4 text-green-300 shadow-[0_0_40px_rgba(34,197,94,0.15)] backdrop-blur-xl transition-all hover:border-green-400/50 hover:bg-green-500/20 hover:shadow-[0_0_60px_rgba(34,197,94,0.25)] disabled:opacity-50"
          >
            <CheckCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            <div className="text-left">
              <div className="text-base font-bold">設計を承認</div>
              <div className="text-xs text-green-400/70">
                フルオート実装を開始
              </div>
            </div>
            <Rocket className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
