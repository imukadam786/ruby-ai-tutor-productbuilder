import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL =
  "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/matric-diagrams/";

// Addendum images uploaded to the matric-diagrams bucket.
// Naming: mathslit-<paper>-addendum-q<section>  (no .png extension)
// Each section prefix covers all sub-questions within that section.

const ML_P1_2021_ADDENDUM = {
  "2.1": "mathslit-p1-may-jun-2021-addendum-q2.1",
  "4.1": "mathslit-p1-may-jun-2021-addendum-q4.1",
  "5.3": "mathslit-p1-may-jun-2021-addendum-q5.3",
};

const ML_P2_2021_ADDENDUM = {
  "2.1": "mathslit-p2-may-jun-2021-addendum-q2.1",
  "3.2": "mathslit-p2-may-jun-2021-addendum-q3.2",
  "4.2": "mathslit-p2-may-jun-2021-addendum-q4.2",
};

const ML_P1_2022_ADDENDUM = {
  "2.1": "mathslit-p1-may-jun-2022-addendum-q2.1",
  "3.2": "mathslit-p1-may-jun-2022-addendum-q3.2",
  "4.2": "mathslit-p1-may-jun-2022-addendum-q4.2",
  "5.3": "mathslit-p1-may-jun-2022-addendum-q5.3",
};

const ML_P2_2022_ADDENDUM = {
  "2.1": "mathslit-p2-may-jun-2022-addendum-q2.1",
  "2.2": "mathslit-p2-may-jun-2022-addendum-q2.2",
  "4.1": "mathslit-p2-may-jun-2022-addendum-q4.1",
  "5.2": "mathslit-p2-may-jun-2022-addendum-q5.2",
};

// Nov 2023 P2 — stored in maths-lit-p2-may-jun-2023-combined.json
const ML_P2_NOV2023_ADDENDUM = {
  "1.2": "mathslit-p2-nov-2023-addendum-q1.2",
  "2.1": "mathslit-p2-nov-2023-addendum-q2.1",
  "5":   "mathslit-p2-nov-2023-addendum-q5",
};

const ML_P1_2024_ADDENDUM = {
  "2.1": "mathslit-p1-may-jun-2024-addendum-q2.1",
  "4.2": "mathslit-p1-may-jun-2024-addendum-q4.2",
};

const ML_P2_2024_ADDENDUM = {
  "2.1": "mathslit-p2-may-jun-2024-addendum-q2.1",
  "2.2": "mathslit-p2-may-jun-2024-addendum-q2.2",
  "3.2": "mathslit-p2-may-jun-2024-addendum-q3.2",
  "4.1": "mathslit-p2-may-jun-2024-addendum-q4.1",
  "4.2": "mathslit-p2-may-jun-2024-addendum-q4.2",
  "5.1": "mathslit-p2-may-jun-2024-addendum-q5.1",
};

const ML_P1_2025_ADDENDUM = {
  "2.1": "mathslit-p1-may-jun-2025-addendum-q2.1",
  "2.2": "mathslit-p1-may-jun-2025-addendum-q2.2",
  "3.2": "mathslit-p1-may-jun-2025-addendum-q3.2",
  "3.3": "mathslit-p1-may-jun-2025-addendum-q3.3",
};

const ML_P2_2025_ADDENDUM = {
  "2.1": "mathslit-p2-may-jun-2025-addendum-q2.1",
  "3.1": "mathslit-p2-may-jun-2025-addendum-q3.1",
  "5.1": "mathslit-p2-may-jun-2025-addendum-q5.1",
};

// Longest-prefix matching: handles "2.1.2", "2.1.2(a)", "2.1.2 (a)" etc.
function findBestPrefix(label, sectionMap) {
  const matching = Object.keys(sectionMap).filter(
    (prefix) =>
      label === prefix ||
      label.startsWith(prefix + ".") ||
      label.startsWith(prefix + "(") ||
      label.startsWith(prefix + " ")
  );
  if (!matching.length) return null;
  return matching.sort((a, b) => b.length - a.length)[0];
}

function applyAddendums(paper, sectionMap) {
  let count = 0;
  for (const q of paper.questions) {
    for (const sq of q.subQuestions) {
      const prefix = findBestPrefix(sq.label, sectionMap);
      if (!prefix) continue;

      const addendumUrl = BASE_URL + sectionMap[prefix];

      if (!sq.diagramUrl) {
        // No existing diagram — set directly
        sq.diagramUrl = addendumUrl;
      } else {
        // Already has a diagram — combine into diagramUrls array
        // diagramUrls takes precedence over diagramUrl in the renderer
        if (!sq.diagramUrls) {
          sq.diagramUrls = [sq.diagramUrl, addendumUrl];
        } else if (!sq.diagramUrls.includes(addendumUrl)) {
          sq.diagramUrls.push(addendumUrl);
        }
      }
      count++;
    }
  }
  return count;
}

function processFile(filePath, sectionMap, label) {
  const raw = readFileSync(filePath, "utf8");
  const paper = JSON.parse(raw);
  const n = applyAddendums(paper, sectionMap);
  writeFileSync(filePath, JSON.stringify(paper, null, 2), "utf8");
  console.log(`[${label}] Wired ${n} addendum diagramUrls → ${filePath}`);
}

const dir = resolve(process.cwd(), "data/papers");

processFile(`${dir}/maths-lit-p1-may-jun-2021-combined.json`, ML_P1_2021_ADDENDUM, "ml-p1-2021");
processFile(`${dir}/maths-lit-p2-may-jun-2021-combined.json`, ML_P2_2021_ADDENDUM, "ml-p2-2021");
processFile(`${dir}/maths-lit-p1-may-jun-2022-combined.json`, ML_P1_2022_ADDENDUM, "ml-p1-2022");
processFile(`${dir}/maths-lit-p2-may-jun-2022-combined.json`, ML_P2_2022_ADDENDUM, "ml-p2-2022");
processFile(`${dir}/maths-lit-p2-may-jun-2023-combined.json`, ML_P2_NOV2023_ADDENDUM, "ml-p2-nov2023");
processFile(`${dir}/maths-lit-p1-may-jun-2024-combined.json`, ML_P1_2024_ADDENDUM, "ml-p1-2024");
processFile(`${dir}/maths-lit-p2-may-jun-2024-combined.json`, ML_P2_2024_ADDENDUM, "ml-p2-2024");
processFile(`${dir}/maths-lit-p1-may-jun-2025.json`,          ML_P1_2025_ADDENDUM, "ml-p1-2025");
processFile(`${dir}/maths-lit-p2-may-jun-2025-combined.json`, ML_P2_2025_ADDENDUM, "ml-p2-2025");

console.log("Done.");
