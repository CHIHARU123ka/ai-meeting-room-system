"use client";

import { useCallback, useMemo } from "react";
import Header from "@/components/Header";
import MessageColumn from "@/components/MessageColumn";
import UserInput from "@/components/UserInput";
import ApproveButton from "@/components/ApproveButton";
import ImplementationPanel from "@/components/ImplementationPanel";
import { useMeetingStore } from "@/store/meeting";
import { useStreamChat } from "@/hooks/useStreamChat";
import { useImplementation } from "@/hooks/useImplementation";

const CLAUDE_SYSTEM = `あなたは「Claude設計官」です。システム設計・アーキテクチャ決定・最終判断を担当します。

ルール:
- 日本語で回答
- ユーザーの要件を聞いて、技術スタック・DB設計・API設計・画面設計・デザインイメージを提案
- Geminiの指摘は真摯に検討し改善点を取り入れる
- デザインについてはユーザーの好みを最優先で反映する
- 実装可能な具体的な設計を提示する`;

const GEMINI_SYSTEM = `あなたは「Geminiレビュアー」です。設計のレビュー・検証・反論・改善提案を担当します。

ルール:
- 日本語で回答
- Claudeの設計に対してスケーラビリティ・セキュリティ・コスト効率・UXの観点でレビュー
- デザインについてはカラーパレット案を複数提示する
- 具体的な根拠を示して指摘する
- 良い点は積極的に認め、問題点のみ指摘する`;

export default function Home() {
  const {
    phase,
    messages,
    isStreaming,
    streamingMessageId,
    addMessage,
    setDesignContext,
    setPhase,
  } = useMeetingStore();
  const { streamChat } = useStreamChat();
  const { startImplementation } = useImplementation();

  const claudeMessages = useMemo(
    () =>
      messages
        .filter((m) => m.role === "claude" || m.role === "user")
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
    [messages]
  );

  const geminiMessages = useMemo(
    () =>
      messages
        .filter((m) => m.role === "gemini" || m.role === "user" || m.role === "claude")
        .map((m) => ({
          role: m.role === "user" ? "user" : m.role === "gemini" ? "model" : "user",
          content:
            m.role === "claude"
              ? `[Claude設計官の提案]\n${m.content}`
              : m.content,
        })),
    [messages]
  );

  const hasEnoughDiscussion = useMemo(() => {
    const claudeCount = messages.filter((m) => m.role === "claude").length;
    const geminiCount = messages.filter((m) => m.role === "gemini").length;
    return claudeCount >= 1 && geminiCount >= 1 && !isStreaming;
  }, [messages, isStreaming]);

  const handleSend = useCallback(
    async (text: string) => {
      if (phase !== "discussion") return;

      addMessage("user", text);

      const claudeResult = await streamChat(
        "/api/chat/claude",
        "claude",
        [...claudeMessages, { role: "user", content: text }],
        CLAUDE_SYSTEM
      );

      const geminiResult = await streamChat(
        "/api/chat/gemini",
        "gemini",
        [
          ...geminiMessages,
          { role: "user", content: text },
          {
            role: "user",
            content: `[Claude設計官の提案]\n${claudeResult}`,
          },
        ],
        GEMINI_SYSTEM
      );

      setDesignContext(
        `ユーザー要件: ${text}\n\nClaude設計: ${claudeResult}\n\nGeminiレビュー: ${geminiResult}`
      );
    },
    [
      phase,
      addMessage,
      streamChat,
      claudeMessages,
      geminiMessages,
      setDesignContext,
    ]
  );

  const handleApprove = useCallback(() => {
    const store = useMeetingStore.getState();
    setPhase("approved");
    addMessage("system", "設計が承認されました。フルオート実装を開始します...");

    const requirement =
      messages.find((m) => m.role === "user")?.content || "";
    const designContext = store.designContext;

    setTimeout(() => {
      startImplementation(designContext, requirement);
    }, 1000);
  }, [setPhase, addMessage, messages, startImplementation]);

  const showApprove = phase === "discussion" && hasEnoughDiscussion;

  return (
    <div className="flex h-dvh flex-col">
      <Header />

      <div className="flex-1 grid grid-cols-1 gap-4 p-4 min-h-0 md:grid-cols-3">
        <MessageColumn
          title="Claude 設計官"
          role="claude"
          messages={messages}
          streamingId={streamingMessageId}
          accent="claude"
        />
        <div className="flex flex-col gap-4 min-h-0">
          <MessageColumn
            title="あなた"
            role="user"
            messages={messages}
            streamingId={null}
            accent="user"
          />
          <MessageColumn
            title="System"
            role="system"
            messages={messages}
            streamingId={null}
            accent="user"
          />
        </div>
        <MessageColumn
          title="Gemini レビュアー"
          role="gemini"
          messages={messages}
          streamingId={streamingMessageId}
          accent="gemini"
        />
      </div>

      <ImplementationPanel />

      <ApproveButton
        visible={showApprove}
        onApprove={handleApprove}
        disabled={isStreaming}
      />

      <UserInput
        onSend={handleSend}
        disabled={phase !== "discussion" || isStreaming}
      />
    </div>
  );
}
