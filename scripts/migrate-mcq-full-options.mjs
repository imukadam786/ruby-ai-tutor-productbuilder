/**
 * Migration: populate full A–J options for matching-type MCQ subquestions.
 *
 * Matching questions store the full Column B in questionText like:
 *   "...COLUMN B:\nA. description\nB. description\n..."  or
 *   "...COLUMN B options:\nA description\nB description\n..."
 *
 * When options only has < 8 keys, this script parses all available
 * letter entries from questionText and writes them into options.
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve, join } from "path";

const dir = resolve(process.cwd(), "data/papers");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

// Matches lines like: "A description", "A. description", "A: description", "A) description"
const OPTION_LINE_RE = /^([A-J])[.:)\s]\s*(.+)$/;

function parseOptionsFromText(questionText) {
  const lines = questionText.split("\n").map((l) => l.trim()).filter(Boolean);
  const found = {};
  let inColumnB = false;

  for (const line of lines) {
    if (/column\s*b/i.test(line)) {
      inColumnB = true;
      continue;
    }
    if (inColumnB) {
      const m = line.match(OPTION_LINE_RE);
      if (m) found[m[1]] = m[2].trim();
    }
  }

  // Fallback: scan whole text line-by-line
  if (Object.keys(found).length === 0) {
    for (const line of lines) {
      const m = line.match(OPTION_LINE_RE);
      if (m && /^[A-J]$/.test(m[1])) found[m[1]] = m[2].trim();
    }
  }

  // Fallback: inline semicolon-separated format
  // e.g. "Choose from: A. desc one; B. desc two; C. desc three"
  if (Object.keys(found).length === 0) {
    // Extract only the segment starting at the first "A." option to avoid
    // matching "COLUMN A" or "COLUMN B." labels before the real options list
    const startIdx = questionText.search(/(?:choose\s+from[^A-Z]*|:\s*)A\./i);
    const segment = startIdx >= 0
      ? questionText.slice(questionText.indexOf("A.", startIdx))
      : questionText;
    const inlineRe = /\b([A-J])\.\s*([^;)]+?)(?=\s*[;)]\s*[A-J]\.|[;)]|$)/g;
    let m;
    while ((m = inlineRe.exec(segment)) !== null) {
      found[m[1]] = m[2].trim();
    }
  }

  return found;
}

let totalFiles = 0;
let totalUpdated = 0;

for (const file of files) {
  const filePath = join(dir, file);
  const raw = readFileSync(filePath, "utf8").replace(/^﻿/, "");
  const paper = JSON.parse(raw);
  let changed = false;

  for (const q of paper.questions) {
    // Track last fully-parsed options set for "as listed in X.X.1" propagation
    let lastFullOptions = null;

    for (const sq of q.subQuestions) {
      if (sq.type !== "mcq" || !sq.options) continue;

      const existingKeys = Object.keys(sq.options).filter((k) => sq.options[k]);
      const isMatching =
        /column\s*[ab]/i.test(sq.questionText) ||
        /match.*term/i.test(sq.questionText) ||
        /choose.*description/i.test(sq.questionText);

      if (!isMatching) continue;

      // Propagate options from sibling when text says "as listed in X.X.1"
      if (/as listed in/i.test(sq.questionText) && lastFullOptions) {
        if (existingKeys.length < Object.keys(lastFullOptions).length) {
          sq.options = { ...lastFullOptions };
          changed = true;
          totalUpdated++;
        }
        continue;
      }

      const parsed = parseOptionsFromText(sq.questionText);
      if (Object.keys(parsed).length > existingKeys.length) {
        sq.options = parsed;
        lastFullOptions = parsed;
        changed = true;
        totalUpdated++;
      } else if (Object.keys(parsed).length > 0) {
        lastFullOptions = sq.options; // already full
      }
    }
  }

  if (changed) {
    writeFileSync(filePath, JSON.stringify(paper, null, 2), "utf8");
    totalFiles++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`\nDone. ${totalUpdated} subquestions updated across ${totalFiles} files.`);
