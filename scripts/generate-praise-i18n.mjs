// Pre-translates the correct-answer praise pools into every supported language,
// ONCE, so the app never pays for an LLM call on a correct answer (it just looks
// the praise up in data/praise-i18n.json). Wrong-answer feedback is still
// translated live by lib/language-utils.ts#localiseFeedback.
//
//   node --env-file=.env.local scripts/generate-praise-i18n.mjs
//
// Re-run to refresh / add a language. English is written verbatim (no API call).
// Source of truth for the English pools lives here.

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

// English praise pools (must match the tiers lib/praise.ts selects by).
const PRAISE_EN = {
  early: [
    "Amazing! You got it! ⭐",
    "Brilliant work! That's exactly right! 🌟",
    "Yes! You did it! Keep going! ⭐",
    "Fantastic! That's correct! 🎉",
    "Superstar! Well done! ⭐",
  ],
  mid: [
    "Correct! Good thinking.",
    "Well done — that's right.",
    "Spot on. Keep it up.",
    "Nice work. That's exactly it.",
    "Correct. Good approach.",
  ],
  senior: [
    "Correct.",
    "Right answer.",
    "That's it.",
    "Exactly right.",
    "Correct — well done.",
  ],
  senior_hard: [
    "Correct — that one takes real understanding.",
    "Right. That's a genuinely challenging skill.",
    "Exactly right. Not an easy question.",
    "Correct — good work on a hard one.",
  ],
};

// Non-English languages offered in the picker (components/SettingsView.tsx).
const LANGUAGES = [
  "Afrikaans", "Arabic", "French", "German",
  "isiNdebele", "isiXhosa", "isiZulu", "Sepedi", "Sesotho",
  "Setswana", "siSwati", "Tshivenda", "Xitsonga", "Spanish",
];

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY not set. Run with: node --env-file=.env.local scripts/generate-praise-i18n.mjs");
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function translatePools(language) {
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [{
      role: "user",
      content:
        `Translate the string values of this JSON into ${language} for a primary-school child. ` +
        `These are short "correct answer" praise messages — keep the warm, encouraging tone and ` +
        `keep any emoji exactly where they are. Translate ONLY the values; keep the keys and the ` +
        `array structure exactly as they are. Return ONLY the JSON.\n\n` +
        JSON.stringify(PRAISE_EN),
    }],
  }, { signal: AbortSignal.timeout(30_000) });
  const parsed = JSON.parse(resp.choices[0]?.message?.content ?? "{}");
  // Validate shape — fall back to English for any tier the model mangled.
  const out = {};
  for (const tier of Object.keys(PRAISE_EN)) {
    const arr = parsed[tier];
    out[tier] = Array.isArray(arr) && arr.length === PRAISE_EN[tier].length && arr.every((s) => typeof s === "string" && s.trim())
      ? arr
      : PRAISE_EN[tier];
  }
  return out;
}

const result = { English: PRAISE_EN };
for (const lang of LANGUAGES) {
  try {
    result[lang] = await translatePools(lang);
    const usedFallback = Object.keys(PRAISE_EN).some((t) => result[lang][t] === PRAISE_EN[t]);
    console.log(`${lang}: ok${usedFallback ? " (some tiers fell back to English)" : ""}`);
  } catch (e) {
    result[lang] = PRAISE_EN;
    console.log(`${lang}: FAILED (${e.message}) — fell back to English`);
  }
}

const outPath = path.join(process.cwd(), "data", "praise-i18n.json");
fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n");
console.log(`\nWrote ${outPath} (${Object.keys(result).length} languages)`);
