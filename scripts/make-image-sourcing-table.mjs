// Builds ONE combined image-sourcing table (Afrikaans + Life Skills) of every
// picture still to be made, with a file label, what it shows, type, and an AI
// prompt. Output: IMAGE_SOURCING.md at repo root.
//
//   node scripts/make-image-sourcing-table.mjs

import fs from "node:fs";
import path from "node:path";
import { LABEL_TO_KEY } from "./life-skills-image-map.mjs";

const ROOT = process.cwd();
const STYLE =
  "Flat Twemoji-style vector icon, bright solid colour fills, no outlines, no shadows, no text, one subject centred on a plain white background, square 1:1, friendly and simple for a young children's learning app.";

// ── Afrikaans: the 21 remaining keys (subject prompt = the distinguishing bit) ──
const AFR = [
  ["scene_seun_appel", "boy eating an apple", "Scene", "A young boy biting into a red apple he is holding, clearly eating it"],
  ["scene_meisie_appel", "girl eating an apple", "Scene", "A young girl biting into a red apple she is holding, clearly eating it"],
  ["scene_seun_bal", "boy with a ball", "Scene", "A young boy holding and playing with a round ball, not eating"],
  ["scene_hond_water", "dog drinking water", "Scene", "A dog with its head lowered, drinking water from a bowl"],
  ["scene_hond_kos", "dog eating food", "Scene", "A dog eating food from a pet food bowl, chewing, not drinking"],
  ["scene_kat_melk", "cat drinking milk", "Scene", "A cat lapping milk from a saucer on the floor"],
  ["scene_hond_slaap", "big brown dog sleeping", "Scene", "A big brown dog lying down fast asleep with eyes closed"],
  ["scene_hond_hardloop", "dog running", "Scene", "A dog running fast, legs stretched in mid-stride"],
  ["scene_kat_slaap", "cat sleeping", "Scene", "A cat curled up asleep with its eyes closed"],
  ["scene_meisie_fiets", "girl riding a bike", "Scene", "A young girl riding a bicycle"],
  ["scene_seun_fiets", "boy riding a bike", "Scene", "A young boy riding a bicycle"],
  ["scene_meisie_loop", "girl walking", "Scene", "A young girl walking on foot, taking a step, no bicycle"],
  ["hoed_rooi", "red hat", "Object", "A single bright red sun hat"],
  ["trui_blou", "blue jersey", "Object", "A blue knitted pullover jersey (sweater)"],
  ["trui_rooi", "red jersey", "Object", "A red knitted pullover jersey (sweater)"],
  ["clothes_trui", "jersey (neutral colour)", "Object", "A green knitted pullover jersey (sweater)"],
  ["obj_tafel", "table", "Object", "A simple wooden table with a flat top and four legs"],
  ["obj_kas", "cupboard", "Object", "A tall wooden cupboard / cabinet with closed doors"],
  ["body_kop", "head", "Object", "A single child's head and shoulders, front view, friendly face"],
  ["act_sit", "sitting", "Scene", "A child sitting down cross-legged on the floor"],
  ["act_spring", "jumping", "Scene", "A child jumping with both feet off the ground, arms up, mid-air"],
];

// ── Life Skills: every image-match option label not yet mapped to an icon ──────
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, "data/life-skills-question-bank.json"), "utf8"));
const SCENE = /\b(washing|eating|playing|helping|walking|sharing|taking|pushing|laughing|shouting|ignoring|hiding|drinking|crossing|dancing|riding|running|sleeping|surrounded|reading|holds?|carries|delivers)\b|\b(a child|children|someone|a person|people|a boy|a girl|the person|the chef|the dancer|the doctor|the vet|the footballer|the scholar|the postal)\b/i;

const seen = new Map(); // label -> count
for (const t of Object.values(bank.topics ?? {})) {
  if (t.grade > 3) continue;
  for (const q of t.questions ?? []) {
    if (q.input_type !== "image-match") continue;
    for (const opt of q.options ?? []) {
      const label = String(opt).trim();
      if (LABEL_TO_KEY[label]) continue; // already has an icon
      seen.set(label, (seen.get(label) ?? 0) + 1);
    }
  }
}

const slug = (s) =>
  s.toLowerCase().replace(/^(a|an|the)\s+/, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
const keyFor = (label) => {
  const isScene = SCENE.test(label);
  const prefix = isScene ? "scene_" : /knee|elbow|toe|head/i.test(label) ? "body_"
    : /house|office|shop|school|kitchen|market|pool|station|building|tower|centre|road|park|library|stove|space|farm|flat/i.test(label) ? "place_"
    : "obj_";
  return { key: prefix + slug(label), type: isScene ? "Scene" : "Object" };
};

const used = new Set();
const LS = [...seen.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([label, n]) => {
    let { key, type } = keyFor(label);
    let k = key, i = 2;
    while (used.has(k)) k = `${key}_${i++}`;
    used.add(k);
    return { key: k, label, type, n };
  });

// ── Emit one combined markdown table ──────────────────────────────────────────
const esc = (s) => String(s).replace(/\|/g, "\\|");
const out = [];
out.push(`# Image sourcing — Afrikaans + Life Skills`);
out.push(``);
out.push(`Every picture still to be made, across both subjects. Save each result with`);
out.push(`the exact **File** path shown. Once a file lands it appears in the app`);
out.push(`automatically (Life Skills keys must also be added to`);
out.push(`\`scripts/life-skills-image-map.mjs\` to wire them in).`);
out.push(``);
out.push(`**Style — append to every AI prompt:**`);
out.push(`> ${STYLE}`);
out.push(``);
out.push(`Final prompt for each row = the **AI prompt** cell + the style line above.`);
out.push(``);
out.push(`Totals: Afrikaans ${AFR.length} · Life Skills ${LS.length} · **${AFR.length + LS.length} images**.`);
out.push(``);
out.push(`| Subject | File (save here) | Type | What it shows | AI prompt (+ style line) |`);
out.push(`|---------|------------------|------|---------------|--------------------------|`);
for (const [key, shows, type, prompt] of AFR) {
  out.push(`| Afrikaans | public/afrikaans/${key}.png | ${type} | ${esc(shows)} | ${esc(prompt)} |`);
}
for (const r of LS) {
  out.push(`| Life Skills | public/life-skills/${r.key}.png | ${r.type} | ${esc(r.label)}${r.n > 1 ? ` (×${r.n})` : ""} | ${esc(r.label)} |`);
}
out.push(``);

fs.writeFileSync(path.join(ROOT, "IMAGE_SOURCING.md"), out.join("\n") + "\n");
console.log(`Wrote IMAGE_SOURCING.md — ${AFR.length} Afrikaans + ${LS.length} Life Skills = ${AFR.length + LS.length} rows`);
const objCount = LS.filter((r) => r.type === "Object").length;
console.log(`Life Skills split: ${objCount} Object, ${LS.length - objCount} Scene`);
