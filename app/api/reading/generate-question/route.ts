import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL } from "@/lib/anthropic";
import { getReadingSkillById } from "@/lib/reading-student-model";
import { ReadingTemplate, ReadingGeneratedQuestion, AudioTapChoice } from "@/types/reading";
import type { ReadingQuestionBank, ReadingBankItem, ReadingBankSkill } from "@/types/reading-bank";

// Node.js serverless runtime (default — no `runtime = "edge"`): banks are
// loaded on demand per request via dynamic import so each level ships as its
// own webpack chunk. Only the requested level is loaded into the serverless
// container's memory.

// ── Question banks for L6+ (Intermediate Phase) ──────────────────────────────
// Tree skills (R6.T1.A1…) carry `bank_skill_id` (e.g. "L6.A1") → the bank skill.
// L6=Gr4 L7=Gr5 L8=Gr6 (Intermediate) · L9=Gr7 L10=Gr8 L11=Gr9 (Senior) ·
// L12=Gr10 L13=Gr11 L14=Gr12 (FET). L9–L14 ship as scaffolds: empty
// `items[]` makes buildBankQuestion return null and fall through until the
// head of education authors content. No code change needed when they do.
const bankCache = new Map<number, ReadingQuestionBank>();

async function loadReadingBank(level: number): Promise<ReadingQuestionBank | null> {
  const cached = bankCache.get(level);
  if (cached) return cached;
  let mod: { default: unknown } | null = null;
  switch (level) {
    case 6:  mod = await import("@/data/reading-question-banks/L6.json");  break;
    case 7:  mod = await import("@/data/reading-question-banks/L7.json");  break;
    case 8:  mod = await import("@/data/reading-question-banks/L8.json");  break;
    case 9:  mod = await import("@/data/reading-question-banks/L9.json");  break;
    case 10: mod = await import("@/data/reading-question-banks/L10.json"); break;
    case 11: mod = await import("@/data/reading-question-banks/L11.json"); break;
    case 12: mod = await import("@/data/reading-question-banks/L12.json"); break;
    case 13: mod = await import("@/data/reading-question-banks/L13.json"); break;
    case 14: mod = await import("@/data/reading-question-banks/L14.json"); break;
    default: return null;
  }
  const bank = mod.default as ReadingQuestionBank;
  bankCache.set(level, bank);
  return bank;
}

/** Source text shown to the learner — pooled (A1/A2/A3) or inline per skill.
 *  Some skills carry both a main passage and a data text (e.g. source
 *  integration) — show both. */
function bankItemSourceText(item: ReadingBankItem, bank: ReadingQuestionBank): string {
  if (item.textId) return bank.texts.find((t) => t.id === item.textId)?.body ?? "";
  const main = item.passage || item.procedureText || item.contextSentence || "";
  if (main && item.dataText) return `${main}\n\n${item.dataText}`;
  return main || item.dataText || "";
}

/** Build a question from the L6+ static bank for a tree skill that has a
 *  bank_skill_id. Returns null for L1–L5 skills (handled elsewhere) so the
 *  caller falls through to the existing pipeline. */
async function buildBankQuestion(
  skillId: string,
  used_refs: string[]
): Promise<Omit<ReadingGeneratedQuestion, "id"> | null> {
  const treeSkill = getReadingSkillById(skillId);
  const bankSkillId = treeSkill?.bank_skill_id;
  if (!treeSkill || !bankSkillId) return null;

  const levelMatch = skillId.match(/^R(\d+)/);
  const level = levelMatch ? parseInt(levelMatch[1], 10) : 0;
  const bank = await loadReadingBank(level);
  if (!bank) return null;

  const bankSkill = bank.skills.find((s) => s.skillId === bankSkillId) as
    | ReadingBankSkill
    | undefined;
  if (!bankSkill || bankSkill.items.length === 0) return null;

  const pool = bankSkill.items.filter((it) => !used_refs.includes(it.id));
  const items = pool.length > 0 ? pool : bankSkill.items;
  const item = items[Math.floor(Math.random() * items.length)];

  const source = bankItemSourceText(item, bank);
  const ask = item.question || item.prompt || bankSkill.defaultPrompt;
  let modeHint = "";
  if (item.answerKey.mode === "sequence") {
    modeHint = "\n\nWrite the steps in the correct order — one step per line.";
  } else if (item.answerKey.mode === "choice") {
    const opts = item.answerKey.options
      .map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`)
      .join("   ");
    modeHint = `\n\n${opts}\n\nType the letter of your answer.`;
  }
  const question = `${source ? source + "\n\n" : ""}${ask}${modeHint}`;

  return {
    skill_id: skillId,
    template: "written" as ReadingTemplate,
    question,
    // expected_answer carries the JSON answer-key so submit-answer scores
    // without re-loading the bank.
    expected_answer: JSON.stringify(item.answerKey),
    hint: bankSkill.recovery[0]?.action,
    scaffolding_notes: bankSkill.recovery[0]?.action ?? bankSkill.description,
    used_ref: item.id,
  };
}

// ── Audio-tap question builder for phoneme-production skills ──────────────────
// These skills (R2.T1, R2.T2) require isolated phoneme production which STT
// cannot reliably detect. We generate deterministic multiple-choice questions.

// ── Word-choice pools for phoneme-identification skills ───────────────────────
// TTS speaks full words only — no isolated phonemes.
// Each entry: one correct word + two distractor words.
// Student taps to hear each word, then picks the one with the target sound.

const VOWELS = new Set(["a","e","i","o","u"]);

// R2.T1 — Letter-Sound: correct word starts with (consonant) or contains (vowel) the phoneme
const LETTER_WORD_CHOICES: Record<string, { correct: string; distractors: [string, string] }> = {
  b: { correct: "bat",   distractors: ["dog",  "pin"]  },
  d: { correct: "dog",   distractors: ["bat",  "got"]  },
  f: { correct: "fan",   distractors: ["sun",  "mat"]  },
  g: { correct: "got",   distractors: ["dot",  "hot"]  },
  h: { correct: "hat",   distractors: ["bat",  "cat"]  },
  j: { correct: "jug",   distractors: ["bug",  "mug"]  },
  k: { correct: "kit",   distractors: ["bit",  "sit"]  },
  l: { correct: "log",   distractors: ["dog",  "fog"]  },
  m: { correct: "mat",   distractors: ["bat",  "hat"]  },
  n: { correct: "net",   distractors: ["bet",  "set"]  },
  p: { correct: "pin",   distractors: ["bin",  "tin"]  },
  r: { correct: "red",   distractors: ["bed",  "led"]  },
  s: { correct: "sun",   distractors: ["run",  "gun"]  },
  t: { correct: "top",   distractors: ["hop",  "pop"]  },
  v: { correct: "van",   distractors: ["pan",  "can"]  },
  w: { correct: "wet",   distractors: ["net",  "set"]  },
  y: { correct: "yam",   distractors: ["jam",  "ham"]  },
  z: { correct: "zip",   distractors: ["dip",  "hip"]  },
  // Vowels — correct word has the short vowel sound in the middle (CVC)
  a: { correct: "cat",   distractors: ["sit",  "hot"]  },
  e: { correct: "hen",   distractors: ["bin",  "hop"]  },
  i: { correct: "sit",   distractors: ["cat",  "cup"]  },
  o: { correct: "hot",   distractors: ["hat",  "hit"]  },
  u: { correct: "cup",   distractors: ["cap",  "cop"]  },
};

// R2.T1.A2 — Backward mapping: student hears/sees a word and picks the letter it starts with.
// Used to test the sound→letter direction. Consonant entries use first-sound; vowel entries use middle-sound.
const BACKWARD_LETTER_CHOICES: { word: string; correctLetter: string; distractorLetters: [string, string]; vowel: boolean }[] = [
  // Consonants — "Which letter makes the FIRST sound in '{word}'?"
  { word: "bat",  correctLetter: "B", distractorLetters: ["D", "P"],  vowel: false },
  { word: "dog",  correctLetter: "D", distractorLetters: ["B", "G"],  vowel: false },
  { word: "fan",  correctLetter: "F", distractorLetters: ["V", "N"],  vowel: false },
  { word: "got",  correctLetter: "G", distractorLetters: ["D", "K"],  vowel: false },
  { word: "hat",  correctLetter: "H", distractorLetters: ["B", "T"],  vowel: false },
  { word: "jug",  correctLetter: "J", distractorLetters: ["G", "B"],  vowel: false },
  { word: "kit",  correctLetter: "K", distractorLetters: ["G", "T"],  vowel: false },
  { word: "log",  correctLetter: "L", distractorLetters: ["D", "B"],  vowel: false },
  { word: "mat",  correctLetter: "M", distractorLetters: ["N", "W"],  vowel: false },
  { word: "net",  correctLetter: "N", distractorLetters: ["M", "H"],  vowel: false },
  { word: "pin",  correctLetter: "P", distractorLetters: ["B", "D"],  vowel: false },
  { word: "red",  correctLetter: "R", distractorLetters: ["D", "N"],  vowel: false },
  { word: "sun",  correctLetter: "S", distractorLetters: ["F", "N"],  vowel: false },
  { word: "top",  correctLetter: "T", distractorLetters: ["D", "P"],  vowel: false },
  { word: "van",  correctLetter: "V", distractorLetters: ["F", "B"],  vowel: false },
  { word: "wet",  correctLetter: "W", distractorLetters: ["M", "N"],  vowel: false },
  { word: "yam",  correctLetter: "Y", distractorLetters: ["J", "W"],  vowel: false },
  { word: "zip",  correctLetter: "Z", distractorLetters: ["S", "D"],  vowel: false },
  // Vowels — "Which letter makes the MIDDLE sound in '{word}'?"
  { word: "cat",  correctLetter: "A", distractorLetters: ["E", "O"],  vowel: true  },
  { word: "hen",  correctLetter: "E", distractorLetters: ["A", "I"],  vowel: true  },
  { word: "sit",  correctLetter: "I", distractorLetters: ["E", "A"],  vowel: true  },
  { word: "hot",  correctLetter: "O", distractorLetters: ["A", "U"],  vowel: true  },
  { word: "cup",  correctLetter: "U", distractorLetters: ["O", "A"],  vowel: true  },
];

// R2.T1.A3 — Confusable-pair discrimination: b/d, p/q, m/w.
// Student sees the letter (displayWord) and must pick the word that starts with its sound.
// The confusable field is always a word starting with the visually similar letter's sound —
// choosing it reveals a letter-shape mix-up.
const CONFUSABLE_PAIR_CHOICES: { letter: string; correct: string; confusable: string; neutral: string }[] = [
  // b / d
  { letter: "b", correct: "bat",  confusable: "dog",  neutral: "fan" },
  { letter: "b", correct: "bag",  confusable: "dig",  neutral: "sun" },
  { letter: "b", correct: "bug",  confusable: "dip",  neutral: "map" },
  { letter: "d", correct: "dog",  confusable: "bat",  neutral: "fan" },
  { letter: "d", correct: "dig",  confusable: "big",  neutral: "sun" },
  { letter: "d", correct: "dot",  confusable: "bit",  neutral: "map" },
  // p / q  (q = /kw/ so choices are clearly distinct sounds — tests letter-shape ID)
  { letter: "p", correct: "pin",  confusable: "quit", neutral: "sun" },
  { letter: "p", correct: "pat",  confusable: "quiz", neutral: "mat" },
  { letter: "p", correct: "pot",  confusable: "quit", neutral: "hot" },
  { letter: "q", correct: "quit", confusable: "pin",  neutral: "sun" },
  { letter: "q", correct: "quiz", confusable: "pat",  neutral: "mat" },
  // m / w
  { letter: "m", correct: "mat",  confusable: "wet",  neutral: "hat" },
  { letter: "m", correct: "mud",  confusable: "win",  neutral: "bud" },
  { letter: "m", correct: "men",  confusable: "web",  neutral: "hen" },
  { letter: "w", correct: "wet",  confusable: "mat",  neutral: "hat" },
  { letter: "w", correct: "win",  confusable: "mud",  neutral: "bud" },
  { letter: "w", correct: "web",  confusable: "men",  neutral: "hen" },
];

// R2.T2.A1 — Digraph: correct word contains the digraph sound
// Array format allows multiple entries per digraph (avoids same-word repeats within a BKT session)
const DIGRAPH_WORD_CHOICES: { digraph: string; correct: string; distractors: [string, string] }[] = [
  // SH
  { digraph: "sh", correct: "ship",  distractors: ["chip", "tip"]   },
  { digraph: "sh", correct: "shop",  distractors: ["drop", "crop"]  },
  { digraph: "sh", correct: "shell", distractors: ["bell", "fell"]  },
  // CH
  { digraph: "ch", correct: "chin",  distractors: ["shin", "tin"]   },
  { digraph: "ch", correct: "chop",  distractors: ["top",  "pop"]   },
  { digraph: "ch", correct: "chest", distractors: ["best", "rest"]  },
  // TH
  { digraph: "th", correct: "that",  distractors: ["sat",  "mat"]   },
  { digraph: "th", correct: "thin",  distractors: ["win",  "bin"]   },
  { digraph: "th", correct: "thumb", distractors: ["plum", "drum"]  },
  // WH
  { digraph: "wh", correct: "when",  distractors: ["hen",  "ten"]   },
  { digraph: "wh", correct: "whip",  distractors: ["dip",  "lip"]   },
  { digraph: "wh", correct: "wheel", distractors: ["feel", "meal"]  },
  // CK
  { digraph: "ck", correct: "duck",  distractors: ["dug",  "dun"]   },
  { digraph: "ck", correct: "back",  distractors: ["bat",  "bad"]   },
  { digraph: "ck", correct: "lock",  distractors: ["log",  "lot"]   },
  // NG
  { digraph: "ng", correct: "ring",  distractors: ["rim",  "rip"]   },
  { digraph: "ng", correct: "long",  distractors: ["log",  "lot"]   },
  { digraph: "ng", correct: "song",  distractors: ["son",  "sob"]   },
  // PH
  { digraph: "ph", correct: "phone", distractors: ["bone", "tone"]  },
  { digraph: "ph", correct: "photo", distractors: ["pony", "polo"]  },
  { digraph: "ph", correct: "graph", distractors: ["grab", "gram"]  },
  // extended entries
  { digraph: "sh", correct: "shade", distractors: ["blade", "made"] },
  { digraph: "sh", correct: "shift", distractors: ["drift", "lift"] },
  { digraph: "sh", correct: "shout", distractors: ["trout", "pout"] },
  { digraph: "sh", correct: "shrub", distractors: ["grub",  "club"] },
  { digraph: "ch", correct: "chick", distractors: ["trick", "brick"]},
  { digraph: "ch", correct: "chart", distractors: ["dart",  "part"] },
  { digraph: "ch", correct: "chess", distractors: ["dress", "press"]},
  { digraph: "ch", correct: "chuck", distractors: ["truck", "stuck"]},
  { digraph: "th", correct: "cloth", distractors: ["blot",  "slot"] },
  { digraph: "th", correct: "broth", distractors: ["blot",  "trot"] },
  { digraph: "th", correct: "teeth", distractors: ["feet",  "meet"] },
  { digraph: "wh", correct: "white", distractors: ["bite",  "kite"] },
  { digraph: "wh", correct: "whale", distractors: ["tale",  "bale"] },
  { digraph: "ck", correct: "clock", distractors: ["block", "flock"]},
  { digraph: "ck", correct: "trick", distractors: ["brick", "click"]},
  { digraph: "ck", correct: "black", distractors: ["slack", "stack"]},
  { digraph: "ng", correct: "bring", distractors: ["brim",  "brit"] },
  { digraph: "ng", correct: "sting", distractors: ["stem",  "step"] },
  { digraph: "ng", correct: "strong",distractors: ["strop", "strob"]},
];

// R2.T2.A2 — Blend: correct word starts with the consonant blend
const BLEND_WORD_CHOICES: Record<string, { correct: string; distractors: [string, string] }> = {
  bl: { correct: "blue",  distractors: ["clue",  "true"]  },
  cl: { correct: "clap",  distractors: ["flap",  "slap"]  },
  fl: { correct: "flag",  distractors: ["clap",  "drag"]  },
  pl: { correct: "plan",  distractors: ["clan",  "span"]  },
  br: { correct: "brim",  distractors: ["trim",  "grim"]  },
  cr: { correct: "crab",  distractors: ["drab",  "grab"]  },
  dr: { correct: "drip",  distractors: ["trip",  "grip"]  },
  fr: { correct: "frog",  distractors: ["blog",  "clog"]  },
  gr: { correct: "grin",  distractors: ["spin",  "slim"]  },
  pr: { correct: "press", distractors: ["dress", "bless"] },
  st: { correct: "stop",  distractors: ["drop",  "crop"]  },
  sp: { correct: "spin",  distractors: ["grin",  "slim"]  },
  sn: { correct: "snap",  distractors: ["trap",  "clap"]  },
  sk: { correct: "skip",  distractors: ["drip",  "trip"]  },
  tr: { correct: "trap",  distractors: ["snap",  "clap"]  },
  sl: { correct: "slip",  distractors: ["skip",  "grip"]  },
  sw: { correct: "swim",  distractors: ["slim",  "trim"]  },
};

// ── R1 audio-tap pools ────────────────────────────────────────────────────────
// All R1 phonological skills use word-choice format.
// Questions use natural language only — no /phoneme/ slash notation.

// R1.T2.A1 — Rhyme: student picks the word that rhymes with the target
const RHYME_CHOICES: { target: string; correct: string; distractors: [string, string] }[] = [
  { target: "cat",   correct: "hat",   distractors: ["dog",   "run"]   },
  { target: "bed",   correct: "red",   distractors: ["cat",   "top"]   },
  { target: "hop",   correct: "mop",   distractors: ["cup",   "six"]   },
  { target: "sun",   correct: "fun",   distractors: ["hat",   "dot"]   },
  { target: "pig",   correct: "dig",   distractors: ["cup",   "map"]   },
  { target: "ball",  correct: "tall",  distractors: ["run",   "bin"]   },
  { target: "cake",  correct: "lake",  distractors: ["top",   "cup"]   },
  { target: "tree",  correct: "bee",   distractors: ["hat",   "dog"]   },
  { target: "ship",  correct: "tip",   distractors: ["bus",   "hot"]   },
  { target: "king",  correct: "ring",  distractors: ["cup",   "dog"]   },
  { target: "rain",  correct: "train", distractors: ["cloud", "bus"]   },
  { target: "night", correct: "light", distractors: ["day",   "bird"]  },
  { target: "book",  correct: "look",  distractors: ["run",   "sit"]   },
  { target: "star",  correct: "car",   distractors: ["moon",  "fish"]  },
  { target: "cold",  correct: "bold",  distractors: ["warm",  "soft"]  },
  // extended pool
  { target: "fog",   correct: "log",   distractors: ["hat",   "cup"]   },
  { target: "cap",   correct: "map",   distractors: ["dog",   "run"]   },
  { target: "bit",   correct: "sit",   distractors: ["hop",   "map"]   },
  { target: "bug",   correct: "mug",   distractors: ["bat",   "hop"]   },
  { target: "wet",   correct: "net",   distractors: ["cup",   "dog"]   },
  { target: "fan",   correct: "ran",   distractors: ["dog",   "cup"]   },
  { target: "pin",   correct: "bin",   distractors: ["hot",   "cap"]   },
  { target: "tall",  correct: "wall",  distractors: ["run",   "dog"]   },
  { target: "meet",  correct: "feet",  distractors: ["hat",   "cup"]   },
  { target: "rope",  correct: "hope",  distractors: ["hat",   "cup"]   },
  { target: "tell",  correct: "bell",  distractors: ["run",   "hat"]   },
  { target: "sand",  correct: "hand",  distractors: ["cup",   "dog"]   },
  { target: "heat",  correct: "meat",  distractors: ["book",  "run"]   },
  { target: "clock", correct: "block", distractors: ["ship",  "dog"]   },
  { target: "cry",   correct: "fly",   distractors: ["sun",   "hat"]   },
  { target: "blow",  correct: "snow",  distractors: ["cup",   "hat"]   },
  { target: "train", correct: "chain", distractors: ["book",  "cup"]   },
  { target: "stone", correct: "bone",  distractors: ["book",  "cup"]   },
  { target: "sleep", correct: "deep",  distractors: ["hat",   "cup"]   },
  { target: "white", correct: "bite",  distractors: ["book",  "cup"]   },
  { target: "coat",  correct: "boat",  distractors: ["hat",   "sun"]   },
  { target: "town",  correct: "brown", distractors: ["sun",   "hat"]   },
  { target: "clap",  correct: "map",   distractors: ["dog",   "cup"]   },
  { target: "spring",correct: "ring",  distractors: ["book",  "sun"]   },
  { target: "play",  correct: "day",   distractors: ["sun",   "dog"]   },
  { target: "mad",   correct: "glad",  distractors: ["cup",   "run"]   },
  { target: "mix",   correct: "fix",   distractors: ["dog",   "hat"]   },
  { target: "best",  correct: "nest",  distractors: ["run",   "cup"]   },
  { target: "top",   correct: "drop",  distractors: ["sun",   "hat"]   },
  { target: "jump",  correct: "pump",  distractors: ["dog",   "run"]   },
  { target: "chair", correct: "bear",  distractors: ["book",  "cup"]   },
  { target: "found", correct: "round", distractors: ["hat",   "dog"]   },
  { target: "green", correct: "seen",  distractors: ["cup",   "hat"]   },
  { target: "bright",correct: "night", distractors: ["cup",   "sun"]   },
];

// R1.T2.A2 — Syllable: student picks the word with the target number of syllables
const SYLLABLE_CHOICES: { count: number; correct: string; distractors: [string, string] }[] = [
  { count: 1, correct: "cat",       distractors: ["rabbit",    "umbrella"]  },
  { count: 2, correct: "rabbit",    distractors: ["cat",       "together"]  },
  { count: 3, correct: "together",  distractors: ["rabbit",    "cat"]       },
  { count: 1, correct: "jump",      distractors: ["happy",     "remember"]  },
  { count: 2, correct: "puppy",     distractors: ["fish",      "computer"]  },
  { count: 3, correct: "umbrella",  distractors: ["bird",      "garden"]    },
  { count: 1, correct: "bath",      distractors: ["table",     "tomorrow"]  },
  { count: 2, correct: "window",    distractors: ["run",       "remember"]  },
  { count: 3, correct: "computer",  distractors: ["puppy",     "dog"]       },
  { count: 1, correct: "hot",       distractors: ["button",    "umbrella"]  },
  { count: 2, correct: "garden",    distractors: ["cat",       "computer"]  },
  { count: 3, correct: "remember",  distractors: ["happy",     "fish"]      },
  // extended pool
  { count: 1, correct: "snake",     distractors: ["yellow",    "library"]   },
  { count: 2, correct: "yellow",    distractors: ["snake",     "library"]   },
  { count: 3, correct: "library",   distractors: ["snake",     "yellow"]    },
  { count: 1, correct: "flag",      distractors: ["open",      "beautiful"] },
  { count: 2, correct: "open",      distractors: ["flag",      "beautiful"] },
  { count: 3, correct: "beautiful", distractors: ["open",      "flag"]      },
  { count: 1, correct: "house",     distractors: ["sister",    "another"]   },
  { count: 2, correct: "sister",    distractors: ["house",     "another"]   },
  { count: 3, correct: "another",   distractors: ["house",     "sister"]    },
  { count: 1, correct: "train",     distractors: ["morning",   "adventure"] },
  { count: 2, correct: "morning",   distractors: ["train",     "adventure"] },
  { count: 3, correct: "adventure", distractors: ["morning",   "train"]     },
  { count: 1, correct: "drum",      distractors: ["begin",     "amazing"]   },
  { count: 2, correct: "begin",     distractors: ["drum",      "amazing"]   },
  { count: 3, correct: "amazing",   distractors: ["drum",      "begin"]     },
  { count: 1, correct: "cheese",    distractors: ["lucky",     "fantastic"] },
  { count: 2, correct: "lucky",     distractors: ["cheese",    "fantastic"] },
  { count: 3, correct: "fantastic", distractors: ["cheese",    "lucky"]     },
  { count: 1, correct: "phone",     distractors: ["lion",      "tomorrow"]  },
  { count: 2, correct: "lion",      distractors: ["phone",     "tomorrow"]  },
  { count: 3, correct: "tomorrow",  distractors: ["phone",     "lion"]      },
  { count: 1, correct: "fly",       distractors: ["pencil",    "elephant"]  },
  { count: 2, correct: "pencil",    distractors: ["fly",       "elephant"]  },
  { count: 3, correct: "elephant",  distractors: ["pencil",    "fly"]       },
  { count: 1, correct: "sport",     distractors: ["table",     "family"]    },
  { count: 2, correct: "table",     distractors: ["sport",     "family"]    },
  { count: 3, correct: "family",    distractors: ["sport",     "table"]     },
  { count: 1, correct: "street",    distractors: ["butter",    "however"]   },
  { count: 2, correct: "butter",    distractors: ["street",    "however"]   },
  { count: 3, correct: "however",   distractors: ["butter",    "street"]    },
  { count: 1, correct: "slide",     distractors: ["mirror",    "important"] },
  { count: 2, correct: "mirror",    distractors: ["slide",     "important"] },
  { count: 3, correct: "important", distractors: ["mirror",    "slide"]     },
  { count: 1, correct: "book",      distractors: ["monkey",    "exciting"]  },
  { count: 2, correct: "monkey",    distractors: ["book",      "exciting"]  },
  { count: 3, correct: "exciting",  distractors: ["monkey",    "book"]      },
];

// R1.T3.A1 — Phoneme Isolation: student picks the word that shares the onset or coda
const PHONEME_ISOLATION_CHOICES: {
  type: "onset" | "coda";
  target: string;
  correct: string;
  distractors: [string, string];
}[] = [
  // Onset (first sound)
  { type: "onset", target: "sun",  correct: "sock", distractors: ["bat",  "dog"]  },
  { type: "onset", target: "ball", correct: "bat",  distractors: ["cap",  "sun"]  },
  { type: "onset", target: "fan",  correct: "fish", distractors: ["dog",  "hat"]  },
  { type: "onset", target: "mat",  correct: "map",  distractors: ["cat",  "run"]  },
  { type: "onset", target: "top",  correct: "tin",  distractors: ["bat",  "red"]  },
  { type: "onset", target: "net",  correct: "nap",  distractors: ["cup",  "dig"]  },
  { type: "onset", target: "red",  correct: "rat",  distractors: ["pin",  "hat"]  },
  { type: "onset", target: "hot",  correct: "hat",  distractors: ["cat",  "dog"]  },
  // Coda (last sound)
  { type: "coda",  target: "cat",  correct: "hot",  distractors: ["bed",  "cup"]  },
  { type: "coda",  target: "dog",  correct: "bag",  distractors: ["cat",  "pin"]  },
  { type: "coda",  target: "sun",  correct: "bin",  distractors: ["hot",  "dig"]  },
  { type: "coda",  target: "lip",  correct: "cup",  distractors: ["bat",  "red"]  },
  { type: "coda",  target: "red",  correct: "bed",  distractors: ["cat",  "top"]  },
  { type: "coda",  target: "ham",  correct: "dim",  distractors: ["hot",  "cat"]  },
  { type: "coda",  target: "fix",  correct: "box",  distractors: ["hat",  "run"]  },
  { type: "coda",  target: "bell", correct: "fill", distractors: ["bat",  "top"]  },
  // extended onset
  { type: "onset", target: "cat",  correct: "cap",  distractors: ["sun",  "mop"]  },
  { type: "onset", target: "dog",  correct: "dip",  distractors: ["cat",  "run"]  },
  { type: "onset", target: "pig",  correct: "pot",  distractors: ["bat",  "cup"]  },
  { type: "onset", target: "log",  correct: "lid",  distractors: ["bat",  "cup"]  },
  { type: "onset", target: "map",  correct: "mud",  distractors: ["cup",  "dog"]  },
  { type: "onset", target: "bin",  correct: "bad",  distractors: ["cup",  "dog"]  },
  { type: "onset", target: "cup",  correct: "cod",  distractors: ["sun",  "bat"]  },
  { type: "onset", target: "sit",  correct: "sob",  distractors: ["hat",  "run"]  },
  { type: "onset", target: "gap",  correct: "got",  distractors: ["sun",  "bat"]  },
  { type: "onset", target: "win",  correct: "web",  distractors: ["cup",  "dog"]  },
  { type: "onset", target: "hit",  correct: "hop",  distractors: ["bat",  "cup"]  },
  { type: "onset", target: "run",  correct: "rug",  distractors: ["hat",  "dog"]  },
  { type: "onset", target: "jet",  correct: "jug",  distractors: ["bat",  "cup"]  },
  { type: "onset", target: "kit",  correct: "kid",  distractors: ["sun",  "mop"]  },
  { type: "onset", target: "zip",  correct: "zap",  distractors: ["cup",  "bat"]  },
  // extended coda
  { type: "coda",  target: "map",  correct: "cup",  distractors: ["dog",  "sun"]  },
  { type: "coda",  target: "sit",  correct: "bat",  distractors: ["dog",  "run"]  },
  { type: "coda",  target: "run",  correct: "hen",  distractors: ["cat",  "top"]  },
  { type: "coda",  target: "bed",  correct: "mad",  distractors: ["top",  "cup"]  },
  { type: "coda",  target: "got",  correct: "hot",  distractors: ["cup",  "bin"]  },
  { type: "coda",  target: "bag",  correct: "big",  distractors: ["cup",  "hot"]  },
  { type: "coda",  target: "mud",  correct: "sad",  distractors: ["top",  "cup"]  },
  { type: "coda",  target: "win",  correct: "sun",  distractors: ["hot",  "cap"]  },
  { type: "coda",  target: "hop",  correct: "cup",  distractors: ["bat",  "dog"]  },
  { type: "coda",  target: "set",  correct: "bit",  distractors: ["dog",  "run"]  },
  { type: "coda",  target: "dim",  correct: "swim", distractors: ["bat",  "cup"]  },
  { type: "coda",  target: "kick", correct: "sock", distractors: ["cup",  "bat"]  },
];

// R1.T3.A2 — Segmentation & Blending: two sub-types
const PHONEME_SEGMENT_CHOICES: {
  type: "count";
  count: number;
  correct: string;
  distractors: [string, string];
}[] = [
  { type: "count", count: 2, correct: "go",    distractors: ["cat",   "stop"]  },
  { type: "count", count: 3, correct: "cat",   distractors: ["go",    "stop"]  },
  { type: "count", count: 4, correct: "stop",  distractors: ["cat",   "go"]    },
  { type: "count", count: 2, correct: "up",    distractors: ["bat",   "frog"]  },
  { type: "count", count: 3, correct: "bat",   distractors: ["up",    "frog"]  },
  { type: "count", count: 4, correct: "frog",  distractors: ["bat",   "up"]    },
  { type: "count", count: 3, correct: "sun",   distractors: ["me",    "clap"]  },
  { type: "count", count: 2, correct: "me",    distractors: ["sun",   "clap"]  },
  { type: "count", count: 4, correct: "clap",  distractors: ["sun",   "me"]    },
  { type: "count", count: 3, correct: "hop",   distractors: ["at",    "flat"]  },
  { type: "count", count: 2, correct: "at",    distractors: ["hop",   "flat"]  },
  { type: "count", count: 4, correct: "flat",  distractors: ["hop",   "at"]    },
  // extended pool
  { type: "count", count: 2, correct: "no",    distractors: ["dog",   "trip"]  },
  { type: "count", count: 3, correct: "dog",   distractors: ["no",    "trip"]  },
  { type: "count", count: 4, correct: "trip",  distractors: ["dog",   "no"]    },
  { type: "count", count: 2, correct: "ice",   distractors: ["red",   "skin"]  },
  { type: "count", count: 3, correct: "red",   distractors: ["ice",   "skin"]  },
  { type: "count", count: 4, correct: "skin",  distractors: ["red",   "ice"]   },
  { type: "count", count: 2, correct: "I",     distractors: ["him",   "jump"]  },
  { type: "count", count: 3, correct: "him",   distractors: ["I",     "jump"]  },
  { type: "count", count: 4, correct: "jump",  distractors: ["him",   "I"]     },
  { type: "count", count: 3, correct: "sit",   distractors: ["my",    "hand"]  },
  { type: "count", count: 2, correct: "my",    distractors: ["sit",   "hand"]  },
  { type: "count", count: 4, correct: "hand",  distractors: ["sit",   "my"]    },
  { type: "count", count: 3, correct: "mud",   distractors: ["a",     "grim"]  },
  { type: "count", count: 2, correct: "be",    distractors: ["mud",   "grim"]  },
  { type: "count", count: 4, correct: "grim",  distractors: ["mud",   "be"]    },
  { type: "count", count: 3, correct: "map",   distractors: ["two",   "belt"]  },
  { type: "count", count: 2, correct: "two",   distractors: ["map",   "belt"]  },
  { type: "count", count: 4, correct: "belt",  distractors: ["map",   "two"]   },
  { type: "count", count: 3, correct: "job",   distractors: ["I",     "snap"]  },
  { type: "count", count: 4, correct: "snap",  distractors: ["job",   "I"]     },
  { type: "count", count: 3, correct: "cup",   distractors: ["ow",    "step"]  },
  { type: "count", count: 2, correct: "ow",    distractors: ["cup",   "step"]  },
  { type: "count", count: 4, correct: "step",  distractors: ["cup",   "ow"]    },
  { type: "count", count: 3, correct: "bin",   distractors: ["so",    "plop"]  },
  { type: "count", count: 2, correct: "so",    distractors: ["bin",   "plop"]  },
  { type: "count", count: 4, correct: "plop",  distractors: ["bin",   "so"]    },
  { type: "count", count: 3, correct: "hen",   distractors: ["he",    "slim"]  },
  { type: "count", count: 2, correct: "he",    distractors: ["hen",   "slim"]  },
  { type: "count", count: 4, correct: "slim",  distractors: ["hen",   "he"]    },
];
const PHONEME_BLEND_CHOICES: {
  type: "blend";
  segments: string;
  correct: string;
  distractors: [string, string];
}[] = [
  { type: "blend", segments: "k - a - t",     correct: "cat",   distractors: ["bat",   "cup"]   },
  { type: "blend", segments: "s - u - n",     correct: "sun",   distractors: ["fun",   "bun"]   },
  { type: "blend", segments: "d - o - g",     correct: "dog",   distractors: ["log",   "fog"]   },
  { type: "blend", segments: "r - e - d",     correct: "red",   distractors: ["bed",   "led"]   },
  { type: "blend", segments: "h - o - p",     correct: "hop",   distractors: ["top",   "pop"]   },
  { type: "blend", segments: "p - i - n",     correct: "pin",   distractors: ["bin",   "tin"]   },
  { type: "blend", segments: "m - a - p",     correct: "map",   distractors: ["cap",   "tap"]   },
  { type: "blend", segments: "b - u - g",     correct: "bug",   distractors: ["dug",   "mug"]   },
  // extended pool
  { type: "blend", segments: "f - i - sh",    correct: "fish",  distractors: ["dish",  "wish"]  },
  { type: "blend", segments: "ch - i - p",    correct: "chip",  distractors: ["ship",  "tip"]   },
  { type: "blend", segments: "sh - o - p",    correct: "shop",  distractors: ["stop",  "chop"]  },
  { type: "blend", segments: "th - i - n",    correct: "thin",  distractors: ["win",   "chin"]  },
  { type: "blend", segments: "w - e - b",     correct: "web",   distractors: ["bed",   "wet"]   },
  { type: "blend", segments: "j - o - g",     correct: "jog",   distractors: ["log",   "fog"]   },
  { type: "blend", segments: "n - u - t",     correct: "nut",   distractors: ["but",   "gut"]   },
  { type: "blend", segments: "v - a - n",     correct: "van",   distractors: ["can",   "pan"]   },
  { type: "blend", segments: "z - i - p",     correct: "zip",   distractors: ["dip",   "hip"]   },
  { type: "blend", segments: "w - i - g",     correct: "wig",   distractors: ["big",   "dig"]   },
  { type: "blend", segments: "l - e - g",     correct: "leg",   distractors: ["beg",   "peg"]   },
  { type: "blend", segments: "t - u - b",     correct: "tub",   distractors: ["cub",   "rub"]   },
  { type: "blend", segments: "f - o - g",     correct: "fog",   distractors: ["dog",   "log"]   },
  { type: "blend", segments: "g - u - m",     correct: "gum",   distractors: ["rum",   "sum"]   },
  { type: "blend", segments: "s - a - d",     correct: "sad",   distractors: ["bad",   "mad"]   },
  { type: "blend", segments: "h - e - n",     correct: "hen",   distractors: ["den",   "ten"]   },
  { type: "blend", segments: "c - o - t",     correct: "cot",   distractors: ["dot",   "got"]   },
  { type: "blend", segments: "r - i - p",     correct: "rip",   distractors: ["dip",   "tip"]   },
  { type: "blend", segments: "t - i - n",     correct: "tin",   distractors: ["bin",   "fin"]   },
  { type: "blend", segments: "p - o - t",     correct: "pot",   distractors: ["cot",   "hot"]   },
  { type: "blend", segments: "c - u - p",     correct: "cup",   distractors: ["pup",   "sup"]   },
  { type: "blend", segments: "b - i - t",     correct: "bit",   distractors: ["fit",   "hit"]   },
  { type: "blend", segments: "s - i - t",     correct: "sit",   distractors: ["bit",   "wit"]   },
  { type: "blend", segments: "d - i - m",     correct: "dim",   distractors: ["him",   "rim"]   },
  { type: "blend", segments: "g - o - t",     correct: "got",   distractors: ["cot",   "hot"]   },
  { type: "blend", segments: "w - a - x",     correct: "wax",   distractors: ["tax",   "max"]   },
  { type: "blend", segments: "y - a - m",     correct: "yam",   distractors: ["jam",   "ham"]   },
  { type: "blend", segments: "c - a - b",     correct: "cab",   distractors: ["dab",   "tab"]   },
  { type: "blend", segments: "s - o - b",     correct: "sob",   distractors: ["bob",   "mob"]   },
  { type: "blend", segments: "l - i - p",     correct: "lip",   distractors: ["dip",   "tip"]   },
  { type: "blend", segments: "m - o - p",     correct: "mop",   distractors: ["hop",   "top"]   },
  { type: "blend", segments: "r - u - g",     correct: "rug",   distractors: ["bug",   "mug"]   },
  { type: "blend", segments: "n - a - p",     correct: "nap",   distractors: ["cap",   "tap"]   },
];

// R1.T3.A3 — Phoneme Manipulation: deletion and substitution (natural language, no slash notation)
const PHONEME_MANIP_CHOICES: {
  type: "delete" | "substitute";
  target: string;
  position: "first" | "last";
  to?: string;
  correct: string;
  distractors: [string, string];
}[] = [
  // Deletion — remove first sound
  { type: "delete",     target: "bat",  position: "first",           correct: "at",  distractors: ["hat",  "fat"]  },
  { type: "delete",     target: "stop", position: "first",           correct: "top", distractors: ["hop",  "pop"]  },
  { type: "delete",     target: "slip", position: "first",           correct: "lip", distractors: ["dip",  "tip"]  },
  { type: "delete",     target: "snag", position: "first",           correct: "nag", distractors: ["bag",  "tag"]  },
  { type: "delete",     target: "grip", position: "first",           correct: "rip", distractors: ["dip",  "hip"]  },
  // Deletion — remove last sound
  { type: "delete",     target: "cats", position: "last",            correct: "cat", distractors: ["bat",  "hat"]  },
  { type: "delete",     target: "runs", position: "last",            correct: "run", distractors: ["sun",  "fun"]  },
  { type: "delete",     target: "dogs", position: "last",            correct: "dog", distractors: ["log",  "fog"]  },
  // Substitution — change first sound
  { type: "substitute", target: "bat",  position: "first", to: "s",  correct: "sat", distractors: ["hat",  "mat"]  },
  { type: "substitute", target: "hot",  position: "first", to: "d",  correct: "dot", distractors: ["pot",  "lot"]  },
  { type: "substitute", target: "pin",  position: "first", to: "b",  correct: "bin", distractors: ["tin",  "sin"]  },
  { type: "substitute", target: "fan",  position: "first", to: "r",  correct: "ran", distractors: ["can",  "pan"]  },
  // Substitution — change last sound
  { type: "substitute", target: "cap",  position: "last",  to: "t",  correct: "cat", distractors: ["bat",  "hat"]  },
  { type: "substitute", target: "mud",  position: "last",  to: "g",  correct: "mug", distractors: ["bug",  "tug"]  },
  { type: "substitute", target: "sit",  position: "last",  to: "p",  correct: "sip", distractors: ["dip",  "tip"]  },
  // extended deletion — first sound
  { type: "delete",     target: "flat", position: "first",           correct: "lat", distractors: ["mat",  "sat"]  },
  { type: "delete",     target: "clap", position: "first",           correct: "lap", distractors: ["map",  "cap"]  },
  { type: "delete",     target: "spin", position: "first",           correct: "pin", distractors: ["bin",  "tin"]  },
  { type: "delete",     target: "frog", position: "first",           correct: "rog", distractors: ["log",  "fog"]  },
  { type: "delete",     target: "trip", position: "first",           correct: "rip", distractors: ["dip",  "tip"]  },
  { type: "delete",     target: "snap", position: "first",           correct: "nap", distractors: ["cap",  "map"]  },
  { type: "delete",     target: "skin", position: "first",           correct: "kin", distractors: ["bin",  "tin"]  },
  { type: "delete",     target: "drip", position: "first",           correct: "rip", distractors: ["dip",  "hip"]  },
  { type: "delete",     target: "crab", position: "first",           correct: "rab", distractors: ["tab",  "cab"]  },
  { type: "delete",     target: "plan", position: "first",           correct: "lan", distractors: ["ran",  "can"]  },
  // extended deletion — last sound
  { type: "delete",     target: "maps", position: "last",            correct: "map", distractors: ["cap",  "tap"]  },
  { type: "delete",     target: "bins", position: "last",            correct: "bin", distractors: ["pin",  "tin"]  },
  { type: "delete",     target: "cups", position: "last",            correct: "cup", distractors: ["pup",  "sup"]  },
  { type: "delete",     target: "hats", position: "last",            correct: "hat", distractors: ["bat",  "mat"]  },
  { type: "delete",     target: "beds", position: "last",            correct: "bed", distractors: ["red",  "led"]  },
  // extended substitution — change first sound
  { type: "substitute", target: "mat",  position: "first", to: "c",  correct: "cat", distractors: ["bat",  "sat"]  },
  { type: "substitute", target: "log",  position: "first", to: "d",  correct: "dog", distractors: ["fog",  "hog"]  },
  { type: "substitute", target: "cup",  position: "first", to: "p",  correct: "pup", distractors: ["sup",  "tup"]  },
  { type: "substitute", target: "dig",  position: "first", to: "b",  correct: "big", distractors: ["wig",  "fig"]  },
  { type: "substitute", target: "net",  position: "first", to: "w",  correct: "wet", distractors: ["set",  "met"]  },
  { type: "substitute", target: "ran",  position: "first", to: "c",  correct: "can", distractors: ["pan",  "man"]  },
  { type: "substitute", target: "hop",  position: "first", to: "t",  correct: "top", distractors: ["pop",  "cop"]  },
  { type: "substitute", target: "sun",  position: "first", to: "f",  correct: "fun", distractors: ["run",  "bun"]  },
  // extended substitution — change last sound
  { type: "substitute", target: "bit",  position: "last",  to: "g",  correct: "big", distractors: ["dig",  "wig"]  },
  { type: "substitute", target: "hop",  position: "last",  to: "t",  correct: "hot", distractors: ["dot",  "got"]  },
  { type: "substitute", target: "ran",  position: "last",  to: "g",  correct: "rag", distractors: ["bag",  "tag"]  },
  { type: "substitute", target: "pin",  position: "last",  to: "g",  correct: "pig", distractors: ["big",  "dig"]  },
  { type: "substitute", target: "bed",  position: "last",  to: "g",  correct: "beg", distractors: ["leg",  "peg"]  },
  { type: "substitute", target: "cup",  position: "last",  to: "t",  correct: "cut", distractors: ["but",  "gut"]  },
  { type: "substitute", target: "log",  position: "last",  to: "t",  correct: "lot", distractors: ["cot",  "dot"]  },
];

// ── Static word pools for L2 reading and L3 encoding skills ──────────────────
// These replace LLM calls for written/reading template skills.
// Expected answer is always the word itself (exact match, case-insensitive).

// R3.T1.A1 + R2.T2.A3 — Short-vowel CVC words (no blends or digraphs)
const CVC_POOL = [
  "cat","dog","sit","hot","run","bin","mat","fog","pin","cup",
  "bat","hen","lip","jog","mud","cap","bed","dig","mop","bud",
  "fin","leg","hop","sad","wet","big","nap","set","tip","web",
  "zip","dim","got","jam","kit","lot","pop","ram","van","yam",
  // extended pool
  "hit","pit","rid","rip","rot","rug","rum","sag","sap","sat",
  "sub","sum","tab","tan","tap","tin","tub","tug","vat","wag",
  "wax","wit","yap","zap","cob","cod","con","cop","cot","cub",
  "dab","dam","den","dot","dun","fad","fan","fat","fig","fit",
  "fob","gab","gap","gas","gel","gig","gin","gum","gun","gut",
  "hug","hut","kid","lag","lap","lad","lid","lop","lug","mob",
];

// R3.T1.A2 — CCVC / CVCC words (initial or final blend)
const BLEND_WORD_POOL = [
  "stop","frog","clap","drip","flat","grip","plan","slim","trip","brim",
  "snap","spin","step","skip","slab","drop","flag","grin","plop","trim",
  "bled","crab","drab","flop","pram","scab","sled","slug","snag","stab",
  "swam","brag","clod","cram","glob","plum","skid","slid","spud","stub",
  // extended pool
  "flap","clam","clop","crop","plod","trod","scat","skit","slog","snub",
  "spat","spot","spun","stag","stem","stun","blab","blip","blot","clip",
  "clot","club","glad","glop","gram","grim","tram","trap","prod","prop",
  "skim","slam","slap","slip","slot","slum","sped","spit","flab","flip",
  "blob","slop","crag","drug","brig","flan","scam","scum","twig","plug",
  "snot","swot","blew","clew","brew","drew","grew","stew","swig","strop",
];

// R3.T1.A3 — Phonically regular but less common real words
const UNFAMILIAR_POOL = [
  "crisp","stomp","drift","blend","cleft","frost","grump","plonk","brisk","clump",
  "flint","scalp","sprig","throb","whisk","tramp","clench","crept","glint","growl",
  "pluck","scald","skimp","slunk","sniff","speck","strut","swept","thump","squat",
  // extended pool
  "thrift","floss","broth","froth","filth","gulch","mulch","blink","brink","clink",
  "drink","shrink","stink","clank","crank","drank","frank","plank","stank","thank",
  "blank","flump","plump","slump","trump","cramp","clamp","stamp","swamp","crimp",
  "shrimp","blimp","grind","bland","brand","grand","spend","mend","lend","fend",
  "tend","bent","dent","lent","rent","sent","tent","vent","went","deft",
  "heft","left","belt","felt","melt","bulk","hulk","sulk","pulp","gulp",
  "milk","silk","helm","yelp","kelp","mink","rink","sink","wink","limp",
];

// R4.T1.A1 — Phonetically regular but less common real words (harder than R3, Grade 2–3)
// No overlap with UNFAMILIAR_POOL
const R4_PHONETIC_POOL = [
  "stench","crunch","splotch","clutch","thrush","squint","wrench","twitch","slump","grunt",
  "dwell","fleck","strum","gruff","scuff","crimp","brunt","blotch","sketch","notch",
  "fetch","drench","bluff","shrunk","shred","yelp","kelp","scamp","clamp","froth",
  // extended pool
  "strep","scrub","crutch","stitch","scotch","hatch","latch","botch","hutch","watch",
  "patch","catch","match","etch","vetch","retch","wretch","belch","squelch","filch",
  "zilch","hunch","bunch","lunch","munch","punch","flinch","pinch","cinch","wince",
  "mince","dense","fence","hence","sense","tense","verse","terse","curse","nurse",
  "burst","thirst","perch","birch","lurch","church","march","parch","torch","scorch",
  "splint","grudge","budge","judge","fudge","nudge","sludge","pledge","ledge","hedge",
  "wedge","badge","bulge","gorge","surge","purge","verge","merge","lunge","plunge",
];

// R4 passage bank — pre-authored short passages for fluency skills
// Passages are embedded in the question string (whitespace-pre-wrap renders newlines correctly)

const R4_TRACKING_PASSAGES = [
  {
    passage: "The hen sat on the nest.\nA cat crept up to look.\nThe hen flapped her wings.",
    expected_answer: "The hen sat on the nest. A cat crept up to look. The hen flapped her wings.",
  },
  {
    passage: "Ben had a red kite.\nHe ran into the wind.\nThe kite went up, up, up.",
    expected_answer: "Ben had a red kite. He ran into the wind. The kite went up, up, up.",
  },
  {
    passage: "A frog sat on a log.\nIt jumped into the pond.\nThe pond made a big splash.",
    expected_answer: "A frog sat on a log. It jumped into the pond. The pond made a big splash.",
  },
  {
    passage: "Mum put the milk on the step.\nThe dog lapped it all up.\nThen he wagged his tail.",
    expected_answer: "Mum put the milk on the step. The dog lapped it all up. Then he wagged his tail.",
  },
  {
    passage: "The wind blew the leaves.\nThey spun and twisted down.\nA child picked up the best one.",
    expected_answer: "The wind blew the leaves. They spun and twisted down. A child picked up the best one.",
  },
  {
    passage: "Sam ran to the shop.\nHe got a bun and a bag.\nThen he ran back home.",
    expected_answer: "Sam ran to the shop. He got a bun and a bag. Then he ran back home.",
  },
  {
    passage: "The cat had a long nap.\nIt sat in the warm sun.\nA bird sang in the tree.",
    expected_answer: "The cat had a long nap. It sat in the warm sun. A bird sang in the tree.",
  },
  {
    passage: "Nomsa fed the hens.\nThey ran up to the bowl.\nThe big hen got the most.",
    expected_answer: "Nomsa fed the hens. They ran up to the bowl. The big hen got the most.",
  },
  {
    passage: "Dad lit the fire.\nThe meat began to sizzle.\nWe all sat down to eat.",
    expected_answer: "Dad lit the fire. The meat began to sizzle. We all sat down to eat.",
  },
  {
    passage: "A bee buzzed near the jam.\nIt landed on the lid.\nMum waved it away.",
    expected_answer: "A bee buzzed near the jam. It landed on the lid. Mum waved it away.",
  },
  {
    passage: "The bus came at last.\nWe got on and sat down.\nIt drove us to school.",
    expected_answer: "The bus came at last. We got on and sat down. It drove us to school.",
  },
  {
    passage: "Thabo kicked the ball.\nIt flew over the wall.\nThe dog ran to fetch it.",
    expected_answer: "Thabo kicked the ball. It flew over the wall. The dog ran to fetch it.",
  },
  {
    passage: "Rain fell on the roof.\nThe drops ran down the glass.\nSoon a puddle formed.",
    expected_answer: "Rain fell on the roof. The drops ran down the glass. Soon a puddle formed.",
  },
  {
    passage: "Gogo made some soup.\nIt was hot and full of beans.\nWe ate it with fresh bread.",
    expected_answer: "Gogo made some soup. It was hot and full of beans. We ate it with fresh bread.",
  },
  {
    passage: "The frog hid in the reeds.\nA stork walked by slowly.\nThe frog kept very still.",
    expected_answer: "The frog hid in the reeds. A stork walked by slowly. The frog kept very still.",
  },
  {
    passage: "Lerato found a shell.\nIt was pink and smooth.\nShe put it in her bag.",
    expected_answer: "Lerato found a shell. It was pink and smooth. She put it in her bag.",
  },
  {
    passage: "The kite got stuck.\nIt hung in the tall tree.\nDad helped to pull it down.",
    expected_answer: "The kite got stuck. It hung in the tall tree. Dad helped to pull it down.",
  },
  {
    passage: "We packed the car.\nWe drove to the sea.\nThe waves were big and blue.",
    expected_answer: "We packed the car. We drove to the sea. The waves were big and blue.",
  },
  {
    passage: "The pup chewed a sock.\nMum was not happy.\nShe gave it a bone instead.",
    expected_answer: "The pup chewed a sock. Mum was not happy. She gave it a bone instead.",
  },
  {
    passage: "Ants marched in a line.\nThey carried bits of leaf.\nThey took them to the nest.",
    expected_answer: "Ants marched in a line. They carried bits of leaf. They took them to the nest.",
  },
];

const R4_WORD_SETS = [
  { words: "the, was, they, said, have",  expected: "the was they said have"  },
  { words: "come, some, from, what, where", expected: "come some from what where" },
  { words: "there, their, here, were, your", expected: "there their here were your" },
  { words: "about, again, friend, people, every", expected: "about again friend people every" },
  { words: "because, before, could, should, would", expected: "because before could should would" },
  { words: "one, two, four, eight, ten", expected: "one two four eight ten" },
  { words: "who, why, when, what, where", expected: "who why when what where" },
  { words: "live, give, love, move, have", expected: "live give love move have" },
  { words: "any, many, money, honey, funny", expected: "any many money honey funny" },
  { words: "walk, talk, half, calf, calm", expected: "walk talk half calf calm" },
  { words: "door, floor, poor, four, your", expected: "door floor poor four your" },
  { words: "they, them, then, there, those", expected: "they them then there those" },
  { words: "once, gone, done, some, come", expected: "once gone done some come" },
  { words: "could, would, should, world, word", expected: "could would should world word" },
  { words: "great, break, bread, head, dead", expected: "great break bread head dead" },
  { words: "two, too, to, do, who", expected: "two too to do who" },
  { words: "night, light, right, might, eight", expected: "night light right might eight" },
  { words: "father, mother, brother, sister, other", expected: "father mother brother sister other" },
  { words: "people, little, middle, apple, table", expected: "people little middle apple table" },
  { words: "first, second, third, fourth, fifth", expected: "first second third fourth fifth" },
];

const R4_PROSODY_PASSAGES = [
  {
    passage: "The cat sat on the mat, and then she slept.\nShe purred loudly, but no one heard.\nWas anyone home? No, the house was quiet.",
    expected_answer: "The cat sat on the mat, and then she slept. She purred loudly, but no one heard. Was anyone home? No, the house was quiet.",
  },
  {
    passage: "First, the hen laid an egg. Then, she sat on it.\nAfter three days, the egg cracked open.\n\"Cheep!\" said the chick, and out it came.",
    expected_answer: "First, the hen laid an egg. Then, she sat on it. After three days, the egg cracked open. Cheep! said the chick, and out it came.",
  },
  {
    passage: "Tom wanted a dog, but Mum said no.\n\"Please?\" said Tom. \"I'll look after it!\"\nMum smiled, and they went to the shelter.",
    expected_answer: "Tom wanted a dog, but Mum said no. Please? said Tom. I'll look after it! Mum smiled, and they went to the shelter.",
  },
  {
    passage: "It was cold, wet, and windy outside.\nSam put on his coat, his scarf, and his hat.\nHe stepped out, and the wind blew his hat away!",
    expected_answer: "It was cold, wet, and windy outside. Sam put on his coat, his scarf, and his hat. He stepped out, and the wind blew his hat away!",
  },
  {
    passage: "The bees buzzed, the birds sang, and the sun shone.\nIt was the best day of summer.\n\"Let's stay here forever,\" said Lily, and she laughed.",
    expected_answer: "The bees buzzed, the birds sang, and the sun shone. It was the best day of summer. Let's stay here forever, said Lily, and she laughed.",
  },
  {
    passage: "The dog barked, growled, and ran in circles.\n'What is wrong?' asked Lin.\nThen she saw the cat on the roof.",
    expected_answer: "The dog barked, growled, and ran in circles. What is wrong? asked Lin. Then she saw the cat on the roof.",
  },
  {
    passage: "Slowly, carefully, she opened the lid.\nInside was a tiny, sleeping kitten.\n'Oh, you are so small!' she whispered.",
    expected_answer: "Slowly, carefully, she opened the lid. Inside was a tiny, sleeping kitten. Oh, you are so small! she whispered.",
  },
  {
    passage: "The wind howled, the rain poured, and the thunder crashed.\nWere they safe inside? Yes, the house was strong.\n'Don't worry,' said Dad. 'It will pass.'",
    expected_answer: "The wind howled, the rain poured, and the thunder crashed. Were they safe inside? Yes, the house was strong. Don't worry, said Dad. It will pass.",
  },
  {
    passage: "First, mix the flour and the sugar.\nNext, add the eggs and the milk.\nFinally, pour it in and bake!",
    expected_answer: "First, mix the flour and the sugar. Next, add the eggs and the milk. Finally, pour it in and bake!",
  },
  {
    passage: "Tendai ran fast, but the bus pulled away.\n'Wait! Please wait!' he shouted.\nThe driver stopped, smiled, and opened the door.",
    expected_answer: "Tendai ran fast, but the bus pulled away. Wait! Please wait! he shouted. The driver stopped, smiled, and opened the door.",
  },
  {
    passage: "The market was loud, busy, and bright.\nPeople called out, 'Fresh fruit! Cheap fruit!'\nMa bought apples, bananas, and a big, ripe mango.",
    expected_answer: "The market was loud, busy, and bright. People called out, Fresh fruit! Cheap fruit! Ma bought apples, bananas, and a big, ripe mango.",
  },
  {
    passage: "Could she climb the tree? She was not sure.\nShe reached up, pulled hard, and lifted herself.\n'I did it!' she cried with joy.",
    expected_answer: "Could she climb the tree? She was not sure. She reached up, pulled hard, and lifted herself. I did it! she cried with joy.",
  },
  {
    passage: "The baby laughed, clapped, and waved her arms.\n'Peekaboo!' said her brother.\nShe giggled, hiccupped, and laughed again.",
    expected_answer: "The baby laughed, clapped, and waved her arms. Peekaboo! said her brother. She giggled, hiccupped, and laughed again.",
  },
  {
    passage: "It was dark, cold, and very quiet.\n'Is anyone there?' called Sipho.\nAn owl hooted, and he jumped in fright.",
    expected_answer: "It was dark, cold, and very quiet. Is anyone there? called Sipho. An owl hooted, and he jumped in fright.",
  },
  {
    passage: "We packed our bags, locked the door, and left.\nWould we make the train in time?\nYes — we ran, and we just caught it!",
    expected_answer: "We packed our bags, locked the door, and left. Would we make the train in time? Yes — we ran, and we just caught it!",
  },
  {
    passage: "The teacher smiled and said, 'Well done, everyone.'\nWe had worked hard, and it showed.\n'Tomorrow,' she added, 'we begin something new.'",
    expected_answer: "The teacher smiled and said, Well done, everyone. We had worked hard, and it showed. Tomorrow, she added, we begin something new.",
  },
  {
    passage: "Splash! The stone hit the water.\nRipples spread out, wide and round.\n'Watch this one,' said Ben, picking up another.",
    expected_answer: "Splash! The stone hit the water. Ripples spread out, wide and round. Watch this one, said Ben, picking up another.",
  },
  {
    passage: "She tasted the soup, paused, and frowned.\nWas it too salty? Far too salty!\n'Let's start again,' she sighed.",
    expected_answer: "She tasted the soup, paused, and frowned. Was it too salty? Far too salty! Let's start again, she sighed.",
  },
  {
    passage: "The puppy dug, sniffed, and wagged its tail.\n'What have you found?' asked Kabelo.\nIt was an old, muddy, chewed-up bone.",
    expected_answer: "The puppy dug, sniffed, and wagged its tail. What have you found? asked Kabelo. It was an old, muddy, chewed-up bone.",
  },
  {
    passage: "Up, up, up went the big balloon.\n'Don't let go!' shouted Mum.\nBut the string slipped, and away it flew.",
    expected_answer: "Up, up, up went the big balloon. Don't let go! shouted Mum. But the string slipped, and away it flew.",
  },
];

// R4.T3.A2 — passages with a deliberate meaning violation; student should catch the error word
const R4_SELF_MONITORING_PASSAGES = [
  {
    passage: "The cat swam up the tree to find a bird.\nShe waited at the top for a very long time.\nFinally, the bird flew away.",
    error_word: "swam",
    expected_answer: "swam",
  },
  {
    passage: "She hung her coat on the floor when she came in.\nThen she sat down and took off her shoes.\nMum called her for dinner.",
    error_word: "floor",
    expected_answer: "floor",
  },
  {
    passage: "The farmer planted his seeds in the ceiling of the field.\nHe watered them every morning.\nSoon small green shoots appeared.",
    error_word: "ceiling",
    expected_answer: "ceiling",
  },
  {
    passage: "Tom ate his sandwich and then drank a big cup of sand.\nHe said it was the best lunch ever.\nMum packed the same thing the next day.",
    error_word: "sand",
    expected_answer: "sand",
  },
  {
    passage: "The fish jumped high into the clouds to catch a worm.\nIt splashed back into the river.\nThe heron watched and waited.",
    error_word: "clouds",
    expected_answer: "clouds",
  },
  {
    passage: "The hot sun melted the snowman into a puddle of bricks.\nThe children were sad to see him go.\nThey hoped it would snow again soon.",
    error_word: "bricks",
    expected_answer: "bricks",
  },
  {
    passage: "Mum put the bread in the fridge to make toast.\nIt popped up brown and warm.\nWe spread it with butter and jam.",
    error_word: "fridge",
    expected_answer: "fridge",
  },
  {
    passage: "The bird flew down and swam to its nest in the tree.\nIt fed its hungry chicks.\nThen it flew off to find more food.",
    error_word: "swam",
    expected_answer: "swam",
  },
  {
    passage: "At night the sky was full of bright yellow grass.\nWe lay on our backs and gazed up.\nOne even shot across the sky.",
    error_word: "grass",
    expected_answer: "grass",
  },
  {
    passage: "She was tired, so she climbed into bed and ran asleep.\nShe pulled up the warm blanket.\nVery soon she was dreaming.",
    error_word: "ran",
    expected_answer: "ran",
  },
  {
    passage: "The fish lived deep in the dry ocean.\nIt swam past the colourful coral.\nA big shark chased it away.",
    error_word: "dry",
    expected_answer: "dry",
  },
  {
    passage: "We were hungry, so we sat down to drink our dinner.\nThere was rice, beans, and chicken.\nWe ate up every last bit.",
    error_word: "drink",
    expected_answer: "drink",
  },
  {
    passage: "The fire was so cold that we moved closer to it.\nThe flames crackled and popped.\nWe toasted bread on long sticks.",
    error_word: "cold",
    expected_answer: "cold",
  },
  {
    passage: "Gogo wore her thick coat because the day was so hot.\nThe icy wind was sharp and biting.\nShe pulled her scarf tighter.",
    error_word: "hot",
    expected_answer: "hot",
  },
  {
    passage: "The car would not start, so Dad rode it to the garage.\nThe man looked under the bonnet.\nVery soon the engine worked again.",
    error_word: "rode",
    expected_answer: "rode",
  },
  {
    passage: "I could not see in the dark, so I turned off the light.\nThe whole room became bright at once.\nNow I could read my book.",
    error_word: "off",
    expected_answer: "off",
  },
  {
    passage: "The baby was crying, so Mum gave her a warm bottle of sand.\nThe baby drank it all up.\nThen she fell fast asleep.",
    error_word: "sand",
    expected_answer: "sand",
  },
  {
    passage: "It was raining hard, so we opened our umbrella made of glass.\nThe drops bounced off the top.\nWe stayed nice and dry.",
    error_word: "glass",
    expected_answer: "glass",
  },
  {
    passage: "The runner was thirsty after the race, so she ate a big glass of water.\nThe water was cool and fresh.\nShe felt much better.",
    error_word: "ate",
    expected_answer: "ate",
  },
  {
    passage: "The teacher wrote the sum on the board with a piece of soap.\nThe white letters were easy to read.\nWe copied them into our books.",
    error_word: "soap",
    expected_answer: "soap",
  },
];

// ── R5 Comprehension & Language Expansion static bank ────────────────────────
// Eliminates LLM generate-question calls for all R5 skills.
// Assessment (submit-answer) still uses LLM for quality evaluation.

// R5.T1.A1 — Literal Comprehension with Text Evidence
const R5_LITERAL_PASSAGES = [
  {
    passage: "Honey bees are one of the most important insects on Earth. They collect pollen from flowers and carry it back to their hive. As they travel from flower to flower, they help plants grow by spreading the pollen. Without bees, many of our fruits and vegetables could not grow. One hive can hold up to 60,000 bees working together.",
    question: "According to the passage, how do bees help plants grow? Find the words in the passage that tell you.",
    expected_answer: "They help plants grow by spreading the pollen as they travel from flower to flower.",
  },
  {
    passage: "Penguins are birds that cannot fly, but they are excellent swimmers. Their wings have changed over time into flippers, which help them move quickly through the water. Penguins live in cold places and huddle together in large groups to stay warm. Emperor penguins can dive to depths of over 500 metres when hunting for fish.",
    question: "What do penguins use their wings for? Use words from the passage in your answer.",
    expected_answer: "Their wings have changed into flippers which help them move quickly through the water.",
  },
  {
    passage: "The Amazon rainforest is home to more species of plants and animals than any other place on Earth. More than half of the world's plant and animal species live there. The Amazon River runs through it, providing water for millions of living things. Every year, however, large areas of rainforest are cut down for farming and building.",
    question: "What happens to the Amazon rainforest every year? Find the sentence that tells you.",
    expected_answer: "Every year, large areas of rainforest are cut down for farming and building.",
  },
  {
    passage: "The Moon does not produce its own light. The light we see at night is actually sunlight reflecting off the Moon's surface. The Moon travels around the Earth once every 27 days. As it moves, the shape of the lit area appears to change — these changes are called the phases of the Moon.",
    question: "Where does the Moon's light come from? Use words from the passage in your answer.",
    expected_answer: "The light we see is sunlight reflecting off the Moon's surface.",
  },
  {
    passage: "African elephants are the largest land animals on Earth. They use their long trunks to pick up food, drink water, and communicate with each other. Elephants live in family groups led by the oldest female, called the matriarch. They have excellent memories and can remember other elephants and places for many years.",
    question: "What is the role of the matriarch in an elephant family? Find the words in the passage that explain this.",
    expected_answer: "The oldest female, called the matriarch, leads the family group.",
  },
  {
    passage: "Volcanoes form when hot melted rock called magma pushes up through cracks in the Earth's surface. When magma reaches the surface it is called lava. Lava can flow for many kilometres before it cools and hardens into rock. Some volcanoes erupt explosively, sending ash and gas high into the sky.",
    question: "What is lava? Use the passage to explain your answer.",
    expected_answer: "Lava is magma that has reached the Earth's surface.",
  },
  {
    passage: "Giraffes are the tallest animals in the world. Their long necks help them reach leaves high up in the trees that other animals cannot eat. A giraffe's tongue can be as long as 45 centimetres, which helps it pull leaves from thorny branches. Even though their necks are so long, giraffes have the same number of neck bones as humans.",
    question: "How do giraffes reach food that other animals cannot? Use words from the passage.",
    expected_answer: "Their long necks help them reach leaves high up in the trees.",
  },
  {
    passage: "Spiders are not insects; they are arachnids with eight legs. Most spiders spin webs from silk made inside their own bodies. The sticky web traps insects that fly or crawl into it. The spider feels the web shake when something is caught and hurries over to wrap up its meal.",
    question: "How does a spider know when something is caught in its web? Find the words in the passage.",
    expected_answer: "It feels the web shake when something is caught.",
  },
  {
    passage: "Rooibos is a special plant that grows only in the Cederberg mountains of South Africa. Its thin green leaves turn red when they dry in the sun. People use the dried leaves to make rooibos tea, which has no caffeine in it. Farmers have grown rooibos in this area for over a hundred years.",
    question: "Where does the rooibos plant grow? Find the words in the passage.",
    expected_answer: "It grows only in the Cederberg mountains of South Africa.",
  },
  {
    passage: "Camels are well suited to life in the desert. The humps on their backs store fat, which their bodies can use for energy when food is hard to find. Camels can go for many days without drinking water. Their long eyelashes and closeable nostrils protect them from blowing sand.",
    question: "What do camels store in their humps? Use words from the passage.",
    expected_answer: "Their humps store fat, which their bodies use for energy.",
  },
  {
    passage: "A frog begins its life as a tiny egg laid in water. The egg hatches into a tadpole, which has a tail and breathes underwater using gills. As the tadpole grows, it slowly develops legs and lungs. Finally it becomes an adult frog that can live both on land and in water.",
    question: "What does a tadpole use to breathe underwater?",
    expected_answer: "A tadpole breathes underwater using gills.",
  },
  {
    passage: "Table Mountain stands high above the city of Cape Town. It has a flat top that is about three kilometres from side to side. A cloud sometimes covers the top, and people call this cloud the 'tablecloth'. Visitors can ride a cable car all the way to the top to enjoy the view.",
    question: "What do people call the cloud that covers the top of Table Mountain?",
    expected_answer: "People call it the 'tablecloth'.",
  },
  {
    passage: "The ostrich is the largest bird in the world, but it cannot fly. Instead, it runs very fast on its strong legs, reaching speeds of up to 70 kilometres an hour. Ostriches lay the biggest eggs of any bird. When in danger, an ostrich can give a powerful kick to protect itself.",
    question: "How does the ostrich move quickly if it cannot fly? Use the passage.",
    expected_answer: "It runs very fast on its strong legs.",
  },
  {
    passage: "Rivers carry water from the mountains down to the sea. Along the way, the water is used by people, animals, and plants. Some rivers are so big that boats can sail along them. When too little rain falls, rivers can dry up, and this is called a drought.",
    question: "What is it called when too little rain falls and rivers dry up?",
    expected_answer: "It is called a drought.",
  },
  {
    passage: "Sharks have many rows of sharp teeth. When a shark loses a tooth, a new one moves forward to take its place. A shark may grow and lose thousands of teeth during its lifetime. This is why sharks almost always have a full set of teeth ready for catching fish.",
    question: "What happens when a shark loses a tooth? Use the passage.",
    expected_answer: "A new tooth moves forward to take its place.",
  },
  {
    passage: "Plants make their own food using sunlight. Their green leaves catch the light from the sun. Together with water and air, the leaves turn this light into food for the plant. This is why most plants need plenty of sunshine to grow well.",
    question: "What do plants use to make their own food? Find the words in the passage.",
    expected_answer: "They use sunlight, caught by their green leaves, together with water and air.",
  },
  {
    passage: "Dolphins are clever sea animals that live in groups called pods. They talk to each other using clicks and whistles. Dolphins must come up to the surface to breathe air through a blowhole on top of their heads. They often leap right out of the water as they swim.",
    question: "How do dolphins breathe? Find the words in the passage.",
    expected_answer: "They come to the surface to breathe air through a blowhole on top of their heads.",
  },
  {
    passage: "Bread is made from flour, water, and yeast. The yeast is a tiny living thing that makes the dough rise and become soft. After the dough has risen, it is baked in a hot oven. The heat turns the soft dough into bread with a crispy crust.",
    question: "What does the yeast do to the dough? Use the passage.",
    expected_answer: "The yeast makes the dough rise and become soft.",
  },
  {
    passage: "Bats are the only mammals that can truly fly. Most bats sleep during the day and come out at night to find food. They use sound to find their way in the dark. A bat makes a high squeak and then listens for the echo to know where things are.",
    question: "How do bats find their way in the dark?",
    expected_answer: "They make a high squeak and listen for the echo.",
  },
  {
    passage: "The tortoise carries its home on its back. Its hard shell protects it from danger, and it can pull its head and legs inside when it feels afraid. Tortoises move very slowly, but they can live for a very long time — some for more than a hundred years.",
    question: "What does the tortoise do when it feels afraid? Use the passage.",
    expected_answer: "It pulls its head and legs inside its hard shell.",
  },
];

// R5.T1.A2 — Inferential Comprehension with Connector and Evidence
const R5_INFERENCE_PASSAGES = [
  {
    passage: "Leo the dog waited by the front door every evening at exactly 5 o'clock. He would wag his tail and look up at the door handle. When he heard footsteps on the path, he would bark once and spin in a circle. Then he would sit perfectly still, eyes fixed on the door.",
    question: "Why do you think Leo sat by the door at 5 o'clock every evening? Use the word 'because' in your answer.",
    expected_answer: "Leo waited by the door because his owner came home at that time every day.",
  },
  {
    passage: "Mei checked her watch three times in the last ten minutes of class. She had packed her bag before the bell rang. When the teacher asked a question, Mei's hand shot up immediately with the right answer — but her eyes kept drifting to the clock on the wall.",
    question: "What can you infer about how Mei was feeling? Use 'this shows that' in your answer.",
    expected_answer: "Mei was eager to leave, this shows that she was excited about something happening after school.",
  },
  {
    passage: "Sam stared at the jar of coins on his desk. He counted them once, then again. He opened his notebook and wrote down a number. Then he looked at the picture on the wall — a shiny red bicycle — and smiled to himself.",
    question: "Why do you think Sam was counting the coins? Use 'because' in your answer.",
    expected_answer: "Sam was counting the coins because he was saving up to buy the bicycle.",
  },
  {
    passage: "After three weeks without rain, the leaves on the tomato plants were yellow and curling. The soil felt dry and dusty to the touch. Mrs Chen filled two watering cans, carried them slowly to the garden, and poured the water carefully around each plant.",
    question: "Why did Mrs Chen water the plants? Use evidence from the passage in your answer.",
    expected_answer: "She watered the plants because there had been no rain for three weeks and the plants were dying.",
  },
  {
    passage: "Omar never used to visit the library. Then one rainy afternoon, he borrowed a book about space just to pass the time. The next Saturday, he was back — this time looking for three more books. By the end of the month, he had read seven.",
    question: "What can you infer changed for Omar? Use 'because' or 'this shows that' in your answer.",
    expected_answer: "Omar developed a love of reading, because he kept coming back for more and more books.",
  },
  {
    passage: "The chef tasted the soup, frowned, and reached for the salt. She tasted it again, then added a pinch of pepper. After a third taste she set the spoon down and called her assistant over. 'Nearly perfect,' she said, 'but something is still missing.'",
    question: "What can you infer the chef is trying to do? Use 'because' in your answer.",
    expected_answer: "The chef is trying to get the soup exactly right, because she keeps tasting and adjusting it.",
  },
  {
    passage: "Every time the doorbell rang, Buddy the cat darted under the sofa. He stayed there, very still, until the last of the visitors had gone home.",
    question: "What can you infer about Buddy? Use 'because' in your answer.",
    expected_answer: "Buddy is shy or frightened of strangers, because he hides whenever visitors arrive.",
  },
  {
    passage: "Zanele packed sunscreen, a hat, a towel, and her swimming costume into her bag. She looked up at the bright blue sky and grinned with excitement.",
    question: "Where do you think Zanele is going? Use 'because' in your answer.",
    expected_answer: "She is going to the beach or a pool, because she packed a towel, swimming costume and sunscreen.",
  },
  {
    passage: "The bell rang. Chairs scraped, bags zipped shut, and feet pounded towards the door. Within seconds the classroom was completely empty.",
    question: "What can you infer had just happened? Use 'this shows that' in your answer.",
    expected_answer: "The lesson or school day had ended, this shows that the children were eager to leave.",
  },
  {
    passage: "Dad kept looking at his watch. He paced up and down by the window and opened the front door twice to look down the road.",
    question: "What can you infer about Dad? Use 'because' in your answer.",
    expected_answer: "Dad is waiting anxiously for someone, because he keeps checking the time and looking down the road.",
  },
  {
    passage: "When Grandma walked in, the children jumped up, shouted 'Surprise!', and pointed to a cake covered in candles.",
    question: "What can you infer the day was? Use 'because' in your answer.",
    expected_answer: "It was Grandma's birthday, because there was a cake with candles and the children shouted surprise.",
  },
  {
    passage: "Thabo's stomach rumbled loudly in the middle of the lesson. He kept glancing at the clock and could not stop thinking about the lunchbox in his bag.",
    question: "What can you infer about Thabo? Use 'because' in your answer.",
    expected_answer: "Thabo was hungry, because his stomach rumbled and he kept thinking about his lunch.",
  },
  {
    passage: "The puppy ran to the front door with its lead held in its mouth. It spun in excited circles and whined softly at Kabelo.",
    question: "What does the puppy want? Use 'because' in your answer.",
    expected_answer: "The puppy wants to go for a walk, because it brought its lead and is waiting excitedly at the door.",
  },
  {
    passage: "Lerato wiped her eyes and sniffed as she turned the last page of the story. She closed the book gently and hugged it to her chest.",
    question: "How do you think the story made Lerato feel? Use 'this shows that' in your answer.",
    expected_answer: "The story made her sad or deeply moved, this shows that it had a touching ending.",
  },
  {
    passage: "The sky turned dark grey and the wind picked up. People on the beach began folding their umbrellas and hurrying towards their cars.",
    question: "What can you infer is about to happen? Use 'because' in your answer.",
    expected_answer: "A storm or heavy rain is coming, because the sky darkened and everyone rushed off the beach.",
  },
  {
    passage: "Sipho tiptoed past his baby sister's bedroom. He carried his shoes in his hand instead of wearing them, and held his breath as he passed her door.",
    question: "Why was Sipho being so quiet? Use 'because' in your answer.",
    expected_answer: "He was being quiet because he did not want to wake his sleeping baby sister.",
  },
  {
    passage: "The classroom floor was covered in glitter and dried glue. On every desk lay a half-finished card with hearts drawn on the front.",
    question: "What can you infer the class had been doing? Use 'this shows that' in your answer.",
    expected_answer: "The class had been making cards, this shows that they were busy with an art or craft activity.",
  },
  {
    passage: "Mr Naidoo put on his thickest gloves, a scarf, and a woolly hat before stepping outside. His breath came out in little white clouds.",
    question: "What can you infer about the weather? Use 'because' in your answer.",
    expected_answer: "It was very cold, because he wrapped up warmly and his breath showed in the air.",
  },
  {
    passage: "Aisha had practised her song every single day for a month. Now, standing behind the stage curtain, she took a deep breath and noticed her hands were shaking.",
    question: "How do you think Aisha was feeling? Use 'this shows that' in your answer.",
    expected_answer: "Aisha was nervous before performing, this shows that her hands were shaking even though she was well prepared.",
  },
  {
    passage: "The dinner plate was empty except for a few crumbs. In the corner, the dog sat licking its lips and wagging its tail happily.",
    question: "What can you infer happened to the food? Use 'because' in your answer.",
    expected_answer: "The dog ate the food, because the plate is empty and the dog is licking its lips.",
  },
];

// R5.T1.A3 — Oral or Written Retell with Main Idea and Supporting Details
const R5_RETELL_PASSAGES = [
  {
    passage: "Seahorses are unusual fish. Unlike most animals, it is the male seahorse that carries the babies. The female lays her eggs into a special pouch on the father's belly. The father carries the eggs for about two weeks until the babies hatch. Seahorses can also change colour to hide from predators.",
    question: "Retell this passage in your own words. What was it mostly about? Give at least 2 supporting details.",
    expected_answer: "Main idea: seahorses are unusual fish. Details should include the male carrying eggs in a pouch, and seahorses changing colour to hide.",
  },
  {
    passage: "Sand dunes are hills of sand formed by the wind. Wind picks up loose sand and drops it when it slows down. Over time, the dropped sand piles up into a dune shape. Sand dunes can move — some travel several metres each year. The tallest sand dunes in the world can be over 400 metres high.",
    question: "Retell this passage. What was it mainly about? Include 2 facts from the passage.",
    expected_answer: "Main idea: sand dunes are hills of sand formed by wind. Facts should include dunes moving over time, and their possible height of 400+ metres.",
  },
  {
    passage: "Recycling helps protect the environment by reducing the amount of rubbish sent to landfill. When we recycle paper, glass, and plastic, fewer new materials need to be made. Making new materials uses a lot of energy and creates pollution. Recycling even one tonne of paper saves 17 trees.",
    question: "Retell this passage. What was it mostly about? Give 2 details that support the main idea.",
    expected_answer: "Main idea: recycling helps the environment by reducing waste. Details: it reduces the need for new materials, and saves trees — for example, recycling one tonne of paper saves 17 trees.",
  },
  {
    passage: "Florence Nightingale changed the way nurses cared for patients. During the 1800s, hospitals were often dirty and dangerous. Florence insisted on clean wards, fresh air, and proper food for patients. The death rate in the hospitals she worked in dropped dramatically. She is remembered as the founder of modern nursing.",
    question: "Retell what you read about Florence Nightingale. What is the main idea, and what are 2 supporting details?",
    expected_answer: "Main idea: Florence Nightingale changed nursing and hospital care. Details: she insisted on clean wards and proper food, and the death rate dropped because of her changes.",
  },
  {
    passage: "The water cycle describes how water moves around the Earth. Water from oceans, rivers, and lakes evaporates into the air as water vapour. As it rises, it cools and forms clouds. When clouds hold too much water, it falls back to Earth as rain or snow. The water then flows back into rivers and oceans, and the cycle begins again.",
    question: "Retell this passage in your own words. What is the main idea? Give 2 steps from the water cycle.",
    expected_answer: "Main idea: the water cycle explains how water keeps moving around the Earth. Steps should include evaporation forming clouds, and rain/snow returning water to rivers and oceans.",
  },
  {
    passage: "Lions live together in groups called prides. The female lions, called lionesses, do most of the hunting, working as a team to catch their prey. The male lion protects the pride and is known for his thick mane. Lion cubs are looked after by all the adults in the pride.",
    question: "Retell this passage in your own words. What is it mainly about? Give 2 supporting details.",
    expected_answer: "Main idea: lions live and work together in a pride. Details: lionesses hunt as a team, the male protects the pride, and all the adults help care for the cubs.",
  },
  {
    passage: "Nelson Mandela was a great leader in South Africa. He spent 27 years in prison for standing up against unfair laws. After he was freed, he helped to bring people of all races together. In 1994 he became the first president of South Africa to be chosen by all its people.",
    question: "Retell what you read about Nelson Mandela. What is the main idea, and what are 2 details?",
    expected_answer: "Main idea: Nelson Mandela was an important South African leader who fought against unfairness. Details: he was in prison for 27 years, and he became the first president elected by all South Africans in 1994.",
  },
  {
    passage: "Honeybees have a clever way of telling each other where to find flowers. When a bee finds food, it returns to the hive and does a special 'waggle dance'. The way it moves shows the other bees which direction to fly and how far to go. Soon many bees set off to collect the nectar.",
    question: "Retell this passage. What is it mostly about? Include 2 details.",
    expected_answer: "Main idea: honeybees use a dance to share where food is. Details: a bee does a waggle dance in the hive, and its movements show the direction and distance to the flowers.",
  },
  {
    passage: "Looking after your teeth keeps them healthy and strong. You should brush your teeth twice a day, in the morning and before bed. Brushing removes bits of food and germs that can cause holes in your teeth. Eating too many sweets can also damage your teeth, so it is best to eat them only sometimes.",
    question: "Retell this passage. What is the main idea and 2 supporting details?",
    expected_answer: "Main idea: looking after your teeth keeps them healthy. Details: brush twice a day to remove food and germs, and avoid eating too many sweets.",
  },
  {
    passage: "Some birds travel huge distances when the seasons change. This long journey is called migration. As winter comes and food becomes scarce, the birds fly to warmer places where they can find food. When spring returns, they fly all the way back to build their nests.",
    question: "Retell this passage in your own words. What is the main idea and 2 details?",
    expected_answer: "Main idea: some birds migrate long distances with the seasons. Details: they fly to warmer places in winter to find food, and return in spring to build nests.",
  },
  {
    passage: "The blue whale is the largest animal that has ever lived, even bigger than the biggest dinosaurs. Although it is enormous, it eats tiny sea creatures called krill. A blue whale must come to the surface to breathe air. It can make very loud sounds to call to other whales far away.",
    question: "Retell this passage. What was it mainly about? Give 2 facts.",
    expected_answer: "Main idea: the blue whale is the largest animal ever to live. Facts: it eats tiny krill, it must surface to breathe, and it makes loud sounds to call other whales.",
  },
  {
    passage: "Trees are very important for life on Earth. They take in a gas called carbon dioxide and give out oxygen, which people and animals need to breathe. Trees also give us shade, fruit, and homes for birds and insects. This is why planting trees helps to keep our world healthy.",
    question: "Retell this passage. What is the main idea and 2 details?",
    expected_answer: "Main idea: trees are very important for life on Earth. Details: they give out the oxygen we breathe, and they provide shade, fruit and homes for animals.",
  },
  {
    passage: "A rainbow appears when the sun shines through drops of rain. The raindrops bend the sunlight and split it into many colours. A rainbow always has its colours in the same order, from red on the outside to violet on the inside. You can only see a rainbow when the sun is behind you.",
    question: "Retell this passage in your own words. What is the main idea and 2 details?",
    expected_answer: "Main idea: rainbows form when sunlight shines through raindrops. Details: the drops split the light into colours in a fixed order, and you can only see one with the sun behind you.",
  },
  {
    passage: "Ants are small, but they work together in large groups called colonies. Each ant has its own job to do. Some search for food, some look after the eggs, and the queen ant lays all the eggs. By working as a team, the colony can build nests and gather food much faster.",
    question: "Retell this passage. What is the main idea and 2 supporting details?",
    expected_answer: "Main idea: ants work together in colonies. Details: each ant has a job — some find food and some mind the eggs — and the queen lays all the eggs.",
  },
  {
    passage: "Most parts of the world have four seasons: spring, summer, autumn, and winter. In spring, plants begin to grow and flowers bloom. Summer is warm and the days are long. In autumn the leaves change colour and fall, and in winter it is cold and the days are short.",
    question: "Retell this passage. What is it mainly about? Give 2 details.",
    expected_answer: "Main idea: there are four seasons in the year. Details: plants grow in spring, summer is warm with long days, leaves fall in autumn, and winter is cold.",
  },
  {
    passage: "A magnet is a special object that can pull certain metals towards it. Magnets are strongest at their two ends, which are called poles. If you put the same poles of two magnets together they push apart, but opposite poles pull together. Magnets are used in fridge doors, compasses, and many machines.",
    question: "Retell this passage. What is the main idea and 2 details?",
    expected_answer: "Main idea: magnets pull certain metals and have two poles. Details: same poles push apart while opposite poles attract, and magnets are used in things like fridges and compasses.",
  },
  {
    passage: "Firefighters do a brave and important job in our communities. They rush to put out fires and to rescue people who are in danger. They wear special suits and helmets to protect them from heat and smoke. Firefighters also teach people how to stay safe and stop fires from starting.",
    question: "Retell this passage. What is the main idea and 2 details?",
    expected_answer: "Main idea: firefighters do an important job keeping people safe. Details: they put out fires and rescue people, they wear protective suits, and they teach fire safety.",
  },
  {
    passage: "Chameleons are lizards with an amazing skill: they can change the colour of their skin. They do this to hide from danger and to show how they are feeling. Chameleons also have very long, sticky tongues that shoot out to catch insects. Their eyes can even look in two directions at the same time.",
    question: "Retell this passage. What is the main idea and 2 details?",
    expected_answer: "Main idea: chameleons are lizards with special skills. Details: they change colour to hide and to show feelings, they have long sticky tongues for catching insects, and their eyes can look two ways at once.",
  },
  {
    passage: "Water is precious, especially in dry countries like South Africa. We can all help to save water at home. Turning off the tap while brushing your teeth saves many litres each day. Taking shorter showers and fixing dripping taps also makes a big difference.",
    question: "Retell this passage. What is the main idea and 2 supporting details?",
    expected_answer: "Main idea: we should all save water, especially in dry places. Details: turn off the tap while brushing teeth, take shorter showers, and fix dripping taps.",
  },
];

// R5.T2.A1 — Reasoning Connective Use (because, however, therefore)
const R5_CONNECTIVE_PROMPTS = [
  {
    sentence_a: "The weather was stormy.",
    sentence_b: "the football match was cancelled.",
    connective_hint: "Use 'therefore', 'however', or 'because' to join these two ideas.",
    expected_answer: "The weather was stormy, therefore the football match was cancelled.",
  },
  {
    sentence_a: "She studied hard for the test every night.",
    sentence_b: "she got full marks.",
    connective_hint: "Join these two ideas using 'because' or 'therefore'.",
    expected_answer: "She studied hard for the test every night, therefore she got full marks.",
  },
  {
    sentence_a: "Tom wanted to go swimming.",
    sentence_b: "the pool was closed for repairs.",
    connective_hint: "Use 'however' or 'because' to connect these two ideas.",
    expected_answer: "Tom wanted to go swimming; however, the pool was closed for repairs.",
  },
  {
    sentence_a: "The plant had no sunlight for two weeks.",
    sentence_b: "it stopped growing and its leaves turned yellow.",
    connective_hint: "Join these ideas using 'because' or 'therefore'.",
    expected_answer: "The plant had no sunlight for two weeks, therefore it stopped growing and its leaves turned yellow.",
  },
  {
    sentence_a: "I enjoy chocolate cake.",
    sentence_b: "I prefer vanilla.",
    connective_hint: "Use 'however' to show a contrast between these two ideas.",
    expected_answer: "I enjoy chocolate cake; however, I prefer vanilla.",
  },
  {
    sentence_a: "The roads were icy and dangerous.",
    sentence_b: "the school decided to close for the day.",
    connective_hint: "Connect these ideas using 'therefore' or 'because'.",
    expected_answer: "The roads were icy and dangerous, therefore the school decided to close for the day.",
  },
  {
    sentence_a: "The library was very quiet.",
    sentence_b: "everyone was busy reading.",
    connective_hint: "Use 'because' to join these two ideas.",
    expected_answer: "The library was very quiet because everyone was busy reading.",
  },
  {
    sentence_a: "He forgot to take his umbrella.",
    sentence_b: "he got soaked in the rain.",
    connective_hint: "Join these ideas using 'therefore' or 'because'.",
    expected_answer: "He forgot to take his umbrella, therefore he got soaked in the rain.",
  },
  {
    sentence_a: "She loves all kinds of animals.",
    sentence_b: "she does not enjoy going to the zoo.",
    connective_hint: "Use 'however' to show the contrast between these ideas.",
    expected_answer: "She loves all kinds of animals; however, she does not enjoy going to the zoo.",
  },
  {
    sentence_a: "The team practised every single day.",
    sentence_b: "they won the final match.",
    connective_hint: "Join these ideas using 'because' or 'therefore'.",
    expected_answer: "The team practised every single day, therefore they won the final match.",
  },
  {
    sentence_a: "I wanted to phone my friend.",
    sentence_b: "my phone battery was flat.",
    connective_hint: "Use 'however' to show the problem.",
    expected_answer: "I wanted to phone my friend; however, my phone battery was flat.",
  },
  {
    sentence_a: "The ground was very dry.",
    sentence_b: "the farmer watered all his crops.",
    connective_hint: "Join these ideas using 'so' or 'therefore'.",
    expected_answer: "The ground was very dry, therefore the farmer watered all his crops.",
  },
  {
    sentence_a: "Sipho was feeling very tired.",
    sentence_b: "he kept on working until he finished.",
    connective_hint: "Use 'but' or 'however' to show the contrast.",
    expected_answer: "Sipho was feeling very tired; however, he kept on working until he finished.",
  },
  {
    sentence_a: "We missed the early bus.",
    sentence_b: "we had to walk all the way to school.",
    connective_hint: "Join these ideas using 'so' or 'therefore'.",
    expected_answer: "We missed the early bus, therefore we had to walk all the way to school.",
  },
  {
    sentence_a: "The cake looked absolutely delicious.",
    sentence_b: "it tasted far too sweet.",
    connective_hint: "Use 'however' to show the contrast.",
    expected_answer: "The cake looked absolutely delicious; however, it tasted far too sweet.",
  },
  {
    sentence_a: "The baby would not stop crying.",
    sentence_b: "she was hungry.",
    connective_hint: "Use 'because' to join these two ideas.",
    expected_answer: "The baby would not stop crying because she was hungry.",
  },
  {
    sentence_a: "It was a public holiday.",
    sentence_b: "all the shops were closed.",
    connective_hint: "Join these ideas using 'so' or 'therefore'.",
    expected_answer: "It was a public holiday, therefore all the shops were closed.",
  },
  {
    sentence_a: "Lerato studied very hard for the test.",
    sentence_b: "she still found some questions difficult.",
    connective_hint: "Use 'but' or 'however' to show the contrast.",
    expected_answer: "Lerato studied very hard for the test; however, she still found some questions difficult.",
  },
  {
    sentence_a: "The river burst its banks in the night.",
    sentence_b: "the road was flooded by morning.",
    connective_hint: "Join these ideas using 'therefore' or 'because'.",
    expected_answer: "The river burst its banks in the night, therefore the road was flooded by morning.",
  },
  {
    sentence_a: "He saved his pocket money for months.",
    sentence_b: "he could finally buy the new game.",
    connective_hint: "Join these ideas using 'so' or 'therefore'.",
    expected_answer: "He saved his pocket money for months, therefore he could finally buy the new game.",
  },
];

// R5.T2.A2 — Contextually Accurate Vocabulary Use
const R5_VOCABULARY_PROMPTS = [
  { word: "enormous",  definition: "very large in size",               example: "The elephant was enormous." },
  { word: "cautious",  definition: "very careful to avoid danger",     example: "She was cautious crossing the busy road." },
  { word: "exhausted", definition: "extremely tired",                  example: "After the long race, he felt exhausted." },
  { word: "peculiar",  definition: "strange or unusual",               example: "The smell coming from the kitchen was peculiar." },
  { word: "reluctant", definition: "not wanting to do something",      example: "She was reluctant to leave the party." },
  { word: "vibrant",   definition: "bright, lively, and full of energy", example: "The market was vibrant with colour and noise." },
  { word: "ancient",   definition: "very old, from a long time ago",   example: "The ancient castle had stood for 800 years." },
  { word: "fragile",   definition: "easily broken or damaged",         example: "The glass ornament was fragile, so she held it carefully." },
  { word: "delicate",  definition: "easily harmed or needing careful handling", example: "The butterfly's wings are very delicate." },
  { word: "furious",   definition: "extremely angry",                  example: "Dad was furious when he saw the broken window." },
  { word: "generous",  definition: "happy to give and share with others", example: "She is generous and always shares her lunch." },
  { word: "timid",     definition: "shy and easily frightened",        example: "The timid mouse hid behind the box." },
  { word: "brilliant", definition: "very bright, or very clever",      example: "The fireworks were brilliant against the night sky." },
  { word: "weary",     definition: "very tired",                       example: "After the long hike we were all weary." },
  { word: "curious",   definition: "wanting to know or learn about something", example: "The curious kitten poked its nose into the bag." },
  { word: "gigantic",  definition: "extremely big",                    example: "A gigantic wave crashed onto the rocks." },
  { word: "gentle",    definition: "kind and careful, not rough",      example: "Be gentle when you hold the baby chick." },
  { word: "anxious",   definition: "worried or nervous",               example: "She felt anxious before her first day at a new school." },
  { word: "rapid",     definition: "very fast",                        example: "The river became rapid after the heavy rain." },
  { word: "scarce",    definition: "hard to find because there is very little", example: "Water becomes scarce during a drought." },
  { word: "delighted", definition: "very pleased and happy",           example: "He was delighted to win first prize." },
  { word: "stubborn",  definition: "refusing to change your mind",     example: "The stubborn donkey would not move at all." },
  { word: "feeble",    definition: "weak, with very little strength",  example: "The feeble old dog could barely climb the steps." },
  { word: "marvellous",definition: "wonderful and amazing",            example: "We had a marvellous time at the fair." },
];

// R5.T3.A1 — Structured Written Response (topic sentence + details + connectives)
const R5_WRITTEN_PASSAGES = [
  {
    passage: "Plastic pollution is a serious problem in our oceans. Every year, millions of tonnes of plastic enter the sea. Sea animals can mistake plastic for food and become very ill. Plastic also breaks into tiny pieces called microplastics, which are almost impossible to remove from the water.",
    question: "Write a paragraph about plastic pollution. Start with a clear topic sentence, then give 2 supporting details from the passage. Use at least one connecting word (because, however, therefore).",
    expected_answer: "Model: 'Plastic pollution is a serious threat to ocean life. Every year, millions of tonnes of plastic enter the sea, therefore sea animals are in danger of mistaking it for food. The plastic also breaks into microplastics, which are extremely difficult to remove.'",
  },
  {
    passage: "Regular exercise has many benefits for children. It helps build strong muscles and bones. Exercise also improves mood and concentration at school. Children who are active tend to sleep better at night. Even 30 minutes of activity a day can make a big difference.",
    question: "Write a structured paragraph about the benefits of exercise for children. Begin with a topic sentence, give 2 details, and use a connecting word.",
    expected_answer: "Model: 'Exercise is very important for children's health and wellbeing. It builds strong muscles and bones, and because it improves concentration, children do better at school. Even 30 minutes a day can make a significant difference.'",
  },
  {
    passage: "Libraries are valuable places in every community. They provide free access to books, computers, and information for everyone. Libraries run programmes for children including story times and reading clubs. They also offer quiet spaces for people to study and learn.",
    question: "Write a paragraph explaining why libraries are important. Use a topic sentence, 2 supporting details, and a connective word.",
    expected_answer: "Model: 'Libraries are important because they give everyone in the community free access to books and information. They also run programmes for children, therefore they support learning from an early age. Libraries are a valuable resource for the whole community.'",
  },
  {
    passage: "Deforestation — the cutting down of forests — is causing serious problems around the world. Trees absorb carbon dioxide from the air, so when they are removed, more carbon stays in the atmosphere. This contributes to climate change. Forests are also home to half of all land species, many of which are losing their habitat.",
    question: "Write a structured paragraph about deforestation. Include a topic sentence, 2 details from the passage, and use 'because' or 'therefore'.",
    expected_answer: "Model: 'Deforestation is causing serious harm to our planet. Trees absorb carbon dioxide, therefore cutting them down contributes to climate change. Forests are also home to millions of species, because of this, deforestation threatens biodiversity worldwide.'",
  },
  {
    passage: "Space exploration has led to many important discoveries. Scientists have learned about the formation of planets and the history of our solar system. Technology developed for space missions is now used in everyday life — including GPS, water filters, and memory foam. Many experts believe exploring space will be essential for the future of humanity.",
    question: "Write a paragraph explaining why space exploration matters. Use a topic sentence, 2 supporting details, and at least one connective.",
    expected_answer: "Model: 'Space exploration is important because it has led to significant discoveries about our solar system. Technology from space missions is now used in everyday life, such as GPS and water filters. Therefore, space exploration benefits not only science but also daily life on Earth.'",
  },
  {
    passage: "Eating fruit and vegetables every day keeps our bodies healthy. They are full of vitamins that help us grow and fight off illness. Fruit and vegetables also give us energy to work and play. Choosing them instead of sweets is good for our teeth too.",
    question: "Write a paragraph about why we should eat fruit and vegetables. Start with a topic sentence, give 2 details from the passage, and use a connecting word (because, however, therefore).",
    expected_answer: "Model: 'Eating fruit and vegetables every day is very good for us. They are full of vitamins, therefore they help us grow and stay well. They also give us energy and are better for our teeth than sweets.'",
  },
  {
    passage: "Keeping a pet can be very rewarding. Pets such as dogs and cats give us company and love. Looking after a pet also teaches children to be responsible, as the animal needs feeding and care every day. Playing with a pet can make us feel happy and calm.",
    question: "Write a structured paragraph about the benefits of keeping a pet. Use a topic sentence, 2 details, and a connecting word.",
    expected_answer: "Model: 'Keeping a pet has many benefits. Pets give us company and love, and because they need daily care, they teach us to be responsible. Spending time with a pet can also make us feel calm and happy.'",
  },
  {
    passage: "Getting enough sleep is important for children. While we sleep, our bodies rest and grow. A good night's sleep also helps us to concentrate and remember what we learn at school. Children who do not sleep enough often feel grumpy and tired during the day.",
    question: "Write a paragraph about why sleep is important. Include a topic sentence, 2 supporting details, and a connecting word.",
    expected_answer: "Model: 'Sleep is very important for growing children. While we sleep our bodies rest and grow, therefore we wake up feeling strong. Good sleep also helps us to concentrate at school, however too little sleep makes us grumpy.'",
  },
  {
    passage: "Keeping our school clean is everyone's job. When we throw litter on the ground, it makes the school look untidy and can harm animals. Putting our rubbish in the bin keeps the grounds neat and safe. A clean school is a nicer place for everyone to learn and play.",
    question: "Write a structured paragraph about keeping our school clean. Use a topic sentence, 2 details, and a connective.",
    expected_answer: "Model: 'Keeping our school clean is something we should all do. Litter looks untidy and can harm animals, therefore we must always use the bins. A clean school is a safer and nicer place for everyone to learn.'",
  },
  {
    passage: "Rhinos are amazing animals, but they are in great danger. People hunt them illegally for their horns, and this has made their numbers fall. Many people are now working hard to protect rhinos in game parks. If we look after them, future children will still be able to see these special animals.",
    question: "Write a paragraph about why we should protect rhinos. Begin with a topic sentence, give 2 details, and use a connecting word.",
    expected_answer: "Model: 'We should protect rhinos because they are in great danger. People hunt them illegally for their horns, therefore their numbers have fallen. Many people now guard rhinos in game parks so that future children can still see them.'",
  },
  {
    passage: "Reading books is one of the best things you can do. Books take us on adventures to faraway places and times. Reading also helps us to learn new words and ideas. The more we read, the better we become at it, and the more we enjoy it.",
    question: "Write a paragraph about why reading is good for us. Use a topic sentence, 2 details, and a connecting word.",
    expected_answer: "Model: 'Reading books is wonderful for many reasons. Books take us on exciting adventures, and because we meet new words, our language grows. The more we read, therefore, the better and happier readers we become.'",
  },
  {
    passage: "Working as a team helps us do better than working alone. When everyone shares the work, a big job becomes easier and faster. Team members can also help each other when something is difficult. Playing and working in a team teaches us to listen and to be kind.",
    question: "Write a structured paragraph about why teamwork matters. Include a topic sentence, 2 details, and a connective.",
    expected_answer: "Model: 'Teamwork helps us to achieve more than we can alone. When everyone shares the work the job becomes easier, therefore it is finished faster. Team members also help one another, and this teaches us to listen and be kind.'",
  },
  {
    passage: "Saving electricity is good for our homes and for our planet. Switching off lights when we leave a room uses less power. Using less electricity also means our families pay smaller bills. When we save power, we help to look after the Earth's resources.",
    question: "Write a paragraph about how and why we should save electricity. Use a topic sentence, 2 details, and a connecting word.",
    expected_answer: "Model: 'Saving electricity is important for our homes and the planet. Switching off lights uses less power, therefore our families pay smaller bills. Using less electricity also helps to protect the Earth's resources.'",
  },
  {
    passage: "Staying safe near roads is very important. Before crossing, we should always stop, look both ways, and listen for cars. Crossing at a zebra crossing or with a scholar patrol is much safer. Cars move quickly, so we must never run into the road to fetch a ball.",
    question: "Write a structured paragraph about how to stay safe near roads. Include a topic sentence, 2 details, and a connecting word.",
    expected_answer: "Model: 'Staying safe near roads is very important for everyone. We should stop, look, and listen before crossing, and because cars move quickly, we must use a zebra crossing. We should never run into the road to fetch a ball.'",
  },
  {
    passage: "Clean water is something all living things need. We use water for drinking, cooking, washing, and growing food. In some places water is hard to find, so it must not be wasted. We can save water by closing taps tightly and using only what we need.",
    question: "Write a paragraph about why water is important and how we can save it. Use a topic sentence, 2 details, and a connecting word.",
    expected_answer: "Model: 'Clean water is something every living thing needs. We use it for drinking, cooking and washing, however in some places it is hard to find. Therefore we should save water by closing taps tightly and using only what we need.'",
  },
  {
    passage: "Being kind to others makes the world a better place. A kind word or a helping hand can make someone's whole day brighter. When we are kind, people often want to be kind back to us. Small acts of kindness, like sharing or saying thank you, cost nothing but mean a lot.",
    question: "Write a structured paragraph about why we should be kind. Include a topic sentence, 2 details, and a connective.",
    expected_answer: "Model: 'Being kind makes the world a better place for everyone. A kind word can brighten someone's day, and because kindness spreads, people are often kind back. Small acts like sharing cost nothing, therefore we should do them every day.'",
  },
  {
    passage: "Learning to swim is a useful and important skill. Knowing how to swim can keep you safe near pools, rivers, and the sea. Swimming is also good exercise that makes our bodies strong. It is best to swim where there is a lifeguard, and never to swim alone.",
    question: "Write a paragraph about why learning to swim is important. Use a topic sentence, 2 details, and a connecting word.",
    expected_answer: "Model: 'Learning to swim is a very important skill. It can keep us safe near water, and because it uses the whole body, it is good exercise too. However, we should always swim where there is a lifeguard and never swim alone.'",
  },
];

// R2.T3.A1 — Vowel team words for decoding (student reads aloud via STT)
const VOWEL_TEAM_POOL = [
  // ai
  "rain","sail","tail","main","pain","wait","train","chain","brain","plain",
  // ea
  "leaf","beat","seat","read","team","dream","heap","clean","steal","speak",
  // oa
  "boat","coat","road","load","soap","toast","goat","float","groan","cloak",
  // oo (long)
  "moon","food","cool","pool","boot","tooth","spoon","bloom","drool","proof",
  // oo (short)
  "book","cook","look","foot","wood","good","stood","brook","shook","hook",
  // ow (as in snow)
  "snow","flow","grow","slow","show","glow","blow","crow","throw","bowl",
  // ou/ow (as in cloud/cow)
  "cloud","loud","sound","found","round","mouth","count","shout","ground","brown",
  // ie
  "pie","tie","tried","cried","dried","fried","skied","spied",
  // ue/ew
  "blue","true","clue","glue","grew","blew","flew","drew",
  // ay (as in day)
  "day","say","play","stay","gray","spray","clay","pray","sway","tray",
  // ee (as in tree)
  "tree","free","see","bee","fee","knee","flee","three","speed","greet",
  // ea (additional)
  "near","dear","fear","year","clear","hear","pea","sea","tea","flea",
];

// R2.T3.A2 — Phonogram pattern words (student reads word containing the phonogram)
const PHONOGRAM_POOL: { phonogram: string; word: string }[] = [
  { phonogram: "-ack", word: "back"  },
  { phonogram: "-ake", word: "cake"  },
  { phonogram: "-ale", word: "tale"  },
  { phonogram: "-all", word: "ball"  },
  { phonogram: "-ame", word: "game"  },
  { phonogram: "-ank", word: "bank"  },
  { phonogram: "-ap",  word: "map"   },
  { phonogram: "-ash", word: "cash"  },
  { phonogram: "-at",  word: "hat"   },
  { phonogram: "-ate", word: "late"  },
  { phonogram: "-aw",  word: "claw"  },
  { phonogram: "-ay",  word: "play"  },
  { phonogram: "-eat", word: "heat"  },
  { phonogram: "-ell", word: "bell"  },
  { phonogram: "-est", word: "nest"  },
  { phonogram: "-ice", word: "rice"  },
  { phonogram: "-ick", word: "brick" },
  { phonogram: "-ide", word: "slide" },
  { phonogram: "-ight",word: "light" },
  { phonogram: "-ill", word: "hill"  },
  { phonogram: "-in",  word: "spin"  },
  { phonogram: "-ine", word: "vine"  },
  { phonogram: "-ing", word: "ring"  },
  { phonogram: "-ink", word: "think" },
  { phonogram: "-ip",  word: "drip"  },
  { phonogram: "-it",  word: "spit"  },
  { phonogram: "-ock", word: "clock" },
  { phonogram: "-oke", word: "smoke" },
  { phonogram: "-op",  word: "drop"  },
  { phonogram: "-ore", word: "store" },
  { phonogram: "-ot",  word: "spot"  },
  { phonogram: "-uck", word: "truck" },
  { phonogram: "-ug",  word: "plug"  },
  { phonogram: "-ump", word: "stump" },
  { phonogram: "-unk", word: "chunk" },
  { phonogram: "-ut",  word: "shut"  },
  { phonogram: "-ub",  word: "grub"  },
  { phonogram: "-an",  word: "plan"  },
  { phonogram: "-oom", word: "bloom" },
  { phonogram: "-ail", word: "snail" },
  // extended — second and third words per pattern
  { phonogram: "-ack", word: "hack"  }, { phonogram: "-ack", word: "stack" },
  { phonogram: "-ake", word: "bake"  }, { phonogram: "-ake", word: "shake" },
  { phonogram: "-ale", word: "bale"  }, { phonogram: "-ale", word: "whale" },
  { phonogram: "-all", word: "call"  }, { phonogram: "-all", word: "tall"  },
  { phonogram: "-ame", word: "fame"  }, { phonogram: "-ame", word: "flame" },
  { phonogram: "-ank", word: "rank"  }, { phonogram: "-ank", word: "drank" },
  { phonogram: "-ap",  word: "cap"   }, { phonogram: "-ap",  word: "snap"  },
  { phonogram: "-ash", word: "dash"  }, { phonogram: "-ash", word: "crash" },
  { phonogram: "-at",  word: "fat"   }, { phonogram: "-at",  word: "flat"  },
  { phonogram: "-ate", word: "gate"  }, { phonogram: "-ate", word: "crate" },
  { phonogram: "-aw",  word: "jaw"   }, { phonogram: "-aw",  word: "draw"  },
  { phonogram: "-ay",  word: "day"   }, { phonogram: "-ay",  word: "stay"  },
  { phonogram: "-eat", word: "beat"  }, { phonogram: "-eat", word: "treat" },
  { phonogram: "-ell", word: "sell"  }, { phonogram: "-ell", word: "shell" },
  { phonogram: "-est", word: "best"  }, { phonogram: "-est", word: "chest" },
  { phonogram: "-ice", word: "dice"  }, { phonogram: "-ice", word: "price" },
  { phonogram: "-ick", word: "kick"  }, { phonogram: "-ick", word: "stick" },
  { phonogram: "-ide", word: "hide"  }, { phonogram: "-ide", word: "ride"  },
  { phonogram: "-ight",word: "night" }, { phonogram: "-ight",word: "bright"},
  { phonogram: "-ill", word: "fill"  }, { phonogram: "-ill", word: "still" },
  { phonogram: "-in",  word: "thin"  }, { phonogram: "-in",  word: "grin"  },
  { phonogram: "-ine", word: "pine"  }, { phonogram: "-ine", word: "shine" },
  { phonogram: "-ing", word: "sing"  }, { phonogram: "-ing", word: "bring" },
  { phonogram: "-ink", word: "sink"  }, { phonogram: "-ink", word: "drink" },
  { phonogram: "-ip",  word: "tip"   }, { phonogram: "-ip",  word: "skip"  },
  { phonogram: "-it",  word: "bit"   }, { phonogram: "-it",  word: "knit"  },
  { phonogram: "-ock", word: "knock" }, { phonogram: "-ock", word: "flock" },
  { phonogram: "-oke", word: "spoke" }, { phonogram: "-oke", word: "broke" },
  { phonogram: "-op",  word: "shop"  }, { phonogram: "-op",  word: "crop"  },
  { phonogram: "-ore", word: "more"  }, { phonogram: "-ore", word: "score" },
  { phonogram: "-ot",  word: "hot"   }, { phonogram: "-ot",  word: "trot"  },
  { phonogram: "-uck", word: "duck"  }, { phonogram: "-uck", word: "stuck" },
  { phonogram: "-ug",  word: "bug"   }, { phonogram: "-ug",  word: "shrug" },
  { phonogram: "-ump", word: "jump"  }, { phonogram: "-ump", word: "plump" },
  { phonogram: "-unk", word: "skunk" }, { phonogram: "-unk", word: "drunk" },
  { phonogram: "-ut",  word: "but"   }, { phonogram: "-ut",  word: "strut" },
  { phonogram: "-ub",  word: "club"  }, { phonogram: "-ub",  word: "scrub" },
  { phonogram: "-an",  word: "can"   }, { phonogram: "-an",  word: "span"  },
  { phonogram: "-oom", word: "room"  }, { phonogram: "-oom", word: "zoom"  },
  { phonogram: "-ail", word: "tail"  }, { phonogram: "-ail", word: "trail" },
];

// R2.T3.A3 — Vowel team blending: segmented phonemes → student picks the blended word (audio-tap)
const VOWEL_TEAM_BLEND_CHOICES: {
  segments: string;
  correct: string;
  distractors: [string, string];
}[] = [
  { segments: "r - ai - n",      correct: "rain",  distractors: ["ran",   "rein"]  },
  { segments: "b - oa - t",      correct: "boat",  distractors: ["boot",  "bat"]   },
  { segments: "s - ea - t",      correct: "seat",  distractors: ["sat",   "suit"]  },
  { segments: "m - oo - n",      correct: "moon",  distractors: ["man",   "mean"]  },
  { segments: "s - n - ow",      correct: "snow",  distractors: ["show",  "now"]   },
  { segments: "cl - ou - d",     correct: "cloud", distractors: ["clod",  "loud"]  },
  { segments: "l - ea - f",      correct: "leaf",  distractors: ["loaf",  "left"]  },
  { segments: "tr - ai - n",     correct: "train", distractors: ["ran",   "rain"]  },
  { segments: "b - oo - k",      correct: "book",  distractors: ["back",  "buck"]  },
  { segments: "gl - ue",         correct: "glue",  distractors: ["glow",  "clue"]  },
  { segments: "t - oa - s - t",  correct: "toast", distractors: ["test",  "coast"] },
  { segments: "sp - ea - k",     correct: "speak", distractors: ["peak",  "speck"] },
  // extended pool
  { segments: "f - ee - t",      correct: "feet",  distractors: ["fat",   "fit"]   },
  { segments: "s - ee - d",      correct: "seed",  distractors: ["said",  "side"]  },
  { segments: "t - ee - th",     correct: "teeth", distractors: ["tenth", "tenth"] },
  { segments: "b - ea - ch",     correct: "beach", distractors: ["batch", "beech"] },
  { segments: "t - ea - m",      correct: "team",  distractors: ["tame",  "trim"]  },
  { segments: "d - r - ea - m",  correct: "dream", distractors: ["drum",  "drip"]  },
  { segments: "f - l - oa - t",  correct: "float", distractors: ["flat",  "flit"]  },
  { segments: "r - oa - d",      correct: "road",  distractors: ["rod",   "read"]  },
  { segments: "g - r - oa - n",  correct: "groan", distractors: ["gran",  "grin"]  },
  { segments: "c - oo - l",      correct: "cool",  distractors: ["col",   "coal"]  },
  { segments: "sp - oo - n",     correct: "spoon", distractors: ["span",  "spin"]  },
  { segments: "f - oo - t",      correct: "foot",  distractors: ["fat",   "fit"]   },
  { segments: "w - oo - d",      correct: "wood",  distractors: ["wad",   "wed"]   },
  { segments: "g - r - ow",      correct: "grow",  distractors: ["grub",  "grab"]  },
  { segments: "bl - ow",         correct: "blow",  distractors: ["blue",  "blob"]  },
  { segments: "cr - ow - n",     correct: "crown", distractors: ["cron",  "cram"]  },
  { segments: "f - ou - nd",     correct: "found", distractors: ["fond",  "fund"]  },
  { segments: "r - ou - nd",     correct: "round", distractors: ["rand",  "rind"]  },
  { segments: "sh - ou - t",     correct: "shout", distractors: ["shot",  "shut"]  },
  { segments: "p - l - ay",      correct: "play",  distractors: ["plan",  "plop"]  },
  { segments: "d - ay",          correct: "day",   distractors: ["dip",   "dog"]   },
  { segments: "s - t - ay",      correct: "stay",  distractors: ["stop",  "step"]  },
];

// R3.T1.A4 — Nonsense words (phonically plausible, no real-word memory possible)
// TTS pronounces these via G2P rules — same as reading an unfamiliar word aloud.
// Student hears via TTS and types the sounds — STT is never used for this skill.
const NONSENSE_POOL = [
  "zolp","brix","flem","blim","wuft","nuck","fept","vusk","drap","klob",
  "snuv","trelp","grimp","plonf","skuv","twib","bleff","drusk","flumb","grolt",
  "pwick","snelf","zlob","brimp","chuft","glosp","plick","snuft","trimp","vlomp",
  "wruft","zlemb","crulp","driff","flonk","grusk","plimp","snolv","tremp","wulft",
  // extended pool
  "snalf","brult","zivp","klunt","frelb","gribz","ploxt","snorv","twick","blorf",
  "dresp","grubs","plits","snerv","trold","cluff","vrent","dwolp","snult","freck",
  "glimp","prubz","skuft","trelb","vlunk","wrobs","znelf","crolf","drump","flend",
  "gritl","snorf","treck","blund","cralp","dremp","flinb","klobs","plend","snevt",
  "tribs","vrump","znolp","brelm","drelf","plims","snock","trelm","vronk","wrimp",
  "znuff","zrelt","grulf","flonb","crulb","blonf","wrubt","snelp","drimp","klobf",
];

// R2.T2.A4 — Words containing a digraph (sh/ch/th/wh/ck/ng)
const DIGRAPH_WORD_POOL = [
  "ship","shop","shed","shell","shock","sharp",
  "chin","chip","chop","chunk","check","chain",
  "that","thin","thick","three","thud","them",
  "whip","wheel","which","when","wheat","while",
  "duck","back","lock","dock","sick","kick",
  "ring","long","song","bring","sang","swing",
  "chest","flesh","think","bench","shack","chose",
  // extended pool — sh
  "shade","shift","shelf","shore","shout","shrub","shine","shirt","shook","shred",
  // extended pool — ch
  "chick","churn","charm","chart","chess","chuck","chat","church",
  // extended pool — th
  "bath","math","path","with","tooth","teeth","truth","cloth",
  // extended pool — wh
  "white","whale","whole","whose","where",
  // extended pool — ck
  "block","brick","click","clock","crack","flick","knock","lack","lick","luck",
  "neck","nick","pack","pick","rock","sack","stick","truck","tuck","peck",
  // extended pool — ng
  "bang","ding","gang","hang","king","lung","rang","rung","sing","tang","wing","zing",
];

// R3.T2.A1 — uses BLEND_WORD_POOL (complete left-to-right sequence, same words, different instruction)
// R3.T2.A2 — uses UNFAMILIAR_POOL (self-correction prompt, same words, different instruction)

/** Builds a deterministic static question for L3 encoding or L2 reading skills.
 *  Returns null if the skill should fall through to LLM generation. */
function buildStaticQuestion(skill_id: string, used_refs: string[]): Omit<ReadingGeneratedQuestion, "id"> | null {
  // ── L2 CVC decoding (student sees word, reads it aloud via STT) ──────────
  if (skill_id === "R2.T2.A3") {
    const { item: word, ref } = pickExcluding(CVC_POOL, (w) => w, used_refs);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: "Read this word out loud.",
      displayWord: word.toUpperCase(),
      expected_answer: word,
      scaffolding_notes: "CVC decoding: student blends all three phonemes into one word.",
      used_ref: ref,
    };
  }

  // ── L2 digraph word decoding ─────────────────────────────────────────────
  if (skill_id === "R2.T2.A4") {
    const { item: word, ref } = pickExcluding(DIGRAPH_WORD_POOL, (w) => w, used_refs);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: "Read this word out loud.",
      displayWord: word.toUpperCase(),
      expected_answer: word,
      scaffolding_notes: "Digraph decoding: student identifies the digraph sound and blends the full word.",
      used_ref: ref,
    };
  }

  // ── R2 vowel team word decoding (student reads word aloud via STT) ────────
  if (skill_id === "R2.T3.A1") {
    const { item: word, ref } = pickExcluding(VOWEL_TEAM_POOL, (w) => w, used_refs);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: "Read this word out loud.",
      displayWord: word.toUpperCase(),
      expected_answer: word,
      scaffolding_notes: "Vowel team decoding: student identifies the vowel team and reads the whole word.",
      used_ref: ref,
    };
  }

  // ── R2 phonogram word reading (student reads word containing the phonogram) ─
  if (skill_id === "R2.T3.A2") {
    const { item, ref } = pickExcluding(PHONOGRAM_POOL, (e) => e.word, used_refs);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: `Read this word out loud. Listen for the ${item.phonogram} part.`,
      displayWord: item.word.toUpperCase(),
      expected_answer: item.word,
      scaffolding_notes: `Phonogram decoding: student reads the ${item.phonogram} pattern and blends the full word.`,
      used_ref: ref,
    };
  }

  // ── L3 CVC encoding (student hears word via TTS, types the spelling) ─────
  if (skill_id === "R3.T1.A1") {
    const { item: word, ref } = pickExcluding(CVC_POOL, (w) => w, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "Listen to the word. Type what you hear — one letter for each sound.",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "CVC encoding: student maps each phoneme to a grapheme in order.",
      used_ref: ref,
    };
  }

  // ── L3 CCVC/CVCC encoding ────────────────────────────────────────────────
  if (skill_id === "R3.T1.A2") {
    const { item: word, ref } = pickExcluding(BLEND_WORD_POOL, (w) => w, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "Listen to the word. Type every sound you hear — don't miss any letters in the blend.",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "Blend encoding: student must capture all phonemes including the blend.",
      used_ref: ref,
    };
  }

  // ── L3 unfamiliar real word encoding ────────────────────────────────────
  if (skill_id === "R3.T1.A3") {
    const { item: word, ref } = pickExcluding(UNFAMILIAR_POOL, (w) => w, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "Listen carefully. Type this word by sounding it out — you may not have seen it before.",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "Phonological analysis: student must decode by sound, not memory.",
      used_ref: ref,
    };
  }

  // ── L3 nonsense word encoding (code proof) ───────────────────────────────
  if (skill_id === "R3.T1.A4") {
    const { item: word, ref } = pickExcluding(NONSENSE_POOL, (w) => w, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "This is a made-up word. Listen and type every sound you hear.",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "Nonsense encoding: proves student uses the phonics code, not word memory.",
      used_ref: ref,
    };
  }

  // ── L3 left-to-right grapheme sequence ──────────────────────────────────
  if (skill_id === "R3.T2.A1") {
    const { item: word, ref } = pickExcluding(BLEND_WORD_POOL, (w) => w, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "Listen and write every sound from the first to the last — nothing missing, nothing out of order.",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "Sequence completeness: student must account for every phoneme in order.",
      used_ref: ref,
    };
  }

  // ── L3 phonetic self-correction ──────────────────────────────────────────
  if (skill_id === "R3.T2.A2") {
    const { item: word, ref } = pickExcluding(UNFAMILIAR_POOL, (w) => w, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "Listen, type your best spelling, then check — does every letter match a sound you heard?",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "Self-correction: student reviews own attempt against phoneme sequence.",
      used_ref: ref,
    };
  }

  // ── R4 Decoding & Fluency skills ─────────────────────────────────────────

  // R4.T1.A1 — Phonetic word decoding (student reads unfamiliar word aloud via STT)
  if (skill_id === "R4.T1.A1") {
    const { item: word, ref } = pickExcluding(R4_PHONETIC_POOL, (w) => w, used_refs);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: "Read this word out loud.",
      displayWord: word.toUpperCase(),
      expected_answer: word,
      scaffolding_notes: "Phonetic decoding: student applies phonics knowledge to decode an unfamiliar word — each sound in order.",
      used_ref: ref,
    };
  }

  // R4.T2.A1 — Left-to-right text tracking (student reads 3-line passage aloud)
  if (skill_id === "R4.T2.A1") {
    const { item, ref } = pickExcluding(R4_TRACKING_PASSAGES, (p) => p.expected_answer, used_refs);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: `Read each line from left to right. Start at the left each time you move to a new line.\n\n${item.passage}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Tracking: student reads each line left-to-right without skipping or repeating lines.",
      used_ref: ref,
    };
  }

  // R4.T2.A2 — Whole-word reading (student reads word set as fast as possible)
  if (skill_id === "R4.T2.A2") {
    const { item, ref } = pickExcluding(R4_WORD_SETS, (s) => s.expected, used_refs);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: `Read these words as quickly as you can — say each one as a whole word, not letter by letter.\n\n${item.words}`,
      expected_answer: item.expected,
      scaffolding_notes: "Whole-word reading: student should recognise each word instantly without sounding out individual letters.",
      used_ref: ref,
    };
  }

  // R4.T3.A1 — Phrased reading with prosody (student reads passage using punctuation as phrasing cues)
  if (skill_id === "R4.T3.A1") {
    const { item, ref } = pickExcluding(R4_PROSODY_PASSAGES, (p) => p.expected_answer, used_refs);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: `Read this aloud. Use the punctuation to help you group your words — pause at commas and full stops.\n\n${item.passage}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Prosody: student should read in phrases grouped by punctuation, not word-by-word.",
      used_ref: ref,
    };
  }

  // R4.T3.A2 — Self-monitoring for meaning (student reads and types the error word)
  if (skill_id === "R4.T3.A2") {
    const { item, ref } = pickExcluding(R4_SELF_MONITORING_PASSAGES, (p) => p.expected_answer, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `Read this passage. One word does not make sense. Type the word that seemed wrong.\n\n${item.passage}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: `Self-monitoring: passage contains the word "${item.error_word}" which violates meaning. Student should catch and type it.`,
      used_ref: ref,
    };
  }

  // ── R5 Comprehension & Language Expansion ────────────────────────────────

  // R5.T1.A1 — Literal Comprehension with Text Evidence
  if (skill_id === "R5.T1.A1") {
    const { item, ref } = pickExcluding(R5_LITERAL_PASSAGES, (p) => p.expected_answer, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `${item.passage}\n\n${item.question}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Literal comprehension: student answers a factual question and cites the words from the passage that support their answer.",
      used_ref: ref,
    };
  }

  // R5.T1.A2 — Inferential Comprehension with Connector and Evidence
  if (skill_id === "R5.T1.A2") {
    const { item, ref } = pickExcluding(R5_INFERENCE_PASSAGES, (p) => p.expected_answer, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `${item.passage}\n\n${item.question}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Inferential comprehension: student reads beyond the text, uses 'because' or 'this shows that', and supports their inference with evidence.",
      used_ref: ref,
    };
  }

  // R5.T1.A3 — Oral or Written Retell with Main Idea and Supporting Details
  if (skill_id === "R5.T1.A3") {
    const { item, ref } = pickExcluding(R5_RETELL_PASSAGES, (p) => p.expected_answer, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `${item.passage}\n\n${item.question}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Retell: student identifies the main idea and gives at least 2 supporting details in a logical order.",
      used_ref: ref,
    };
  }

  // R5.T2.A1 — Reasoning Connective Use
  if (skill_id === "R5.T2.A1") {
    const { item, ref } = pickExcluding(R5_CONNECTIVE_PROMPTS, (p) => p.expected_answer, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `Write one sentence that connects these two ideas using a connective word (because, however, or therefore).\n\nIdea 1: ${item.sentence_a}\nIdea 2: ${item.sentence_b}\n\n${item.connective_hint}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Connective use: student joins two related ideas using the appropriate logical connective. Accept any grammatically correct sentence that uses a suitable connective.",
      used_ref: ref,
    };
  }

  // R5.T2.A2 — Contextually Accurate Vocabulary Use
  if (skill_id === "R5.T2.A2") {
    const { item, ref } = pickExcluding(R5_VOCABULARY_PROMPTS, (p) => p.word, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `The word '${item.word}' means ${item.definition}.\n\nWrite your own sentence using the word '${item.word}' to show that you understand what it means.`,
      expected_answer: `A correct sentence using '${item.word}' in context. Example: ${item.example}`,
      scaffolding_notes: `Vocabulary use: student uses '${item.word}' in a sentence where the meaning is clearly correct. Reject sentences where the word is misused or just copied from the definition.`,
      used_ref: ref,
    };
  }

  // R5.T3.A1 — Structured Written Response with Topic Sentence and Connectives
  if (skill_id === "R5.T3.A1") {
    const { item, ref } = pickExcluding(R5_WRITTEN_PASSAGES, (p) => p.expected_answer, used_refs);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `${item.passage}\n\n${item.question}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Structured response: student writes a topic sentence, 2+ supporting details, and uses at least one connective. Check for completeness, logical order, and accurate connective use.",
      used_ref: ref,
    };
  }

  return null;
}

/** Picks a random item that hasn't been used yet (by ref). Falls back to full pool if all used. */
function pickExcluding<T>(arr: T[], getRef: (item: T) => string, used: string[]): { item: T; ref: string } {
  const usedSet = new Set(used);
  const available = arr.filter((item) => !usedSet.has(getRef(item)));
  const pool = available.length > 0 ? available : arr;
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { item, ref: getRef(item) };
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Returns a word-choice question for letter-sound, digraph, or blend skills.
 *  TTS speaks full words only — no isolated phonemes.
 *  Returns null if the skill should fall through to LLM generation. */
function buildAudioTapQuestion(skill_id: string, used_refs: string[]): Omit<ReadingGeneratedQuestion, "id"> | null {
  // R2.T1.A1 — Letter-to-Sound Retrieval: consonant-only word choices
  if (skill_id === "R2.T1.A1") {
    const consonantKeys = Object.keys(LETTER_WORD_CHOICES).filter((l) => !VOWELS.has(l));
    const { item: letter, ref } = pickExcluding(consonantKeys, (k) => k, used_refs);
    const data = LETTER_WORD_CHOICES[letter];
    if (!data) return null;
    const choices: AudioTapChoice[] = shuffle([
      { label: data.correct,        speech: data.correct,        correct: true  },
      { label: data.distractors[0], speech: data.distractors[0], correct: false },
      { label: data.distractors[1], speech: data.distractors[1], correct: false },
    ]);
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question: `Which word STARTS with the ${letter.toUpperCase()} sound?`,
      displayWord: letter.toUpperCase(),
      audioChoices: choices,
      expected_answer: data.correct,
      scaffolding_notes: "Word-choice: student taps each word to hear it, then picks the one with the target sound.",
      used_ref: ref,
    };
  }

  // R2.T1.A2 — Bidirectional Letter-Sound Mapping: alternates forward (letter→word) and backward (word→letter)
  if (skill_id === "R2.T1.A2") {
    // Build a combined pool of forward refs ("fwd_b") and backward refs ("bwd_bat")
    const fwdRefs = Object.keys(LETTER_WORD_CHOICES).map((l) => `fwd_${l}`);
    const bwdRefs = BACKWARD_LETTER_CHOICES.map((e) => `bwd_${e.word}`);
    const allRefs = [...fwdRefs, ...bwdRefs];
    const { item: ref } = pickExcluding(allRefs, (r) => r, used_refs);

    if (ref.startsWith("fwd_")) {
      const letter = ref.slice(4);
      const data = LETTER_WORD_CHOICES[letter];
      if (!data) return null;
      const choices: AudioTapChoice[] = shuffle([
        { label: data.correct,        speech: data.correct,        correct: true  },
        { label: data.distractors[0], speech: data.distractors[0], correct: false },
        { label: data.distractors[1], speech: data.distractors[1], correct: false },
      ]);
      const question = VOWELS.has(letter)
        ? `Which word has the short ${letter.toUpperCase()} sound?`
        : `Which word STARTS with the ${letter.toUpperCase()} sound?`;
      return {
        skill_id,
        template: "oral" as ReadingTemplate,
        question,
        displayWord: letter.toUpperCase(),
        audioChoices: choices,
        expected_answer: data.correct,
        scaffolding_notes: "Forward direction: letter shown, student picks the word with that sound.",
        used_ref: ref,
      };
    } else {
      // Backward: word shown, student picks the letter
      const word = ref.slice(4);
      const entry = BACKWARD_LETTER_CHOICES.find((e) => e.word === word);
      if (!entry) return null;
      const question = entry.vowel
        ? `Which letter makes the MIDDLE sound in "${entry.word}"?`
        : `Which letter makes the FIRST sound in "${entry.word}"?`;
      const choices: AudioTapChoice[] = shuffle([
        { label: entry.correctLetter,          speech: `${entry.correctLetter}, as in ${entry.word}`,          correct: true  },
        { label: entry.distractorLetters[0],   speech: `${entry.distractorLetters[0]}`,                        correct: false },
        { label: entry.distractorLetters[1],   speech: `${entry.distractorLetters[1]}`,                        correct: false },
      ]);
      return {
        skill_id,
        template: "oral" as ReadingTemplate,
        question,
        displayWord: entry.word,
        audioChoices: choices,
        expected_answer: entry.correctLetter,
        scaffolding_notes: "Backward direction: word shown, student picks the letter that makes its first (or middle) sound.",
        used_ref: ref,
      };
    }
  }

  // R2.T1.A3 — Visually Confusable Letter Discrimination (b/d, p/q, m/w)
  // The letter is shown; student picks the word that starts with its sound.
  // The confusable distractor starts with the look-alike letter's sound — revealing a mix-up.
  if (skill_id === "R2.T1.A3") {
    const { item: entry, ref } = pickExcluding(
      CONFUSABLE_PAIR_CHOICES,
      (e) => `${e.letter}_${e.correct}`,
      used_refs
    );
    const choices: AudioTapChoice[] = shuffle([
      { label: entry.correct,    speech: entry.correct,    correct: true  },
      { label: entry.confusable, speech: entry.confusable, correct: false },
      { label: entry.neutral,    speech: entry.neutral,    correct: false },
    ]);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: `Which word starts with the sound this letter makes?`,
      displayWord: entry.letter.toUpperCase(),
      audioChoices: choices,
      expected_answer: entry.correct,
      scaffolding_notes: `Confusable-pair drill. If student picks "${entry.confusable}", they are reading "${entry.letter}" as its look-alike partner.`,
      used_ref: ref,
    };
  }

  // R2.T2.A1 — Digraph Phoneme Retrieval (word-choice format)
  if (skill_id === "R2.T2.A1") {
    const { item: entry, ref } = pickExcluding(DIGRAPH_WORD_CHOICES, (e) => e.correct, used_refs);
    const choices: AudioTapChoice[] = shuffle([
      { label: entry.correct,        speech: entry.correct,        correct: true  },
      { label: entry.distractors[0], speech: entry.distractors[0], correct: false },
      { label: entry.distractors[1], speech: entry.distractors[1], correct: false },
    ]);
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question: `Which word has the ${entry.digraph.toUpperCase()} sound?`,
      displayWord: entry.digraph.toUpperCase(),
      audioChoices: choices,
      expected_answer: entry.correct,
      scaffolding_notes: "Word-choice: student identifies which word contains the digraph sound.",
      used_ref: ref,
    };
  }

  // R2.T2.A2 — Consonant Blend Production (word-choice format)
  if (skill_id === "R2.T2.A2") {
    const blendKeys = Object.keys(BLEND_WORD_CHOICES);
    const { item: blend, ref } = pickExcluding(blendKeys, (k) => k, used_refs);
    const data = BLEND_WORD_CHOICES[blend];
    if (!data) return null;
    const choices: AudioTapChoice[] = shuffle([
      { label: data.correct,        speech: data.correct,        correct: true  },
      { label: data.distractors[0], speech: data.distractors[0], correct: false },
      { label: data.distractors[1], speech: data.distractors[1], correct: false },
    ]);
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question: `Which word STARTS with the ${blend.toUpperCase()} blend?`,
      displayWord: blend.toUpperCase(),
      audioChoices: choices,
      expected_answer: data.correct,
      scaffolding_notes: "Word-choice: student identifies which word starts with the target blend.",
      used_ref: ref,
    };
  }

  // R2.T3.A3 — Vowel Team Blending (display segmented phonemes, student picks the word)
  if (skill_id === "R2.T3.A3") {
    const { item: entry, ref } = pickExcluding(VOWEL_TEAM_BLEND_CHOICES, (e) => e.correct, used_refs);
    const choices: AudioTapChoice[] = shuffle([
      { label: entry.correct,        speech: entry.correct,        correct: true  },
      { label: entry.distractors[0], speech: entry.distractors[0], correct: false },
      { label: entry.distractors[1], speech: entry.distractors[1], correct: false },
    ]);
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question: "Tap to hear each word. Which one matches these sounds?",
      displayWord: entry.segments,
      audioChoices: choices,
      expected_answer: entry.correct,
      scaffolding_notes: "Vowel team blending: student blends the segmented sounds (including the vowel team) into a whole word.",
      used_ref: ref,
    };
  }

  // ── R1 audio-tap skills ─────────────────────────────────────────────────────

  // R1.T2.A1 — Rhyme Generation and Identification
  if (skill_id === "R1.T2.A1") {
    const { item: entry, ref } = pickExcluding(RHYME_CHOICES, (e) => e.target, used_refs);
    const choices: AudioTapChoice[] = shuffle([
      { label: entry.correct,        speech: entry.correct,        correct: true  },
      { label: entry.distractors[0], speech: entry.distractors[0], correct: false },
      { label: entry.distractors[1], speech: entry.distractors[1], correct: false },
    ]);
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question: `Which word rhymes with ${entry.target.toUpperCase()}?`,
      displayWord: entry.target.toUpperCase(),
      audioChoices: choices,
      expected_answer: entry.correct,
      scaffolding_notes: "Rhyme identification: student taps each word to hear it, then picks the one that sounds the same at the end as the target.",
      used_ref: ref,
    };
  }

  // R1.T2.A2 — Syllable Segmentation and Blending
  if (skill_id === "R1.T2.A2") {
    const { item: entry, ref } = pickExcluding(SYLLABLE_CHOICES, (e) => e.correct, used_refs);
    const syllableWord = entry.count === 1 ? "syllable" : "syllables";
    const choices: AudioTapChoice[] = shuffle([
      { label: entry.correct,        speech: entry.correct,        correct: true  },
      { label: entry.distractors[0], speech: entry.distractors[0], correct: false },
      { label: entry.distractors[1], speech: entry.distractors[1], correct: false },
    ]);
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question: `Which word has ${entry.count} ${syllableWord}? Tap each one to hear it.`,
      displayWord: String(entry.count),
      audioChoices: choices,
      expected_answer: entry.correct,
      scaffolding_notes: "Syllable counting: student listens to each word and counts the beats to find the one with the target syllable count.",
      used_ref: ref,
    };
  }

  // R1.T3.A1 — Phoneme Isolation (onset and coda)
  if (skill_id === "R1.T3.A1") {
    const { item: entry, ref } = pickExcluding(PHONEME_ISOLATION_CHOICES, (e) => e.target, used_refs);
    const choices: AudioTapChoice[] = shuffle([
      { label: entry.correct,        speech: entry.correct,        correct: true  },
      { label: entry.distractors[0], speech: entry.distractors[0], correct: false },
      { label: entry.distractors[1], speech: entry.distractors[1], correct: false },
    ]);
    const question = entry.type === "onset"
      ? `Which word STARTS with the same sound as ${entry.target.toUpperCase()}?`
      : `Which word ENDS with the same sound as ${entry.target.toUpperCase()}?`;
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question,
      displayWord: entry.target.toUpperCase(),
      audioChoices: choices,
      expected_answer: entry.correct,
      scaffolding_notes: `Phoneme isolation (${entry.type}): student identifies the target sound in the reference word, then finds the word that shares it.`,
      used_ref: ref,
    };
  }

  // R1.T3.A2 — Full Phoneme Segmentation and Blending (two sub-types, randomly selected)
  if (skill_id === "R1.T3.A2") {
    const useBlend = Math.random() < 0.5 && PHONEME_BLEND_CHOICES.length > 0;
    if (useBlend) {
      const { item: entry, ref } = pickExcluding(PHONEME_BLEND_CHOICES, (e) => e.correct, used_refs);
      const choices: AudioTapChoice[] = shuffle([
        { label: entry.correct,        speech: entry.correct,        correct: true  },
        { label: entry.distractors[0], speech: entry.distractors[0], correct: false },
        { label: entry.distractors[1], speech: entry.distractors[1], correct: false },
      ]);
      return {
        skill_id,
        template: "oral" as ReadingTemplate,
        question: "Tap to hear each word. Which one matches these sounds?",
        displayWord: entry.segments,
        audioChoices: choices,
        expected_answer: entry.correct,
        scaffolding_notes: "Phoneme blending: student reads the segmented sounds, blends them mentally, then finds the matching word.",
        used_ref: ref,
      };
    } else {
      const { item: entry, ref } = pickExcluding(PHONEME_SEGMENT_CHOICES, (e) => e.correct, used_refs);
      const soundWord = entry.count === 1 ? "sound" : "sounds";
      const choices: AudioTapChoice[] = shuffle([
        { label: entry.correct,        speech: entry.correct,        correct: true  },
        { label: entry.distractors[0], speech: entry.distractors[0], correct: false },
        { label: entry.distractors[1], speech: entry.distractors[1], correct: false },
      ]);
      return {
        skill_id,
        template: "oral" as ReadingTemplate,
        question: `Which word has ${entry.count} ${soundWord}? Tap each one to hear it.`,
        displayWord: String(entry.count),
        audioChoices: choices,
        expected_answer: entry.correct,
        scaffolding_notes: "Phoneme segmentation: student listens to each word and counts the individual sounds to find the one with the target count.",
        used_ref: ref,
      };
    }
  }

  // R1.T3.A3 — Phoneme Manipulation (deletion and substitution)
  if (skill_id === "R1.T3.A3") {
    const { item: entry, ref } = pickExcluding(PHONEME_MANIP_CHOICES, (e) => e.target, used_refs);
    const choices: AudioTapChoice[] = shuffle([
      { label: entry.correct,        speech: entry.correct,        correct: true  },
      { label: entry.distractors[0], speech: entry.distractors[0], correct: false },
      { label: entry.distractors[1], speech: entry.distractors[1], correct: false },
    ]);
    const question = entry.type === "delete"
      ? `What word is left if you take away the ${entry.position} sound of ${entry.target.toUpperCase()}?`
      : `What new word do you get if you change the ${entry.position} sound of ${entry.target.toUpperCase()} to the ${entry.to!.toUpperCase()} sound?`;
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question,
      displayWord: entry.target.toUpperCase(),
      audioChoices: choices,
      expected_answer: entry.correct,
      scaffolding_notes: `Phoneme manipulation (${entry.type}): student mentally ${entry.type === "delete" ? "removes" : "swaps"} a sound and identifies the resulting word.`,
      used_ref: ref,
    };
  }

  return null;
}

const ERROR_RECOVERY_INSTRUCTIONS: Record<string, string> = {
  ERR_PHONEME_CONF:
    "Generate a question that isolates the two confused phonemes in a minimal pair. " +
    "Do not present both phonemes in the same word. Force the student to discriminate.",
  ERR_SOUND_RECALL:
    "Generate a question using only the letter whose sound failed. " +
    "Present it in isolation first, then inside a simple CVC word. " +
    "Do not introduce any other letters that were recently confused.",
  ERR_BLEND_FAIL:
    "Generate a question with a 2-phoneme blend only (CV or VC). " +
    "Do not use CCVC or CVCC words. The student cannot yet merge longer sequences.",
  ERR_SOUND_OMIT:
    "Generate a question that makes the omitted phoneme highly salient. " +
    "If the medial vowel is being omitted, use words where the vowel is long and stressed. " +
    "Avoid words where the omitted phoneme is in a weak position.",
  ERR_SOUND_INSERT:
    "Generate a question using words with clean consonant clusters — no schwa-inducing " +
    "environments. Avoid words where an inserted vowel would sound natural.",
  ERR_VOWEL_CONF:
    "Generate a minimal pair contrast question for the specific confused vowel pair. " +
    "E.g. if short/long confusion: use a CVC vs CVCe pair with the same consonants.",
  ERR_ORTHO_GUESS:
    "Generate a nonsense word question. The student must decode phonemically — " +
    "there is no visual word memory to rely on. Do not use real words in this question.",
  ERR_SIGHT_MISS:
    "Generate a rapid recognition question for the missed sight word only. " +
    "Present the word in 3 different sentence contexts. Flag it as irregular.",
  ERR_MULTI_BREAK:
    "Generate a 2-syllable word question only. The student cannot yet blend 3+ syllables. " +
    "Use closed syllable words first (VC/CVC structure in each syllable).",
  ERR_FLUENCY_HES:
    "Generate a question using a passage the student has already seen this session. " +
    "Repeated reading of familiar text builds automaticity. Keep the passage short: " +
    "no more than 2 sentences.",
  ERR_MEANING_BLIND:
    "Generate a literal comprehension question only. Ask what happened, not why. " +
    "The student must locate the answer explicitly in the text before inferring anything.",
  ERR_SELF_MON:
    "Generate a question that contains a deliberate meaning-violation sentence. " +
    "Ask the student if everything made sense. The goal is to trigger self-correction.",
};


export async function POST(req: NextRequest) {
  try {
    const {
      skill_id,
      template,
      attempt_number = 1,
      include_hint = false,
      is_correct = true,
      error_type = null,
      used_refs = [],
    }: {
      skill_id: string;
      template: ReadingTemplate;
      attempt_number?: number;
      include_hint?: boolean;
      is_correct?: boolean;
      error_type?: string | null;
      used_refs?: string[];
    } = await req.json();

    const skill = getReadingSkillById(skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // For phonological/phonemic-awareness skills, always return a deterministic
    // audio-tap question — regardless of template. These skills require the student
    // to listen and tap; they cannot "clap syllables" into a microphone, and the
    // LLM falls back to unusable voice tasks when the template is "listening".
    const tapQuestion = buildAudioTapQuestion(skill_id, used_refs);
    if (tapQuestion) {
      return NextResponse.json({ ...tapQuestion, id: `rq_${Date.now()}` });
    }

    // For L2 reading and L3 encoding skills, return a static word-bank question
    // (no LLM needed — expected answer is the word itself, checked by exact match)
    const staticQuestion = buildStaticQuestion(skill_id, used_refs);
    if (staticQuestion) {
      return NextResponse.json({ ...staticQuestion, id: `rq_${Date.now()}` });
    }

    // L6+ static bank (Intermediate Phase). Served before the LLM fallback so
    // these never hit the Grade R–3 generation path.
    const bankQuestion = await buildBankQuestion(skill_id, used_refs);
    if (bankQuestion) {
      return NextResponse.json({ ...bankQuestion, id: `rq_${Date.now()}` });
    }

    const templateDescriptions: Record<ReadingTemplate, string> = {
      oral: "An oral/spoken task — the student responds verbally or types what they would say out loud. Focus on speaking, listening, or sound production.",
      listening: "A listening comprehension task — present a short passage or instructions and ask the student to respond based on what they heard/read.",
      written: "A written response task — the student writes a word, sentence, or short answer. Focus on spelling, encoding, or written expression.",
      reading: "A reading decoding/fluency task — the student reads a word, sentence, or short passage and answers a question about it.",
    };

    const levelHint =
      attempt_number > 1
        ? `This is attempt ${attempt_number}. Make the question a different context from the previous one.`
        : "";

    const errorContext = error_type && ERROR_RECOVERY_INSTRUCTIONS[error_type]
      ? `
The student's most recent error was classified as: ${error_type}
${ERROR_RECOVERY_INSTRUCTIONS[error_type]}
${!is_correct ? "Use a simpler context, shorter words, and stronger scaffolding cues than the previous question. Change the approach — do not repeat the same question format that just failed." : ""}`
      : !is_correct
        ? "The student answered incorrectly. Use a simpler context and stronger scaffolding cues. Change the approach — do not repeat the same question format that just failed."
        : "Generate a question that continues consolidating this skill. Same difficulty level, new example.";

    // Detect phoneme-production skills by skill ID — only R2.T1 (letter-sound)
    // and R2.T2.A1/A2 (digraph/blend production) require the oral phoneme constraint.
    // Word-decoding skills (R2.T2.A3+) are reading tasks — never phoneme production.
    const isPhonemeSkill =
      skill_id.startsWith("R2.T1") ||
      skill_id === "R2.T2.A1" ||
      skill_id === "R2.T2.A2";

    const phonemeVoiceRule =
      template === "oral" && isPhonemeSkill
        ? `
CRITICAL — BROWSER SPEECH RECOGNITION CONSTRAINT:
This app uses the browser's built-in speech recogniser, which only detects full words — it CANNOT detect isolated phoneme sounds like /th/, /sh/, /ch/, /m/, etc.

For this phoneme/sound skill with the oral template, you MUST:
- NEVER ask the student to say an isolated sound (e.g. "Say the /th/ sound", "What sound does sh make?")
- INSTEAD ask the student to say a WORD that contains the target sound.
  Examples:
    • "Say a word that has the 'th' sound in it" → expected_answer: "thumb" (or "three", "this", "that")
    • "Tell me a word that starts with the 'sh' sound" → expected_answer: "ship"
    • "Can you think of a word with the 'ch' sound?" → expected_answer: "chip"
    • "Say a word where you can hear the short /a/ sound" → expected_answer: "cat"
- Set expected_answer to ONE common valid word that contains the target phoneme.
- The grader will accept ANY word containing the target phoneme as correct — not just the exact word.
`
        : "";

    const prompt = `You are Ruby, a literacy question generator for the Ruby AI Tutor reading engine.

Generate ONE question for this reading/literacy skill:

SKILL ID: ${skill_id}
SKILL TITLE: ${skill.title}
SKILL DESCRIPTION: ${skill.description}

QUESTION FORMAT: ${template}
Format description: ${templateDescriptions[template]}

${levelHint}

${errorContext}
${phonemeVoiceRule}
${include_hint ? "Include a scaffolding hint that guides the student without giving away the answer." : "Do not include a hint."}

Respond in this exact JSON format (no markdown, raw JSON only):
{
  "question": "The complete question or task, clearly worded for a primary school student",
  "expected_answer": "The ideal correct response from the student",
  "hint": ${include_hint ? '"A scaffolding hint that guides without revealing the answer"' : "null"},
  "scaffolding_notes": "Brief note about common errors to watch for with this question"
}

Important:
- Keep language simple and age-appropriate (Grade R–3)
- The task must be achievable in a short session
- expected_answer must be precise
- Match difficulty exactly to the skill level`;

    const response = await getOpenAI().chat.completions.create({
      model: OPENAI_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }, { signal: AbortSignal.timeout(20_000) });

    const text = response.choices[0]?.message?.content ?? "";

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return NextResponse.json({ error: "Failed to parse question" }, { status: 500 });
    }

    const question: ReadingGeneratedQuestion = {
      id: `rq_${Date.now()}`,
      skill_id,
      template,
      question: parsed.question,
      hint: parsed.hint || undefined,
      expected_answer: parsed.expected_answer,
      scaffolding_notes: parsed.scaffolding_notes || "",
    };

    return NextResponse.json(question);
  } catch (error) {
    console.error("Reading generate-question error:", error);
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 });
  }
}
