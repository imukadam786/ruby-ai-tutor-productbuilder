import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const { strings, targetLanguage } = await req.json();

    const prompt = `You are a professional translator for an educational app used by children. Translate the following UI strings from English to ${targetLanguage}.

CRITICAL RULES:
- Keep {placeholders} like {name} exactly as-is, unchanged
- Keep numbers and symbols unchanged
- Return ONLY a valid JSON object with the exact same keys mapped to translated values
- No markdown code fences, no explanation, just raw JSON
- Use natural, age-appropriate language for children

Strings to translate:
${JSON.stringify(strings, null, 2)}`;

    const response = await getOpenAI().chat.completions.create({
      model: OPENAI_MODEL,
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const translations = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
