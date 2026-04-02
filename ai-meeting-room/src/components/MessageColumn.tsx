"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MessageBubble from "./MessageBubble";
import type { Message, Role } from "@/types";

interface MessageColumnProps {
  title: string;
  role: Role;
  messages: Message[];
  streamingId: string | null;
  accent: "claude" | "gemini" | "user";
}

const accentStyles = {
  claude: {
    border: "border-[rgba(217,119,87,0.2)]",
    title: "text-claude-text",
    icon: "from-[rgba(217,119,87,0.3)] to-[rgba(217,119,87,0.1)]",
  },
  gemini: {
    border: "border-[rgba(66,133,244,0.2)]",
    title: "text-gemini-text",
    icon: "from-[rgba(66,133,244,0.3)] to-[rgba(66,133,244,0.1)]",
  },
  user: {
    border: "border-[rgba(168,85,247,0.2)]",
    title: "text-user-text",
    icon: "from-[rgba(168,85,247,0.3)] to-[rgba(168,85,247,0.1)]",
  },
};

export default function MessageColumn({
  title,
  role,
  messages,
  streamingId,
  accent,
}: MessageColumnProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const filtered = messages.filter((m) => m.role === role);
  const style = accentStyles[accent];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filtered.length, filtered[filtered.length - 1]?.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: accent === "claude" ? 0 : accent === "user" ? 0.1 : 0.2 }}
      className={`glass flex flex-col ${style.border} h-full min-h-0`}
    >
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <div
          className={`h-3 w-3 rounded-full bg-gradient-to-br ${style.icon}`}
        />
        <h2 className={`text-sm font-bold ${style.title}`}>{title}</h2>
        <span className="ml-auto text-[10px] text-zinc-500">
          {filtered.length} messages
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-zinc-600">待機中...</p>
          </div>
        )}
        {filtered.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={msg.id === streamingId}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </motion.div>
  );
}
