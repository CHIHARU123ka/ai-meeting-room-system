"use client";

import { useCallback, useRef } from "react";
import { useMeetingStore } from "@/store/meeting";

export function useImplementation() {
  const { setPhase, addImplementationLog, addMessage } = useMeetingStore();
  const abortRef = useRef<AbortController | null>(null);

  const startImplementation = useCallback(
    async (designContext: string, requirement: string) => {
      // Abort any previous in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const abortController = new AbortController();
      abortRef.current = abortController;

      setPhase("implementing");
      addMessage("system", "実装フェーズを開始します...");
      addImplementationLog("=== 実装フェーズ開始 ===");

      let receivedTerminalEvent = false;

      try {
        const res = await fetch("/api/implement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designContext, requirement }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          const errorText = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("Response body is not readable");

        const decoder = new TextDecoder();
        let buffer = "";

        const processLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) return;
          try {
            const data = JSON.parse(trimmed.slice(6));

            switch (data.type) {
              case "agent_start":
                addImplementationLog(
                  `[${data.agent}] ${data.role} - 開始...`
                );
                break;
              case "agent_complete":
                addImplementationLog(
                  `[${data.agent}] 完了 (${data.length} chars)`
                );
                break;
              case "agent_error":
                addImplementationLog(
                  `[${data.agent}] エラー: ${data.error}`
                );
                break;
              case "attempt":
                addImplementationLog(data.message);
                break;
              case "attempt_failed":
                addImplementationLog(
                  `試行${data.attempt}失敗: ${data.error}`
                );
                break;
              case "retry":
                addImplementationLog(data.message);
                break;
              case "implementation_complete":
                receivedTerminalEvent = true;
                addImplementationLog(data.message);
                addMessage("system", data.message);
                setPhase("completed");
                break;
              case "implementation_failed":
                receivedTerminalEvent = true;
                addImplementationLog(data.message);
                addMessage("system", data.message);
                setPhase("error");
                break;
            }
          } catch {
            // skip malformed JSON
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            processLine(line);
          }
        }

        // Process any remaining data in the buffer after stream ends
        if (buffer.trim()) {
          processLine(buffer.trim());
        }

        // If the stream ended without a terminal event, handle gracefully
        if (!receivedTerminalEvent) {
          addImplementationLog("ストリームが予期せず終了しました。");
          addMessage("system", "実装ストリームが予期せず終了しました。");
          setPhase("error");
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          addImplementationLog("実装がキャンセルされました。");
          setPhase("error");
          return;
        }
        const errMsg =
          error instanceof Error ? error.message : "Unknown error";
        addImplementationLog(`致命的エラー: ${errMsg}`);
        addMessage("system", `実装エラー: ${errMsg}`);
        setPhase("error");
      }
    },
    [setPhase, addImplementationLog, addMessage]
  );

  const cancelImplementation = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  return { startImplementation, cancelImplementation };
}
