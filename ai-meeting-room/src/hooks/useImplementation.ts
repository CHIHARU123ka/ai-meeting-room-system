"use client";

import { useCallback } from "react";
import { useMeetingStore } from "@/store/meeting";

export function useImplementation() {
  const { setPhase, addImplementationLog, addMessage } = useMeetingStore();

  const startImplementation = useCallback(
    async (designContext: string, requirement: string) => {
      setPhase("implementing");
      addMessage("system", "実装フェーズを開始します...");
      addImplementationLog("=== 実装フェーズ開始 ===");

      try {
        const res = await fetch("/api/implement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designContext, requirement }),
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
                  addImplementationLog(data.message);
                  addMessage("system", data.message);
                  setPhase("completed");
                  break;
                case "implementation_failed":
                  addImplementationLog(data.message);
                  addMessage("system", data.message);
                  setPhase("error");
                  break;
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : "Unknown error";
        addImplementationLog(`致命的エラー: ${errMsg}`);
        addMessage("system", `実装エラー: ${errMsg}`);
        setPhase("error");
      }
    },
    [setPhase, addImplementationLog, addMessage]
  );

  return { startImplementation };
}
