"use client";

import { motion } from "framer-motion";
import { useMeetingStore } from "@/store/meeting";
import { Bot, RotateCcw } from "lucide-react";

const phaseLabels: Record<string, string> = {
  discussion: "設計議論中",
  approved: "設計承認済み",
  implementing: "フルオート実装中",
  completed: "実装完了",
  error: "エラー発生",
};

const phaseColors: Record<string, string> = {
  discussion: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  approved: "bg-green-500/20 text-green-300 border-green-500/30",
  implementing: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  error: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function Header() {
  const { phase, reset } = useMeetingStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass sticky top-0 z-50 mx-4 mt-4 flex items-center justify-between px-6 py-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/20">
          <Bot className="h-5 w-5 text-purple-300" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            AI開発会議室
          </h1>
          <p className="text-xs text-zinc-400">Claude x Gemini</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${phaseColors[phase]}`}
        >
          {phaseLabels[phase]}
        </span>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          リセット
        </button>
      </div>
    </motion.header>
  );
}
