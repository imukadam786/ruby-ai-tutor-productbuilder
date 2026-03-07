import { NextRequest, NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/anthropic";
import { LessonPlan } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { topic, subject, level } = await req.json();

    const prompt = `Create a comprehensive lesson plan for the following:
Topic: ${topic}
Subject: ${subject}
Student Level: ${level}

Respond with a JSON object in exactly this format (no markdown, just raw JSON):
{
  "summary": "A 1-2 sentence overview of what the student will learn",
  "sections": [
    {
      "title": "Section title",
      "content": "Detailed explanation of this section. Use clear, educational language appropriate for the level.",
      "examples": ["Example 1", "Example 2"],
      "practice": "A practice problem or exercise for this section"
    }
  ]
}

Include 3-5 sections. Make the content thorough and educational. For math topics, include formulas and step-by-step examples.`;

    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content ?? "";

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse lesson plan" },
        { status: 500 }
      );
    }

    const lesson: LessonPlan = {
      id: `lesson_${Date.now()}`,
      topic,
      subject,
      level,
      sections: parsed.sections || [],
      summary: parsed.summary || "",
      createdAt: new Date().toISOString(),
      completed: false,
    };

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Lesson API error:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson" },
      { status: 500 }
    );
  }
}
