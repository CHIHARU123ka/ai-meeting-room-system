"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useMeetingStore } from "@/store/meeting";

export default function ImplementationPanel() {
  const { phase, implementationLogs } = useMeetingStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const visible = phase === "implementing" || phase === "completed" || phase === "error";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [implementationLogs.length]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="mx-4 mb-4 overflow-hidden"
        >
          <div className="glass border-amber-500/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-300">
                実装コンソール
              </h3>
              <div className="ml-auto flex items-center gap-2">
                {phase === "implementing" && (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                )}
                {phase === "completed" && (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                )}
                {phase === "error" && (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className="text-xs text-zinc-500">
                  {implementationLogs.length} entries
                </span>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg bg-black/40 p-3 font-mono text-xs leading-relaxed">
              {implementationLogs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`py-0.5 ${
                    log.includes("エラー") || log.includes("失敗")
                      ? "text-red-400"
                      : log.includes("完了") || log.includes("成功")
                        ? "text-emerald-400"
                        : log.includes("開始")
                          ? "text-amber-400"
                          : "text-zinc-400"
                  }`}
                >
                  <span className="mr-2 text-zinc-600">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  {log}
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
