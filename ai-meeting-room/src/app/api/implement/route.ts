import Anthropic from "@anthropic-ai/sdk";
import { sendNotification } from "@/lib/notify";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface AgentTask {
  name: string;
  role: string;
  prompt: string;
}

async function runAgent(
  task: AgentTask,
  context: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<string> {
  const send = (data: object) =>
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

  send({ type: "agent_start", agent: task.name, role: task.role });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8096,
      temperature: 0.1,
      system: `あなたは${task.role}です。省略なし・完全実装のみ出力してください。日本語で作業し、コードはそのまま使える完全版を出力してください。`,
      messages: [
        { role: "user", content: `【コンテキスト】\n${context}\n\n【タスク】\n${task.prompt}` },
      ],
    });

    const result =
      response.content[0].type === "text" ? response.content[0].text : "";
    send({
      type: "agent_complete",
      agent: task.name,
      length: result.length,
    });
    return result;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    send({ type: "agent_error", agent: task.name, error: errMsg });
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const { designContext, requirement } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );

      const maxRetries = 3;
      let context = `要件: ${requirement}\n設計コンテキスト: ${designContext}`;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        send({
          type: "attempt",
          attempt,
          maxRetries,
          message: `実装試行 ${attempt}/${maxRetries}`,
        });

        try {
          const agents: AgentTask[] = [
            {
              name: "PM",
              role: "プロダクトマネージャー(PM歴10年)",
              prompt: `以下の要件と設計から完全な仕様書を作成せよ:\n要件: ${requirement}\n設計: ${designContext}\n\n出力: Markdown形式の仕様書(機能一覧・画面一覧・データモデル・タスクリスト)`,
            },
            {
              name: "Architect",
              role: "システムアーキテクト",
              prompt: `仕様に基づきアーキテクチャ設計書を作成:\n- 技術スタック選定理由\n- ディレクトリ構造\n- API設計\n- DB設計\n- セキュリティ設計`,
            },
            {
              name: "Frontend",
              role: "フロントエンドエンジニア(UI/UX専門家)",
              prompt: `設計書に基づきフロントエンドを完全実装:\n- 全コンポーネント完全実装\n- レスポンシブ対応\n- 各ファイルを === ファイル名 === 区切りで出力`,
            },
            {
              name: "Backend",
              role: "バックエンドエンジニア(セキュリティ重視)",
              prompt: `設計書に基づきバックエンドAPIを完全実装:\n- 認証認可\n- バリデーション\n- エラーハンドリング\n- 各ファイルを === ファイル名 === 区切りで出力`,
            },
            {
              name: "QA",
              role: "QAエンジニア(品質保証専門家)",
              prompt: `全実装コードのテスト計画とテストコードを作成:\n- テストケース一覧\n- テストコード完全版\n- カバレッジ目標80%以上`,
            },
            {
              name: "IP_Audit",
              role: "知財監査エージェント",
              prompt: `全成果物の知財監査:\n- 商標リスク\n- ライセンス確認\n- 著作権リスク\n- リスクがあれば代替案提示`,
            },
          ];

          context = `要件: ${requirement}\n設計コンテキスト: ${designContext}`;

          for (const agent of agents) {
            const result = await runAgent(
              agent,
              context,
              controller,
              encoder
            );
            context += `\n\n=== ${agent.name}の成果物 ===\n${result.slice(0, 3000)}`;
          }

          send({
            type: "implementation_complete",
            message: "全エージェント完了！実装成功！",
          });

          await sendNotification(
            "AI開発会議室: 実装完了",
            `要件「${requirement}」の実装が完了しました！`,
            "high"
          );

          break;
        } catch (error: unknown) {
          const errMsg =
            error instanceof Error ? error.message : "Unknown error";
          send({
            type: "attempt_failed",
            attempt,
            error: errMsg,
          });

          if (attempt === maxRetries) {
            send({
              type: "implementation_failed",
              message: `${maxRetries}回試行しましたが失敗しました。設計を見直してください。`,
            });

            await sendNotification(
              "AI開発会議室: 実装失敗",
              `要件「${requirement}」の実装が${maxRetries}回失敗しました。`,
              "urgent"
            );
          } else {
            send({
              type: "retry",
              message: `エラー発生。設計を見直して再試行します... (${attempt + 1}/${maxRetries})`,
            });

            const reviewResult = await runAgent(
              {
                name: "ErrorReviewer",
                role: "エラー分析・設計見直し担当",
                prompt: `以下のエラーが発生しました。原因を分析し、設計を修正してください:\nエラー: ${errMsg}\n元の設計: ${designContext}`,
              },
              context + `\nエラー: ${errMsg}`,
              controller,
              encoder
            );
            context = reviewResult;
          }
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
