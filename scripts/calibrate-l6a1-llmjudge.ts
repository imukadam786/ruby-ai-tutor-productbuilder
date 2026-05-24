// LLM-judge calibration — same 30 human-labelled answers as the embedding test.
// Apples-to-apples: confusion matrix + accuracy vs your labels, compared to the
// embedding baseline (best 73%, bands entangled).
// Run: node scripts/calibrate-l6a1-llmjudge.ts   (loads .env.local)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import OpenAI from "openai";
import { openAIJudge } from "../lib/reading-llm-judge.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
if (!process.env.OPENAI_API_KEY) { console.error("no OPENAI_API_KEY in .env.local"); process.exit(1); }

const bank = JSON.parse(readFileSync(join(root, "data/reading-question-banks/L6.json"), "utf8"));
const fixture = JSON.parse(readFileSync(join(root, "scripts/calibration/L6.A1-set.json"), "utf8"));
const a1 = bank.skills.find((s: { skillId: string }) => s.skillId === "L6.A1");
const item = (id: string) => a1.items.find((i: { id: string }) => i.id === id);
const text = (tid: string) => bank.texts.find((t: { id: string }) => t.id === tid);

const judge = openAIJudge(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
type L = "G" | "A" | "R";
const toL = (b: string): L => (b === "GREEN" ? "G" : b === "AMBER" ? "A" : "R");

const M: Record<L, Record<L, number>> = {
  G: { G: 0, A: 0, R: 0 }, A: { G: 0, A: 0, R: 0 }, R: { G: 0, A: 0, R: 0 },
};
let correct = 0, falsePass = 0, falseFail = 0;
const disagree: string[] = [];

for (const s of fixture.samples) {
  const it = item(s.ref);
  const t = text(it.textId);
  const r = await judge({
    studentAnswer: s.answer,
    sourceText: t.body,
    referenceMainIdea: it.answerKey.reference,
  });
  const pred = toL(r.band);
  const truth = s.label as L;
  M[truth][pred]++;
  if (pred === truth) correct++;
  const truePass = truth === "G" || truth === "A";
  const predPass = pred === "G" || pred === "A";
  if (!truePass && predPass) falsePass++;
  if (truePass && !predPass) falseFail++;
  if (pred !== truth)
    disagree.push(
      `  #${String(s.n).padStart(2)} ${s.ref}  you=${truth} judge=${pred}` +
      `${r.firedError ? " [" + r.firedError + "]" : ""}  "${s.answer.slice(0, 52)}${s.answer.length > 52 ? "…" : ""}"  — ${r.reason}`
    );
}

const n = fixture.samples.length;
console.log(`\nLLM-judge (gpt-4o-mini) vs your ${n} labels`);
console.log(`accuracy = ${((correct / n) * 100).toFixed(0)}%   (embedding best was 73%)`);
console.log(`falsePass (fail→pass) = ${falsePass}   falseFail (good→reject) = ${falseFail}`);
console.log("\nConfusion (rows = your label, cols = judge):");
console.log("        judgeG judgeA judgeR");
for (const tr of ["G", "A", "R"] as L[])
  console.log(`  ${tr}     ${String(M[tr].G).padStart(5)} ${String(M[tr].A).padStart(5)} ${String(M[tr].R).padStart(5)}`);
console.log(`\nDisagreements (${disagree.length}/${n}):`);
console.log(disagree.join("\n") || "  none");
