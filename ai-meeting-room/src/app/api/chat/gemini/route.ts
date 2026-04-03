import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, systemPrompt } = await req.json();

  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GOOGLE_AI_STUDIO_API_KEY not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "messages array is required and must not be empty" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const history = messages.map(
        (m: { role: string; content: string }) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })
      );

      const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction:
            systemPrompt ||
            "あなたはシステムレビューの専門家です。日本語で回答してください。",
          temperature: 0.3,
          maxOutputTokens: 8192,
        },
        contents: history,
      });

      for await (const chunk of response) {
        const text = chunk.text ?? "";
        if (text) {
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({ content: text, done: false })}\n\n`
            )
          );
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
      console.error("[Gemini chat error]", errMsg);
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
