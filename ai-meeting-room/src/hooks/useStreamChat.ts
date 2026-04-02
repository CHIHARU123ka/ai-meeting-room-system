"use client";

import { useCallback } from "react";
import { useMeetingStore } from "@/store/meeting";
import type { Role } from "@/types";

export function useStreamChat() {
  const { addMessage, appendToMessage, setStreaming } = useMeetingStore();

  const streamChat = useCallback(
    async (
      endpoint: "/api/chat/claude" | "/api/chat/gemini",
      role: Role,
      messages: Array<{ role: string; content: string }>,
      systemPrompt?: string
    ): Promise<string> => {
      const messageId = addMessage(role, "");
      setStreaming(true, messageId);
      let fullContent = "";

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, systemPrompt }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                appendToMessage(messageId, data.content);
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : "Unknown error";
        appendToMessage(messageId, `\n\n[エラー: ${errMsg}]`);
        fullContent += `\n\n[エラー: ${errMsg}]`;
      } finally {
        setStreaming(false, null);
      }

      return fullContent;
    },
    [addMessage, appendToMessage, setStreaming]
  );

  return { streamChat };
}
