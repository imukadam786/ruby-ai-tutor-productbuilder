import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireApiSecret } from "@/lib/api-auth";
import { checkLanguage } from "@/lib/language-utils";

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
      questionType,
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
      questionType?: string;
    } = await req.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const hasImage = !!imageData;
    const showFullSolution = mode === "practice" || attemptCount >= 3;
    const showWorkedExample =
      mode === "guided" &&
      attemptCount === 1 &&
      questionType !== "mcq" &&
      questionType !== "match-group";

    // Safeguard: memoText is per-question and should be small, but cap it to
    // prevent any accidentally large value from inflating the request.
    const safeMemo = memoText.length > 3000 ? memoText.slice(0, 3000) + "\n[memo truncated]" : memoText;

    const systemPrompt = `You are Ruby, an AI exam coach helping a Grade 12 student work through a South African National Senior Certificate (NSC/Matric) past paper.

Your role:
- Evaluate the student's working step by step against the official mark scheme
- Award marks for each correct step
- Give targeted feedback in the student's chosen home language: ${language}
- In GUIDED mode (attempt 1): Socratic only — acknowledge what the student did, ask one specific question about a mistake or gap, give one gentle nudge toward the right approach. Do NOT show a worked example. Do NOT name both methods. Let the student think first.
- In GUIDED mode (attempt 2, calculation/written only): Explain + Example — acknowledge what they tried, point out the specific gap, then: (a) explain the concept in plain everyday language with no jargon, (b) show a brief worked example using completely different numbers or context that demonstrates the method step by step, (c) explicitly ask the student to now apply that same method to their own question. Do NOT solve the student's actual question.
- In GUIDED mode (attempt 2, MCQ): Same as attempt 1 — Socratic only.
- In GUIDED mode (attempt 3+): Reveal the correct method and show the full step-by-step solution for the student's actual question.
- In PRACTICE mode: Give the full mark-by-mark evaluation and complete solution.

Attempt 2 sequence for guided mode (calculation/written):
1. Acknowledge what the student tried
2. Identify the specific gap or misconception
3. Explain the underlying concept in plain, everyday language (imagine explaining to a 14-year-old with no subject background)
4. Show a short worked example with DIFFERENT numbers/context — label it clearly (e.g. "Here is a similar example:")
5. End with a prompt like "Now use this method on your question."

CRITICAL — LANGUAGE RULES:
- Write your full response in ${language}.
- Mathematical expressions and standard notation stay as-is (e.g. H₂O, E=mc², ∑).
- Scientific and technical subject terms must stay in English — do NOT translate them. South African schools use English terminology in all languages. Examples: follicle, corpus luteum, ovulation, mitosis, photosynthesis, covalent bond, Newton's law, oxidation, equilibrium, gradient, hypothesis. If a term has a widely accepted ${language} equivalent, you may use it, but defaulting to the English term is always correct.
- Preserve the pedagogical structure exactly: acknowledge what the student got right, redirect to the gap, guide with a question or nudge. Do not add or remove information.

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
${safeMemo}

MODE: ${mode === "guided" ? "GUIDED" : "PRACTICE"}
ATTEMPT NUMBER: ${attemptCount + 1}
SHOW FULL SOLUTION: ${showFullSolution ? "YES — reveal the method and full worked solution for the student's actual question." : "NO"}
SHOW WORKED EXAMPLE: ${showWorkedExample ? "YES — explain the concept in plain language, then show a worked example with different numbers/context. Do NOT solve the student's actual question." : "NO — Socratic only: acknowledge, ask one question, give one nudge."}

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
      max_tokens: 1500,
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

    if (language !== "English" && parsed.feedback) {
      const langOk = await checkLanguage(parsed.feedback, language);
      if (!langOk) {
        const retrySystem = systemPrompt + `\n\nIMPORTANT: Your previous response was not in ${language}. Rewrite it fully in ${language}. Remember: keep scientific and technical terms in English (follicle, corpus luteum, mitosis, etc.) — only the surrounding explanation text must be in ${language}.`;
        const retryResp = await openai.chat.completions.create({
          model: "gpt-4o",
          max_tokens: 1500,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: retrySystem },
            { role: "user", content: userContent },
          ],
        });
        try {
          const retryParsed = JSON.parse(retryResp.choices[0]?.message?.content ?? "{}");
          if (retryParsed.feedback) parsed = retryParsed;
        } catch { /* keep original */ }
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[matric/evaluate] error:", err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
