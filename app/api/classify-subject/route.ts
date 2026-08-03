import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TUTORS } from "@/lib/tutors";

// Lightweight vision call used only when a learner uploads a homework photo
// with no typed caption to go on (see HomeworkStart.tsx). Typed text is
// matched instantly and for free via lib/homeworkRouting.ts — this endpoint
// exists purely to give image-only uploads the same "we picked the right
// tutor for you" experience, at the cost of one small non-streaming call.

const SUBJECTS = Array.from(new Set(TUTORS.flatMap((t) => t.subjects)));

export async function POST(req: NextRequest) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    try {
        const { imageData, imageMimeType }: { imageData?: string; imageMimeType?: string } =
            await req.json();

        if (!imageData) {
            return NextResponse.json({ subject: null }, { status: 400 });
        }

        const completion = await openai.chat.completions.create(
            {
                model: "gpt-4o-mini",
                max_tokens: 20,
                temperature: 0,
                messages: [
                    {
                        role: "system",
                        content:
                            `Look at the homework photo and identify which school subject it belongs to. ` +
                            `Reply with exactly one of these words, nothing else: ${SUBJECTS.join(", ")}, Unknown.`,
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Which subject is this homework for?" },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${imageMimeType ?? "image/jpeg"};base64,${imageData}`,
                                },
                            },
                        ],
                    },
                ],
            },
            { signal: AbortSignal.timeout(15_000) },
        );

        const raw = completion.choices[0]?.message?.content?.trim() ?? "";
        const subject = SUBJECTS.find((s) => s.toLowerCase() === raw.toLowerCase()) ?? null;

        return NextResponse.json({ subject });
    } catch (error) {
        console.error("Classify-subject API error:", error);
        return NextResponse.json({ subject: null }, { status: 500 });
    }
}
