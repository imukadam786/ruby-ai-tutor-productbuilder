// ─── Reading Diagnostic Task Bank ─────────────────────────────────────────────
// 14 tasks administered once per student to determine reading placement.
// Full test always administered — no early exit.

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
    id: "D02",
    domain: "Phoneme Isolation",
    mode: "voice",
    description: "Onset and coda phoneme identification",
    instruction: "Listen to each word and say the sound I ask for.",
    passThreshold: 0.8,
    mapsToSkill: "R1.T3.A1",
    items: [
      { id: "D02-01", prompt: 'What is the first sound in "cat"?', expected: "k" },
      { id: "D02-02", prompt: 'What is the first sound in "fish"?', expected: "f" },
      { id: "D02-03", prompt: 'What is the first sound in "big"?', expected: "b" },
      { id: "D02-04", prompt: 'What is the last sound in "map"?', expected: "p" },
      { id: "D02-05", prompt: 'What is the last sound in "bed"?', expected: "d" },
      { id: "D02-06", prompt: 'What is the last sound in "log"?', expected: "g" },
    ],
  },
  {
    id: "D03",
    domain: "Letter Sound — Consonants",
    mode: "voice",
    description: "Consonant letter-sound correspondence",
    instruction: "Tell me the sound each letter makes.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T1.A1",
    items: [
      { id: "D03-01", prompt: 'What sound does the letter "b" make?', expected: "b" },
      { id: "D03-02", prompt: 'What sound does the letter "d" make?', expected: "d" },
      { id: "D03-03", prompt: 'What sound does the letter "f" make?', expected: "f" },
      { id: "D03-04", prompt: 'What sound does the letter "g" make?', expected: "g" },
      { id: "D03-05", prompt: 'What sound does the letter "h" make?', expected: "h" },
      { id: "D03-06", prompt: 'What sound does the letter "l" make?', expected: "l" },
      { id: "D03-07", prompt: 'What sound does the letter "m" make?', expected: "m" },
      { id: "D03-08", prompt: 'What sound does the letter "n" make?', expected: "n" },
      { id: "D03-09", prompt: 'What sound does the letter "p" make?', expected: "p" },
      { id: "D03-10", prompt: 'What sound does the letter "s" make?', expected: "s" },
    ],
  },
  {
    id: "D04",
    domain: "Letter Sound — Vowels",
    mode: "voice",
    description: "Short vowel letter-sound correspondence",
    instruction: "Tell me the short sound each vowel makes.",
    passThreshold: 0.8,
    mapsToSkill: "R2.T1.A1",
    items: [
      { id: "D04-01", prompt: 'What is the short sound of "a", like in "cat"?', expected: "a" },
      { id: "D04-02", prompt: 'What is the short sound of "e", like in "bed"?', expected: "e" },
      { id: "D04-03", prompt: 'What is the short sound of "i", like in "sit"?', expected: "i" },
      { id: "D04-04", prompt: 'What is the short sound of "o", like in "hot"?', expected: "o" },
      { id: "D04-05", prompt: 'What is the short sound of "u", like in "cup"?', expected: "u" },
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
    mapsToSkill: "R2.T3.A1",
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
    id: "D16",
    domain: "Oral Reading Fluency",
    mode: "voice-timed",
    description: "50-word passage read aloud — WPM and prosody",
    instruction: "Read the passage below out loud. Press Start when you are ready, then read until you finish.",
    passThreshold: 0.8, // WPM ≥ 60 maps to pass
    mapsToSkill: "R3.T1.A1",
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
    description: "Explicit information retrieval from a short passage",
    instruction: "Read the passage, then tap the best answer to each question.",
    passThreshold: 0.8,
    mapsToSkill: "R4.T1.A1",
    items: [
      {
        id: "D17-01",
        prompt: 'Passage: "Maya woke up early. She ate toast for breakfast and then put on her red coat. She walked to the bus stop and waited." — What did Maya eat for breakfast?',
        expected: "toast",
        options: ["eggs", "toast", "cereal"],
      },
      {
        id: "D17-02",
        prompt: 'What colour was Maya\'s coat?',
        expected: "red",
        options: ["blue", "green", "red"],
      },
      {
        id: "D17-03",
        prompt: 'Where did Maya go after breakfast?',
        expected: "the bus stop",
        options: ["the park", "the bus stop", "school"],
      },
    ],
  },
  {
    id: "D18",
    domain: "Inferential Comprehension",
    mode: "tap",
    description: "Inference and implied meaning from the same passage",
    instruction: "Use the passage to answer these questions. The answer is not said directly — you need to think about it.",
    passThreshold: 0.75,
    mapsToSkill: "R5.T1.A1",
    items: [
      {
        id: "D18-01",
        prompt: 'Same passage about Maya. Why did Maya put on her red coat?',
        expected: "she was going outside",
        options: ["she was cold inside", "she was going outside", "she liked the colour"],
      },
      {
        id: "D18-02",
        prompt: 'How do you think Maya was feeling while she waited at the bus stop?',
        expected: "calm or ready",
        options: ["angry", "calm or ready", "very tired"],
      },
    ],
  },
];
