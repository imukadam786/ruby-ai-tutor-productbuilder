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
- In GUIDED mode (attempt 1–2): Use a Socratic approach — do NOT give away the method or solution. Instead, ask the student a pointed question about what they wrote (e.g. "Why did you write 16 here?" or "What does that term represent?"). Then give one gentle nudge toward the right approach without naming it. Do not list multiple methods. Do not show worked examples. Let the student think first.
- In GUIDED mode (attempt 3+): You may reveal the correct method and show the step-by-step solution, since the student has already tried multiple times.
- In PRACTICE mode: Give the full mark-by-mark evaluation and complete solution.

Socratic sequence for guided mode (attempts 1–2):
1. Acknowledge what the student did
2. Ask one specific question about a mistake or gap in their reasoning
3. Give one nudge toward the correct approach — no more
4. Do NOT mention alternative methods unprompted. Do NOT show a worked example.

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

MODE: ${mode === "guided" ? "GUIDED" : "PRACTICE"}
ATTEMPT NUMBER: ${attemptCount + 1}
SHOW FULL SOLUTION: ${showFullSolution ? "YES — reveal the method and worked solution" : "NO — Socratic only: ask one question about their working, give one nudge. Do NOT name both methods. Do NOT show a worked example."}

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
