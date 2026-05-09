import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL =
  "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/";

// ── math-lit-p1-may-jun-2025 ──────────────────────────────────────────────────
const ML_P1_2025 = {
  exact: {
    "3.3.2": "math-lit-p1-may-jun-2025-q3.3.2.png",
  },
  section: {
    "1.1": "math-lit-p1-may-jun-2025-q1.1.png",
    "1.2": "math-lit-p1-may-jun-2025-q1.2.png",
    "1.3": "math-lit-p1-may-jun-2025-q1.3.png",
    "2.3": "math-lit-p1-may-jun-2025-q2.3.png",
    "3.1": "math-lit-p1-may-jun-2025-q3.1.png",
    "4.2": "math-lit-p1-may-jun-2025-q4.2.png",
    "5.1": "math-lit-p1-may-jun-2025-q5.1.png",
    "5.2": "math-lit-p1-may-jun-2025-q5.2.png",
  },
};

// ── math-lit-p2-may-jun-2025 ──────────────────────────────────────────────────
// q4/q4.2/q4.3 and q5/q5.2/q5.3 use longest-prefix matching:
// 4.1.x → q4, 4.2.x → q4.2, 4.3.x → q4.3
// 5.1.x → q5, 5.2.x → q5.2, 5.3.x → q5.3
const ML_P2_2025 = {
  exact: {},
  section: {
    "1.1": "math-lit-p2-may-jun-2025-q1.1.png",
    "1.3": "math-lit-p2-may-jun-2025-q1.3.png",
    "2.2": "math-lit-p2-may-jun-2025-q2.2.png",
    "3.2": "math-lit-p2-may-jun-2025-q3.2.png",
    "4":   "math-lit-p2-may-jun-2025-q4.png",
    "4.2": "math-lit-p2-may-jun-2025-q4.2.png",
    "4.3": "math-lit-p2-may-jun-2025-q4.3.png",
    "5":   "math-lit-p2-may-jun-2025-q5.png",
    "5.2": "math-lit-p2-may-jun-2025-q5.2.png",
    "5.3": "math-lit-p2-may-jun-2025-q5.3.png",
  },
};

// ── math-lit-p1-may-jun-2024 ──────────────────────────────────────────────────
// q4/q5 are whole-question section images; q5.2/q5.3 override via longer prefix
const ML_P1_2024 = {
  exact: {
    "3.2.3": "math-lit-p1-may-jun-2024-q3.2.3.png",
  },
  section: {
    "1.1": "math-lit-p1-may-jun-2024-q1.1.png",
    "1.2": "math-lit-p1-may-jun-2024-q1.2.png",
    "1.3": "math-lit-p1-may-jun-2024-q1.3.png",
    "1.4": "math-lit-p1-may-jun-2024-q1.4.png",
    "2.2": "math-lit-p1-may-jun-2024-q2.2.png",
    "3.1": "math-lit-p1-may-jun-2024-q3.1.png",
    "3.2": "math-lit-p1-may-jun-2024-q3.2.png",
    "4":   "math-lit-p1-may-jun-2024-q4.png",
    "5":   "math-lit-p1-may-jun-2024-q5.png",
    "5.2": "math-lit-p1-may-jun-2024-q5.2.png",
    "5.3": "math-lit-p1-may-jun-2024-q5.3.png",
  },
};

// ── math-lit-p2-may-jun-2024 ──────────────────────────────────────────────────
// q1 covers 1.1.x; q1.2/q1.3 override via longer prefix
// q3 covers all of question 3; q5/q5.2 for question 5
const ML_P2_2024 = {
  exact: {
    "4.1.5": "math-lit-p2-may-jun-2024-q4.1.5.png",
  },
  section: {
    "1":   "math-lit-p2-may-jun-2024-q1.png",
    "1.2": "math-lit-p2-may-jun-2024-q1.2.png",
    "1.3": "math-lit-p2-may-jun-2024-q1.3.png",
    "2.2": "math-lit-p2-may-jun-2024-q2.2.png",
    "2.3": "math-lit-p2-may-jun-2024-q2.3.png",
    "2.4": "math-lit-p2-may-jun-2024-q2.4.png",
    "3":   "math-lit-p2-may-jun-2024-q3.png",
    "5":   "math-lit-p2-may-jun-2024-q5.png",
    "5.2": "math-lit-p2-may-jun-2024-q5.2.png",
  },
};

// ── math-lit-p1-may-jun-2022 ──────────────────────────────────────────────────
// q3 covers all of question 3; q5/q5.2 for question 5 (q5.2 overrides via prefix)
const ML_P1_2022 = {
  exact: {},
  section: {
    "1.1": "math-lit-p1-may-jun-2022-q1.1.png",
    "1.2": "math-lit-p1-may-jun-2022-q1.2.png",
    "1.3": "math-lit-p1-may-jun-2022-q1.3.png",
    "2.2": "math-lit-p1-may-jun-2022-q2.2.png",
    "3":   "math-lit-p1-may-jun-2022-q3.png",
    "5":   "math-lit-p1-may-jun-2022-q5.png",
    "5.2": "math-lit-p1-may-jun-2022-q5.2.png",
  },
};

// ── math-lit-p2-may-jun-2022 ──────────────────────────────────────────────────
// q3/q3.2: 3.1.x → q3, 3.2.x → q3.2 (longer prefix)
const ML_P2_2022 = {
  exact: {},
  section: {
    "1.1": "math-lit-p2-may-jun-2022-q1.1.png",
    "1.2": "math-lit-p2-may-jun-2022-q1.2.png",
    "1.3": "math-lit-p2-may-jun-2022-q1.3.png",
    "3":   "math-lit-p2-may-jun-2022-q3.png",
    "3.2": "math-lit-p2-may-jun-2022-q3.2.png",
    "4.2": "math-lit-p2-may-jun-2022-q4.2.png",
    "5":   "math-lit-p2-may-jun-2022-q5.png",
  },
};

// ── math-lit-p1-may-jun-2021 ──────────────────────────────────────────────────
// q2.2.2 exact overrides q2.2 section for label "2.2.2"
// q2.3.2 section (with paren extension) overrides q2.3 for labels "2.3.2(a/b/c)"
// NOTE: bucket filename has typo — "math-lit-p1may-jun-2021-q2.3.2.png" (missing dash)
const ML_P1_2021 = {
  exact: {
    "2.2.2": "math-lit-p1-may-jun-2021-q2.2.2.png",
  },
  section: {
    "1.1":   "math-lit-p1-may-jun-2021-q1.1.png",
    "1.2":   "math-lit-p1-may-jun-2021-q1.2.png",
    "1.3":   "math-lit-p1-may-jun-2021-q1.3.png",
    "2.2":   "math-lit-p1-may-jun-2021-q2.2.png",
    "2.3":   "math-lit-p1-may-jun-2021-q2.3.png",
    "2.3.2": "math-lit-p1may-jun-2021-q2.3.2.png",
    "3":     "math-lit-p1-may-jun-2021-q3.png",
    "3.2":   "math-lit-p1-may-jun-2021-q3.2.png",
    "4.1":   "math-lit-p1-may-jun-2021-q4.1.png",
    "4.2":   "math-lit-p1-may-jun-2021-q4.2.png",
    "5.1":   "math-lit-p1-may-jun-2021-q5.1.png",
    "5.2":   "math-lit-p1-may-jun-2021-q5.2.png",
  },
};

// ── math-lit-p2-may-jun-2021 ──────────────────────────────────────────────────
// q1.2.2 exact overrides q1.2 section for label "1.2.2"
// q2.3.2 section (with paren extension) overrides q2.3 for labels "2.3.2(a/b/c)"
const ML_P2_2021 = {
  exact: {
    "1.2.2": "math-lit-p2-may-jun-2021-q1.2.2.png",
  },
  section: {
    "1.1":   "math-lit-p2-may-jun-2021-q1.1.png",
    "1.2":   "math-lit-p2-may-jun-2021-q1.2.png",
    "2.1":   "math-lit-p2-may-jun-2021-q2.1.png",
    "2.2":   "math-lit-p2-may-jun-2021-q2.2.png",
    "2.3":   "math-lit-p2-may-jun-2021-q2.3.png",
    "2.3.2": "math-lit-p2-may-jun-2021-q2.3.2.png",
    "3.1":   "math-lit-p2-may-jun-2021-q3.1.png",
  },
};

// Extended matching: also handles "prefix(" for labels like "2.3.2(a)"
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

      // longest-prefix section match; also handles "prefix(" for parenthetical labels
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

processFile(`${dir}/maths-lit-p1-may-jun-2025.json`,          ML_P1_2025, "ml-p1-2025");
processFile(`${dir}/maths-lit-p2-may-jun-2025-combined.json`, ML_P2_2025, "ml-p2-2025");
processFile(`${dir}/maths-lit-p1-may-jun-2024-combined.json`, ML_P1_2024, "ml-p1-2024");
processFile(`${dir}/maths-lit-p2-may-jun-2024-combined.json`, ML_P2_2024, "ml-p2-2024");
processFile(`${dir}/maths-lit-p1-may-jun-2022-combined.json`, ML_P1_2022, "ml-p1-2022");
processFile(`${dir}/maths-lit-p2-may-jun-2022-combined.json`, ML_P2_2022, "ml-p2-2022");
processFile(`${dir}/maths-lit-p1-may-jun-2021-combined.json`, ML_P1_2021, "ml-p1-2021");
processFile(`${dir}/maths-lit-p2-may-jun-2021-combined.json`, ML_P2_2021, "ml-p2-2021");

console.log("Done.");
