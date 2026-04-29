import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const papersDir = join(__dirname, "../data/papers");

const targets = [
  // Math P1
  "math-p1-may-jun-2021",
  "math-p1-may-jun-2022",
  "math-p1-may-jun-2023",
  "math-p1-may-jun-2024",
  "math-p1-may-jun-2025",
  "math-p1-prep-2026a",
  "math-p1-prep-2026b",
  // Math P2
  "math-p2-may-jun-2021",
  "math-p2-may-jun-2022",
  "math-p2-may-jun-2023",
  "math-p2-may-jun-2024",
  "math-p2-may-jun-2025",
  // Phys-Sci P1
  "phys-sci-p1-may-jun-2021",
  "phys-sci-p1-may-jun-2022",
  "phys-sci-p1-may-jun-2023",
  "phys-sci-p1-may-jun-2024",
  "phys-sci-p1-may-jun-2025",
  // Phys-Sci P2
  "phys-sci-p2-may-jun-2021",
  "phys-sci-p2-may-jun-2022",
  "phys-sci-p2-may-jun-2023",
  "phys-sci-p2-may-jun-2024",
  "phys-sci-p2-may-jun-2025",
  // English HL
  "eng-hl-p1-may-jun-2023",
  "eng-hl-p2-may-jun-2023",
  "eng-hl-p3-may-jun-2023",
  // Afrikaans FAL
  "afr-fal-p1-may-jun-2022",
  // Geography
  "geo-p1-may-jun-2023",
  "geo-p1-may-jun-2024",
  "geo-p1-may-jun-2025",
  // Life Sciences
  "life-sci-p1-may-jun-2023",
  "life-sci-p1-may-jun-2025",
];

let totalFixed = 0;

for (const name of targets) {
  const path = join(papersDir, `${name}.json`);
  const paper = JSON.parse(readFileSync(path, "utf8"));

  let fixed = 0;
  for (const q of paper.questions) {
    for (const sq of q.subQuestions) {
      if (!sq.type) {
        sq.type = "written";
        fixed++;
      }
    }
  }

  writeFileSync(path, JSON.stringify(paper, null, 2), "utf8");
  console.log(`${name}: +${fixed} type:written`);
  totalFixed += fixed;
}

console.log(`\nDone. Total subquestions updated: ${totalFixed}`);
