import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireApiSecret } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const authError = requireApiSecret(req);
  if (authError) return authError;

  try {
    const {
      questionLabel,
      questionText,
      memoText,
      studentText,
      imageData,
      imageMimeType,
      language,
      mode,
      attemptCount,
    }: {
      questionLabel: string;
      questionText: string;
      memoText: string;
      studentText: string;
      imageData?: string;
      imageMimeType?: string;
      language: string;
      mode: "guided" | "practice";
      attemptCount: number;
    } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const hasImage = !!imageData;
    const showFullSolution = mode === "practice" || attemptCount >= 3;

    const systemPrompt = `You are Ruby, an AI exam coach helping a Grade 12 student work through a South African National Senior Certificate (NSC/Matric) past paper.

Your role:
- Evaluate the student's working step by step against the official mark scheme
- Award marks for each correct step
- Give targeted feedback in the student's chosen home language: ${language}
- In GUIDED mode: Guide without giving away the full answer (unless attempt 3+)
- In PRACTICE mode: Give the full mark-by-mark evaluation and complete solution

CRITICAL: Always respond in ${language}. If the language is not English, write your full response in ${language}. Mathematical expressions can stay in standard notation.

RESPONSE FORMAT — you must return valid JSON only, no markdown wrapper:
{
  "marksEarned": <number>,
  "totalMarks": <number>,
  "allCorrect": <boolean>,
  "feedback": "<your feedback as a markdown string — use \\n for newlines, escape any quotes>"
}

The feedback field must be a single-line JSON string (escape newlines as \\n).`;

    const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [];

    const promptText = `QUESTION ${questionLabel}:
${questionText}

OFFICIAL MARK SCHEME (confidential — do not reproduce verbatim to student):
${memoText}

MODE: ${mode === "guided" ? "GUIDED (coaching — hint only if not fully correct, unless this is attempt 3+ in which case show the solution)" : "PRACTICE (full evaluation — show the complete solution with mark breakdown)"}
ATTEMPT NUMBER: ${attemptCount + 1}
SHOW FULL SOLUTION: ${showFullSolution ? "YES" : "NO — give a hint toward what is wrong"}

STUDENT'S WORKING:
${studentText || "(No text provided — see image below)"}

Evaluate the student's working against the mark scheme. Award marks for each correct step. Respond in ${language}.`;

    userContent.push({ type: "text", text: promptText });

    if (hasImage && imageData) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${imageMimeType ?? "image/jpeg"};base64,${imageData}`,
          detail: "high",
        },
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";

    let parsed: {
      marksEarned?: number;
      totalMarks?: number;
      allCorrect?: boolean;
      feedback?: string;
    };

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { marksEarned: 0, totalMarks: 0, allCorrect: false, feedback: raw };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[matric/evaluate] error:", err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
