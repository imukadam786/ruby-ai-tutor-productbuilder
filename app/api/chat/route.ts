import { NextRequest } from "next/server";
import OpenAI from "openai";
import { Message } from "@/types";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/prompts";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const {
            messages,
            imageData,
            imageMimeType,
        }: { messages: Message[]; imageData?: string; imageMimeType?: string } =
            await req.json();

        const hasImage = !!imageData;

        const openaiMessages: any[] = messages.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content,
        }));

        const lastMsg = messages[messages.length - 1];

        if (hasImage && lastMsg?.role === "user") {
            openaiMessages.push({
                role: "user",
                content: [
                    {
                        type: "text",
                        text:
                            lastMsg.content ||
                            "Please analyse this image and help me with it.",
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${imageMimeType ?? "image/jpeg"};base64,${imageData}`,
                        },
                    },
                ],
            });
        } else if (lastMsg) {
            openaiMessages.push({
                role: lastMsg.role,
                content: lastMsg.content,
            });
        }

        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            stream: true,
            max_tokens: 2048,
            messages: [
                {
                    role: "system",
                    content: TUTOR_SYSTEM_PROMPT,
                },
                ...openaiMessages,
            ],
        });

        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.choices[0]?.delta?.content ?? "";

                        if (text) {
                            controller.enqueue(encoder.encode(text));

                            if (text.includes("\n\n")) {
                                await new Promise((r) => setTimeout(r, 200));
                            } else if (text.includes("\n")) {
                                await new Promise((r) => setTimeout(r, 80));
                            }
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