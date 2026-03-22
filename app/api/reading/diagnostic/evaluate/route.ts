import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL } from "@/lib/anthropic";
import { ReadingErrorType } from "@/types/reading";

const TASK_MASTERY_THRESHOLDS: Record<string, number> = {
  D01: 0.7,
  D02: 0.7,
  D03: 0.7,
  D04: 0.8,
  D05: 0.8,
  D06: 0.8,
  D07: 0.7,
  D08: 0.7,
  D09: 0.7,
  D10: 0.7,
  D11: 0.7,
  D12: 0.7,
  D13: 0.7,
  D14: 0.7,
  D15: 0.7,
  D16: 0.7,
  D17: 0.7,
  D18: 0.7,
};

export async function POST(req: NextRequest) {
  try {
    const { taskId, response, items } = await req.json() as {
      taskId: string;
      response: string;
      items?: string[];
    };

    if (!response || !response.trim()) {
      return NextResponse.json({
        correct: false,
        score: 0,
        errorType: "ERR_SOUND_RECALL" as ReadingErrorType,
      });
    }

    const threshold = TASK_MASTERY_THRESHOLDS[taskId] ?? 0.7;
    const itemsList = items?.join(", ") ?? "";

    const prompt = `You are an expert literacy diagnostician evaluating a child's reading response.

Task ID: ${taskId}
Items tested: ${itemsList}
Student's response: "${response}"

Evaluate whether the student demonstrates mastery of this task. Consider:
- Accuracy of phoneme production, decoding, or comprehension
- Whether errors are minor (acceptable) or indicate a genuine gap
- For voice tasks, transcription may be imperfect — be generous with near-correct responses

Respond in this exact JSON format (raw JSON only, no markdown):
{
  "correct": true or false,
  "score": 0.0 to 1.0 (estimated proportion correct),
  "errorType": one of: "ERR_PHONEME_CONF", "ERR_SOUND_RECALL", "ERR_BLEND_FAIL", "ERR_SOUND_OMIT", "ERR_SOUND_INSERT", "ERR_VOWEL_CONF", "ERR_ORTHO_GUESS", "ERR_SIGHT_MISS", "ERR_MULTI_BREAK", "ERR_FLUENCY_HES", "ERR_MEANING_BLIND", "ERR_SELF_MON", or "correct",
  "notes": "brief explanation of evaluation"
}

Set "correct" to true if score >= ${threshold}. Use "correct" as errorType when the student succeeds.`;

    const aiResponse = await getOpenAI().chat.completions.create({
      model: OPENAI_MODEL,
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const aiText = aiResponse.choices[0]?.message?.content ?? "";

    let parsed: { correct: boolean; score: number; errorType: string; notes?: string };
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
    } catch {
      // Fallback: try to detect correctness from response length/content
      const looksCorrect = response.trim().length > 2;
      parsed = {
        correct: looksCorrect,
        score: looksCorrect ? 0.75 : 0.3,
        errorType: looksCorrect ? "correct" : "ERR_SOUND_RECALL",
      };
    }

    const validErrorTypes: ReadingErrorType[] = [
      "ERR_PHONEME_CONF", "ERR_SOUND_RECALL", "ERR_BLEND_FAIL", "ERR_SOUND_OMIT",
      "ERR_SOUND_INSERT", "ERR_VOWEL_CONF", "ERR_ORTHO_GUESS", "ERR_SIGHT_MISS",
      "ERR_MULTI_BREAK", "ERR_FLUENCY_HES", "ERR_MEANING_BLIND", "ERR_SELF_MON", "correct",
    ];

    const errorType: ReadingErrorType = validErrorTypes.includes(parsed.errorType as ReadingErrorType)
      ? (parsed.errorType as ReadingErrorType)
      : parsed.correct ? "correct" : "ERR_SOUND_RECALL";

    return NextResponse.json({
      correct: parsed.correct,
      score: Math.max(0, Math.min(1, parsed.score ?? (parsed.correct ? 0.85 : 0.3))),
      errorType,
    });
  } catch (error) {
    console.error("Diagnostic evaluate error:", error);
    return NextResponse.json({ error: "Failed to evaluate response" }, { status: 500 });
  }
}
