"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/types";

const roleConfig = {
  claude: {
    label: "Claude",
    glass: "glass-claude",
    textColor: "text-claude-text",
    dotColor: "bg-[#d97757]",
  },
  gemini: {
    label: "Gemini",
    glass: "glass-gemini",
    textColor: "text-gemini-text",
    dotColor: "bg-[#4285f4]",
  },
  user: {
    label: "あなた",
    glass: "glass-user",
    textColor: "text-user-text",
    dotColor: "bg-purple-500",
  },
  system: {
    label: "System",
    glass: "glass",
    textColor: "text-zinc-400",
    dotColor: "bg-zinc-500",
  },
};

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({
  message,
  isStreaming,
}: MessageBubbleProps) {
  const config = roleConfig[message.role];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${config.glass} glass rounded-2xl p-4 mb-3`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${config.dotColor} ${isStreaming ? "animate-pulse" : ""}`}
        />
        <span className={`text-xs font-semibold ${config.textColor}`}>
          {config.label}
        </span>
        <span className="text-[10px] text-zinc-500">
          {new Date(message.timestamp).toLocaleTimeString("ja-JP")}
        </span>
      </div>
      <div className="markdown-body text-sm leading-relaxed text-zinc-200">
        <ReactMarkdown>{message.content}</ReactMarkdown>
        {isStreaming && !message.content && (
          <div className="streaming-dot flex gap-1 py-2">
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
