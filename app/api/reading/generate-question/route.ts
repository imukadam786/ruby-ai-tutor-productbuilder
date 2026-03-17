import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, OPENAI_MODEL } from "@/lib/anthropic";
import { getReadingSkillById } from "@/lib/reading-student-model";
import { ReadingTemplate, ReadingGeneratedQuestion, AudioTapChoice } from "@/types/reading";

// ── Audio-tap question builder for phoneme-production skills ──────────────────
// These skills (R2.T1, R2.T2) require isolated phoneme production which STT
// cannot reliably detect. We generate deterministic multiple-choice questions.

const LETTER_DATA: Record<string, { label: string; speech: string }> = {
  a: { label: "/a/",  speech: "short A, as in apple" },
  b: { label: "/b/",  speech: "B, as in bat"         },
  c: { label: "/k/",  speech: "K, as in cat"         },
  d: { label: "/d/",  speech: "D, as in dog"         },
  e: { label: "/e/",  speech: "short E, as in bed"   },
  f: { label: "/f/",  speech: "F, as in fish"        },
  g: { label: "/g/",  speech: "G, as in got"         },
  h: { label: "/h/",  speech: "H, as in hat"         },
  i: { label: "/i/",  speech: "short I, as in sit"   },
  j: { label: "/j/",  speech: "J, as in jump"        },
  k: { label: "/k/",  speech: "K, as in kite"        },
  l: { label: "/l/",  speech: "L, as in leg"         },
  m: { label: "/m/",  speech: "M, as in mat"         },
  n: { label: "/n/",  speech: "N, as in net"         },
  o: { label: "/o/",  speech: "short O, as in hot"   },
  p: { label: "/p/",  speech: "P, as in pin"         },
  r: { label: "/r/",  speech: "R, as in red"         },
  s: { label: "/s/",  speech: "S, as in sun"         },
  t: { label: "/t/",  speech: "T, as in top"         },
  u: { label: "/u/",  speech: "short U, as in cup"   },
  v: { label: "/v/",  speech: "V, as in van"         },
  w: { label: "/w/",  speech: "W, as in wet"         },
  y: { label: "/y/",  speech: "Y, as in yes"         },
  z: { label: "/z/",  speech: "Z, as in zip"         },
};

const CONSONANT_DISTRACTORS: Record<string, string[]> = {
  b:["d","p"], c:["k","s"], d:["b","g"], f:["v","p"], g:["k","d"],
  h:["m","n"], j:["y","g"], k:["g","t"], l:["r","n"], m:["n","b"],
  n:["m","l"], p:["b","t"], r:["l","w"], s:["z","f"], t:["d","p"],
  v:["f","b"], w:["v","r"], y:["j","w"], z:["s","v"],
};
const VOWEL_DISTRACTORS: Record<string, string[]> = {
  a:["e","o"], e:["i","a"], i:["e","u"], o:["u","a"], u:["o","i"],
};
const VOWELS = new Set(["a","e","i","o","u"]);

const CONSONANT_POOL = ["b","d","f","g","h","j","k","l","m","n","p","r","s","t","v","w","y","z"];
const VOWEL_POOL = ["a","e","i","o","u"];

// Digraphs with fixed plausible distractor sets
const DIGRAPH_CHOICES: Record<string, AudioTapChoice[]> = {
  sh: [{label:"/sh/",speech:"sh, as in ship",correct:true},{label:"/s/",speech:"S, as in sun",correct:false},{label:"/ch/",speech:"ch, as in chip",correct:false}],
  ch: [{label:"/ch/",speech:"ch, as in chip",correct:true},{label:"/sh/",speech:"sh, as in ship",correct:false},{label:"/k/",speech:"K, as in cat",correct:false}],
  th: [{label:"/th/",speech:"th, as in this",correct:true},{label:"/t/",speech:"T, as in top",correct:false},{label:"/d/",speech:"D, as in dog",correct:false}],
  wh: [{label:"/wh/",speech:"wh, as in when",correct:true},{label:"/w/",speech:"W, as in wet",correct:false},{label:"/h/",speech:"H, as in hat",correct:false}],
  ck: [{label:"/k/",speech:"K, as in kick (one sound)",correct:true},{label:"/ch/",speech:"ch, as in chip",correct:false},{label:"/k/+/k/",speech:"two separate K sounds",correct:false}],
  ng: [{label:"/ng/",speech:"ng, as in ring",correct:true},{label:"/n/",speech:"N, as in net",correct:false},{label:"/g/",speech:"G, as in got",correct:false}],
  ph: [{label:"/f/",speech:"F, as in fish (ph makes the F sound)",correct:true},{label:"/p/",speech:"P, as in pin",correct:false},{label:"/ph/",speech:"two sounds, p then h",correct:false}],
};

// Blends with fixed plausible distractor sets
const BLEND_CHOICES: Record<string, AudioTapChoice[]> = {
  bl: [{label:"/b/ then /l/",speech:"b then l, as in blue",correct:true},{label:"/l/ then /b/",speech:"l then b — wrong order",correct:false},{label:"/bl/ one sound",speech:"bl as one single sound",correct:false}],
  cl: [{label:"/k/ then /l/",speech:"k then l, as in clap",correct:true},{label:"/l/ then /k/",speech:"l then k — wrong order",correct:false},{label:"/kl/ one sound",speech:"cl as one single sound",correct:false}],
  fl: [{label:"/f/ then /l/",speech:"f then l, as in flag",correct:true},{label:"/l/ then /f/",speech:"l then f — wrong order",correct:false},{label:"/fl/ one sound",speech:"fl as one single sound",correct:false}],
  pl: [{label:"/p/ then /l/",speech:"p then l, as in play",correct:true},{label:"/l/ then /p/",speech:"l then p — wrong order",correct:false},{label:"/pl/ one sound",speech:"pl as one single sound",correct:false}],
  br: [{label:"/b/ then /r/",speech:"b then r, as in bring",correct:true},{label:"/r/ then /b/",speech:"r then b — wrong order",correct:false},{label:"/br/ one sound",speech:"br as one single sound",correct:false}],
  cr: [{label:"/k/ then /r/",speech:"k then r, as in crab",correct:true},{label:"/r/ then /k/",speech:"r then k — wrong order",correct:false},{label:"/kr/ one sound",speech:"cr as one single sound",correct:false}],
  dr: [{label:"/d/ then /r/",speech:"d then r, as in drip",correct:true},{label:"/r/ then /d/",speech:"r then d — wrong order",correct:false},{label:"/dr/ one sound",speech:"dr as one single sound",correct:false}],
  fr: [{label:"/f/ then /r/",speech:"f then r, as in frog",correct:true},{label:"/r/ then /f/",speech:"r then f — wrong order",correct:false},{label:"/fr/ one sound",speech:"fr as one single sound",correct:false}],
  gr: [{label:"/g/ then /r/",speech:"g then r, as in grab",correct:true},{label:"/r/ then /g/",speech:"r then g — wrong order",correct:false},{label:"/gr/ one sound",speech:"gr as one single sound",correct:false}],
  pr: [{label:"/p/ then /r/",speech:"p then r, as in press",correct:true},{label:"/r/ then /p/",speech:"r then p — wrong order",correct:false},{label:"/pr/ one sound",speech:"pr as one single sound",correct:false}],
  st: [{label:"/s/ then /t/",speech:"s then t, as in stop",correct:true},{label:"/t/ then /s/",speech:"t then s — wrong order",correct:false},{label:"/st/ one sound",speech:"st as one single sound",correct:false}],
  sp: [{label:"/s/ then /p/",speech:"s then p, as in spin",correct:true},{label:"/p/ then /s/",speech:"p then s — wrong order",correct:false},{label:"/sp/ one sound",speech:"sp as one single sound",correct:false}],
  sn: [{label:"/s/ then /n/",speech:"s then n, as in snap",correct:true},{label:"/n/ then /s/",speech:"n then s — wrong order",correct:false},{label:"/sn/ one sound",speech:"sn as one single sound",correct:false}],
  sk: [{label:"/s/ then /k/",speech:"s then k, as in skip",correct:true},{label:"/k/ then /s/",speech:"k then s — wrong order",correct:false},{label:"/sk/ one sound",speech:"sk as one single sound",correct:false}],
  tr: [{label:"/t/ then /r/",speech:"t then r, as in trap",correct:true},{label:"/r/ then /t/",speech:"r then t — wrong order",correct:false},{label:"/tr/ one sound",speech:"tr as one single sound",correct:false}],
  sl: [{label:"/s/ then /l/",speech:"s then l, as in slip",correct:true},{label:"/l/ then /s/",speech:"l then s — wrong order",correct:false},{label:"/sl/ one sound",speech:"sl as one single sound",correct:false}],
  sw: [{label:"/s/ then /w/",speech:"s then w, as in swim",correct:true},{label:"/w/ then /s/",speech:"w then s — wrong order",correct:false},{label:"/sw/ one sound",speech:"sw as one single sound",correct:false}],
};

const DIGRAPH_POOL = Object.keys(DIGRAPH_CHOICES);
const BLEND_POOL = Object.keys(BLEND_CHOICES);

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

function buildLetterChoices(letter: string): AudioTapChoice[] {
  const info = LETTER_DATA[letter];
  if (!info) return [];
  const distractorLetters = VOWELS.has(letter)
    ? (VOWEL_DISTRACTORS[letter] ?? ["e","o"])
    : (CONSONANT_DISTRACTORS[letter] ?? ["m","n"]);
  const choices: AudioTapChoice[] = [
    { label: info.label, speech: info.speech, correct: true },
    ...distractorLetters.slice(0, 2).map((l) => {
      const d = LETTER_DATA[l];
      return d ? { label: d.label, speech: d.speech, correct: false } : null;
    }).filter((c): c is AudioTapChoice => c !== null),
  ];
  return shuffle(choices);
}

/** Returns a deterministic audio-tap question for letter-sound or digraph skills,
 *  or null if the skill should still use LLM-based generation. */
function buildAudioTapQuestion(skill_id: string): Omit<ReadingGeneratedQuestion, "id"> | null {
  // R2.T1 — Letter-Sound Correspondence
  if (skill_id.startsWith("R2.T1")) {
    const pool = skill_id === "R2.T1.A1" ? CONSONANT_POOL : [...CONSONANT_POOL, ...VOWEL_POOL];
    const letter = pickRandom(pool);
    const choices = buildLetterChoices(letter);
    if (choices.length < 3) return null;
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question: `What sound does this letter make?`,
      displayWord: letter.toUpperCase(),
      audioChoices: choices,
      expected_answer: choices.find((c) => c.correct)?.label ?? "",
      scaffolding_notes: "Audio-tap: student selects the correct phoneme from 3 choices.",
    };
  }

  // R2.T2.A1 — Digraph Phoneme Retrieval
  if (skill_id === "R2.T2.A1") {
    const digraph = pickRandom(DIGRAPH_POOL);
    const choices = shuffle(DIGRAPH_CHOICES[digraph]);
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question: `What ONE sound do these two letters make together?`,
      displayWord: digraph,
      audioChoices: choices,
      expected_answer: choices.find((c) => c.correct)?.label ?? "",
      scaffolding_notes: "Audio-tap: student identifies the single digraph phoneme.",
    };
  }

  // R2.T2.A2 — Consonant Blend Production
  if (skill_id === "R2.T2.A2") {
    const blend = pickRandom(BLEND_POOL);
    const choices = shuffle(BLEND_CHOICES[blend]);
    return {
      skill_id,
      template: "oral" as ReadingTemplate,
      question: `These two letters make two sounds close together. Which button shows the correct way to say both sounds in this blend?`,
      displayWord: blend,
      audioChoices: choices,
      expected_answer: choices.find((c) => c.correct)?.label ?? "",
      scaffolding_notes: "Audio-tap: student identifies correct blend order.",
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

const DECISION_INSTRUCTIONS: Record<string, string> = {
  reteach:
    "This is a RETEACH question. Use a simpler context, shorter words, and stronger " +
    "scaffolding cues than the previous question. Change the approach — do not repeat " +
    "the same question format that just failed.",
  practice:
    "This is a PRACTICE question. Same skill, new example. Maintain the same difficulty " +
    "level as the previous question. No scaffolding needed.",
  advance:
    "The student has mastered this skill. Generate the first question for the next skill " +
    "in the sequence. Do not reference the previous skill.",
  accelerate:
    "The student is fast-tracking. Generate a question at the next skill level immediately. " +
    "Do not generate consolidation questions for the current skill.",
  backtrack:
    "The student is returning to a prerequisite skill. Generate the first question for " +
    "that prerequisite skill. Use simple, foundational examples.",
};

export async function POST(req: NextRequest) {
  try {
    const {
      skill_id,
      template,
      attempt_number = 1,
      include_hint = false,
      decision = "practice",
      error_type = null,
    }: {
      skill_id: string;
      template: ReadingTemplate;
      attempt_number?: number;
      include_hint?: boolean;
      decision?: string;
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

The decision engine has determined: ${decision.toUpperCase()}
${DECISION_INSTRUCTIONS[decision.toLowerCase()] ?? ""}`
      : `
No error on the previous attempt. Decision: ${decision.toUpperCase()}.
${DECISION_INSTRUCTIONS[decision.toLowerCase()] ?? "Generate a question that continues consolidating this skill."}`;

    // Detect phoneme-production skills — these need word-based oral tasks
    const isPhonemeSkill = /phonem|letter.?sound|digraph|blend|vowel.?sound|consonant.?sound/i.test(
      skill.title + " " + skill.description
    );

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
    });

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
