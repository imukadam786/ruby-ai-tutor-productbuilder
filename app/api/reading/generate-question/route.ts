import { NextRequest, NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/anthropic";
import { getReadingSkillById } from "@/lib/reading-student-model";
import { ReadingTemplate, ReadingGeneratedQuestion } from "@/types/reading";

export async function POST(req: NextRequest) {
  try {
    const {
      skill_id,
      template,
      attempt_number = 1,
      include_hint = false,
    }: {
      skill_id: string;
      template: ReadingTemplate;
      attempt_number?: number;
      include_hint?: boolean;
    } = await req.json();

    const skill = getReadingSkillById(skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const templateDescriptions: Record<ReadingTemplate, string> = {
      oral: "An oral/spoken task — the student responds verbally or types what they would say out loud. Focus on speaking, listening, or sound production.",
      listening: "A listening comprehension task — present a short passage or instructions and ask the student to respond based on what they heard/read.",
      written: "A written response task — the student writes a word, sentence, or short answer. Focus on spelling, encoding, or written expression.",
      reading: "A reading decoding/fluency task — the student reads a word, sentence, or short passage and answers a question about it.",
    };

    const levelHint =
      attempt_number > 1
        ? `This is attempt ${attempt_number}. Make the question a different context from the previous one.`
        : "";

    const prompt = `You are Ruby, a literacy question generator for the Ruby AI Tutor reading engine.

Generate ONE question for this reading/literacy skill:

SKILL ID: ${skill_id}
SKILL TITLE: ${skill.title}
SKILL DESCRIPTION: ${skill.description}

QUESTION FORMAT: ${template}
Format description: ${templateDescriptions[template]}

${levelHint}

${include_hint ? "Include a scaffolding hint that guides the student without giving away the answer." : "Do not include a hint."}

Respond in this exact JSON format (no markdown, raw JSON only):
{
  "question": "The complete question or task, clearly worded for a primary school student",
  "expected_answer": "The ideal correct response from the student",
  "hint": ${include_hint ? '"A scaffolding hint that guides without revealing the answer"' : "null"},
  "scaffolding_notes": "Brief note about common errors to watch for with this question"
}

Important:
- Keep language simple and age-appropriate (Grade R–3)
- The task must be achievable in a short session
- expected_answer must be precise
- Match difficulty exactly to the skill level`;

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
      return NextResponse.json({ error: "Failed to parse question" }, { status: 500 });
    }

    const question: ReadingGeneratedQuestion = {
      id: `rq_${Date.now()}`,
      skill_id,
      template,
      question: parsed.question,
      hint: parsed.hint || undefined,
      expected_answer: parsed.expected_answer,
      scaffolding_notes: parsed.scaffolding_notes || "",
    };

    return NextResponse.json(question);
  } catch (error) {
    console.error("Reading generate-question error:", error);
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 });
  }
}
