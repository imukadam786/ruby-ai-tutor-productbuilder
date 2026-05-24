import { getOpenAI } from "@/lib/anthropic";

const ALIASES: Record<string, string[]> = {
  afrikaans: ["afrikaans"],
  isixhosa: ["xhosa", "isixhosa"],
  isizulu: ["zulu", "isizulu"],
  sepedi: ["sepedi", "pedi", "northern sotho"],
  sesotho: ["sesotho", "sotho"],
  setswana: ["setswana", "tswana"],
  siswati: ["swati", "siswati", "swazi"],
  tshivenda: ["venda", "tshivenda"],
  xitsonga: ["tsonga", "xitsonga"],
  isindebele: ["ndebele", "isindebele"],
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function languageMatches(detected: string, expected: string): boolean {
  const d = normalize(detected);
  const e = normalize(expected);
  if (d.includes(e) || e.includes(d)) return true;
  return (ALIASES[e] ?? []).some(a => d.includes(a));
}

/**
 * Checks whether `text` is actually written in `expected` language.
 * Returns true when correct, or when detection is inconclusive (err on pass).
 * Only makes an API call when language !== "English".
 */
export async function checkLanguage(text: string, expected: string): Promise<boolean> {
  if (expected === "English" || !text.trim()) return true;
  try {
    const resp = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 15,
      temperature: 0,
      messages: [{
        role: "user",
        content: `What language is this text written in? Reply with only the language name in English, nothing else.\n\n"${text.slice(0, 200)}"`,
      }],
    }, { signal: AbortSignal.timeout(5_000) });
    const detected = (resp.choices[0]?.message?.content ?? "").trim().toLowerCase();
    if (!detected) return true;
    return languageMatches(detected, expected);
  } catch {
    return true;
  }
}

/**
 * Translates student-facing feedback into `language` for a primary-school
 * child, in one small model call. Returns the originals unchanged when the
 * language is English, both strings are empty, or translation fails — we
 * never block a marking result on a translation hiccup, and English is the
 * safe fallback (same err-on-pass philosophy as checkLanguage).
 */
export async function localiseFeedback(
  fields: { feedback: string; recovery?: string },
  language: string
): Promise<{ feedback: string; recovery: string }> {
  const feedback = fields.feedback ?? "";
  const recovery = fields.recovery ?? "";
  if (language === "English" || (!feedback.trim() && !recovery.trim())) {
    return { feedback, recovery };
  }
  try {
    const resp = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [{
        role: "user",
        content:
          `Translate the string values of this JSON into ${language} for a ` +
          `primary-school child. Keep the meaning and the warm, encouraging ` +
          `tone. Translate ONLY the values; keep the keys exactly as they are. ` +
          `Return ONLY the JSON.\n\n` +
          JSON.stringify({ feedback, recovery }),
      }],
    }, { signal: AbortSignal.timeout(10_000) });
    const raw = resp.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { feedback?: string; recovery?: string };
    return {
      feedback: parsed.feedback || feedback,
      recovery: parsed.recovery || recovery,
    };
  } catch {
    return { feedback, recovery };
  }
}
