"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { useMeetingStore } from "@/store/meeting";

interface UserInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function UserInput({ onSend, disabled }: UserInputProps) {
  const [input, setInput] = useState("");
  const { isStreaming } = useMeetingStore();

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setInput("");
  }, [input, disabled, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass mx-4 mb-4 p-4"
    >
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="要件を入力してください... (Shift+Enter で改行)"
          rows={2}
          disabled={disabled || isStreaming}
          className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-purple-500/40 focus:bg-white/[0.07] disabled:opacity-50"
        />
        <AnimatePresence mode="wait">
          <motion.button
            key={isStreaming ? "loading" : "send"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={handleSend}
            disabled={disabled || isStreaming || !input.trim()}
            className="flex h-12 w-12 items-center justify-center self-end rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
