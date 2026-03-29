/**
 * Converts D002, D003, D004 tasks in all 50 reading question-bank papers
 * from answerMode:"voice" to answerMode:"audio-tap" with 3 audio choices.
 */

const fs = require("fs");
const path = require("path");

// ── Phoneme label + TTS speech text for every letter ──────────────────────────

const LETTER_PHONEME = {
  a: { label: "/a/",  speech: "short A, as in apple"  },
  b: { label: "/b/",  speech: "B, as in bat"           },
  c: { label: "/k/",  speech: "K, as in cat"           },
  d: { label: "/d/",  speech: "D, as in dog"           },
  e: { label: "/e/",  speech: "short E, as in bed"     },
  f: { label: "/f/",  speech: "F, as in fish"          },
  g: { label: "/g/",  speech: "G, as in got"           },
  h: { label: "/h/",  speech: "H, as in hat"           },
  i: { label: "/i/",  speech: "short I, as in sit"     },
  j: { label: "/j/",  speech: "J, as in jump"          },
  k: { label: "/k/",  speech: "K, as in kite"          },
  l: { label: "/l/",  speech: "L, as in leg"           },
  m: { label: "/m/",  speech: "M, as in mat"           },
  n: { label: "/n/",  speech: "N, as in net"           },
  o: { label: "/o/",  speech: "short O, as in hot"     },
  p: { label: "/p/",  speech: "P, as in pin"           },
  q: { label: "/kw/", speech: "kw, as in queen"        },
  r: { label: "/r/",  speech: "R, as in red"           },
  s: { label: "/s/",  speech: "S, as in sun"           },
  t: { label: "/t/",  speech: "T, as in top"           },
  u: { label: "/u/",  speech: "short U, as in cup"     },
  v: { label: "/v/",  speech: "V, as in van"           },
  w: { label: "/w/",  speech: "W, as in wet"           },
  x: { label: "/ks/", speech: "ks, as in fox"          },
  y: { label: "/y/",  speech: "Y, as in yes"           },
  z: { label: "/z/",  speech: "Z, as in zip"           },
};

// ── Distractors for consonants (D003) ─────────────────────────────────────────
// Chosen to be plausible confusions (similar articulation or visual similarity)

const CONSONANT_DISTRACTORS = {
  b: ["d", "p"],  c: ["k", "s"],  d: ["b", "g"],  f: ["v", "p"],
  g: ["k", "d"],  h: ["m", "n"],  j: ["y", "g"],  k: ["g", "t"],
  l: ["r", "n"],  m: ["n", "b"],  n: ["m", "l"],  p: ["b", "t"],
  q: ["k", "c"],  r: ["l", "w"],  s: ["z", "f"],  t: ["d", "p"],
  v: ["f", "b"],  w: ["v", "r"],  x: ["k", "z"],  y: ["j", "w"],
  z: ["s", "v"],
};

// ── Distractors for short vowels (D004) ───────────────────────────────────────

const VOWEL_DISTRACTORS = {
  a: ["e", "o"],
  e: ["i", "a"],
  i: ["e", "u"],
  o: ["u", "a"],
  u: ["o", "i"],
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

// ── Fallback letters when a word has fewer than 3 unique letters ───────────────

const FALLBACK_LETTERS = ["m", "n", "l", "r", "b", "t", "p", "g", "s", "d"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeChoice(letter, correct) {
  const info = LETTER_PHONEME[letter.toLowerCase()];
  if (!info) return null;
  return {
    label: info.label,
    value: info.label,
    speech: info.speech,
    correct,
  };
}

/** Shuffle array in-place (Fisher-Yates) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── D002 — Phoneme Isolation ("What is the very FIRST sound in 'sun'?") ────────
// Correct: first letter of displayWord
// Distractors: remaining letters of the word (fill with fallbacks if needed)

function convertD002(task) {
  const word = (task.displayWord || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return task;

  const uniqueLetters = [...new Set(word.split(""))];
  const firstLetter = uniqueLetters[0];
  const distractors = uniqueLetters.slice(1);

  // Fill up to 2 distractors from fallbacks if needed
  for (const fb of FALLBACK_LETTERS) {
    if (distractors.length >= 2) break;
    if (fb !== firstLetter && !distractors.includes(fb)) distractors.push(fb);
  }

  const choices = [
    makeChoice(firstLetter, true),
    ...distractors.slice(0, 2).map((l) => makeChoice(l, false)),
  ].filter(Boolean);

  shuffle(choices);

  const updated = { ...task, answerMode: "audio-tap", choices };
  delete updated.expectedAnswer;
  delete updated.maxResponseMs;
  delete updated.voiceHint;
  return updated;
}

// ── D003 — Letter Sound Consonants ("What sound does this letter make?") ────────
// Correct: the displayed letter
// Distractors: from CONSONANT_DISTRACTORS map

function convertD003(task) {
  const letter = (task.displayWord || "").toLowerCase().replace(/[^a-z]/g, "")[0];
  if (!letter || VOWELS.has(letter)) return task;

  const distractors = (CONSONANT_DISTRACTORS[letter] || ["m", "n"]).slice(0, 2);
  const choices = [
    makeChoice(letter, true),
    ...distractors.map((l) => makeChoice(l, false)),
  ].filter(Boolean);

  shuffle(choices);

  const updated = { ...task, answerMode: "audio-tap", choices };
  delete updated.expectedAnswer;
  delete updated.maxResponseMs;
  delete updated.voiceHint;
  return updated;
}

// ── D004 — Letter Sound Vowels ("What SHORT sound does this letter make?") ─────
// Correct: the displayed vowel (short sound)
// Distractors: from VOWEL_DISTRACTORS map (other short vowels)

function convertD004(task) {
  const letter = (task.displayWord || "").toLowerCase().replace(/[^a-z]/g, "")[0];
  if (!letter || !VOWELS.has(letter)) return task;

  const distractors = (VOWEL_DISTRACTORS[letter] || ["e", "o"]).slice(0, 2);
  const choices = [
    makeChoice(letter, true),
    ...distractors.map((l) => makeChoice(l, false)),
  ].filter(Boolean);

  shuffle(choices);

  const updated = { ...task, answerMode: "audio-tap", choices };
  delete updated.expectedAnswer;
  delete updated.maxResponseMs;
  delete updated.voiceHint;
  return updated;
}

// ── Process all 50 papers ─────────────────────────────────────────────────────

const dir = path.join(__dirname, "..", "data", "question-banks");
let updated = 0;
let skipped = 0;

for (let i = 1; i <= 50; i++) {
  const filepath = path.join(dir, `${i}.json`);
  if (!fs.existsSync(filepath)) { skipped++; continue; }

  let tasks;
  try {
    tasks = JSON.parse(fs.readFileSync(filepath, "utf8"));
  } catch (e) {
    console.error(`  ✗ Failed to parse ${i}.json:`, e.message);
    skipped++;
    continue;
  }

  let changed = false;
  tasks = tasks.map((task) => {
    if (task.domainCode === "D002" && task.answerMode === "voice") {
      changed = true;
      return convertD002(task);
    }
    if (task.domainCode === "D003" && task.answerMode === "voice") {
      changed = true;
      return convertD003(task);
    }
    if (task.domainCode === "D004" && task.answerMode === "voice") {
      changed = true;
      return convertD004(task);
    }
    return task;
  });

  if (changed) {
    fs.writeFileSync(filepath, JSON.stringify(tasks, null, 2));
    updated++;
    console.log(`  ✓ ${i}.json — D002/D003/D004 converted`);
  }
}

console.log(`\nDone. Updated: ${updated} papers, skipped: ${skipped}`);
