import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL =
  "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/";

const PAPERS = [
  { paper: 1, year: 2021 },
  { paper: 2, year: 2021 },
  { paper: 1, year: 2022 },
  { paper: 2, year: 2022 },
  { paper: 1, year: 2023 },
  { paper: 2, year: 2023 },
  { paper: 1, year: 2024 },
  { paper: 2, year: 2024 },
  { paper: 1, year: 2025 },
  { paper: 2, year: 2025 },
];

let totalWired = 0;

for (const { paper, year } of PAPERS) {
  const filename = `hist-p${paper}-may-jun-${year}.json`;
  const filePath = resolve("data/papers", filename);

  let data;
  try {
    data = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    console.warn(`⚠ Skipping ${filename} — not found`);
    continue;
  }

  let wired = 0;
  for (const question of data.questions) {
    for (const source of question.sources) {
      // Build expected bucket filename
      // Source IDs are like "1A", "2B", "3C" → lowercase → "1a", "2b", "3c"
      const srcId = source.id.toLowerCase();
      const bucketFile = `his-p${paper}-may-jun-${year}-q${question.number}-source-${srcId}.png`;
      const url = BASE_URL + bucketFile;

      if (source.imageUrl !== url) {
        source.imageUrl = url;
        wired++;
      }
    }
  }

  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`✓ ${filename}: wired ${wired} source image(s)`);
  totalWired += wired;
}

console.log(`\nDone — ${totalWired} imageUrl(s) set across ${PAPERS.length} papers`);
