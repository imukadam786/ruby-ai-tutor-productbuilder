import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL =
  "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/";

// ── geo-p1-may-jun-2023 ───────────────────────────────────────────────────────
// bucket: q1.1.1-q1.1.5(exact), q1.2/q1.4/q1.5(section),
//         q2.1.4-q2.1.8(exact), q2.2/q2.4(section), q2.3.1-q2.3.4(exact)
// q21.x.x entries are mislabeled duplicates of q2.1.x — skip them
// q2.3.6 has no matching label in JSON — skip
const GEO_P1_2023 = {
  exact: {
    "1.1.1": "geo-p1-may-jun-2023-q1.1.1.png",
    "1.1.2": "geo-p1-may-jun-2023-q1.1.2.png",
    "1.1.3": "geo-p1-may-jun-2023-q1.1.3.png",
    "1.1.4": "geo-p1-may-jun-2023-q1.1.4.png",
    "1.1.5": "geo-p1-may-jun-2023-q1.1.5.png",
    "2.1.4": "geo-p1-may-jun-2023-q2.1.4.png",
    "2.1.5": "geo-p1-may-jun-2023-q2.1.5.png",
    "2.1.6": "geo-p1-may-jun-2023-q2.1.6.png",
    "2.1.7": "geo-p1-may-jun-2023-q2.1.7.png",
    "2.1.8": "geo-p1-may-jun-2023-q2.1.8.png",
    "2.3.1": "geo-p1-may-jun-2023-q2.3.1.png",
    "2.3.2": "geo-p1-may-jun-2023-q2.3.2.png",
    "2.3.3": "geo-p1-may-jun-2023-q2.3.3.png",
    "2.3.4": "geo-p1-may-jun-2023-q2.3.4.png",
  },
  section: {
    "1.2": "geo-p1-may-jun-2023-q1.2.png",
    "1.4": "geo-p1-may-jun-2023-q1.4.png",
    "1.5": "geo-p1-may-jun-2023-q1.5.png",
    "2.2": "geo-p1-may-jun-2023-q2.2.png",
    "2.4": "geo-p1-may-jun-2023-q2.4.png",
  },
};

// ── geo-p1-may-jun-2024 ───────────────────────────────────────────────────────
// bucket: q1.1.1-q1.1.7(exact), q1.2.1-q1.2.8(exact), q1.3/q1.4/q1.5(section),
//         q2.1.1-q2.1.7(exact), q2.2.1-q2.2.6(exact), q2.3/q2.4/q2.5(section)
const GEO_P1_2024 = {
  exact: {
    "1.1.1": "geo-p1-may-jun-2024-q1.1.1.png",
    "1.1.2": "geo-p1-may-jun-2024-q1.1.2.png",
    "1.1.3": "geo-p1-may-jun-2024-q1.1.3.png",
    "1.1.4": "geo-p1-may-jun-2024-q1.1.4.png",
    "1.1.5": "geo-p1-may-jun-2024-q1.1.5.png",
    "1.1.6": "geo-p1-may-jun-2024-q1.1.6.png",
    "1.1.7": "geo-p1-may-jun-2024-q1.1.7.png",
    "1.2.1": "geo-p1-may-jun-2024-q1.2.1.png",
    "1.2.2": "geo-p1-may-jun-2024-q1.2.2.png",
    "1.2.3": "geo-p1-may-jun-2024-q1.2.3.png",
    "1.2.4": "geo-p1-may-jun-2024-q1.2.4.png",
    "1.2.5": "geo-p1-may-jun-2024-q1.2.5.png",
    "1.2.6": "geo-p1-may-jun-2024-q1.2.6.png",
    "1.2.7": "geo-p1-may-jun-2024-q1.2.7.png",
    "1.2.8": "geo-p1-may-jun-2024-q1.2.8.png",
    "2.1.1": "geo-p1-may-jun-2024-q2.1.1.png",
    "2.1.2": "geo-p1-may-jun-2024-q2.1.2.png",
    "2.1.3": "geo-p1-may-jun-2024-q2.1.3.png",
    "2.1.4": "geo-p1-may-jun-2024-q2.1.4.png",
    "2.1.5": "geo-p1-may-jun-2024-q2.1.5.png",
    "2.1.6": "geo-p1-may-jun-2024-q2.1.6.png",
    "2.1.7": "geo-p1-may-jun-2024-q2.1.7.png",
    "2.2.1": "geo-p1-may-jun-2024-q2.2.1.png",
    "2.2.2": "geo-p1-may-jun-2024-q2.2.2.png",
    "2.2.3": "geo-p1-may-jun-2024-q2.2.3.png",
    "2.2.4": "geo-p1-may-jun-2024-q2.2.4.png",
    "2.2.5": "geo-p1-may-jun-2024-q2.2.5.png",
    "2.2.6": "geo-p1-may-jun-2024-q2.2.6.png",
  },
  section: {
    "1.3": "geo-p1-may-jun-2024-q1.3.png",
    "1.4": "geo-p1-may-jun-2024-q1.4.png",
    "1.5": "geo-p1-may-jun-2024-q1.5.png",
    "2.3": "geo-p1-may-jun-2024-q2.3.png",
    "2.4": "geo-p1-may-jun-2024-q2.4.png",
    "2.5": "geo-p1-may-jun-2024-q2.5.png",
  },
};

// ── geo-p1-may-jun-2025 ───────────────────────────────────────────────────────
// bucket: q1.1.1-q1.1.8(exact), q1.2.1-q1.2.7(exact), q1.3/q1.4/q1.5(section),
//         q2.1.1-q2.1.3(exact), q2.2.1-q2.2.7(exact), q2.3/q2.4(section)
const GEO_P1_2025 = {
  exact: {
    "1.1.1": "geo-p1-may-jun-2025-q1.1.1.png",
    "1.1.2": "geo-p1-may-jun-2025-q1.1.2.png",
    "1.1.3": "geo-p1-may-jun-2025-q1.1.3.png",
    "1.1.4": "geo-p1-may-jun-2025-q1.1.4.png",
    "1.1.5": "geo-p1-may-jun-2025-q1.1.5.png",
    "1.1.6": "geo-p1-may-jun-2025-q1.1.6.png",
    "1.1.7": "geo-p1-may-jun-2025-q1.1.7.png",
    "1.1.8": "geo-p1-may-jun-2025-q1.1.8.png",
    "1.2.1": "geo-p1-may-jun-2025-q1.2.1.png",
    "1.2.2": "geo-p1-may-jun-2025-q1.2.2.png",
    "1.2.3": "geo-p1-may-jun-2025-q1.2.3.png",
    "1.2.4": "geo-p1-may-jun-2025-q1.2.4.png",
    "1.2.5": "geo-p1-may-jun-2025-q1.2.5.png",
    "1.2.6": "geo-p1-may-jun-2025-q1.2.6.png",
    "1.2.7": "geo-p1-may-jun-2025-q1.2.7.png",
    "2.1.1": "geo-p1-may-jun-2025-q2.1.1.png",
    "2.1.2": "geo-p1-may-jun-2025-q2.1.2.png",
    "2.1.3": "geo-p1-may-jun-2025-q2.1.3.png",
    "2.2.1": "geo-p1-may-jun-2025-q2.2.1.png",
    "2.2.2": "geo-p1-may-jun-2025-q2.2.2.png",
    "2.2.3": "geo-p1-may-jun-2025-q2.2.3.png",
    "2.2.4": "geo-p1-may-jun-2025-q2.2.4.png",
    "2.2.5": "geo-p1-may-jun-2025-q2.2.5.png",
    "2.2.6": "geo-p1-may-jun-2025-q2.2.6.png",
    "2.2.7": "geo-p1-may-jun-2025-q2.2.7.png",
  },
  section: {
    "1.3": "geo-p1-may-jun-2025-q1.3.png",
    "1.4": "geo-p1-may-jun-2025-q1.4.png",
    "1.5": "geo-p1-may-jun-2025-q1.5.png",
    "2.3": "geo-p1-may-jun-2025-q2.3.png",
    "2.4": "geo-p1-may-jun-2025-q2.4.png",
  },
};

// ── geo-p2-may-jun-2024 ───────────────────────────────────────────────────────
// bucket: q1.1.1-q1.1.7(exact), q1.3/q1.4/q1.5(section), q2.3/q2.4(section)
const GEO_P2_2024 = {
  exact: {
    "1.1.1": "geo-p2-may-jun-2024-q1.1.1.png",
    "1.1.2": "geo-p2-may-jun-2024-q1.1.2.png",
    "1.1.3": "geo-p2-may-jun-2024-q1.1.3.png",
    "1.1.4": "geo-p2-may-jun-2024-q1.1.4.png",
    "1.1.5": "geo-p2-may-jun-2024-q1.1.5.png",
    "1.1.6": "geo-p2-may-jun-2024-q1.1.6.png",
    "1.1.7": "geo-p2-may-jun-2024-q1.1.7.png",
  },
  section: {
    "1.3": "geo-p2-may-jun-2024-q1.3.png",
    "1.4": "geo-p2-may-jun-2024-q1.4.png",
    "1.5": "geo-p2-may-jun-2024-q1.5.png",
    "2.3": "geo-p2-may-jun-2024-q2.3.png",
    "2.4": "geo-p2-may-jun-2024-q2.4.png",
  },
};

// ── geo-p2-may-jun-2023 ───────────────────────────────────────────────────────
// bucket: q1.1.1/q1.1.6/q1.1.7/q1.1.8(exact), q1.2/q1.3/q1.4/q1.5(section),
//         q2.1.4/q2.1.6(exact), q2.3/q2.4/q2.5(section)
const GEO_P2_2023 = {
  exact: {
    "1.1.1": "geo-p2-may-jun-2023-q1.1.1.png",
    "1.1.6": "geo-p2-may-jun-2023-q1.1.6.png",
    "1.1.7": "geo-p2-may-jun-2023-q1.1.7.png",
    "1.1.8": "geo-p2-may-jun-2023-q1.1.8.png",
    "2.1.4": "geo-p2-may-jun-2023-q2.1.4.png",
    "2.1.6": "geo-p2-may-jun-2023-q2.1.6.png",
  },
  section: {
    "1.2": "geo-p2-may-jun-2023-q1.2.png",
    "1.3": "geo-p2-may-jun-2023-q1.3.png",
    "1.4": "geo-p2-may-jun-2023-q1.4.png",
    "1.5": "geo-p2-may-jun-2023-q1.5.png",
    "2.3": "geo-p2-may-jun-2023-q2.3.png",
    "2.4": "geo-p2-may-jun-2023-q2.4.png",
    "2.5": "geo-p2-may-jun-2023-q2.5.png",
  },
};

function applyDiagrams(paper, wiring) {
  let count = 0;
  for (const q of paper.questions) {
    for (const sq of q.subQuestions) {
      const label = sq.label;

      if (wiring.exact[label]) {
        sq.diagramUrl = BASE_URL + wiring.exact[label];
        count++;
        continue;
      }

      // section prefix match — longest prefix wins
      const matchingPrefixes = Object.keys(wiring.section).filter(
        (prefix) => label.startsWith(prefix + ".") || label === prefix
      );
      if (matchingPrefixes.length > 0) {
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
  console.log(`[${label}] Wired ${n} diagramUrls → ${filePath}`);
}

const dir = resolve(process.cwd(), "data/papers");

processFile(`${dir}/geo-p1-may-jun-2023.json`, GEO_P1_2023, "geo-p1-2023");
processFile(`${dir}/geo-p1-may-jun-2024.json`, GEO_P1_2024, "geo-p1-2024");
processFile(`${dir}/geo-p1-may-jun-2025.json`, GEO_P1_2025, "geo-p1-2025");
processFile(`${dir}/geo-p2-may-jun-2024.json`, GEO_P2_2024, "geo-p2-2024");
processFile(`${dir}/geo-p2-may-jun-2023.json`, GEO_P2_2023, "geo-p2-2023");

console.log("Done.");
