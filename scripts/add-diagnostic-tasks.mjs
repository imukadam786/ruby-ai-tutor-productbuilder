/**
 * add-diagnostic-tasks.mjs
 *
 * Adds 6 new diagnostic tasks to all 50 question-bank JSON files:
 *   D01B  Syllable Segmentation      → R1.T2.A2  (insert after D01)
 *   D02B  Full Phoneme Segmentation  → R1.T3.A2  (insert after D02)
 *   D10B  Phoneme Sequence Blending  → R2.T3.A3  (insert after D10)
 *   D13B  Consonant Blend Encoding   → R3.T1.A2  (insert after D13)
 *   D13C  Unfamiliar Word Encoding   → R3.T1.A3  (insert after D13B)
 *   D15B  Self-Monitoring for Meaning→ R4.T3.A2  (insert after D15)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BANKS_DIR = join(__dirname, '../data/question-banks');

// ─── Word pools — 50 variants each ───────────────────────────────────────────

// D01B: Syllable segmentation. Each entry: [word, syllableCount, distractors]
const D01B_POOL = [
  ["rabbit",   2, ["1","2","3"]], ["kitten",   2, ["1","2","3"]], ["garden",   2, ["1","2","3"]],
  ["window",   2, ["1","2","3"]], ["pillow",   2, ["1","2","3"]], ["monkey",   2, ["1","2","3"]],
  ["yellow",   2, ["1","2","3"]], ["butter",   2, ["1","2","3"]], ["sister",   2, ["1","2","3"]],
  ["pocket",   2, ["1","2","3"]], ["bucket",   2, ["1","2","3"]], ["pencil",   2, ["1","2","3"]],
  ["candle",   2, ["1","2","3"]], ["castle",   2, ["1","2","3"]], ["bottle",   2, ["1","2","3"]],
  ["turtle",   2, ["1","2","3"]], ["marble",   2, ["1","2","3"]], ["puddle",   2, ["1","2","3"]],
  ["bubble",   2, ["1","2","3"]], ["riddle",   2, ["1","2","3"]], ["mango",    2, ["1","2","3"]],
  ["camel",    2, ["1","2","3"]], ["ladder",   2, ["1","2","3"]], ["mitten",   2, ["1","2","3"]],
  ["ribbon",   2, ["1","2","3"]], ["velvet",   2, ["1","2","3"]], ["cactus",   2, ["1","2","3"]],
  ["umbrella", 3, ["2","3","4"]], ["elephant", 3, ["2","3","4"]], ["dinosaur", 3, ["2","3","4"]],
  ["tomato",   3, ["2","3","4"]], ["banana",   3, ["2","3","4"]], ["remember", 3, ["2","3","4"]],
  ["tomorrow", 3, ["2","3","4"]], ["together", 3, ["2","3","4"]], ["important", 3, ["2","3","4"]],
  ["October",  3, ["2","3","4"]], ["November", 3, ["2","3","4"]], ["computer", 3, ["2","3","4"]],
  ["however",  3, ["2","3","4"]], ["adventure",3, ["2","3","4"]], ["example",  3, ["2","3","4"]],
  ["probably", 3, ["2","3","4"]], ["holiday",  3, ["2","3","4"]], ["library",  3, ["2","3","4"]],
  ["medicine", 3, ["2","3","4"]], ["usually",  3, ["2","3","4"]], ["beautiful",3, ["2","3","4"]],
  ["difficult",3, ["2","3","4"]], ["yesterday",3, ["2","3","4"]],
];

// D02B: Phoneme segmentation. Each entry: [word, phonemeCount, distractors, question_type]
// question_type: "count" or "last_sound"
const D02B_POOL = [
  ["cat",  3, ["2","3","4"], "count"],  ["ship", 3, ["2","3","4"], "count"],
  ["flag", 4, ["3","4","5"], "count"],  ["step", 4, ["3","4","5"], "count"],
  ["dog",  3, ["2","3","4"], "count"],  ["sun",  3, ["2","3","4"], "count"],
  ["chip", 3, ["2","3","4"], "count"],  ["frog", 4, ["3","4","5"], "count"],
  ["blue", 3, ["2","3","4"], "count"],  ["tree", 3, ["2","3","4"], "count"],
  ["shoe", 2, ["2","3","4"], "count"],  ["rain", 3, ["2","3","4"], "count"],
  ["play", 3, ["2","3","4"], "count"],  ["spin", 4, ["3","4","5"], "count"],
  ["clap", 4, ["3","4","5"], "count"],  ["bed",  3, ["2","3","4"], "count"],
  ["map",  3, ["2","3","4"], "count"],  ["cup",  3, ["2","3","4"], "count"],
  ["hat",  3, ["2","3","4"], "count"],  ["fish", 3, ["2","3","4"], "count"],
  ["red",  3, ["2","3","4"], "count"],  ["jump", 4, ["3","4","5"], "count"],
  ["stop", 4, ["3","4","5"], "count"],  ["drip", 4, ["3","4","5"], "count"],
  ["skin", 4, ["3","4","5"], "count"],  // last-sound variants below
  ["dog",  null, ["/g/","/o/","/d/"], "last", "/g/"],
  ["ship", null, ["/p/","/sh/","/i/"], "last", "/p/"],
  ["cat",  null, ["/t/","/k/","/ae/"], "last", "/t/"],
  ["map",  null, ["/p/","/m/","/a/"], "last", "/p/"],
  ["bed",  null, ["/d/","/b/","/e/"], "last", "/d/"],
  ["sun",  null, ["/n/","/s/","/u/"], "last", "/n/"],
  ["bus",  null, ["/s/","/b/","/u/"], "last", "/s/"],
  ["top",  null, ["/p/","/t/","/o/"], "last", "/p/"],
  ["run",  null, ["/n/","/r/","/u/"], "last", "/n/"],
  ["big",  null, ["/g/","/b/","/i/"], "last", "/g/"],
  ["wet",  null, ["/t/","/w/","/e/"], "last", "/t/"],
  ["hop",  null, ["/p/","/h/","/o/"], "last", "/p/"],
  ["mix",  null, ["/ks/","/m/","/i/"], "last", "/ks/"],
  ["hug",  null, ["/g/","/h/","/u/"], "last", "/g/"],
  ["sad",  null, ["/d/","/s/","/ae/"], "last", "/d/"],
  ["fit",  null, ["/t/","/f/","/i/"], "last", "/t/"],
  ["pod",  null, ["/d/","/p/","/o/"], "last", "/d/"],
  ["leg",  null, ["/g/","/l/","/e/"], "last", "/g/"],
  ["fix",  null, ["/ks/","/f/","/i/"], "last", "/ks/"],
  ["cut",  null, ["/t/","/k/","/u/"], "last", "/t/"],
  ["win",  null, ["/n/","/w/","/i/"], "last", "/n/"],
  ["log",  null, ["/g/","/l/","/o/"], "last", "/g/"],
  ["rub",  null, ["/b/","/r/","/u/"], "last", "/b/"],
  ["gem",  null, ["/m/","/g/","/e/"], "last", "/m/"],
  ["jet",  null, ["/t/","/j/","/e/"], "last", "/t/"],
];

// D10B: Phoneme blending. Each entry: [soundSequence, answer, distractors]
const D10B_POOL = [
  ["/s/ /t/ /r/ /ee/ /t/",  "street",  ["streak",  "street",  "stream"]],
  ["/b/ /r/ /igh/ /t/",      "bright",  ["fright",  "bright",  "blight"]],
  ["/f/ /l/ /oa/ /t/",       "float",   ["bloat",   "float",   "throat"]],
  ["/s/ /p/ /l/ /a/ /sh/",   "splash",  ["clash",   "flash",   "splash"]],
  ["/d/ /r/ /ea/ /m/",       "dream",   ["cream",   "dream",   "seam"]],
  ["/s/ /n/ /ow/",            "snow",    ["slow",    "snow",    "show"]],
  ["/b/ /l/ /oo/ /m/",        "bloom",   ["broom",   "bloom",   "groom"]],
  ["/t/ /r/ /ee/",            "tree",    ["free",    "tree",    "three"]],
  ["/g/ /r/ /ow/ /l/",        "growl",   ["prowl",   "growl",   "fowl"]],
  ["/s/ /k/ /r/ /ee/ /m/",   "scream",  ["stream",  "scream",  "cream"]],
  ["/p/ /l/ /ea/ /se/",       "please",  ["fleas",   "please",  "sneeze"]],
  ["/b/ /r/ /ea/ /d/",        "bread",   ["spread",  "bread",   "thread"]],
  ["/t/ /r/ /ai/ /n/",        "train",   ["strain",  "train",   "drain"]],
  ["/s/ /p/ /r/ /ai/ /n/ /t/","sprint",  ["print",   "sprint",  "squint"]],
  ["/f/ /r/ /ee/ /z/",        "freeze",  ["breeze",  "freeze",  "sneeze"]],
  ["/k/ /r/ /ow/ /n/",        "crown",   ["brown",   "crown",   "frown"]],
  ["/t/ /w/ /ee/ /t/",        "tweet",   ["treat",   "tweet",   "greet"]],
  ["/g/ /l/ /oa/ /t/",        "gloat",   ["float",   "gloat",   "bloat"]],
  ["/s/ /t/ /ai/ /n/",        "stain",   ["drain",   "stain",   "train"]],
  ["/b/ /l/ /igh/ /t/",       "blight",  ["flight",  "blight",  "slight"]],
  ["/p/ /r/ /ow/ /l/",        "prowl",   ["growl",   "prowl",   "owl"]],
  ["/k/ /l/ /oa/ /k/",        "cloak",   ["croak",   "cloak",   "soak"]],
  ["/s/ /t/ /ee/ /p/",        "steep",   ["sleep",   "steep",   "sweep"]],
  ["/g/ /r/ /ee/ /n/",        "green",   ["screen",  "green",   "keen"]],
  ["/f/ /r/ /ow/ /n/",        "frown",   ["brown",   "frown",   "crown"]],
  ["/s/ /k/ /r/ /oo/ /l/",   "school",  ["fool",    "stool",   "school"]],
  ["/t/ /r/ /oo/ /p/",        "troop",   ["droop",   "troop",   "scoop"]],
  ["/b/ /r/ /oo/ /m/",        "broom",   ["bloom",   "broom",   "groom"]],
  ["/s/ /p/ /r/ /oo/ /t/",   "sprout",  ["shout",   "sprout",  "scout"]],
  ["/t/ /h/ /r/ /ow/ /n/",   "thrown",  ["groan",   "thrown",  "known"]],
  ["/s/ /t/ /r/ /oa/ /ng/",  "strong",  ["prong",   "strong",  "long"]],
  ["/s/ /k/ /r/ /oo/ /n/ /j/","scrounge",["grunge","scrounge","lounge"]],
  ["/p/ /r/ /igh/ /d/",       "pride",   ["bride",   "pride",   "glide"]],
  ["/g/ /r/ /ai/ /d/",        "grayed",  ["frayed",  "grayed",  "swayed"]],
  ["/s/ /t/ /r/ /oo/ /ng/",  "strong",  ["prong",   "strong",  "wrong"]],
  ["/b/ /r/ /ee/ /z/",        "breeze",  ["freeze",  "breeze",  "sneeze"]],
  ["/k/ /r/ /ee/ /p/",        "creep",   ["sleep",   "creep",   "steep"]],
  ["/p/ /r/ /ow/ /d/",        "proud",   ["crowd",   "proud",   "cloud"]],
  ["/s/ /t/ /r/ /ay/",        "stray",   ["spray",   "stray",   "pray"]],
  ["/f/ /r/ /ow/ /st/",       "frost",   ["lost",    "frost",   "cost"]],
  ["/t/ /r/ /ee/ /t/",        "treat",   ["tweet",   "treat",   "greet"]],
  ["/b/ /l/ /ee/ /d/",        "bleed",   ["freed",   "bleed",   "treed"]],
  ["/s/ /n/ /ea/ /k/",        "sneak",   ["creak",   "sneak",   "beak"]],
  ["/g/ /r/ /ow/ /n/",        "grown",   ["blown",   "grown",   "known"]],
  ["/s/ /t/ /r/ /ee/ /m/",   "stream",  ["dream",   "stream",  "cream"]],
  ["/f/ /r/ /ai/ /d/",        "frayed",  ["grayed",  "frayed",  "swayed"]],
  ["/b/ /r/ /ow/ /z/",        "browse",  ["crows",   "browse",  "flows"]],
  ["/s/ /k/ /r/ /ay/",        "spray",   ["stray",   "spray",   "pray"]],
  ["/t/ /r/ /oo/ /th/",       "truth",   ["youth",   "truth",   "booth"]],
  ["/g/ /l/ /ow/",             "glow",    ["flow",    "glow",    "slow"]],
];

// D13B: Blend encoding (CCVC/CVCC). Each entry: [word, spelling]
const D13B_POOL = [
  ["flag","f l a g"], ["best","b e s t"], ["jump","j u m p"], ["clap","c l a p"],
  ["stop","s t o p"], ["drip","d r i p"], ["drum","d r u m"], ["hand","h a n d"],
  ["frog","f r o g"], ["grip","g r i p"], ["sled","s l e d"], ["slid","s l i d"],
  ["flat","f l a t"], ["slug","s l u g"], ["snag","s n a g"], ["snap","s n a p"],
  ["spin","s p i n"], ["spit","s p i t"], ["spot","s p o t"], ["stab","s t a b"],
  ["stem","s t e m"], ["step","s t e p"], ["slim","s l i m"], ["slip","s l i p"],
  ["clip","c l i p"], ["clog","c l o g"], ["crop","c r o p"], ["cram","c r a m"],
  ["drab","d r a b"], ["drip","d r i p"], ["drop","d r o p"], ["drug","d r u g"],
  ["fled","f l e d"], ["flip","f l i p"], ["flop","f l o p"], ["flit","f l i t"],
  ["flab","f l a b"], ["grab","g r a b"], ["grim","g r i m"], ["grin","g r i n"],
  ["grit","g r i t"], ["grub","g r u b"], ["plan","p l a n"], ["plod","p l o d"],
  ["plot","p l o t"], ["plug","p l u g"], ["plum","p l u m"], ["prod","p r o d"],
  ["prop","p r o p"], ["pram","p r a m"],
];

// D13C: Nonsense word encoding. Each entry: [word, spelling]
const D13C_POOL = [
  ["nup","n u p"],   ["greb","g r e b"], ["spav","s p a v"], ["trid","t r i d"],
  ["flem","f l e m"],["brost","b r o s t"],["sniv","s n i v"],["drox","d r o x"],
  ["plub","p l u b"],["clum","c l u m"],  ["gript","g r i p t"],["spod","s p o d"],
  ["blef","b l e f"],["trub","t r u b"],  ["flom","f l o m"],  ["crav","c r a v"],
  ["snod","s n o d"],["drep","d r e p"],  ["glub","g l u b"],  ["pliv","p l i v"],
  ["crob","c r o b"],["snuft","s n u f t"],["blag","b l a g"], ["driv","d r i v"],
  ["flup","f l u p"],["snom","s n o m"],  ["trev","t r e v"],  ["glip","g l i p"],
  ["cron","c r o n"],["spiv","s p i v"],  ["blom","b l o m"],  ["drob","d r o b"],
  ["flim","f l i m"],["snab","s n a b"],  ["trop","t r o p"],  ["clob","c l o b"],
  ["brev","b r e v"],["drob","d r o b"],  ["splan","s p l a n"],["griv","g r i v"],
  ["crub","c r u b"],["sprat","s p r a t"],["flon","f l o n"], ["snup","s n u p"],
  ["trig","t r i g"],["glom","g l o m"],  ["clag","c l a g"],  ["brop","b r o p"],
  ["drob","d r o b"],["sniv","s n i v"],
];

// D15B: Self-monitoring. Each entry: scenario question with 3 choices
const D15B_POOL = [
  {
    question: "You read a sentence and it doesn't make sense. What should you do?",
    correct: "reread the sentence",
    choices: ["reread the sentence", "read faster", "skip to the next page"],
  },
  {
    question: "You read \"The dog ran over the pond\" but that doesn't make sense. What should you do?",
    correct: "go back and check the word",
    choices: ["keep reading", "go back and check the word", "ask someone to read it for you"],
  },
  {
    question: "A good reader reads \"The cat sat on the mat.\" but hears a mistake. What do they do?",
    correct: "go back and fix it",
    choices: ["ignore it and keep reading", "go back and fix it", "stop reading"],
  },
  {
    question: "You are reading and a word doesn't sound right. What is the best thing to do?",
    correct: "reread that part carefully",
    choices: ["reread that part carefully", "skip it", "guess any word"],
  },
  {
    question: "Which of these shows a reader checking their own understanding?",
    correct: "\"Does this make sense?\"",
    choices: ["\"Does this make sense?\"", "\"I'll just keep going\"", "\"This is boring\""],
  },
  {
    question: "You read a sentence three times and still can't understand it. What should you try next?",
    correct: "read the sentences before it for clues",
    choices: ["give up", "read the sentences before it for clues", "read it louder"],
  },
  {
    question: "You notice a sentence you just read doesn't match the picture. What should you do?",
    correct: "reread to find the mismatch",
    choices: ["trust the picture instead", "reread to find the mismatch", "skip the picture"],
  },
  {
    question: "What does it mean to 'monitor your reading'?",
    correct: "checking that what you read makes sense",
    choices: ["reading as fast as you can", "checking that what you read makes sense", "reading every word twice"],
  },
  {
    question: "A reader says: \"Wait, that word doesn't fit — let me try again.\" What skill is this?",
    correct: "self-monitoring",
    choices: ["guessing", "self-monitoring", "skipping"],
  },
  {
    question: "You read 'The bird fright off the branch.' Something is wrong. What should you do?",
    correct: "go back and reread the tricky word",
    choices: ["go back and reread the tricky word", "read the next sentence", "sound out every letter"],
  },
];
// Pad D15B pool to 50 by cycling
while (D15B_POOL.length < 50) {
  D15B_POOL.push(D15B_POOL[D15B_POOL.length % 10]);
}

// ─── Helper: insert task after a given ID ─────────────────────────────────────
function insertAfter(tasks, afterId, newTask) {
  const idx = tasks.findIndex((t) => t.id === afterId);
  if (idx === -1) {
    console.error(`  ⚠ Could not find task "${afterId}" — appending at end`);
    tasks.push(newTask);
    return;
  }
  tasks.splice(idx + 1, 0, newTask);
}

// ─── Build task objects for each paper ───────────────────────────────────────
function buildD01B(i) {
  const [word, count, options] = D01B_POOL[i % D01B_POOL.length];
  return {
    id: "D01B",
    domain: "Syllable Segmentation",
    domainCode: "D001B",
    gate: "A",
    question: `How many syllables in "${word}"?`,
    displayWord: word,
    answerMode: "choice",
    choices: options.map((o) => ({ label: o, value: o, correct: o === String(count) })),
    subText: "Say the word quietly and count the beats.",
  };
}

function buildD02B(i) {
  const row = D02B_POOL[i % D02B_POOL.length];
  const [word, count, options, type, lastSound] = row;
  if (type === "last") {
    return {
      id: "D02B",
      domain: "Full Phoneme Segmentation",
      domainCode: "D002B",
      gate: "A",
      question: `What is the last sound in "${word}"?`,
      displayWord: word,
      answerMode: "audio-tap",
      choices: options.map((o) => ({ label: o, value: o, speech: o, correct: o === lastSound })),
      subText: "Tap to hear each sound choice, then choose the last sound in the word.",
    };
  }
  return {
    id: "D02B",
    domain: "Full Phoneme Segmentation",
    domainCode: "D002B",
    gate: "A",
    question: `How many sounds are in "${word}"?`,
    displayWord: word,
    answerMode: "choice",
    choices: options.map((o) => ({ label: o, value: o, correct: o === String(count) })),
    subText: "Count each individual sound — not letters.",
  };
}

function buildD10B(i) {
  const [seq, answer, choices] = D10B_POOL[i % D10B_POOL.length];
  return {
    id: "D10B",
    domain: "Phoneme Sequence Blending",
    domainCode: "D010B",
    gate: "C",
    question: `Blend these sounds together: ${seq} — what word do they make?`,
    displayWord: seq,
    answerMode: "choice",
    choices: choices.map((c) => ({ label: c, value: c, correct: c === answer })),
    subText: "Listen to the sounds and blend them into one word.",
  };
}

function buildD13B(i) {
  const [word, spelling] = D13B_POOL[i % D13B_POOL.length];
  return {
    id: "D13B",
    domain: "Consonant Blend Encoding",
    domainCode: "D013B",
    gate: "C",
    question: `Spell this word: "${word}"`,
    displayWord: word,
    answerMode: "voice",
    expectedAnswer: spelling,
    voiceHint: "Say each letter clearly, one at a time.",
  };
}

function buildD13C(i) {
  const [word, spelling] = D13C_POOL[i % D13C_POOL.length];
  return {
    id: "D13C",
    domain: "Unfamiliar Word Encoding",
    domainCode: "D013C",
    gate: "C",
    question: `Spell this made-up word: "${word}"`,
    displayWord: word,
    answerMode: "voice",
    expectedAnswer: spelling,
    voiceHint: "Use the sounds to work it out, then say each letter.",
  };
}

function buildD15B(i) {
  const item = D15B_POOL[i % D15B_POOL.length];
  return {
    id: "D15B",
    domain: "Self-Monitoring for Meaning",
    domainCode: "D015B",
    gate: "D",
    question: item.question,
    displayWord: "",
    answerMode: "choice",
    choices: item.choices.map((c) => ({ label: c, value: c, correct: c === item.correct })),
    subText: "Think about what a good reader would do.",
  };
}

// ─── Main: iterate all 50 files ───────────────────────────────────────────────
let updatedCount = 0;
let skippedCount = 0;

for (let fileNum = 1; fileNum <= 50; fileNum++) {
  const filePath = join(BANKS_DIR, `${fileNum}.json`);
  const tasks = JSON.parse(readFileSync(filePath, 'utf8'));

  // Skip if already patched (idempotent)
  if (tasks.some((t) => t.id === 'D01B')) {
    skippedCount++;
    continue;
  }

  const i = fileNum - 1; // 0-indexed for pool selection
  insertAfter(tasks, 'D01',  buildD01B(i));
  insertAfter(tasks, 'D02',  buildD02B(i));
  insertAfter(tasks, 'D10',  buildD10B(i));
  insertAfter(tasks, 'D13',  buildD13B(i));
  insertAfter(tasks, 'D13B', buildD13C(i));
  insertAfter(tasks, 'D15',  buildD15B(i));

  writeFileSync(filePath, JSON.stringify(tasks, null, 2), 'utf8');
  updatedCount++;
  process.stdout.write(`✓ ${fileNum} `);
}

console.log(`\n\nDone. ${updatedCount} files updated, ${skippedCount} already patched.`);
console.log('New task order per paper: D01 → D01B → D02 → D02B → D03–D10 → D10B → D11–D13 → D13B → D13C → D14–D15 → D15B → D16–D18');
