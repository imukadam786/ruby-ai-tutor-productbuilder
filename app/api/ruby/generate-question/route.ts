import { NextRequest, NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/anthropic";
import { getSkillById } from "@/lib/student-model";
import { QuestionTemplate, GeneratedQuestion } from "@/types/ruby";

export async function POST(req: NextRequest) {
  try {
    const {
      skill_id,
      template,
      attempt_number = 1,
      include_hint = false,
    }: {
      skill_id: string;
      template: QuestionTemplate;
      attempt_number?: number;
      include_hint?: boolean;
    } = await req.json();

    const skill = getSkillById(skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const templateDescriptions: Record<QuestionTemplate, string> = {
      concrete:
        "Use physical/visual objects — diagrams, counters, shapes, or pictures. The student interacts with something tangible.",
      story:
        "A real-world word problem with a clear context (e.g. shops, sports, cooking, travel). Include all needed numbers. Ask a clear question.",
      symbolic:
        "A purely mathematical expression, equation, or number problem with no context. Clean and direct.",
    };

    const levelHint =
      attempt_number > 1
        ? `This is attempt ${attempt_number} for this student. Make the question a different context from the previous attempt.`
        : "";

    const prompt = `You are Ruby, a math question generator for the Ruby AI Tutor system.

Generate ONE question for this skill:

SKILL ID: ${skill_id}
SKILL TITLE: ${skill.title}
SKILL DESCRIPTION: ${skill.description}

QUESTION FORMAT: ${template}
Format description: ${templateDescriptions[template]}

${levelHint}

${include_hint ? "Include a scaffolding hint that guides without giving away the answer." : "Do not include a hint."}

Respond in this exact JSON format (no markdown, raw JSON only):
{
  "question": "The complete question text, clearly worded for a student",
  "expected_answer": "The exact correct answer as a student should write it",
  "hint": ${include_hint ? '"A scaffolding hint that guides without revealing the answer"' : "null"},
  "scaffolding_notes": "Brief note for the tutor about common errors to watch for with this question"
}

Important:
- The question must be solvable with pencil and paper
- expected_answer must be precise and unambiguous
- Match the difficulty to the skill level (not too easy, not beyond the skill)`;

    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content ?? "";

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse question" },
        { status: 500 }
      );
    }

    const question: GeneratedQuestion = {
      id: `q_${Date.now()}`,
      skill_id,
      template,
      question: parsed.question,
      hint: parsed.hint || undefined,
      expected_answer: parsed.expected_answer,
      scaffolding_notes: parsed.scaffolding_notes || "",
    };

    return NextResponse.json(question);
  } catch (error) {
    console.error("Generate question error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
