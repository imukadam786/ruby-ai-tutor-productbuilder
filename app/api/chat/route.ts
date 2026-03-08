import { NextRequest } from "next/server";
import { groq, GROQ_MODEL, GROQ_VISION_MODEL, TUTOR_SYSTEM_PROMPT } from "@/lib/anthropic";
import { Message } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      imageData,
      imageMimeType,
    }: { messages: Message[]; imageData?: string; imageMimeType?: string } = await req.json();

    const hasImage = !!imageData;
    const model = hasImage ? GROQ_VISION_MODEL : GROQ_MODEL;

    // Build message array — if image present, attach it to the last user message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groqMessages: any[] = messages.slice(0, -1).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const lastMsg = messages[messages.length - 1];

    if (hasImage && lastMsg?.role === "user") {
      groqMessages.push({
        role: "user",
        content: [
          ...(lastMsg.content
            ? [{ type: "text", text: lastMsg.content }]
            : [{ type: "text", text: "Please analyse this image and help me with it." }]),
          {
            type: "image_url",
            image_url: {
              url: `data:${imageMimeType ?? "image/jpeg"};base64,${imageData}`,
            },
          },
        ],
      });
    } else if (lastMsg) {
      groqMessages.push({
        role: lastMsg.role as "user" | "assistant",
        content: lastMsg.content,
      });
    }

    const stream = await groq.chat.completions.create({
      model,
      max_tokens: 2048,
      messages: [
        { role: "system", content: TUTOR_SYSTEM_PROMPT },
        ...groqMessages,
      ],
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Failed to get response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
