import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, systemPrompt } = await req.json();

  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GOOGLE_AI_STUDIO_API_KEY not set" }),
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const history = messages.map(
          (m: { role: string; content: string }) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })
        );

        const lastMessage = history.pop();

        const response = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction:
              systemPrompt ||
              "あなたはシステムレビューの専門家です。日本語で回答してください。",
            temperature: 0.3,
            maxOutputTokens: 8096,
          },
          contents: [...history, lastMessage],
        });

        for await (const chunk of response) {
          const text = chunk.text || "";
          if (text) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ content: text, done: false })}\n\n`
              )
            );
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ content: "", done: true })}\n\n`
          )
        );
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ content: `\n\n[Error: ${errMsg}]`, done: true })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
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
