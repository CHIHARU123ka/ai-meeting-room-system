import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const AGENT_TIMEOUT_MS = 120000;

interface AgentTask {
  name: string;
  role: string;
  prompt: string;
}

function sseEncode(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

async function runAgent(
  anthropic: Anthropic,
  task: AgentTask,
  context: string,
  writer: WritableStreamDefaultWriter<Uint8Array>
): Promise<string> {
  await writer.write(
    sseEncode({ type: "agent_start", agent: task.name, role: task.role })
  );

  try {
    const response = await anthropic.messages.create(
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        temperature: 0.2,
        system: `あなたは優秀な${task.role}です。与えられたコンテキストとタスクに基づいて、具体的かつ実用的な回答を日本語で提供してください。コード例やファイル構成なども含めて詳細に記述してください。`,
        messages: [
          {
            role: "user",
            content: `## コンテキスト\n${context}\n\n## タスク\n${task.prompt}`,
          },
        ],
      },
      {
        timeout: AGENT_TIMEOUT_MS,
      }
    );

    const result =
      response.content[0].type === "text" ? response.content[0].text : "";
    await writer.write(
      sseEncode({
        type: "agent_complete",
        agent: task.name,
        length: result.length,
      })
    );
    return result;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Agent ${task.name} error]`, errMsg);
    await writer.write(
      sseEncode({ type: "agent_error", agent: task.name, error: errMsg })
    );
    return `[${task.name}] エラー: ${errMsg}`;
  }
}

export async function POST(req: NextRequest) {
  const { designContext, requirement } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!designContext && !requirement) {
    return new Response(
      JSON.stringify({ error: "designContext or requirement is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  (async () => {
    try {
      let context = `## 要件\n${requirement || "(未指定)"}\n\n## 設計コンテキスト（会議での議論内容）\n${designContext || "(未指定)"}`;

      const agents: AgentTask[] = [
        {
          name: "プロダクトマネージャー",
          role: "PM歴10年のプロダクトマネージャー",
          prompt:
            "この要件に基づいて、プロダクト仕様書を作成してください。以下を含めてください：\n1. プロダクトの目的とゴール\n2. ユーザーストーリー（主要なもの3-5個）\n3. 機能要件一覧\n4. 非機能要件（パフォーマンス、セキュリティ等）\n5. 優先度付きのロードマップ\n6. 成功指標（KPI）",
        },
        {
          name: "アーキテクト",
          role: "システムアーキテクト",
          prompt:
            "PMの仕様書を踏まえて、システムアーキテクチャを設計してください：\n1. 技術スタック選定と理由\n2. システム構成図（テキストベース）\n3. データベース設計（主要テーブル・スキーマ）\n4. API設計方針\n5. インフラ構成\n6. スケーラビリティ考慮事項",
        },
        {
          name: "フロントエンドエンジニア",
          role: "フロントエンドエンジニア",
          prompt:
            "アーキテクチャ設計を踏まえて、フロントエンド実装計画を作成してください：\n1. ディレクトリ構造\n2. 主要コンポーネント一覧と責務\n3. 状態管理の方針\n4. ルーティング設計\n5. 主要画面のコンポーネントツリー\n6. 主要コンポーネントのサンプルコード（TypeScript/React）",
        },
        {
          name: "バックエンドエンジニア",
          role: "バックエンドエンジニア（セキュリティ重視）",
          prompt:
            "アーキテクチャ設計を踏まえて、バックエンド実装計画を作成してください：\n1. APIエンドポイント一覧（メソッド、パス、リクエスト/レスポンス）\n2. 認証・認可フロー\n3. データベースマイグレーション計画\n4. エラーハンドリング方針\n5. セキュリティ対策\n6. 主要エンドポイントのサンプルコード",
        },
        {
          name: "QAエンジニア",
          role: "品質保証専門家",
          prompt:
            "全体の実装計画を踏まえて、テスト計画を作成してください：\n1. テスト戦略（単体・結合・E2E）\n2. テストケース一覧（主要なもの）\n3. テスト環境構成\n4. CI/CDパイプラインでのテスト配置\n5. 品質基準とカバレッジ目標\n6. 主要テストのサンプルコード",
        },
        {
          name: "知財監査エージェント",
          role: "知財・ライセンス専門家",
          prompt:
            "使用される技術スタックとライブラリについて、知財・ライセンス監査を行ってください：\n1. 使用ライブラリのライセンス一覧\n2. ライセンス互換性チェック\n3. 商用利用上のリスク評価\n4. OSSコンプライアンス要件\n5. 推奨事項と対策",
        },
      ];

      for (const agent of agents) {
        const result = await runAgent(anthropic, agent, context, writer);
        context += `\n\n---\n## ${agent.name}の出力\n${result}`;
      }

      await writer.write(
        sseEncode({
          type: "implementation_complete",
          message:
            "全エージェント（PM・アーキテクト・フロントエンド・バックエンド・QA・知財監査）の実装設計が完了しました。",
        })
      );
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[Implementation pipeline error]", errMsg);
      try {
        await writer.write(
          sseEncode({
            type: "implementation_failed",
            message: `実装パイプラインでエラーが発生しました: ${errMsg}`,
          })
        );
      } catch {
        // writer may already be closed
      }
    } finally {
      try {
        await writer.close();
      } catch {
        // already closed
      }
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
