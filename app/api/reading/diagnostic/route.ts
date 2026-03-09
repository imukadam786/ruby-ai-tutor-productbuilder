import { NextRequest, NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/anthropic";

const TASK_DEFINITIONS: Record<string, { description: string; mode: "voice" | "text" | "tap" }> = {
  D01: {
    description: `Tell the student: 'I'll say two words. Tell me if they rhyme (sound the same at the end): cat / hat — do they rhyme?' Give 3 rhyme pairs and 3 syllable tasks`,
    mode: "voice",
  },
  D02: {
    description: `Show word, ask 'What is the FIRST sound in [word]?' (onset) and 'What is the LAST sound?' (coda)`,
    mode: "voice",
  },
  D03: {
    description: `Show letter on screen. Ask student to say the SOUND (not name) for: b, f, g, h, j, k, l, m, n, p, r, s, t, v, w`,
    mode: "voice",
  },
  D04: {
    description: `Show vowel. Ask student to say the SHORT vowel sound: a, e, i, o, u`,
    mode: "voice",
  },
  D05: {
    description: `Ask student to read these words aloud: map, sit, hop, fun, wet`,
    mode: "voice",
  },
  D06: {
    description: `Ask student to TYPE what they hear (nonsense CVC words): bim, fot, nup`,
    mode: "text",
  },
  D07: {
    description: `Show digraph. Ask student to say the ONE sound it makes: sh, ch, th, wh, ph, ng`,
    mode: "voice",
  },
  D08: {
    description: `Ask student to read: blan, grift, slop, crump, swind`,
    mode: "voice",
  },
  D09: {
    description: `Ask student to read: cake, bike, note, tune (silent-e words)`,
    mode: "voice",
  },
  D10: {
    description: `Ask student to read vowel team words: rain, feet, boat, play`,
    mode: "voice",
  },
  D11: {
    description: `Flash these words for 1.5s each: the, said, was, are, have, come, some, what, they, where`,
    mode: "voice",
  },
  D12: {
    description: `Ask student to read: bird, corn, hurt, farm, her`,
    mode: "voice",
  },
  D13: {
    description: `Ask student to read two-syllable words: rabbit, sunset, kitten, garden`,
    mode: "voice",
  },
  D14: {
    description: `Ask student to read: umbrella, fantastic, September`,
    mode: "voice",
  },
  D15: {
    description: `Show: unhappy, replay, careful, singer. Ask student to tap/identify the prefix or suffix`,
    mode: "tap",
  },
  D16: {
    description: `Ask student to read a short 50-word passage aloud`,
    mode: "voice",
  },
  D17: {
    description: `After passage: ask 3 literal questions about what was explicitly stated`,
    mode: "tap",
  },
  D18: {
    description: `Ask 2 inference questions requiring reasoning beyond the text`,
    mode: "tap",
  },
};

const TASK_ITEMS: Record<string, string[]> = {
  D01: ["cat/hat (rhyme?)", "dog/log (rhyme?)", "sun/fun (rhyme?)", "clap your hands for each syllable in 'butterfly'", "tap for each syllable in 'rainbow'", "how many syllables in 'elephant'?"],
  D02: ["What is the FIRST sound in 'bat'?", "What is the LAST sound in 'bat'?", "What is the FIRST sound in 'map'?", "What is the LAST sound in 'ship'?", "What is the FIRST sound in 'dog'?", "What is the LAST sound in 'fun'?"],
  D03: ["b", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w"],
  D04: ["a", "e", "i", "o", "u"],
  D05: ["map", "sit", "hop", "fun", "wet"],
  D06: ["bim", "fot", "nup"],
  D07: ["sh", "ch", "th", "wh", "ng"],
  D08: ["blan", "grift", "slop", "crump", "swind"],
  D09: ["cake", "bike", "note", "tune"],
  D10: ["rain", "feet", "boat", "play"],
  D11: ["the", "said", "was", "are", "have", "come", "some", "what", "they", "where"],
  D12: ["bird", "corn", "hurt", "farm", "her"],
  D13: ["rabbit", "sunset", "kitten", "garden"],
  D14: ["umbrella", "fantastic", "September"],
  D15: ["unhappy → un-", "replay → re-", "careful → -ful", "singer → -er"],
  D16: ["The big red dog ran fast down the old dirt road. He saw a bird fly up high in the blue sky. The dog jumped up but the bird was too fast. He sat down and looked at the clouds. It was a good day to be a dog."],
  D17: ["What colour was the dog?", "What did the dog see in the sky?", "What did the dog try to do?"],
  D18: ["How do you think the dog felt when the bird flew away?", "Why do you think the dog sat down and looked at the clouds?"],
};

export async function POST(req: NextRequest) {
  try {
    const { taskId, studentName, context } = await req.json() as {
      taskId: string;
      studentName: string;
      context?: string;
    };

    const taskDef = TASK_DEFINITIONS[taskId];
    if (!taskDef) {
      return NextResponse.json({ error: `Unknown taskId: ${taskId}` }, { status: 400 });
    }

    const items = TASK_ITEMS[taskId] ?? [];

    const prompt = `You are a friendly reading tutor for children (ages 5-9). Generate a clear, warm, child-appropriate question/prompt for this diagnostic task.

Task ID: ${taskId}
Task Description: ${taskDef.description}
Student Name: ${studentName}
${context ? `Context: ${context}` : ""}

Generate the task prompt in this exact JSON format (raw JSON, no markdown):
{
  "question": "The main question or instruction to show the student (1-2 sentences, warm and encouraging)",
  "instructions": "Brief instructions for the student on how to respond (1 sentence)"
}

Keep language very simple and encouraging. Address the student by name if it helps. Do not say 'correct' or 'wrong' in the prompt.`;

    const aiResponse = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const aiText = aiResponse.choices[0]?.message?.content ?? "";

    let parsed: { question: string; instructions: string };
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
    } catch {
      parsed = {
        question: `Let's try a reading activity! ${taskDef.description}`,
        instructions: taskDef.mode === "voice" ? "Say your answer aloud." : taskDef.mode === "text" ? "Type your answer below." : "Choose your answer.",
      };
    }

    return NextResponse.json({
      taskId,
      question: parsed.question,
      instructions: parsed.instructions,
      mode: taskDef.mode,
      items,
    });
  } catch (error) {
    console.error("Diagnostic route error:", error);
    return NextResponse.json({ error: "Failed to generate diagnostic question" }, { status: 500 });
  }
}
