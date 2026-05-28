#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "data/matric-physical-sciences-question-banks");
const OUT = path.resolve(process.cwd(), "data/matric-physical-sciences-question-bank.json");

const files = (await fs.readdir(ROOT)).filter((f) => /\.json$/.test(f)).sort();

const skills = {};
let totalItems = 0;

for (const file of files) {
  const raw = await fs.readFile(path.join(ROOT, file), "utf8");
  const data = JSON.parse(raw);
  const id = data.skill;
  if (!id) {
    console.error(`[skip] ${file} has no skill field`);
    continue;
  }
  skills[id] = data;
  totalItems += (data.items || []).length;
}

const out = {
  subject: "matric-physical-sciences",
  version: "1.0",
  description: "Combined Matric Physical Sciences question bank, produced by scripts/build-matric-phys-sci-bank.mjs from data/matric-physical-sciences-question-banks/*.json. Re-run after editing any per-skill bank.",
  built_at: new Date().toISOString(),
  skills,
};

await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`Wrote ${OUT}`);
console.log(`  skills: ${Object.keys(skills).length}`);
console.log(`  total items: ${totalItems}`);
