import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL =
  "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/";

// ── 2021 wiring ──────────────────────────────────────────────────────────────
const WIRE_2021 = {
  exact: {
    "1.1.10": "bio-p1-may-jun-2021-q1.1.10.png",
  },
  section: {
    "1.3": "bio-p1-may-jun-2021-q1.3.png",
    "1.4": "bio-p1-may-jun-2021-q1.4.png",
    "1.5": "bio-p1-may-jun-2021-q1.5.png",
    "2.1": "bio-p1-may-jun-2021-q2.1.png",
    "2.2": "bio-p1-may-jun-2021-q2.2.png",
    "2.4": "bio-p1-may-jun-2021-q2.4.png",
    "3.1": "bio-p1-may-jun-2021-q3.1.png",
    "3.2": "bio-p1-may-jun-2021-q3.2.png",
    "3.3": "bio-p1-may-jun-2021-q3.3.png",
    "3.4": "bio-p1-may-jun-2021-q3.4.png",
  },
};

// ── 2023 wiring ──────────────────────────────────────────────────────────────
const WIRE_2023 = {
  // exact label → filename
  exact: {
    "1.1.6": "bio-p1-may-jun-2023-q1.1.6.png",
    "1.1.7": "bio-p1-may-jun-2023-q1.1.7.png",
  },
  // section prefix → filename  (applied to every sq whose label starts with prefix)
  section: {
    "1.4": "bio-p1-may-jun-2023-q1.4.png",
    "1.5": "bio-p1-may-jun-2023-q1.5.png",
    "2.1": "bio-p1-may-jun-2023-q2.1.png",
    "2.5": "bio-p1-may-jun-2023-q2.5.png",
    "3.1": "bio-p1-may-jun-2023-q3.1.png",
    "3.5": "bio-p1-may-jun-2023-q3.5.png",
  },
};

// ── 2022 wiring ──────────────────────────────────────────────────────────────
const WIRE_2022 = {
  exact: {
    "1.1.7": "bio-p1-may-jun-2022-q1.1.7.png",
  },
  section: {
    "1.4": "bio-p1-may-jun-2022-q1.4.png",
    "1.5": "bio-p1-may-jun-2022-q1.5.png",
    "2.1": "bio-p1-may-jun-2022-q2.1.png",
    "2.2": "bio-p1-may-jun-2022-q2.2.png",
    "2.4": "bio-p1-may-jun-2022-q2.4.png",
    "3.4": "bio-p1-may-jun-2022-q3.4.png",
  },
};

// ── 2025 wiring ──────────────────────────────────────────────────────────────
const WIRE_2025 = {
  exact: {
    "1.1.3": "bio-p1-may-jun-2025-q1.1.3.png",
    "1.1.6": "bio-p1-may-jun-2025-q1.1.6.png",
    "1.1.10": "bio-p1-may-jun-2025-q1.1.10.png",
  },
  section: {
    "1.3": "bio-p1-may-jun-2025-q1.3.png",
    "1.4": "bio-p1-may-jun-2025-q1.4.png",
  },
};

function applyDiagrams(paper, wiring) {
  let count = 0;
  for (const q of paper.questions) {
    for (const sq of q.subQuestions) {
      const label = sq.label;

      // Check exact match first
      if (wiring.exact[label]) {
        sq.diagramUrl = BASE_URL + wiring.exact[label];
        count++;
        continue;
      }

      // Check section prefixes — longest match wins to avoid "1.4" matching "1.40"
      const matchingPrefixes = Object.keys(wiring.section).filter((prefix) =>
        label.startsWith(prefix + ".")  ||  label === prefix
      );
      if (matchingPrefixes.length > 0) {
        // pick the longest prefix (most specific)
        const best = matchingPrefixes.sort((a, b) => b.length - a.length)[0];
        sq.diagramUrl = BASE_URL + wiring.section[best];
        count++;
      }
    }
  }
  return count;
}

function processFile(filePath, wiring, label) {
  const raw = readFileSync(filePath, "utf8");
  const paper = JSON.parse(raw);

  const n = applyDiagrams(paper, wiring);

  writeFileSync(filePath, JSON.stringify(paper, null, 2), "utf8");
  console.log(`[${label}] Wired ${n} subquestion diagram URLs → ${filePath}`);
}

const dir = resolve(process.cwd(), "data/papers");

processFile(`${dir}/life-sci-p1-may-jun-2021.json`, WIRE_2021, "2021");
processFile(`${dir}/life-sci-p1-may-jun-2022-combine.json`, WIRE_2022, "2022");
processFile(`${dir}/life-sci-p1-may-jun-2023.json`, WIRE_2023, "2023");
processFile(`${dir}/life-sci-p1-may-jun-2025.json`, WIRE_2025, "2025");

console.log("Done.");
