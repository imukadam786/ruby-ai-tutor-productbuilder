/**
 * fix-diagnostic-modality.mjs
 *
 * Fixes all modality/UX bugs across all 50 question-bank JSON files.
 *
 * Priority 1 — D02/D03/D04/D05: remove visual-matching labels, replace with
 *              "Sound 1/2/3" + "Tap to hear" instruction text.
 * Priority 2 — D07/D08: insert missing CVC and digraph word-reading tasks.
 * Priority 3 — D15: change from voice (STT-unreliable prefix/suffix) to choice.
 * Priority 4 — D01: embed the word pair into the TTS-readable question text.
 * Priority 5 — Q16: remove impossible phoneme slash notation from question.
 */

import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANKS_DIR = path.join(__dirname, "..", "data", "question-banks");

// ─── Word lists (one entry per file, index 0 = file 1.json) ──────────────────

const D07_WORDS = [
  "cat", "dog", "sit", "cup", "map",
  "bat", "pig", "log", "bed", "sun",
  "bug", "tin", "hop", "red", "big",
  "mud", "hen", "pot", "lip", "ran",
  "den", "fit", "jog", "nap", "rub",
  "wet", "zip", "got", "him", "but",
  "sad", "ten", "dip", "hot", "fun",
  "cap", "win", "sob", "peg", "run",
  "hat", "bit", "top", "pup", "man",
  "kit", "mop", "let", "bin", "cut",
];

const D08_WORDS = [
  "ship",  "chin",  "chop",  "shed",  "chat",
  "shop",  "chip",  "shin",  "chest", "shell",
  "chalk", "chick", "shine", "shack", "champ",
  "chunk", "chain", "sheet", "shade", "sharp",
  "shelf", "chime", "cheap", "charm", "chess",
  "cheek", "shame", "chump", "shoe",  "shake",
  "check", "sheen", "shaft", "child", "shrug",
  "chill", "chimp", "share", "shave", "chuck",
  "shut",  "cheer", "shook", "shout", "shove",
  "shift", "short", "chant", "shown", "chose",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PREFIX_DISTRACTORS = ["UN", "RE", "DIS", "MIS", "PRE"];
const SUFFIX_DISTRACTORS = ["ING", "ED", "LY", "FUL", "NESS"];

function fixAudioTapLabels(task) {
  if (!["D02", "D03", "D04", "D05"].includes(task.id)) return task;
  if (!task.choices) return task;

  return {
    ...task,
    subText: "Tap to hear each sound, then choose the right one.",
    choices: task.choices.map((c, i) => ({
      ...c,
      label: `Sound ${i + 1}`,
      ...(c.value !== undefined ? { value: `sound-${i + 1}` } : {}),
    })),
  };
}

function fixD01(task) {
  if (task.id !== "D01") return task;
  if (!task.displayWord) return task;

  // displayWord is "cat • hat" — split on " • "
  const parts = task.displayWord.split(" • ");
  if (parts.length !== 2) return task;

  return {
    ...task,
    question: `Do '${parts[0]}' and '${parts[1]}' rhyme?`,
  };
}

function fixD15(task) {
  if (task.id !== "D15") return task;
  if (task.answerMode !== "voice") return task;

  const affix = (task.targetAffix || "").toUpperCase();
  const word  = (task.displayWord || "").toUpperCase();
  const isPrefix = task.affixType === "prefix";

  const base = isPrefix
    ? word.slice(affix.length)
    : word.slice(0, -affix.length);

  const distractorPool = isPrefix ? PREFIX_DISTRACTORS : SUFFIX_DISTRACTORS;
  const distractor = distractorPool.find((d) => d !== affix) ?? distractorPool[0];

  const choices = isPrefix
    ? [
        { label: affix,       value: affix.toLowerCase(),       correct: true  },
        { label: base,        value: base.toLowerCase(),        correct: false },
        { label: distractor,  value: distractor.toLowerCase(),  correct: false },
      ]
    : [
        { label: base,        value: base.toLowerCase(),        correct: false },
        { label: affix,       value: affix.toLowerCase(),       correct: true  },
        { label: distractor,  value: distractor.toLowerCase(),  correct: false },
      ];

  return {
    ...task,
    answerMode: "choice",
    question: isPrefix
      ? "Tap the prefix in this word."
      : "Tap the suffix in this word.",
    choices,
    // keep targetAffix / affixType for scoring reference
  };
}

function fixQ16(task) {
  if (task.id !== "Q16") return task;
  // Replace "Think of 'X' without the /Y/ sound. Tap the word you get."
  // with a TTS-safe question that requires no phoneme pronunciation.
  return {
    ...task,
    question: `Which word hides inside '${task.displayWord}'? Tap to choose.`,
  };
}

function makeD07(idx) {
  const word = D07_WORDS[idx];
  return {
    id: "D07",
    domain: "CVC Word Reading",
    domainCode: "D007",
    gate: "B",
    question: "Read this word out loud for me.",
    displayWord: word,
    answerMode: "voice",
    expectedAnswer: word,
    voiceHint: "Tap the mic and say the word you see",
  };
}

function makeD08(idx) {
  const word = D08_WORDS[idx];
  return {
    id: "D08",
    domain: "Digraph Word Decoding",
    domainCode: "D008",
    gate: "B",
    question: "Read this word out loud for me.",
    displayWord: word,
    answerMode: "voice",
    expectedAnswer: word,
    voiceHint: "Tap the mic and say the word you see",
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

let totalModified = 0;

for (let i = 1; i <= 50; i++) {
  const filePath = path.join(BANKS_DIR, `${i}.json`);
  let tasks = JSON.parse(readFileSync(filePath, "utf8"));

  // Priority 1: fix audio-tap labels (D02/D03/D04/D05)
  // Priority 3: D15 voice → choice
  // Priority 4: D01 TTS
  // Priority 5: Q16 phoneme notation
  tasks = tasks.map((t) =>
    fixAudioTapLabels(fixD15(fixD01(fixQ16(t))))
  );

  // Priority 2: insert D07 after D06 (if missing)
  const d06Idx = tasks.findIndex((t) => t.id === "D06");
  const hasD07  = tasks.some((t) => t.id === "D07");
  if (d06Idx !== -1 && !hasD07) {
    tasks.splice(d06Idx + 1, 0, makeD07(i - 1));
  }

  // Insert D08 after D07 (if missing)
  const d07Idx = tasks.findIndex((t) => t.id === "D07");
  const hasD08  = tasks.some((t) => t.id === "D08");
  if (d07Idx !== -1 && !hasD08) {
    tasks.splice(d07Idx + 1, 0, makeD08(i - 1));
  }

  writeFileSync(filePath, JSON.stringify(tasks, null, 2));
  totalModified++;
}

console.log(`Done — patched ${totalModified} files.`);
console.log("Changes applied:");
console.log("  [P1] D02/D03/D04/D05 — choice labels → Sound 1/2/3 + subText");
console.log("  [P2] D07/D08 — inserted after D06 in every file");
console.log("  [P3] D15 — voice → choice mode with tap-able prefix/suffix");
console.log("  [P4] D01 — question now speaks the word pair via TTS");
console.log("  [P5] Q16 — phoneme slash notation removed");
