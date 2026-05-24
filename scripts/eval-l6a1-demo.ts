// Demo: run the similarity-band evaluator against the REAL L6.A1 bank items.
// Run: node scripts/eval-l6a1-demo.ts   (Node 24 strips TS types natively)
//
// No OpenAI key here → lexical fallback scorer. Copy / topic-label / detail
// logic is deterministic and demonstrates regardless of scorer.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import OpenAI from "openai";
import { evaluateSimilarityBand, openAIEmbedder } from "../lib/reading-bank-evaluator.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Load .env.local exactly as Next.js would (key stays in the file, never printed).
function loadEnvLocal() {
  try {
    for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* fall back to lexical */ }
}
loadEnvLocal();

const embedder = process.env.OPENAI_API_KEY
  ? openAIEmbedder(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }))
  : undefined;
const bank = JSON.parse(readFileSync(join(root, "data/reading-question-banks/L6.json"), "utf8"));
const skill = bank.skills.find((s: { skillId: string }) => s.skillId === "L6.A1");
const textById = (id: string) => bank.texts.find((t: { id: string }) => t.id === id);

// Real student-style answers for three real items, spanning every verdict.
const cases: Record<string, { label: string; answer: string }[]> = {
  "A1.012": [
    { label: "GREEN (paraphrase)", answer: "Recycling turns old materials into new things, which cuts pollution and saves resources — you just have to sort your rubbish into the right bins." },
    { label: "AMBER (partial)",    answer: "Recycling is good because it stops pollution." },
    { label: "RED detail",         answer: "A glass bottle can be melted and made into a new bottle." },
    { label: "RED topic-label",    answer: "Recycling" },
    { label: "RED verbatim",       answer: "Landfills take up space, create pollution, and can harm the soil and nearby water." },
  ],
  "A1.001": [
    { label: "GREEN (paraphrase)", answer: "Maya's dog got out, she looked everywhere until she found him, and then made sure it could not happen again." },
    { label: "RED detail",         answer: "Mr Peters pointed toward the park." },
  ],
  "A1.014": [
    { label: "GREEN (paraphrase)", answer: "Water keeps moving around the Earth through evaporation, condensation and precipitation in a never-ending cycle." },
    { label: "RED topic-label",    answer: "The water cycle" },
  ],
};

const pad = (s: string, n: number) => (s + " ".repeat(n)).slice(0, n);
let activeScorer = "";

for (const [itemId, samples] of Object.entries(cases)) {
  const item = skill.items.find((i: { id: string }) => i.id === itemId);
  const text = textById(item.textId);
  console.log(`\n━━ ${itemId}  (${text.title}, Ctx ${item.context})`);
  console.log(`   reference: "${item.answerKey.reference}"`);
  console.log(
    `   ${pad("VERDICT", 22)}${pad("BAND", 7)}${pad("cov", 7)}${pad("copy", 7)}fired`
  );
  for (const s of samples) {
    const r = await evaluateSimilarityBand(
      {
        studentAnswer: s.answer,
        sourceText: text.body,
        reference: item.answerKey.reference,
        bands: item.answerKey.bands,
        copyRejectAt: item.answerKey.copyRejectAt,
        errorSignals: item.errorSignals,
      },
      embedder
    );
    activeScorer = r.scorer;
    console.log(
      `   ${pad(s.label, 22)}${pad(r.band, 7)}${pad(r.coverage.toFixed(2), 7)}${pad(
        r.copyScore.toFixed(2),
        7
      )}${r.firedError ?? "-"}${r.flagged ? "  (flagged)" : ""}`
    );
  }
}
console.log(`\nscorer = ${activeScorer}  (production injects OpenAI embeddings → stronger on synonyms)`);
