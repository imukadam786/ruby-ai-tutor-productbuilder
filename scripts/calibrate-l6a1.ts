// Calibrate L6.A1 similarity-band thresholds against human-labelled answers.
// Run: node scripts/calibrate-l6a1.ts   (loads .env.local for the OpenAI key)
//
// Embeds each answer ONCE, then sweeps green/amber purely. Reports the
// thresholds that best match the human labels, a confusion matrix, and every
// disagreement (incl. structural ones no threshold can fix).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import OpenAI from "openai";
import {
  scoreSimilarity,
  classifyBand,
  openAIEmbedder,
  type SimilarityScores,
} from "../lib/reading-bank-evaluator.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
function loadEnvLocal() {
  try {
    for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* lexical fallback */ }
}
loadEnvLocal();
const embedder = process.env.OPENAI_API_KEY
  ? openAIEmbedder(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }))
  : undefined;

const bank = JSON.parse(readFileSync(join(root, "data/reading-question-banks/L6.json"), "utf8"));
const fixture = JSON.parse(
  readFileSync(join(root, "scripts/calibration/L6.A1-set.json"), "utf8")
);
const skill = bank.skills.find((s: { skillId: string }) => s.skillId === "L6.A1");
const itemById = (id: string) =>
  skill.items.find((i: { id: string }) => i.id === id);
const textById = (id: string) =>
  bank.texts.find((t: { id: string }) => t.id === id);

type Letter = "G" | "A" | "R";
const toLetter = (band: string): Letter =>
  band === "GREEN" ? "G" : band === "AMBER" ? "A" : "R";

// 1. Score every sample once.
type Scored = {
  n: number; ref: string; answer: string; label: Letter;
  scores: SimilarityScores; structuralR: boolean; structuralWhy: string;
};
const scored: Scored[] = [];
for (const s of fixture.samples) {
  const item = itemById(s.ref);
  const text = textById(item.textId);
  const sc = await scoreSimilarity(
    { studentAnswer: s.answer, sourceText: text.body, reference: item.answerKey.reference },
    embedder
  );
  // A structural override makes it RED regardless of any threshold.
  const has = (e: string) => item.errorSignals.includes(e);
  const structuralR =
    (sc.topicLabel && has("TOPIC_LABEL")) ||
    (sc.copyScore >= item.answerKey.copyRejectAt && has("VERBATIM_COPY"));
  const structuralWhy = sc.topicLabel && has("TOPIC_LABEL")
    ? "TOPIC_LABEL"
    : sc.copyScore >= item.answerKey.copyRejectAt && has("VERBATIM_COPY")
    ? "VERBATIM_COPY"
    : "";
  scored.push({ n: s.n, ref: s.ref, answer: s.answer, label: s.label,
    scores: sc, structuralR, structuralWhy });
}

// 2. Sweep thresholds. Pass = G or A (spec: AMBER counts as confirmed).
const cfgBase = { copyRejectAt: 0.6, errorSignals: ["DETAIL_AS_MAIN", "TOPIC_LABEL", "VERBATIM_COPY"] };
const grid = (lo: number, hi: number, step: number) => {
  const a: number[] = [];
  for (let v = lo; v <= hi + 1e-9; v += step) a.push(Math.round(v * 1000) / 1000);
  return a;
};
type Combo = { green: number; amber: number; acc: number; falsePass: number; falseFail: number };
const combos: Combo[] = [];
for (const green of grid(0.55, 0.85, 0.025)) {
  for (const amber of grid(0.3, green - 0.025, 0.025)) {
    let correct = 0, falsePass = 0, falseFail = 0;
    for (const s of scored) {
      const pred = toLetter(
        classifyBand(s.scores, { ...cfgBase, bands: { green, amber } }).band
      );
      if (pred === s.label) correct++;
      const truePass = s.label === "G" || s.label === "A";
      const predPass = pred === "G" || pred === "A";
      if (!truePass && predPass) falsePass++;       // a fail leaked through
      if (truePass && !predPass) falseFail++;        // a good answer rejected
    }
    combos.push({ green, amber, acc: correct / scored.length, falsePass, falseFail });
  }
}
// Best: max accuracy, then fewest false-passes (safety), then fewest false-fails.
combos.sort((a, b) =>
  b.acc - a.acc || a.falsePass - b.falsePass || a.falseFail - b.falseFail
);
const best = combos[0];

// 3. Report.
console.log(`\nscorer = ${scored[0].scores.scorer}   samples = ${scored.length}`);
console.log("\nTop threshold combos (acc | falsePass | falseFail):");
for (const c of combos.slice(0, 6))
  console.log(
    `  green=${c.green.toFixed(3)} amber=${c.amber.toFixed(3)}  ` +
    `acc=${(c.acc * 100).toFixed(0)}%  fPass=${c.falsePass}  fFail=${c.falseFail}`
  );

console.log(`\nCHOSEN: green=${best.green} amber=${best.amber}  ` +
  `acc=${(best.acc * 100).toFixed(0)}%`);

const M: Record<Letter, Record<Letter, number>> = {
  G: { G: 0, A: 0, R: 0 }, A: { G: 0, A: 0, R: 0 }, R: { G: 0, A: 0, R: 0 },
};
const disagreements: string[] = [];
for (const s of scored) {
  const res = classifyBand(s.scores, { ...cfgBase, bands: { green: best.green, amber: best.amber } });
  const pred = toLetter(res.band);
  M[s.label][pred]++;
  if (pred !== s.label) {
    disagreements.push(
      `  #${String(s.n).padStart(2)} ${s.ref}  you=${s.label} got=${pred}  ` +
      `cov=${s.scores.coverage.toFixed(2)} copy=${s.scores.copyScore.toFixed(2)}` +
      `${s.structuralR ? ` [STRUCTURAL:${s.structuralWhy} — threshold can't change this]` : ""}` +
      `  "${s.answer.slice(0, 60)}${s.answer.length > 60 ? "…" : ""}"`
    );
  }
}
console.log("\nConfusion matrix (rows = your label, cols = predicted):");
console.log("        predG  predA  predR");
for (const t of ["G", "A", "R"] as Letter[])
  console.log(`  ${t}     ${String(M[t].G).padStart(4)}   ${String(M[t].A).padStart(4)}   ${String(M[t].R).padStart(4)}`);

console.log(`\nDisagreements (${disagreements.length}/${scored.length}):`);
console.log(disagreements.join("\n") || "  none");
