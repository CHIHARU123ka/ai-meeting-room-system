import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, systemPrompt } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const stream = anthropic.messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        temperature: 0.2,
        system:
          systemPrompt ||
          "あなたはシステム設計の専門家です。日本語で回答してください。",
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        })),
      });

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          const chunk = JSON.stringify({
            content: event.delta.text,
            done: false,
          });
          await writer.write(encoder.encode(`data: ${chunk}\n\n`));
        }
      }

      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({ content: "", done: true })}\n\n`
        )
      );
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[Claude chat error]", errMsg);
      try {
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ content: `\n\n[Error: ${errMsg}]`, done: true })}\n\n`
          )
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
