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
      questionType,
      feedbackStyle,
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
      // "full" = Past Papers section: every wrong answer gets the full
      // explanation + correct answer straight away, no Socratic hints.
      feedbackStyle?: "full";
    } = await req.json();

    const fullExplanation = feedbackStyle === "full";

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

    // Always generate the structured response in English first for maximum
    // pedagogical accuracy (content completeness, correct guiding questions,
    // no paraphrasing). If the target language is not English, the feedback
    // field is translated in a separate dedicated call below.
    const fullExplanationRules = `Your role:
- Evaluate the student's answer against the official mark scheme and award marks for each correct point
- Whenever the student loses ANY marks, give a full explanation and the correct answer straight away. Do NOT give Socratic hints, do NOT ask the student questions, do NOT hold the answer back.

FEEDBACK STYLE when marks were lost (write in plain, everyday language a Grade 12 student understands; speak to the student as "you"):
1. Say what the student chose or wrote, and what that option/idea actually means (one or two sentences). For MCQ, name the option letter and what that option really refers to.
2. Explain what the question is really asking, and name the correct concept in **bold**.
3. Give one to three simple, everyday examples a learner can picture. Every example must be textbook-accurate for CAPS Grade 12. Avoid edge cases that need special conditions to be true (e.g. orbits, circular motion, frictionless surfaces, objects at rest when the question is about motion). If unsure about an example, leave it out. For calculations, show the method briefly instead of examples.
4. MCQ only: if a wrong option is the direct opposite or paired term of the correct answer (e.g. exogenous/endogenous, mitosis/meiosis, debit/credit, inflation/deflation, dominant/recessive), you MUST add one short "Watch out for option X: ..." sentence explaining the difference. If no option is a paired term, skip this step. Never warn about an unrelated option.
5. End with the correct answer on its own line:
   - MCQ: "**Correct answer: <letter>, <option text>**"
   - Match-group: "**Correct answers:**" then one line per row, e.g. "1.2.1: D"
   - Calculation: the full step-by-step solution, then "**Correct answer: <final answer with units>**"
   - Written/explain/essay: "**Model answer:**" then the points that earn the marks, in your own words (one short line each)

Keep it short: steps 1 to 4 together should be about 4 to 6 sentences. Use bold only for the key terms and the answer line. Never use em dashes.
ACCURACY: every fact you state must agree with the mark scheme and standard CAPS content. If you are not sure a claim is true, leave it out. Do not describe a wrong option inaccurately.
Do NOT start with "Not quite", "Incorrect" or a heading (the app already shows one).

When the answer is fully correct: one or two sentences confirming why it is right. No answer line needed.`;

    const guidedRules = `Your role:
- Evaluate the student's working step by step against the official mark scheme
- Award marks for each correct step
- Give targeted feedback in English
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
5. End with a prompt like "Now use this method on your question."`;

    const systemPrompt = `You are Ruby, an AI exam coach helping a Grade 12 student work through a South African National Senior Certificate (NSC/Matric) past paper.

${fullExplanation ? fullExplanationRules : guidedRules}

RESPONSE FORMAT — you must return valid JSON only, no markdown wrapper:
{
  "marksEarned": <number>,
  "totalMarks": <number>,
  "allCorrect": <boolean>,
  "feedback": "<your feedback as a markdown string — use \\n for newlines, escape any quotes>",
  "breakdown": [
    { "point": "<short description of this mark from the scheme>", "maxMarks": <number>, "awarded": <number>, "status": "correct" | "partial" | "missed", "note": "<one short sentence on what the student did / why the mark was lost — empty string if fully correct>" }
  ]
}

BREAKDOWN RULES:
- Itemise the mark scheme into one entry per mark (or per logical mark-group, e.g. "numerator (2)"). Award marks point by point against the student's working.
- "status" is "correct" when awarded === maxMarks, "partial" when 0 < awarded < maxMarks, "missed" when awarded === 0.
- The awarded values across all breakdown entries MUST sum to "marksEarned", and the maxMarks values MUST sum to "totalMarks".
- Keep each "note" to one short, plain-language sentence. Leave it as an empty string for fully-correct points.${fullExplanation ? `
- Write each "point" and "note" speaking to the student as "you" (e.g. "You picked the monetarist approach, which is about money supply, not forces inside the market."). Never write "the student".` : ""}
- For MCQ / match-group questions, a single breakdown entry covering the whole answer is fine.

The feedback field must be a single-line JSON string (escape newlines as \\n).`;

    const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [];

    const promptText = `QUESTION ${questionLabel}:
${questionText}

OFFICIAL MARK SCHEME (confidential — do not reproduce verbatim to student):
${safeMemo}

${fullExplanation ? `QUESTION TYPE: ${questionType ?? "written"}
FEEDBACK: FULL EXPLANATION — if any marks are lost, explain fully and give the correct answer.` : `MODE: ${mode === "guided" ? "GUIDED" : "PRACTICE"}
ATTEMPT NUMBER: ${attemptCount + 1}
SHOW FULL SOLUTION: ${showFullSolution ? "YES — reveal the method and full worked solution for the student's actual question." : "NO"}
SHOW WORKED EXAMPLE: ${showWorkedExample ? "YES — explain the concept in plain language, then show a worked example with different numbers/context. Do NOT solve the student's actual question." : "NO — Socratic only: acknowledge, ask one question, give one nudge."}`}

STUDENT'S WORKING:
${studentText || "(No text provided — see image below)"}

Evaluate the student's working against the mark scheme. Award marks for each correct step. Respond in English.`;

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
      // Low temperature for consistent marking — the same answer should score the
      // same on resubmit. The per-mark breakdown reinforces this by forcing the
      // model to justify each mark rather than eyeball a total.
      temperature: 0.2,
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
      breakdown?: {
        point: string;
        maxMarks: number;
        awarded: number;
        status: "correct" | "partial" | "missed";
        note?: string;
      }[];
    };

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { marksEarned: 0, totalMarks: 0, allCorrect: false, feedback: raw };
    }

    // Keep the answer line on its own paragraph, the model sometimes runs it on.
    if (fullExplanation && parsed.feedback) {
      parsed.feedback = parsed.feedback.replace(
        /\s*(\*\*(?:Correct answers?|Model answer):?)/g,
        "\n\n$1"
      ).trim();
    }

    if (language !== "English" && parsed.feedback) {
      const translationResp = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: `You are a faithful translator for South African educational content. Translate the following English tutoring feedback into ${language}.

TRANSLATION RULES — follow these exactly:
1. Translate every sentence faithfully — do not paraphrase, shorten, or omit anything. Every hint, named term, and guiding question in the English must appear in your translation.
2. Keep ALL scientific, technical, and anatomical terms in plain English — do not translate them, do not add noun-class prefixes, do not attempt a target-language equivalent. Use the English word as-is (e.g. follicle, corpus luteum, ovulation, ovary, mitosis, photosynthesis, covalent bond, gradient, hypothesis).
3. The final guiding question is the most critical sentence — translate it exactly so the student is asked the same thing, not a related but different question.
4. Mathematical notation and expressions stay as-is.
5. Do not add any sentences, clauses, or elaborations not present in the original English. Every sentence you write must correspond directly to a sentence in the source.
6. Return only the translated text, no preamble or explanation.`,
          },
          {
            role: "user",
            content: parsed.feedback,
          },
        ],
      });
      const translated = translationResp.choices[0]?.message?.content?.trim();
      if (translated) parsed.feedback = translated;
    }

    // Translate the per-mark breakdown labels/notes too, so the whole card reads
    // in-language. Kept as a separate best-effort call: if it fails or comes back
    // malformed, the English breakdown still shows under the already-translated
    // feedback rather than failing the whole grade.
    if (language !== "English" && parsed.breakdown && parsed.breakdown.length > 0) {
      // Flatten to [point, note, point, note, …] so order maps back deterministically.
      const strings: string[] = [];
      for (const b of parsed.breakdown) {
        strings.push(b.point ?? "");
        strings.push(b.note ?? "");
      }
      try {
        const breakdownResp = await openai.chat.completions.create({
          model: "gpt-4o",
          max_tokens: 1500,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a faithful translator for South African educational content. Translate each English string in the "items" array into ${language}.

TRANSLATION RULES — follow these exactly:
1. Translate each string faithfully — do not paraphrase, shorten, omit, or merge entries.
2. Keep ALL scientific, technical, financial and mathematical terms, numbers, currency amounts, units and notation in plain English / as-is (e.g. Numerator, Denominator, R450 000, 15 500 units, gradient, mitosis).
3. Preserve the array length and order exactly — the Nth output corresponds to the Nth input. Translate an empty string to an empty string.
4. Return ONLY valid JSON of the form {"items": ["<translated>", …]} with exactly the same number of items.`,
            },
            { role: "user", content: JSON.stringify({ items: strings }) },
          ],
        });
        const breakdownRaw = breakdownResp.choices[0]?.message?.content ?? "{}";
        const breakdownParsed = JSON.parse(breakdownRaw) as { items?: string[] };
        const out = breakdownParsed.items;
        if (Array.isArray(out) && out.length === strings.length) {
          parsed.breakdown = parsed.breakdown.map((b, i) => ({
            ...b,
            point: out[i * 2]?.trim() || b.point,
            note: out[i * 2 + 1]?.trim() || b.note,
          }));
        }
      } catch (e) {
        console.error("[matric/evaluate] breakdown translation failed:", e);
        // Non-fatal — leave the English breakdown in place.
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[matric/evaluate] error:", err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
