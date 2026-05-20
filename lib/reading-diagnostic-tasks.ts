// ─── Reading Diagnostic Task Bank ─────────────────────────────────────────────
// Up to 18 tasks administered once per student to determine reading placement.
// Early exit after 3 consecutive failures — placement calculator handles partial results.

export type DiagnosticTaskMode = "voice" | "text" | "tap" | "audio-tap" | "voice-timed";

export interface DiagnosticItem {
  id: string;
  prompt: string;       // shown on screen and spoken via TTS
  expected: string;     // correct answer (normalised lowercase)
  options?: string[];   // for tap mode only
}

export interface DiagnosticTask {
  id: string;
  domain: string;
  mode: DiagnosticTaskMode;
  description: string;
  instruction: string;  // student-facing instruction
  items: DiagnosticItem[];
  passThreshold: number;   // 0–1 fraction of items that must pass
  mapsToSkill: string;     // entry skill if this task is the first failure
  isHardGateSignal?: boolean;
}

export const DIAGNOSTIC_TASKS: DiagnosticTask[] = [
  {
    id: "D01",
    domain: "Phonological Awareness",
    mode: "voice",
    description: "Rhyme detection and syllable segmentation",
    instruction: "Listen to each question and say your answer out loud.",
    passThreshold: 0.8,
    mapsToSkill: "R1.T2.A1",
    items: [
      { id: "D01-01", prompt: 'Do "cat" and "bat" rhyme? Say yes or no.', expected: "yes" },
      { id: "D01-02", prompt: 'Do "dog" and "log" rhyme? Say yes or no.', expected: "yes" },
      { id: "D01-03", prompt: 'Do "sun" and "cup" rhyme? Say yes or no.', expected: "no" },
      { id: "D01-04", prompt: 'How many syllables in "elephant"? Say the number.', expected: "3" },
      { id: "D01-05", prompt: 'How many syllables in "cat"? Say the number.', expected: "1" },
      { id: "D01-06", prompt: 'How many syllables in "banana"? Say the number.', expected: "3" },
    ],
  },
  {
    id: "D01B",
    domain: "Syllable Segmentation",
    mode: "tap",
    description: "Segment spoken words into syllables and blend syllable sequences",
    instruction: "Listen to each question and tap the correct answer.",
    passThreshold: 0.75,
    mapsToSkill: "R1.T2.A2",
    items: [
      { id: "D01B-01", prompt: 'How many syllables in "rabbit"?', expected: "2", options: ["1", "2", "3"] },
      { id: "D01B-02", prompt: 'How many syllables in "umbrella"?', expected: "3", options: ["2", "3", "4"] },
      { id: "D01B-03", prompt: 'Blend these syllables into a word: "but – ter – fly". What word?', expected: "butterfly", options: ["blueberry", "butterfly", "buttercup"] },
      { id: "D01B-04", prompt: 'How many syllables in "pencil"?', expected: "2", options: ["1", "2", "3"] },
    ],
  },
  {
    id: "D02",
    domain: "Phoneme Isolation",
    mode: "tap",
    description: "Onset and coda phoneme matching — word level",
    instruction: "Listen to each question and tap the word that answers it.",
    passThreshold: 0.8,
    mapsToSkill: "R1.T3.A1",
    items: [
      { id: "D02-01", prompt: 'Which word starts with the same sound as "cat"?', expected: "cup", options: ["cup", "dog", "fish"] },
      { id: "D02-02", prompt: 'Which word starts with the same sound as "fish"?', expected: "fan", options: ["sun", "fan", "big"] },
      { id: "D02-03", prompt: 'Which word starts with the same sound as "big"?', expected: "bat", options: ["pen", "bat", "red"] },
      { id: "D02-04", prompt: 'Which word ends with the same sound as "map"?', expected: "top", options: ["top", "mud", "bin"] },
      { id: "D02-05", prompt: 'Which word ends with the same sound as "bed"?', expected: "red", options: ["cup", "red", "fat"] },
      { id: "D02-06", prompt: 'Which word ends with the same sound as "log"?', expected: "bag", options: ["bag", "pin", "hot"] },
    ],
  },
  {
    id: "D02B",
    domain: "Full Phoneme Segmentation",
    mode: "tap",
    description: "Count the individual phonemes in spoken words",
    instruction: "Listen to the word and tap how many sounds you hear.",
    passThreshold: 0.75,
    mapsToSkill: "R1.T3.A2",
    items: [
      { id: "D02B-01", prompt: 'How many sounds are in "cat"? (/k/ /a/ /t/)', expected: "3", options: ["2", "3", "4"] },
      { id: "D02B-02", prompt: 'How many sounds are in "ship"? (/sh/ /i/ /p/)', expected: "3", options: ["2", "3", "4"] },
      { id: "D02B-03", prompt: 'How many sounds are in "flag"? (/f/ /l/ /a/ /g/)', expected: "4", options: ["3", "4", "5"] },
      { id: "D02B-04", prompt: 'What is the last sound in "dog"?', expected: "/g/", options: ["/d/", "/o/", "/g/"] },
    ],
  },
  {
    id: "D03",
    domain: "Consonant Sound Discrimination",
    mode: "tap",
    description: "Identify the word that starts with a different sound — no letters shown",
    instruction: "Two words start with the same sound. Tap the word that starts differently.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T1.A1",
    items: [
      { id: "D03-01", prompt: "Two of these words start with the same sound. Tap the odd one out.", expected: "cat", options: ["bat", "bus", "cat"] },
      { id: "D03-02", prompt: "Two of these words start with the same sound. Tap the odd one out.", expected: "fish", options: ["dog", "dip", "fish"] },
      { id: "D03-03", prompt: "Two of these words start with the same sound. Tap the odd one out.", expected: "pin", options: ["fan", "pin", "fox"] },
      { id: "D03-04", prompt: "Two of these words start with the same sound. Tap the odd one out.", expected: "hat", options: ["get", "gun", "hat"] },
      { id: "D03-05", prompt: "Two of these words start with the same sound. Tap the odd one out.", expected: "nap", options: ["mat", "mud", "nap"] },
      { id: "D03-06", prompt: "Two of these words start with the same sound. Tap the odd one out.", expected: "big", options: ["sun", "sit", "big"] },
    ],
  },
  {
    id: "D04",
    domain: "Short Vowel Identification",
    mode: "tap",
    description: "Identify the word with a matching short vowel sound — no letters shown",
    instruction: "Listen to each question and tap the word that has the same middle sound.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T1.A1",
    items: [
      { id: "D04-01", prompt: 'Which word has the same middle sound as "cat"?', expected: "cap", options: ["cap", "cake", "car"] },
      { id: "D04-02", prompt: 'Which word has the same middle sound as "bed"?', expected: "pet", options: ["pet", "beat", "beer"] },
      { id: "D04-03", prompt: 'Which word has the same middle sound as "sit"?', expected: "bit", options: ["bit", "bike", "bird"] },
      { id: "D04-04", prompt: 'Which word has the same middle sound as "hot"?', expected: "hop", options: ["hop", "hope", "horn"] },
      { id: "D04-05", prompt: 'Which word has the same middle sound as "cup"?', expected: "cut", options: ["cut", "cute", "curl"] },
    ],
  },
  {
    id: "D05",
    domain: "Digraph Recognition — Two-Letter Sounds",
    mode: "audio-tap",
    description: "Identify the single sound made by common digraphs",
    instruction: "Tap each sound to hear it, then choose the right one.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T2.A1",
    items: [{ id: "D05-01", prompt: "What sound do these two letters make together?", expected: "correct" }],
  },
  {
    id: "D05B",
    domain: "Digraph Recognition — Two-Letter Sounds",
    mode: "audio-tap",
    description: "Second digraph recognition item — different digraph from D05",
    instruction: "Tap each sound to hear it, then choose the right one.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T2.A1",
    items: [{ id: "D05B-01", prompt: "What sound do these two letters make together?", expected: "correct" }],
  },
  {
    id: "D06",
    domain: "Consonant Blend Decoding",
    mode: "voice",
    description: "Read CVC words containing initial and final consonant blends",
    instruction: "Read each word out loud.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T2.A2",
    items: [
      { id: "D06-01", prompt: 'Read this word: "flag"', expected: "flag" },
      { id: "D06-02", prompt: 'Read this word: "stop"', expected: "stop" },
      { id: "D06-03", prompt: 'Read this word: "drip"', expected: "drip" },
      { id: "D06-04", prompt: 'Read this word: "clap"', expected: "clap" },
      { id: "D06-05", prompt: 'Read this word: "best"', expected: "best" },
    ],
  },
  {
    id: "D07",
    domain: "CVC Short-Vowel Word Reading",
    mode: "voice",
    description: "Read simple consonant-vowel-consonant words with short vowels",
    instruction: "Read each word out loud.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T2.A3",
    items: [
      { id: "D07-01", prompt: 'Read this word: "cat"', expected: "cat" },
      { id: "D07-02", prompt: 'Read this word: "dog"', expected: "dog" },
      { id: "D07-03", prompt: 'Read this word: "sit"', expected: "sit" },
      { id: "D07-04", prompt: 'Read this word: "cup"', expected: "cup" },
      { id: "D07-05", prompt: 'Read this word: "map"', expected: "map" },
    ],
  },
  {
    id: "D08",
    domain: "Word Decoding with Digraphs",
    mode: "voice",
    description: "Read words containing sh and ch digraphs",
    instruction: "Read each word out loud.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T2.A4",
    items: [
      { id: "D08-01", prompt: 'Read this word: "ship"', expected: "ship" },
      { id: "D08-02", prompt: 'Read this word: "shop"', expected: "shop" },
      { id: "D08-03", prompt: 'Read this word: "chin"', expected: "chin" },
      { id: "D08-04", prompt: 'Read this word: "chip"', expected: "chip" },
      { id: "D08-05", prompt: 'Read this word: "chop"', expected: "chop" },
    ],
  },
  {
    id: "D09",
    domain: "Long Vowel — Silent E",
    mode: "voice",
    description: "CVCe word decoding",
    instruction: "Read each word out loud.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T3.A1",
    items: [
      { id: "D09-01", prompt: 'Read this word: "cake"', expected: "cake" },
      { id: "D09-02", prompt: 'Read this word: "kite"', expected: "kite" },
      { id: "D09-03", prompt: 'Read this word: "hope"', expected: "hope" },
      { id: "D09-04", prompt: 'Read this word: "tube"', expected: "tube" },
    ],
  },
  {
    id: "D10",
    domain: "Vowel Teams",
    mode: "voice",
    description: "Common vowel team word decoding (ai, ea, oa, oo)",
    instruction: "Read each word out loud.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T3.A1",
    items: [
      { id: "D10-01", prompt: 'Read this word: "rain"', expected: "rain" },
      { id: "D10-02", prompt: 'Read this word: "leaf"', expected: "leaf" },
      { id: "D10-03", prompt: 'Read this word: "boat"', expected: "boat" },
      { id: "D10-04", prompt: 'Read this word: "moon"', expected: "moon" },
    ],
  },
  {
    id: "D10B",
    domain: "Phoneme Sequence Blending",
    mode: "tap",
    description: "Blend a spoken phoneme sequence into a word with multi-phoneme clusters",
    instruction: "Listen to the sounds and tap the word they make.",
    passThreshold: 0.75,
    mapsToSkill: "R2.T3.A3",
    items: [
      { id: "D10B-01", prompt: "Blend these sounds: /s/ /t/ /r/ /ee/ /t/ — what word?", expected: "street", options: ["streak", "street", "stream"] },
      { id: "D10B-02", prompt: "Blend these sounds: /b/ /r/ /igh/ /t/ — what word?", expected: "bright", options: ["fright", "bright", "blight"] },
      { id: "D10B-03", prompt: "Blend these sounds: /f/ /l/ /oa/ /t/ — what word?", expected: "float", options: ["bloat", "float", "throat"] },
    ],
  },
  {
    id: "D11",
    domain: "Sight Words",
    mode: "voice-timed",
    description: "High-frequency word rapid recognition (1.5 s per word)",
    instruction: "Read each word as fast as you can when it appears.",
    passThreshold: 0.9,
    mapsToSkill: "R3.T1.A1",
    items: [
      { id: "D11-01", prompt: "the", expected: "the" },
      { id: "D11-02", prompt: "and", expected: "and" },
      { id: "D11-03", prompt: "said", expected: "said" },
      { id: "D11-04", prompt: "have", expected: "have" },
      { id: "D11-05", prompt: "they", expected: "they" },
      { id: "D11-06", prompt: "was", expected: "was" },
      { id: "D11-07", prompt: "from", expected: "from" },
      { id: "D11-08", prompt: "with", expected: "with" },
      { id: "D11-09", prompt: "here", expected: "here" },
      { id: "D11-10", prompt: "come", expected: "come" },
    ],
  },
  {
    id: "D12",
    domain: "R-Controlled Vowels",
    mode: "voice",
    description: "R-controlled vowel pattern decoding (ar, er, or)",
    instruction: "Read each word out loud.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T3.A2",
    items: [
      { id: "D12-01", prompt: 'Read this word: "bark"', expected: "bark" },
      { id: "D12-02", prompt: 'Read this word: "fern"', expected: "fern" },
      { id: "D12-03", prompt: 'Read this word: "corn"', expected: "corn" },
    ],
  },
  {
    id: "D13",
    domain: "Two-Syllable Decoding",
    mode: "voice",
    description: "Two-syllable decodable word reading",
    instruction: "Read each word out loud.",
    passThreshold: 0.8,
    mapsToSkill: "R3.T2.A1",
    items: [
      { id: "D13-01", prompt: 'Read this word: "plastic"', expected: "plastic" },
      { id: "D13-02", prompt: 'Read this word: "itself"', expected: "itself" },
      { id: "D13-03", prompt: 'Read this word: "sunset"', expected: "sunset" },
      { id: "D13-04", prompt: 'Read this word: "kitten"', expected: "kitten" },
    ],
  },
  {
    id: "D13B",
    domain: "Consonant Blend Encoding",
    mode: "voice",
    description: "Spell words with CCVC and CVCC blend patterns",
    instruction: "Listen to each word and spell it out loud, letter by letter.",
    passThreshold: 0.75,
    mapsToSkill: "R3.T1.A2",
    items: [
      { id: "D13B-01", prompt: 'Spell this word: "flag"', expected: "f l a g" },
      { id: "D13B-02", prompt: 'Spell this word: "best"', expected: "b e s t" },
      { id: "D13B-03", prompt: 'Spell this word: "jump"', expected: "j u m p" },
      { id: "D13B-04", prompt: 'Spell this word: "clap"', expected: "c l a p" },
    ],
  },
  {
    id: "D13C",
    domain: "Unfamiliar Word Encoding",
    mode: "voice",
    description: "Spell phonetically regular but unfamiliar words using phonological analysis",
    instruction: "Listen to each made-up word and spell it out loud. Use the sounds to work it out.",
    passThreshold: 0.67,
    mapsToSkill: "R3.T1.A3",
    items: [
      { id: "D13C-01", prompt: 'Spell this made-up word: "nup"', expected: "n u p" },
      { id: "D13C-02", prompt: 'Spell this made-up word: "greb"', expected: "g r e b" },
      { id: "D13C-03", prompt: 'Spell this made-up word: "spav"', expected: "s p a v" },
    ],
  },
  {
    id: "D14",
    domain: "Multisyllabic Decoding",
    mode: "voice",
    description: "Three-syllable word decoding",
    instruction: "Read each word out loud.",
    passThreshold: 0.8,
    mapsToSkill: "R4.T1.A1",
    items: [
      { id: "D14-01", prompt: 'Read this word: "fantastic"', expected: "fantastic" },
      { id: "D14-02", prompt: 'Read this word: "umbrella"', expected: "umbrella" },
      { id: "D14-03", prompt: 'Read this word: "important"', expected: "important" },
    ],
  },
  {
    id: "D15",
    domain: "Prefix & Suffix Recognition",
    mode: "tap",
    description: "Morpheme identification in context",
    instruction: "Tap on the prefix or suffix in each word.",
    passThreshold: 0.75,
    mapsToSkill: "R4.T2.A1",
    items: [
      { id: "D15-01", prompt: 'Which part of "unhappy" is the prefix?', expected: "un", options: ["un", "happ", "y"] },
      { id: "D15-02", prompt: 'Which part of "jumping" is the suffix?', expected: "ing", options: ["jump", "ing", "j"] },
      { id: "D15-03", prompt: 'Which part of "redo" is the prefix?', expected: "re", options: ["re", "do", "ed"] },
      { id: "D15-04", prompt: 'Which part of "kindness" is the suffix?', expected: "ness", options: ["kind", "ness", "ki"] },
    ],
  },
  {
    id: "D15B",
    domain: "Self-Monitoring for Meaning",
    mode: "tap",
    description: "Identify when reading breaks down and apply fix-up strategies",
    instruction: "Read each question and tap the best answer.",
    passThreshold: 0.75,
    mapsToSkill: "R4.T3.A2",
    items: [
      {
        id: "D15B-01",
        prompt: 'You read a sentence and it doesn\'t make sense. What should you do?',
        expected: "reread the sentence",
        options: ["reread the sentence", "read faster", "skip to the next page"],
      },
      {
        id: "D15B-02",
        prompt: 'You read "The dog ran over the pond" but dogs can\'t run over ponds. What should you do?',
        expected: "go back and check the word",
        options: ["keep reading", "go back and check the word", "ask someone to read it for you"],
      },
    ],
  },
  {
    id: "D16",
    domain: "Oral Reading Fluency",
    mode: "voice-timed",
    description: "50-word passage read aloud — WPM and prosody",
    instruction: "Read the passage below out loud. Press Start when you are ready, then read until you finish.",
    passThreshold: 0.8, // WPM ≥ 60 maps to pass
    mapsToSkill: "R4.T1.A1",
    items: [
      {
        id: "D16-01",
        prompt: "The sun was bright and the sky was blue. A little dog ran across the green field. It stopped to sniff a flower, then kept running. A boy called out to the dog. The dog turned around and ran back to him. The boy laughed and patted the dog on its soft, brown head.",
        expected: "60", // target WPM
      },
    ],
  },
  {
    id: "D17",
    domain: "Literal Comprehension",
    mode: "tap",
    description: "Explicit information retrieval from the D16 fluency passage",
    instruction: "Read the passage, then tap the best answer to each question.",
    passThreshold: 0.8,
    mapsToSkill: "R4.T3.A1",
    items: [
      {
        id: "D17-01",
        prompt: 'Passage: "The sun was bright and the sky was blue. A little dog ran across the green field. It stopped to sniff a flower, then kept running. A boy called out to the dog. The dog turned around and ran back to him. The boy laughed and patted the dog on its soft, brown head." — What did the dog stop to sniff?',
        expected: "a flower",
        options: ["a tree", "a flower", "the boy's hand"],
      },
      {
        id: "D17-02",
        prompt: 'In the same passage — what colour was the field?',
        expected: "green",
        options: ["brown", "blue", "green"],
      },
      {
        id: "D17-03",
        prompt: 'What did the boy do after the dog ran back to him?',
        expected: "laughed and patted the dog",
        options: ["ran away", "laughed and patted the dog", "called out again"],
      },
    ],
  },
  {
    id: "D18",
    domain: "Inferential Comprehension",
    mode: "tap",
    description: "Inference and implied meaning from the D16 fluency passage",
    instruction: "Use the same passage to answer these questions. The answer is not said directly — you need to think about it.",
    passThreshold: 0.75,
    mapsToSkill: "R5.T1.A1",
    items: [
      {
        id: "D18-01",
        prompt: 'In the passage about the dog and the boy — why do you think the dog ran back to the boy?',
        expected: "the boy called it",
        options: ["it was tired", "the boy called it", "it was scared"],
      },
      {
        id: "D18-02",
        prompt: 'What does the passage tell you about how the boy feels about the dog?',
        expected: "he likes the dog",
        options: ["he is angry at the dog", "he likes the dog", "he ignores the dog"],
      },
    ],
  },
  {
    // ── L6 discovery probe ──────────────────────────────────────────────────
    // Deterministic procedural-sequencing probe sourced from the L6.B2 bank
    // (BP.001 "How to Plant a Seed"), as a multiple-choice ordering question.
    // Calculator-facing metadata only: the placement engine reads passThreshold
    // + mapsToSkill from here; the rendered card is L6_PROBE_TASK in
    // ReadingDiagnosticPlacement.tsx (same content, "choice" answerMode).
    // First failure — or a grade-seeded all-pass — places the learner at the
    // start of Level 6. No uncalibrated grading (pure choice correctness).
    id: "DL6",
    domain: "L6 — Procedural Sequencing",
    mode: "tap",
    description: "Order the steps of a procedure (Level 6 probe)",
    instruction: "Choose the option where the steps are in the correct order.",
    passThreshold: 0.8,
    mapsToSkill: "R6.T1.A1",
    items: [
      {
        id: "DL6-01",
        prompt: "Which order correctly plants a seed?",
        expected: "A",
        options: ["A", "B", "C"],
      },
    ],
  },
  // ── L7–L14 discovery probes ─────────────────────────────────────────────
  // One MCQ each, testing the hallmark skill of each level. Stacked after DL6
  // in the diagnostic so Grade 5–12 learners get probed beyond procedural
  // sequencing. Placement calculator scans them in ascending order — first
  // failure decides entry level; all-pass falls back to the grade seed.
  // Rendered cards live in ReadingDiagnosticPlacement.tsx as LX_PROBE_TASK.
  {
    id: "DL7",
    domain: "L7 — Organised Meaning",
    mode: "tap",
    description: "Identify the main idea across a structured paragraph (Level 7 probe)",
    instruction: "Choose the sentence that best captures the writer's main point.",
    passThreshold: 0.8,
    mapsToSkill: "R7.T1.A1",
    items: [
      { id: "DL7-01", prompt: "Read the short text. What is the writer's main point?", expected: "A", options: ["A", "B", "C"] },
    ],
  },
  {
    id: "DL8",
    domain: "L8 — Cause & Effect",
    mode: "tap",
    description: "Identify the main cause in a short academic passage (Level 8 probe)",
    instruction: "Choose the option that best explains the cause.",
    passThreshold: 0.8,
    mapsToSkill: "R8.T1.A1",
    items: [
      { id: "DL8-01", prompt: "Read the passage. What is the MAIN cause of the river drying up?", expected: "B", options: ["A", "B", "C"] },
    ],
  },
  {
    id: "DL9",
    domain: "L9 — Argument Analysis",
    mode: "tap",
    description: "Identify the writer's main argument in a short paragraph (Level 9 probe)",
    instruction: "Choose the sentence that states the writer's main argument.",
    passThreshold: 0.8,
    mapsToSkill: "R9.T1.A1",
    items: [
      { id: "DL9-01", prompt: "Which sentence is the writer's MAIN argument?", expected: "B", options: ["A", "B", "C"] },
    ],
  },
  {
    id: "DL10",
    domain: "L10 — Argument Evaluation",
    mode: "tap",
    description: "Detect the flaw in a short argument (Level 10 probe)",
    instruction: "Choose the option that best explains what is wrong with the argument.",
    passThreshold: 0.8,
    mapsToSkill: "R10.T1.A1",
    items: [
      { id: "DL10-01", prompt: "What is wrong with this argument?", expected: "A", options: ["A", "B", "C"] },
    ],
  },
  {
    id: "DL11",
    domain: "L11 — Source Synthesis",
    mode: "tap",
    description: "Reconcile information across two sources (Level 11 probe)",
    instruction: "Choose the statement that best combines both sources.",
    passThreshold: 0.8,
    mapsToSkill: "R11.T1.A1",
    items: [
      { id: "DL11-01", prompt: "Which statement BEST combines both sources?", expected: "A", options: ["A", "B", "C"] },
    ],
  },
  {
    id: "DL12",
    domain: "L12 — Thesis vs Evidence",
    mode: "tap",
    description: "Identify the thesis sentence in an academic paragraph (Level 12 probe)",
    instruction: "Choose the sentence that is the THESIS of the paragraph.",
    passThreshold: 0.8,
    mapsToSkill: "R12.T1.A1",
    items: [
      { id: "DL12-01", prompt: "Which sentence is the THESIS of this paragraph?", expected: "B", options: ["A", "B", "C"] },
    ],
  },
  {
    id: "DL13",
    domain: "L13 — Theme Beyond Literal",
    mode: "tap",
    description: "Identify symbolic meaning beyond the literal text (Level 13 probe)",
    instruction: "Choose the option that best explains the symbolism.",
    passThreshold: 0.8,
    mapsToSkill: "R13.T1.A1",
    items: [
      { id: "DL13-01", prompt: "What does the plant most likely SYMBOLISE in this story?", expected: "B", options: ["A", "B", "C"] },
    ],
  },
  {
    id: "DL14",
    domain: "L14 — Poetic Device",
    mode: "tap",
    description: "Identify a poetic device in an unseen line (Level 14 probe)",
    instruction: "Choose the device the poet is using.",
    passThreshold: 0.8,
    mapsToSkill: "R14.T1.A1",
    items: [
      { id: "DL14-01", prompt: "Which device is the poet using in this line?", expected: "B", options: ["A", "B", "C"] },
    ],
  },
];
