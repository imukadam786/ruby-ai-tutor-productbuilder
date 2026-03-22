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
const DIGRAPH_WORD_CHOICES: Record<string, { correct: string; distractors: [string, string] }> = {
  sh: { correct: "ship",  distractors: ["chip", "tip"]  },
  ch: { correct: "chin",  distractors: ["shin", "tin"]  },
  th: { correct: "that",  distractors: ["sat",  "mat"]  },
  wh: { correct: "when",  distractors: ["hen",  "ten"]  },
  ck: { correct: "duck",  distractors: ["dug",  "dun"]  },
  ng: { correct: "ring",  distractors: ["rim",  "rip"]  },
  ph: { correct: "phone", distractors: ["bone", "tone"] },
};

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
    const digraph = pickRandom(Object.keys(DIGRAPH_WORD_CHOICES)) as string;
    const data = DIGRAPH_WORD_CHOICES[digraph];
    if (!data) return null;
    const choices: AudioTapChoice[] = shuffle([
      { label: data.correct,        speech: data.correct,        correct: true  },
      { label: data.distractors[0], speech: data.distractors[0], correct: false },
      { label: data.distractors[1], speech: data.distractors[1], correct: false },
    ]);
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question: `Which word has the ${digraph.toUpperCase()} sound?`,
      displayWord: digraph.toUpperCase(),
      audioChoices: choices,
      expected_answer: data.correct,
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
