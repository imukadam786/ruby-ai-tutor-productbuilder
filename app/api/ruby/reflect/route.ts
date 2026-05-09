import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL } from "@/lib/anthropic";
import { getSkillById } from "@/lib/student-model";

export async function POST(req: NextRequest) {
  try {
    const {
      skill_id,
      question,
      student_answer,
      expected_answer,
      reflection_choice,
      language,
    }: {
      skill_id: string;
      question: string;
      student_answer: string;
      expected_answer: string;
      reflection_choice: string;
      language?: string;
    } = await req.json();

    const skill = getSkillById(skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const langInstruction =
      language && language !== "English"
        ? `Respond in ${language}.`
        : "";

    const reflectionContext: Record<string, string> = {
      "didn't understand":
        "The student didn't understand what the question was asking. Focus on clarifying the concept and what the question is asking before re-teaching the method.",
      "calculation mistake":
        "The student knew the method but made a calculation error. This should not reach the LLM — handled client-side.",
      "got lost partway":
        "The student started correctly but got lost mid-way through. Identify likely where they went wrong and re-teach from that step only.",
      guessed:
        "The student guessed without understanding. Re-teach from the beginning, step by step, without overwhelming them.",
    };

    const reflectionGuidance =
      reflectionContext[reflection_choice] ??
      "The student was not sure what went wrong. Diagnose carefully and re-teach with empathy.";

    const prompt = `You are Ruby, a warm and precise maths tutor for school students. ${langInstruction}

A student answered a question incorrectly and told you how they felt about it.

SKILL: ${skill.title}
QUESTION: ${question}
STUDENT ANSWER: ${student_answer}
CORRECT ANSWER: ${expected_answer}
STUDENT REFLECTION: "${reflection_choice}"

GUIDANCE: ${reflectionGuidance}

SKILL RECOVERY STRATEGY: ${skill.recovery_strategy}

Write a short, warm re-teaching response (2–4 sentences) that:
- Acknowledges the student's reflection without judgement
- Directly addresses what went wrong based on their answer and reflection
- Uses the actual numbers from this question
- Ends with one clear thing they should try differently

Do not use bullet points. Do not be generic. Respond in plain conversational text only — no JSON.`;

    const openai = getOpenAI();
    const response = await openai.chat.completions.create(
      {
        model: OPENAI_MODEL,
        max_tokens: 256,
        messages: [{ role: "user", content: prompt }],
      },
      { signal: AbortSignal.timeout(15_000) }
    );

    const reteaching =
      response.choices[0]?.message?.content?.trim() ??
      skill.recovery_strategy;

    return NextResponse.json({ reteaching });
  } catch (error) {
    console.error("[reflect] error:", error);
    return NextResponse.json(
      { error: "Failed to generate reflection response" },
      { status: 500 }
    );
  }
}
