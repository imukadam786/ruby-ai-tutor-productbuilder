/**
 * Migration: extract word banks from questionText into wordBank[] field.
 *
 * Patterns handled:
 *   "...word(s) provided in the list below: word1; word2; word3\n\nSentence…"
 *   "...word(s) provided in the list below. (List: word1; word2; word3)\n\nSentence…"
 *   "...word(s) provided in the list below.\n\nword1; word2; word3\n\nSentence…"
 *
 * After extraction:
 *   - wordBank is set to the parsed array
 *   - questionText is stripped of the word list preamble, leaving just the sentence
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve, join } from "path";

const dir = resolve(process.cwd(), "data/papers");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

const TRIGGER_RE = /word\(s\)\s+provided|word\s+provided|words\s+provided|choose\s+from:/i;

function extractWordBank(questionText) {
  if (!TRIGGER_RE.test(questionText)) return null;

  let wordList = null;
  let cleanText = questionText;

  // Pattern 0: "Sentence. (Choose from: word1; word2; word3)"
  // The word list is AFTER the sentence — extract it and strip from questionText
  const chooseFromPattern = /\s*\(Choose\s+from:\s*([^)]+)\)\s*$/i;
  const chooseFromMatch = questionText.match(chooseFromPattern);
  if (chooseFromMatch) {
    wordList = chooseFromMatch[1].trim();
    cleanText = questionText.replace(chooseFromPattern, "").trim();
  }

  // Pattern 1: "list below: word1; word2\n\nSentence"
  // or "list below: word1; word2. word3\n\nSentence"
  const colonPattern = /list\s+below[.:]\s*([^\n]+?)(?:\n|$)/i;
  const colonMatch = questionText.match(colonPattern);
  if (colonMatch) {
    wordList = colonMatch[1].trim();
    // Remove the full preamble line
    cleanText = questionText.replace(/.*list\s+below[.:][^\n]*\n*/i, "").trim();
  }

  // Pattern 2: "(List: word1; word2)" or "(list below)\n\nword1; word2\n\nSentence"
  if (!wordList) {
    const parenPattern = /\(List:\s*([^)]+)\)/i;
    const parenMatch = questionText.match(parenPattern);
    if (parenMatch) {
      wordList = parenMatch[1].trim();
      cleanText = questionText.replace(/.*\(List:[^)]+\)\s*/i, "").trim();
    }
  }

  // Pattern 3: standalone word list on its own line after the trigger
  if (!wordList) {
    const parts = questionText.split(/\n\n+/);
    // Find the part containing the trigger and assume next paragraph is the list
    for (let i = 0; i < parts.length - 1; i++) {
      if (TRIGGER_RE.test(parts[i]) && /;/.test(parts[i + 1]) && !/\.\.\.|…/.test(parts[i + 1])) {
        wordList = parts[i + 1].trim();
        cleanText = parts.slice(i + 2).join("\n\n").trim();
        break;
      }
    }
  }

  if (!wordList) return null;

  // Parse the word list: split on semicolons or commas
  const words = wordList
    .split(/[;,]/)
    .map((w) => w.trim().replace(/[().]$/, "").trim())
    .filter((w) => w.length > 0 && w.length < 60);

  if (words.length < 3) return null;

  return { words, cleanText };
}

let totalFiles = 0;
let totalUpdated = 0;

for (const file of files) {
  const filePath = join(dir, file);
  const raw = readFileSync(filePath, "utf8").replace(/^﻿/, "");
  const paper = JSON.parse(raw);
  let changed = false;

  for (const q of paper.questions) {
    for (const sq of q.subQuestions) {
      // Skip if already has wordBank
      if (sq.wordBank) continue;
      if (sq.type === "mcq") continue;

      const result = extractWordBank(sq.questionText);
      if (!result) continue;

      sq.wordBank = result.words;
      sq.questionText = result.cleanText;
      changed = true;
      totalUpdated++;
    }
  }

  if (changed) {
    writeFileSync(filePath, JSON.stringify(paper, null, 2), "utf8");
    totalFiles++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`\nDone. ${totalUpdated} subquestions updated across ${totalFiles} files.`);
