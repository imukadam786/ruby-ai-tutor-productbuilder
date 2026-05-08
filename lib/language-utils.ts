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
