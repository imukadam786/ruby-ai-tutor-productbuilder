import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL =
  "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/";

// ── tour-p1-may-jun-2025 ──────────────────────────────────────────────────────
const TOUR_P1_2025 = {
  exact: {
    "1.1.1": "tour-p1-may-jun-2025-q1.1.1.png",
    "1.1.5": "tour-p1-may-jun-2025-q1.1.5.png",
    "1.1.16": "tour-p1-may-jun-2025-q1.1.16.png",
    "1.1.20": "tour-p1-may-jun-2025-q1.1.20.png",
    "1.4": "tour-p1-may-jun-2025-q1.4.png",
    "2.1": "tour-p1-may-jun-2025-q2.1.png",
    "5": "tour-p1-may-jun-2025-q5.png",
  },
  section: {
    "1.2": "tour-p1-may-jun-2025-q1.2.png",
    "1.5": "tour-p1-may-jun-2025-q1.5.png",
    "2": "tour-p1-may-jun-2025-q2.png",
    "3.1": "tour-p1-may-jun-2025-q3.1.png",
    "4.1": "tour-p1-may-jun-2025-q4.1.png",
    "4.2": "tour-p1-may-jun-2025-q4.2.png",
    "6": "tour-p1-may-jun-2025-q6.png",
    "7.1": "tour-p1-may-jun-2025-q7.1.png",
    "7.2": "tour-p1-may-jun-2025-q7.2.png",
    "7.3": "tour-p1-may-jun-2025-q7.3.png",
    "8": "tour-p1-may-jun-2025-q8.png",
    "9": "tour-p1-may-jun-2025-q9.png",
    "9.2": "tour-p1-may-jun-2025-q9.2.png",
    "9.3": "tour-p1-may-jun-2025-q9.3.png",
    "10": "tour-p1-may-jun-2025-q10.png",
  },
};

// ── tour-p1-may-jun-2024 ──────────────────────────────────────────────────────
// q2.3.4 covers 2.3.4(a/b/c); q4.1.6 covers 4.1.6(a/b)
const TOUR_P1_2024 = {
  exact: {
    "1.1.1": "tour-p1-may-jun-2024-q1.1.1.png",
    "1.1.11": "tour-p1-may-jun-2024-q1.1.11.png",
    "1.1.18": "tour-p1-may-jun-2024-q1.1.18.png",
    "1.1.20": "tour-p1-may-jun-2024-q1.1.20.png",
    "1.4": "tour-p1-may-jun-2024-q1.4.png",
    "1.5": "tour-p1-may-jun-2024-q1.5.png",
    "10.3": "tour-p1-may-jun-2024-q10.3.png",
  },
  section: {
    "1.2": "tour-p1-may-jun-2024-q1.2.png",
    "2": "tour-p1-may-jun-2024-q2.png",
    "2.1": "tour-p1-may-jun-2024-q2.1.png",
    "2.3.4": "tour-p1-may-jun-2024-q2.3.4.png",
    "3": "tour-p1-may-jun-2024-q3.png",
    "4": "tour-p1-may-jun-2024-q4.png",
    "4.1.6": "tour-p1-may-jun-2024-q4.1.6.png",
    "4.2": "tour-p1-may-jun-2024-q4.2.png",
    "5": "tour-p1-may-jun-2024-q5.png",
    "6": "tour-p1-may-jun-2024-q6.png",
    "7": "tour-p1-may-jun-2024-q7.png",
    "7.3": "tour-p1-may-jun-2024-q7.3.png",
    "8.1": "tour-p1-may-jun-2024-q8.1.png",
    "8.2": "tour-p1-may-jun-2024-q8.2.png",
    "9.1": "tour-p1-may-jun-2024-q9.1.png",
    "9.2": "tour-p1-may-jun-2024-q9.2.png",
    "10": "tour-p1-may-jun-2024-q10.png",
  },
};

// ── tour-p1-may-jun-2023 ──────────────────────────────────────────────────────
// q2.1 covers 2.1.2–2.1.6(b); q2.1.1 is exact for label "2.1.1"
// q4.4 covers 4.4.1(a/b) + 4.4.2 via startsWith("4.4.")
const TOUR_P1_2023 = {
  exact: {
    "1.1.1": "tour-p1-may-jun-2023-q1.1.1.png",
    "1.1.8": "tour-p1-may-jun-2023-q1.1.8.png",
    "1.1.11": "tour-p1-may-jun-2023-q1.1.11.png",
    "1.1.14": "tour-p1-may-jun-2023-q1.1.14.png",
    "2.1.1": "tour-p1-may-jun-2023-q2.1.1.png",
    "4.1": "tour-p1-may-jun-2023-q4.1.png",
    "4.2": "tour-p1-may-jun-2023-q4.2.png",
  },
  section: {
    "1.2": "tour-p1-may-jun-2023-q1.2.png",
    "1.4": "tour-p1-may-jun-2023-q1.4.png",
    "1.5": "tour-p1-may-jun-2023-q1.5.png",
    "2": "tour-p1-may-jun-2023-q2.png",
    "2.1": "tour-p1-may-jun-2023-q2.1.png",
    "2.3": "tour-p1-may-jun-2023-q2.3.png",
    "3": "tour-p1-may-jun-2023-q3.png",
    "4.3": "tour-p1-may-jun-2023-q4.3.png",
    "4.4": "tour-p1-may-jun-2023-q4.4.png",
    "4.5": "tour-p1-may-jun-2023-q4.5.png",
    "5": "tour-p1-may-jun-2023-q5.png",
    "6": "tour-p1-may-jun-2023-q6.png",
    "7": "tour-p1-may-jun-2023-q7.png",
    "8": "tour-p1-may-jun-2023-q8.png",
    "9": "tour-p1-may-jun-2023-q9.png",
    "9.2": "tour-p1-may-jun-2023-q9.2.png",
    "9.3": "tour-p1-may-jun-2023-q9.3.png",
    "10": "tour-p1-may-jun-2023-q10.png",
  },
};

// ── tour-p1-may-jun-2022 ──────────────────────────────────────────────────────
// q2.1.1 covers 2.1.1(a/b); q2.2.1 covers 2.2.1(a/b/c)
// q2.3.1 is the bucket filename for label "2.3" (the single 2.3 question)
const TOUR_P1_2022 = {
  exact: {
    "1.1.1": "tour-p1-may-jun-2022-q1.1.1.png",
    "1.1.4": "tour-p1-may-jun-2022-q1.1.4.png",
    "1.1.5": "tour-p1-may-jun-2022-q1.1.5.png",
    "1.1.6": "tour-p1-may-jun-2022-q1.1.6.png",
    "1.1.9": "tour-p1-may-jun-2022-q1.1.9.png",
    "1.1.10": "tour-p1-may-jun-2022-q1.1.10.png",
    "1.1.17": "tour-p1-may-jun-2022-q1.1.17.png",
    "1.1.20": "tour-p1-may-jun-2022-q1.1.20.png",
    "1.5": "tour-p1-may-jun-2022-q1.5.png",
    "2.3": "tour-p1-may-jun-2022-q2.3.1.png",
    "5.2.1": "tour-p1-may-jun-2022-q5.2.1.png",
    "5.2.2": "tour-p1-may-jun-2022-q5.2.2.png",
    "7.1.3": "tour-p1-may-jun-2022-q7.1.3.png",
  },
  section: {
    "1.2": "tour-p1-may-jun-2022-q1.2.png",
    "1.4": "tour-p1-may-jun-2022-q1.4.png",
    "2": "tour-p1-may-jun-2022-q2.png",
    "2.1": "tour-p1-may-jun-2022-q2.1.png",
    "2.1.1": "tour-p1-may-jun-2022-q2.1.1.png",
    "2.2": "tour-p1-may-jun-2022-q2.2.png",
    "2.2.1": "tour-p1-may-jun-2022-q2.2.1.png",
    "3.2": "tour-p1-may-jun-2022-q3.2.png",
    "4.1": "tour-p1-may-jun-2022-q4.1.png",
    "4.2": "tour-p1-may-jun-2022-q4.2.png",
    "5.1": "tour-p1-may-jun-2022-q5.1.png",
    "6": "tour-p1-may-jun-2022-q6.png",
    "7": "tour-p1-may-jun-2022-q7.png",
    "8": "tour-p1-may-jun-2022-q8.png",
    "9": "tour-p1-may-jun-2022-q9.png",
    "9.3": "tour-p1-may-jun-2022-q9.3.png",
  },
};

// ── tour-p1-may-jun-2021 ──────────────────────────────────────────────────────
// q2.1.1 is exact for label "2.1.1"; q2.1 covers remaining 2.1.x (2.1.2(a-e))
const TOUR_P1_2021 = {
  exact: {
    "1.1.3": "tour-p1-may-jun-2021-q1.1.3.png",
    "1.1.5": "tour-p1-may-jun-2021-q1.1.5.png",
    "1.1.19": "tour-p1-may-jun-2021-q1.1.19.png",
    "2.1.1": "tour-p1-may-jun-2021-q2.1.1.png",
  },
  section: {
    "1.2": "tour-p1-may-jun-2021-q1.2.png",
    "1.4": "tour-p1-may-jun-2021-q1.4.png",
    "1.5": "tour-p1-may-jun-2021-q1.5.png",
    "2.1": "tour-p1-may-jun-2021-q2.1.png",
    "2.2": "tour-p1-may-jun-2021-q2.2.png",
    "3": "tour-p1-may-jun-2021-q3.png",
    "4.1": "tour-p1-may-jun-2021-q4.1.png",
    "4.2": "tour-p1-may-jun-2021-q4.2.png",
    "5.1": "tour-p1-may-jun-2021-q5.1.png",
    "6.1": "tour-p1-may-jun-2021-q6.1.png",
    "6.2": "tour-p1-may-jun-2021-q6.2.png",
    "7": "tour-p1-may-jun-2021-q7.png",
    "8.1": "tour-p1-may-jun-2021-q8.1.png",
    "8.2": "tour-p1-may-jun-2021-q8.2.png",
    "9.1": "tour-p1-may-jun-2021-q9.1.png",
    "9.2": "tour-p1-may-jun-2021-q9.2.png",
    "9.3": "tour-p1-may-jun-2021-q9.3.png",
  },
};

// Tourism sub-question labels can have parenthesized sub-parts like "2.1.1(a)".
// Extend prefix matching to handle label.startsWith(prefix + "(") so that e.g.
// section key "2.1.1" covers both "2.1.1(a)" and "2.1.1(b)".
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

      const matchingPrefixes = Object.keys(wiring.section).filter(
        (prefix) =>
          label.startsWith(prefix + ".") ||
          label === prefix ||
          label.startsWith(prefix + "(")
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

processFile(
  `${dir}/tourism-p1-may-jun-2025-combined.json`,
  TOUR_P1_2025,
  "tour-p1-2025"
);
processFile(
  `${dir}/tourism-p1-may-jun-2024-combined.json`,
  TOUR_P1_2024,
  "tour-p1-2024"
);
processFile(
  `${dir}/tourism-p1-may-jun-2023-combined.json`,
  TOUR_P1_2023,
  "tour-p1-2023"
);
processFile(
  `${dir}/tourism-p1-may-jun-2022-combined.json`,
  TOUR_P1_2022,
  "tour-p1-2022"
);
processFile(
  `${dir}/tourism-p1-may-jun-2021-combined.json`,
  TOUR_P1_2021,
  "tour-p1-2021"
);

console.log("Done.");
