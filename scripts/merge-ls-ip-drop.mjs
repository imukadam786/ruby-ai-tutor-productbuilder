// One-shot merge: pull L4/L5/L6 PSW topic files from _ip-drop/ into the
// consolidated life-skills-question-bank.json. Refuses to overwrite existing
// topic IDs (so re-running is safe).
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BANK_PATH = path.join(ROOT, "data/life-skills-question-bank.json");
const DROP_DIR  = path.join(ROOT, "data/life-skills-question-banks/_ip-drop");
const DROP_FILES = ["L4.json", "L5.json", "L6.json"];

const bank = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
const before = Object.keys(bank.topics).length;

let addedTopics = 0;
let addedItems = 0;
for (const file of DROP_FILES) {
  const drop = JSON.parse(fs.readFileSync(path.join(DROP_DIR, file), "utf8"));
  for (const [id, topic] of Object.entries(drop)) {
    if (bank.topics[id]) {
      console.log(`⚠ skipping ${id} — already in bank`);
      continue;
    }
    bank.topics[id] = topic;
    addedTopics += 1;
    addedItems  += topic.questions.length;
  }
}

bank.version = "1.1";
bank.description = "Life Skills consolidated question bank. Foundation Phase (Gr 1–3) covers BK&H; Intermediate Phase (Gr 4–6) covers PSW (Personal & Social Well-being). Authored by Claude.";

fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2));
console.log(`✓ Merge complete. Bank topics: ${before} → ${Object.keys(bank.topics).length} (+${addedTopics} topics, +${addedItems} items).`);
