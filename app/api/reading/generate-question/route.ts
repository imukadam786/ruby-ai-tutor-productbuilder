import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/lib/api-auth";
import { getOpenAI, OPENAI_MODEL } from "@/lib/anthropic";
import { getReadingSkillById } from "@/lib/reading-student-model";
import { ReadingTemplate, ReadingGeneratedQuestion, AudioTapChoice } from "@/types/reading";

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
];

// R1.T2.A2 — Syllable: student picks the word with the target number of syllables
const SYLLABLE_CHOICES: { count: number; correct: string; distractors: [string, string] }[] = [
  { count: 1, correct: "cat",      distractors: ["rabbit",   "umbrella"] },
  { count: 2, correct: "rabbit",   distractors: ["cat",      "together"] },
  { count: 3, correct: "together", distractors: ["rabbit",   "cat"]      },
  { count: 1, correct: "jump",     distractors: ["happy",    "remember"] },
  { count: 2, correct: "puppy",    distractors: ["fish",     "computer"] },
  { count: 3, correct: "umbrella", distractors: ["bird",     "garden"]   },
  { count: 1, correct: "bath",     distractors: ["table",    "tomorrow"] },
  { count: 2, correct: "window",   distractors: ["run",      "remember"] },
  { count: 3, correct: "computer", distractors: ["puppy",    "dog"]      },
  { count: 1, correct: "hot",      distractors: ["button",   "umbrella"] },
  { count: 2, correct: "garden",   distractors: ["cat",      "computer"] },
  { count: 3, correct: "remember", distractors: ["happy",    "fish"]     },
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
];

// R1.T3.A2 — Segmentation & Blending: two sub-types
const PHONEME_SEGMENT_CHOICES: {
  type: "count";
  count: number;
  correct: string;
  distractors: [string, string];
}[] = [
  { type: "count", count: 2, correct: "go",   distractors: ["cat",  "stop"] },
  { type: "count", count: 3, correct: "cat",  distractors: ["go",   "stop"] },
  { type: "count", count: 4, correct: "stop", distractors: ["cat",  "go"]   },
  { type: "count", count: 2, correct: "up",   distractors: ["bat",  "frog"] },
  { type: "count", count: 3, correct: "bat",  distractors: ["up",   "frog"] },
  { type: "count", count: 4, correct: "frog", distractors: ["bat",  "up"]   },
  { type: "count", count: 3, correct: "sun",  distractors: ["me",   "clap"] },
  { type: "count", count: 2, correct: "me",   distractors: ["sun",  "clap"] },
  { type: "count", count: 4, correct: "clap", distractors: ["sun",  "me"]   },
  { type: "count", count: 3, correct: "hop",  distractors: ["at",   "flat"] },
  { type: "count", count: 2, correct: "at",   distractors: ["hop",  "flat"] },
  { type: "count", count: 4, correct: "flat", distractors: ["hop",  "at"]   },
];
const PHONEME_BLEND_CHOICES: {
  type: "blend";
  segments: string;
  correct: string;
  distractors: [string, string];
}[] = [
  { type: "blend", segments: "k - a - t", correct: "cat",  distractors: ["bat",  "cup"]  },
  { type: "blend", segments: "s - u - n", correct: "sun",  distractors: ["fun",  "bun"]  },
  { type: "blend", segments: "d - o - g", correct: "dog",  distractors: ["log",  "fog"]  },
  { type: "blend", segments: "r - e - d", correct: "red",  distractors: ["bed",  "led"]  },
  { type: "blend", segments: "h - o - p", correct: "hop",  distractors: ["top",  "pop"]  },
  { type: "blend", segments: "p - i - n", correct: "pin",  distractors: ["bin",  "tin"]  },
  { type: "blend", segments: "m - a - p", correct: "map",  distractors: ["cap",  "tap"]  },
  { type: "blend", segments: "b - u - g", correct: "bug",  distractors: ["dug",  "mug"]  },
];

// R1.T3.A3 — Phoneme Manipulation: deletion and substitution (natural language, no slash notation)
const PHONEME_MANIP_CHOICES: {
  type: "delete" | "substitute";
  target: string;
  position: "first" | "last";
  to?: string;    // for substitute only — the replacement letter name
  correct: string;
  distractors: [string, string];
}[] = [
  // Deletion — remove first sound
  { type: "delete",     target: "bat",  position: "first",            correct: "at",  distractors: ["hat",  "fat"]  },
  { type: "delete",     target: "stop", position: "first",            correct: "top", distractors: ["hop",  "pop"]  },
  { type: "delete",     target: "slip", position: "first",            correct: "lip", distractors: ["dip",  "tip"]  },
  { type: "delete",     target: "snag", position: "first",            correct: "nag", distractors: ["bag",  "tag"]  },
  { type: "delete",     target: "grip", position: "first",            correct: "rip", distractors: ["dip",  "hip"]  },
  // Deletion — remove last sound
  { type: "delete",     target: "cats", position: "last",             correct: "cat", distractors: ["bat",  "hat"]  },
  { type: "delete",     target: "runs", position: "last",             correct: "run", distractors: ["sun",  "fun"]  },
  { type: "delete",     target: "dogs", position: "last",             correct: "dog", distractors: ["log",  "fog"]  },
  // Substitution — change first sound
  { type: "substitute", target: "bat",  position: "first", to: "s",   correct: "sat", distractors: ["hat",  "mat"]  },
  { type: "substitute", target: "hot",  position: "first", to: "d",   correct: "dot", distractors: ["pot",  "lot"]  },
  { type: "substitute", target: "pin",  position: "first", to: "b",   correct: "bin", distractors: ["tin",  "sin"]  },
  { type: "substitute", target: "fan",  position: "first", to: "r",   correct: "ran", distractors: ["can",  "pan"]  },
  // Substitution — change last sound
  { type: "substitute", target: "cap",  position: "last",  to: "t",   correct: "cat", distractors: ["bat",  "hat"]  },
  { type: "substitute", target: "mud",  position: "last",  to: "g",   correct: "mug", distractors: ["bug",  "tug"]  },
  { type: "substitute", target: "sit",  position: "last",  to: "p",   correct: "sip", distractors: ["dip",  "tip"]  },
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
];

// R3.T1.A2 — CCVC / CVCC words (initial or final blend)
const BLEND_WORD_POOL = [
  "stop","frog","clap","drip","flat","grip","plan","slim","trip","brim",
  "snap","spin","step","skip","slab","drop","flag","grin","plop","trim",
  "bled","crab","drab","flop","pram","scab","sled","slug","snag","stab",
  "swam","brag","clod","cram","glob","plum","skid","slid","spud","stub",
];

// R3.T1.A3 — Phonically regular but less common real words
const UNFAMILIAR_POOL = [
  "crisp","stomp","drift","blend","cleft","frost","grump","plonk","brisk","clump",
  "flint","scalp","sprig","throb","whisk","tramp","clench","crept","glint","growl",
  "pluck","scald","skimp","slunk","sniff","speck","strut","swept","thump","squat",
];

// R4.T1.A1 — Phonetically regular but less common real words (harder than R3, Grade 2–3)
// No overlap with UNFAMILIAR_POOL
const R4_PHONETIC_POOL = [
  "stench","crunch","splotch","clutch","thrush","squint","wrench","twitch","slump","grunt",
  "dwell","fleck","strum","gruff","scuff","crimp","brunt","blotch","sketch","notch",
  "fetch","drench","bluff","shrunk","shred","yelp","kelp","scamp","clamp","froth",
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
];

const R4_WORD_SETS = [
  { words: "the, was, they, said, have",  expected: "the was they said have"  },
  { words: "come, some, from, what, where", expected: "come some from what where" },
  { words: "there, their, here, were, your", expected: "there their here were your" },
  { words: "about, again, friend, people, every", expected: "about again friend people every" },
  { words: "because, before, could, should, would", expected: "because before could should would" },
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
];

// R3.T1.A4 — Nonsense words (phonically plausible, no real-word memory possible)
const NONSENSE_POOL = [
  "zolp","brix","flem","blim","wuft","nuck","fept","vusk","drap","klob",
  "snuv","trelp","grimp","plonf","skuv","twib","bleff","drusk","flumb","grolt",
  "pwick","snelf","zlob","brimp","chuft","glosp","plick","snuft","trimp","vlomp",
  "wruft","zlemb","crulp","driff","flonk","grusk","plimp","snolv","tremp","wulft",
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
];

// R3.T2.A1 — uses BLEND_WORD_POOL (complete left-to-right sequence, same words, different instruction)
// R3.T2.A2 — uses UNFAMILIAR_POOL (self-correction prompt, same words, different instruction)

/** Builds a deterministic static question for L3 encoding or L2 reading skills.
 *  Returns null if the skill should fall through to LLM generation. */
function buildStaticQuestion(skill_id: string): Omit<ReadingGeneratedQuestion, "id"> | null {
  // ── L2 CVC decoding (student sees word, reads it aloud via STT) ──────────
  if (skill_id === "R2.T2.A3") {
    const word = pickRandom(CVC_POOL);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: "Read this word out loud.",
      displayWord: word.toUpperCase(),
      expected_answer: word,
      scaffolding_notes: "CVC decoding: student blends all three phonemes into one word.",
    };
  }

  // ── L2 digraph word decoding ─────────────────────────────────────────────
  if (skill_id === "R2.T2.A4") {
    const word = pickRandom(DIGRAPH_WORD_POOL);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: "Read this word out loud.",
      displayWord: word.toUpperCase(),
      expected_answer: word,
      scaffolding_notes: "Digraph decoding: student identifies the digraph sound and blends the full word.",
    };
  }

  // ── R2 vowel team word decoding (student reads word aloud via STT) ────────
  if (skill_id === "R2.T3.A1") {
    const word = pickRandom(VOWEL_TEAM_POOL);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: "Read this word out loud.",
      displayWord: word.toUpperCase(),
      expected_answer: word,
      scaffolding_notes: "Vowel team decoding: student identifies the vowel team and reads the whole word.",
    };
  }

  // ── R2 phonogram word reading (student reads word containing the phonogram) ─
  if (skill_id === "R2.T3.A2") {
    const item = pickRandom(PHONOGRAM_POOL);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: `Read this word out loud. Listen for the ${item.phonogram} part.`,
      displayWord: item.word.toUpperCase(),
      expected_answer: item.word,
      scaffolding_notes: `Phonogram decoding: student reads the ${item.phonogram} pattern and blends the full word.`,
    };
  }

  // ── L3 CVC encoding (student hears word via TTS, types the spelling) ─────
  if (skill_id === "R3.T1.A1") {
    const word = pickRandom(CVC_POOL);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "Listen to the word. Type what you hear — one letter for each sound.",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "CVC encoding: student maps each phoneme to a grapheme in order.",
    };
  }

  // ── L3 CCVC/CVCC encoding ────────────────────────────────────────────────
  if (skill_id === "R3.T1.A2") {
    const word = pickRandom(BLEND_WORD_POOL);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "Listen to the word. Type every sound you hear — don't miss any letters in the blend.",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "Blend encoding: student must capture all phonemes including the blend.",
    };
  }

  // ── L3 unfamiliar real word encoding ────────────────────────────────────
  if (skill_id === "R3.T1.A3") {
    const word = pickRandom(UNFAMILIAR_POOL);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "Listen carefully. Type this word by sounding it out — you may not have seen it before.",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "Phonological analysis: student must decode by sound, not memory.",
    };
  }

  // ── L3 nonsense word encoding (code proof) ───────────────────────────────
  if (skill_id === "R3.T1.A4") {
    const word = pickRandom(NONSENSE_POOL);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "This is a made-up word. Listen and type every sound you hear.",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "Nonsense encoding: proves student uses the phonics code, not word memory.",
    };
  }

  // ── L3 left-to-right grapheme sequence ──────────────────────────────────
  if (skill_id === "R3.T2.A1") {
    const word = pickRandom(BLEND_WORD_POOL);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "Listen and write every sound from the first to the last — nothing missing, nothing out of order.",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "Sequence completeness: student must account for every phoneme in order.",
    };
  }

  // ── L3 phonetic self-correction ──────────────────────────────────────────
  if (skill_id === "R3.T2.A2") {
    const word = pickRandom(UNFAMILIAR_POOL);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: "Listen, type your best spelling, then check — does every letter match a sound you heard?",
      displayWord: word,
      expected_answer: word,
      scaffolding_notes: "Self-correction: student reviews own attempt against phoneme sequence.",
    };
  }

  // ── R4 Decoding & Fluency skills ─────────────────────────────────────────

  // R4.T1.A1 — Phonetic word decoding (student reads unfamiliar word aloud via STT)
  if (skill_id === "R4.T1.A1") {
    const word = pickRandom(R4_PHONETIC_POOL);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: "Read this word out loud.",
      displayWord: word.toUpperCase(),
      expected_answer: word,
      scaffolding_notes: "Phonetic decoding: student applies phonics knowledge to decode an unfamiliar word — each sound in order.",
    };
  }

  // R4.T2.A1 — Left-to-right text tracking (student reads 3-line passage aloud)
  if (skill_id === "R4.T2.A1") {
    const item = pickRandom(R4_TRACKING_PASSAGES);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: `Read each line from left to right. Start at the left each time you move to a new line.\n\n${item.passage}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Tracking: student reads each line left-to-right without skipping or repeating lines.",
    };
  }

  // R4.T2.A2 — Whole-word reading (student reads word set as fast as possible)
  if (skill_id === "R4.T2.A2") {
    const item = pickRandom(R4_WORD_SETS);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: `Read these words as quickly as you can — say each one as a whole word, not letter by letter.\n\n${item.words}`,
      expected_answer: item.expected,
      scaffolding_notes: "Whole-word reading: student should recognise each word instantly without sounding out individual letters.",
    };
  }

  // R4.T3.A1 — Phrased reading with prosody (student reads passage using punctuation as phrasing cues)
  if (skill_id === "R4.T3.A1") {
    const item = pickRandom(R4_PROSODY_PASSAGES);
    return {
      skill_id,
      template: "reading" as ReadingTemplate,
      question: `Read this aloud. Use the punctuation to help you group your words — pause at commas and full stops.\n\n${item.passage}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Prosody: student should read in phrases grouped by punctuation, not word-by-word.",
    };
  }

  // R4.T3.A2 — Self-monitoring for meaning (student reads and types the error word)
  if (skill_id === "R4.T3.A2") {
    const item = pickRandom(R4_SELF_MONITORING_PASSAGES);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `Read this passage. One word does not make sense. Type the word that seemed wrong.\n\n${item.passage}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: `Self-monitoring: passage contains the word "${item.error_word}" which violates meaning. Student should catch and type it.`,
    };
  }

  // ── R5 Comprehension & Language Expansion ────────────────────────────────

  // R5.T1.A1 — Literal Comprehension with Text Evidence
  if (skill_id === "R5.T1.A1") {
    const item = pickRandom(R5_LITERAL_PASSAGES);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `${item.passage}\n\n${item.question}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Literal comprehension: student answers a factual question and cites the words from the passage that support their answer.",
    };
  }

  // R5.T1.A2 — Inferential Comprehension with Connector and Evidence
  if (skill_id === "R5.T1.A2") {
    const item = pickRandom(R5_INFERENCE_PASSAGES);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `${item.passage}\n\n${item.question}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Inferential comprehension: student reads beyond the text, uses 'because' or 'this shows that', and supports their inference with evidence.",
    };
  }

  // R5.T1.A3 — Oral or Written Retell with Main Idea and Supporting Details
  if (skill_id === "R5.T1.A3") {
    const item = pickRandom(R5_RETELL_PASSAGES);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `${item.passage}\n\n${item.question}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Retell: student identifies the main idea and gives at least 2 supporting details in a logical order.",
    };
  }

  // R5.T2.A1 — Reasoning Connective Use
  if (skill_id === "R5.T2.A1") {
    const item = pickRandom(R5_CONNECTIVE_PROMPTS);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `Write one sentence that connects these two ideas using a connective word (because, however, or therefore).\n\nIdea 1: ${item.sentence_a}\nIdea 2: ${item.sentence_b}\n\n${item.connective_hint}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Connective use: student joins two related ideas using the appropriate logical connective. Accept any grammatically correct sentence that uses a suitable connective.",
    };
  }

  // R5.T2.A2 — Contextually Accurate Vocabulary Use
  if (skill_id === "R5.T2.A2") {
    const item = pickRandom(R5_VOCABULARY_PROMPTS);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `The word '${item.word}' means ${item.definition}.\n\nWrite your own sentence using the word '${item.word}' to show that you understand what it means.`,
      expected_answer: `A correct sentence using '${item.word}' in context. Example: ${item.example}`,
      scaffolding_notes: `Vocabulary use: student uses '${item.word}' in a sentence where the meaning is clearly correct. Reject sentences where the word is misused or just copied from the definition.`,
    };
  }

  // R5.T3.A1 — Structured Written Response with Topic Sentence and Connectives
  if (skill_id === "R5.T3.A1") {
    const item = pickRandom(R5_WRITTEN_PASSAGES);
    return {
      skill_id,
      template: "written" as ReadingTemplate,
      question: `${item.passage}\n\n${item.question}`,
      expected_answer: item.expected_answer,
      scaffolding_notes: "Structured response: student writes a topic sentence, 2+ supporting details, and uses at least one connective. Check for completeness, logical order, and accurate connective use.",
    };
  }

  return null;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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
function buildAudioTapQuestion(skill_id: string): Omit<ReadingGeneratedQuestion, "id"> | null {
  // R2.T1 — Letter-Sound Correspondence (word-choice format)
  if (skill_id.startsWith("R2.T1")) {
    const consonantKeys = Object.keys(LETTER_WORD_CHOICES).filter((l) => !VOWELS.has(l));
    const pool = skill_id === "R2.T1.A1"
      ? consonantKeys
      : Object.keys(LETTER_WORD_CHOICES);
    const letter = pickRandom(pool) as string;
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
      scaffolding_notes: "Word-choice: student taps each word to hear it, then picks the one with the target sound.",
    };
  }

  // R2.T2.A1 — Digraph Phoneme Retrieval (word-choice format)
  if (skill_id === "R2.T2.A1") {
    const entry = pickRandom(DIGRAPH_WORD_CHOICES);
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
    };
  }

  // R2.T2.A2 — Consonant Blend Production (word-choice format)
  if (skill_id === "R2.T2.A2") {
    const blend = pickRandom(Object.keys(BLEND_WORD_CHOICES)) as string;
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
    };
  }

  // R2.T3.A3 — Vowel Team Blending (display segmented phonemes, student picks the word)
  if (skill_id === "R2.T3.A3") {
    const entry = pickRandom(VOWEL_TEAM_BLEND_CHOICES);
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
    };
  }

  // ── R1 audio-tap skills ─────────────────────────────────────────────────────

  // R1.T2.A1 — Rhyme Generation and Identification
  if (skill_id === "R1.T2.A1") {
    const entry = pickRandom(RHYME_CHOICES);
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
    };
  }

  // R1.T2.A2 — Syllable Segmentation and Blending
  if (skill_id === "R1.T2.A2") {
    const entry = pickRandom(SYLLABLE_CHOICES);
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
    };
  }

  // R1.T3.A1 — Phoneme Isolation (onset and coda)
  if (skill_id === "R1.T3.A1") {
    const entry = pickRandom(PHONEME_ISOLATION_CHOICES);
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
    };
  }

  // R1.T3.A2 — Full Phoneme Segmentation and Blending (two sub-types, randomly selected)
  if (skill_id === "R1.T3.A2") {
    // Alternate between count (segmentation) and blend tasks
    const useBlend = Math.random() < 0.5 && PHONEME_BLEND_CHOICES.length > 0;
    if (useBlend) {
      const entry = pickRandom(PHONEME_BLEND_CHOICES);
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
      };
    } else {
      const entry = pickRandom(PHONEME_SEGMENT_CHOICES);
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
      };
    }
  }

  // R1.T3.A3 — Phoneme Manipulation (deletion and substitution)
  if (skill_id === "R1.T3.A3") {
    const entry = pickRandom(PHONEME_MANIP_CHOICES);
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
  const deny = requireApiSecret(req);
  if (deny) return deny;
  try {
    const {
      skill_id,
      template,
      attempt_number = 1,
      include_hint = false,
      is_correct = true,
      error_type = null,
    }: {
      skill_id: string;
      template: ReadingTemplate;
      attempt_number?: number;
      include_hint?: boolean;
      is_correct?: boolean;
      error_type?: string | null;
    } = await req.json();

    const skill = getReadingSkillById(skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // For letter-sound and digraph skills, return a deterministic audio-tap question
    // (no LLM needed — isolated phoneme production cannot be captured by STT)
    if (template === "oral") {
      const tapQuestion = buildAudioTapQuestion(skill_id);
      if (tapQuestion) {
        return NextResponse.json({ ...tapQuestion, id: `rq_${Date.now()}` });
      }
    }

    // For L2 reading and L3 encoding skills, return a static word-bank question
    // (no LLM needed — expected answer is the word itself, checked by exact match)
    const staticQuestion = buildStaticQuestion(skill_id);
    if (staticQuestion) {
      return NextResponse.json({ ...staticQuestion, id: `rq_${Date.now()}` });
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
