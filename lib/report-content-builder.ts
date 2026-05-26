// ─── lib/report-content-builder.ts ───────────────────────────────────────────
// Deterministic (no API) report content generator.
// Produces the same ReportContent type as report-generator.ts but uses
// parameterised templates rather than GPT-4o — always fast, always available.

import type { DiagnosticReportInput, ReportContent } from "./report-generator";

// ─── Main export ──────────────────────────────────────────────────────────────

export function buildDeterministicReportContent(
  input: DiagnosticReportInput
): ReportContent {
  const { studentName: name, subject, workingLevel, domainScores, dominantErrors, skillsCompleted } = input;

  const strongDomains   = domainScores.filter((d) => d.label === "strong");
  const practiceDomains = domainScores.filter((d) => d.label === "practice").sort((a, b) => a.score - b.score);
  const buildingDomains = domainScores.filter((d) => d.label === "building");
  const weakDomains     = [...practiceDomains, ...buildingDomains];
  const mainFocus       = weakDomains[0] ?? domainScores[0];
  const mainStrength    = strongDomains[0];

  // ── Placement summary ──────────────────────────────────────────────────────

  const knownSkillsNote =
    skillsCompleted > 0
      ? ` ${name} already knows ${skillsCompleted} skill${skillsCompleted !== 1 ? "s" : ""} — a solid base to build from.`
      : "";

  const placementSummary = `Based on the placement activity, ${name} will begin at ${workingLevel}. This is a starting point, not a ceiling. Ruby builds from where ${name} is, so progress happens at the right pace.${knownSkillsNote}`;

  // ── Strengths ──────────────────────────────────────────────────────────────

  const strengthsNote = mainStrength
    ? `${name}'s strongest area is ${mainStrength.domain}. Ruby will use this as the entry point into the topics that need more practice — building new understanding on what ${name} already knows rather than starting from zero. This is the fastest route to closing the gap.`
    : `${name} showed consistent effort across the placement activity. Ruby will use the best-performing areas as the bridge into the topics that need more attention, making each step feel achievable.`;

  // ── Root cause ─────────────────────────────────────────────────────────────

  const rootCauseSummary =
    subject === "maths"
      ? mainFocus
        ? `${mainFocus.domain} is the main focus because maths skills build on each other in a specific order. When ${mainFocus.domain.toLowerCase()} is not yet fully secure, problems in fractions, algebra, and higher-level number work feel harder than they should — even when the underlying number sense is strong. Strengthening this one foundation will make a wide range of other topics feel more manageable for ${name}.`
        : `Maths skills build on each other in a specific sequence. Ruby has identified where ${name}'s foundations need strengthening — once those are secure, harder topics become noticeably easier.`
      : mainFocus
      ? `${mainFocus.domain} is the main focus because reading builds in a clear sequence — phonics leads to decoding, decoding leads to fluency, and fluency enables comprehension. When an earlier stage is not fully secure, all the stages above it feel harder than they should. Strengthening ${name}'s foundation in ${mainFocus.domain.toLowerCase()} will make reading feel more natural and automatic across the board.`
      : `Reading builds in a clear sequence from sounds to fluency to comprehension. Ruby has identified where ${name}'s foundations need the most attention — once those are secure, the whole reading experience improves.`;

  // ── Learning plan ──────────────────────────────────────────────────────────

  const learningPlan =
    subject === "maths"
      ? buildMathsLearningPlan(name, mainFocus, dominantErrors)
      : buildReadingLearningPlan(name, mainFocus, dominantErrors);

  // ── Experience bullets ─────────────────────────────────────────────────────

  const experienceBullets = [
    `${name} gets one short question at a time — no long worksheets or time pressure`,
    `Ruby explains the concept before asking ${name} to answer — worked examples come first`,
    `When something is tricky, Ruby changes approach rather than repeating the same question`,
    `Skills are revisited automatically after a few days to make sure they stick`,
    `${name} moves at their own pace — no comparison to classmates`,
  ];

  // ── Parent guidance ────────────────────────────────────────────────────────

  const parentGuidance = buildParentGuidance(name, subject, mainFocus, dominantErrors);

  // ── Expected outcomes ──────────────────────────────────────────────────────

  const expectedOutcomes =
    subject === "maths"
      ? [
          `Greater accuracy on ${mainFocus?.domain.toLowerCase() ?? "maths"} questions across different formats`,
          `More confidence attempting problems ${name} previously avoided or rushed through`,
          `Word problems that felt overwhelming will become more manageable`,
          `More independent homework completion as the foundations strengthen`,
        ]
      : [
          `More confident and accurate reading of words ${name} previously struggled with`,
          `Faster recognition of letter patterns and sounds without needing to sound out every word`,
          `Greater willingness to attempt unfamiliar words rather than guessing from context`,
          `Improved reading fluency and comprehension as the foundation becomes secure`,
        ];

  // ── Next session hook ──────────────────────────────────────────────────────

  const nextSessionHook = `Ruby will show a short update after ${name}'s first session — what was covered and how it went. You don't need to do anything before then. Ruby has everything it needs to get started.`;

  return {
    placementSummary,
    strengthsNote,
    rootCauseSummary,
    learningPlan,
    experienceBullets,
    parentGuidance,
    expectedOutcomes,
    nextSessionHook,
  };
}

// ─── Maths learning plan ──────────────────────────────────────────────────────

function buildMathsLearningPlan(
  name: string,
  mainFocus: DiagnosticReportInput["domainScores"][0] | undefined,
  dominantErrors: string[]
): ReportContent["learningPlan"] {
  const focusName = mainFocus?.domain ?? "Number foundations";

  // Map dominant error codes to step topics
  const hasRepresentationError = dominantErrors.some((e) =>
    ["ERR_FRACTION_FORM", "representation_confusion", "ERR_SYMBOLIC_ONLY", "ERR_CONCRETE_ONLY"].includes(e)
  );
  const hasEqualityError = dominantErrors.some((e) =>
    ["ERR_EQUALITY_MISREAD", "ERR_OP_MEANING", "ERR_INVERSE_UNKNOWN"].includes(e)
  );
  const hasStrategyError = dominantErrors.some((e) =>
    ["ERR_NO_STRATEGY", "ERR_WRONG_STRATEGY", "strategy_gap"].includes(e)
  );
  const hasPlaceValueError = dominantErrors.some((e) =>
    ["ERR_PLACE_VALUE", "ERR_PART_WHOLE"].includes(e)
  );

  const steps: ReportContent["learningPlan"] = [];

  steps.push({
    stepNumber: 1,
    title: `Understanding ${focusName}`,
    description: `Ruby introduces ${focusName.toLowerCase()} using concrete examples ${name} can picture — objects, diagrams, and everyday situations. ${name} sees a worked example before answering, so the first attempt always feels achievable.`,
    estimate: "2–3 sessions · about 15–20 minutes each",
  });

  if (hasRepresentationError) {
    steps.push({
      stepNumber: 2,
      title: "Connecting different formats",
      description: `${name} will see the same idea in different ways — as a picture, a number line, and a written expression. Ruby starts with the format ${name} already understands and builds bridges to the others one step at a time.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  } else if (hasPlaceValueError) {
    steps.push({
      stepNumber: 2,
      title: "Place value and number structure",
      description: `${name} will practise recognising the value of digits in different positions. Ruby uses visual groupings — tens frames, base-ten blocks in picture form — before moving to written number work.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  } else {
    steps.push({
      stepNumber: 2,
      title: "Applying the skills in practice",
      description: `${name} practises the core skills in straightforward problems, building fluency before difficulty increases. Ruby tracks accuracy and adjusts the challenge automatically.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  }

  if (hasEqualityError) {
    steps.push({
      stepNumber: 3,
      title: "Balance and missing numbers",
      description: `Ruby rebuilds the equals sign as a balance — both sides must match — so that problems like 3 + ? = 7 become straightforward for ${name}. Balance-scale language and real-world examples come before written equations.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  } else if (hasStrategyError) {
    steps.push({
      stepNumber: 3,
      title: "Choosing the right approach",
      description: `${name} will learn to recognise which strategy fits which problem. Ruby presents problems with clear visual cues at first, then gradually reduces the hints as ${name}'s confidence builds.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  } else {
    steps.push({
      stepNumber: 3,
      title: "Harder problems and mixed practice",
      description: `Once the foundations are secure, ${name} will encounter more complex problems that combine skills. Ruby introduces these gradually so each step builds naturally on the last.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  }

  steps.push({
    stepNumber: 4,
    title: "Word problems and real-world use",
    description: `Applying ${focusName.toLowerCase()} to word problems and real-world scenarios. Because ${name}'s strongest areas are already solid, this stage typically moves quickly once the earlier foundations are in place.`,
    estimate: "2–3 sessions · about 15–20 minutes each",
  });

  return steps;
}

// ─── Reading learning plan ────────────────────────────────────────────────────

function buildReadingLearningPlan(
  name: string,
  mainFocus: DiagnosticReportInput["domainScores"][0] | undefined,
  dominantErrors: string[]
): ReportContent["learningPlan"] {
  const focusName = mainFocus?.domain ?? "Phonics foundations";

  const hasBlendError   = dominantErrors.some((e) => ["ERR_BLEND_FAIL", "ERR_SOUND_OMIT", "ERR_SOUND_INSERT"].includes(e));
  const hasVowelError   = dominantErrors.some((e) => ["ERR_VOWEL_CONF", "ERR_PHONEME_CONF"].includes(e));
  const hasSightError   = dominantErrors.some((e) => ["ERR_SIGHT_MISS", "ERR_ORTHO_GUESS"].includes(e));
  const hasDecodeError  = dominantErrors.some((e) => ["ERR_MULTI_BREAK", "ERR_FLUENCY_HES"].includes(e));

  const steps: ReportContent["learningPlan"] = [];

  steps.push({
    stepNumber: 1,
    title: `Building ${focusName} confidence`,
    description: `Ruby starts with sounds and patterns ${name} already knows, making sure the foundation is fully secure before introducing anything new. Short, varied activities keep each session engaging.`,
    estimate: "2–3 sessions · about 15–20 minutes each",
  });

  if (hasBlendError) {
    steps.push({
      stepNumber: 2,
      title: "Blending sounds into words",
      description: `${name} will practise merging individual sounds smoothly into complete words. Ruby uses a listen-then-say approach — ${name} hears the sounds in sequence before blending, building the pattern gradually.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  } else if (hasVowelError) {
    steps.push({
      stepNumber: 2,
      title: "Vowel sounds and patterns",
      description: `${name} will work through short and long vowel sounds, vowel teams, and r-controlled vowels. Ruby introduces one pattern at a time and checks it is secure before moving on.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  } else {
    steps.push({
      stepNumber: 2,
      title: "Practising new patterns",
      description: `${name} applies the new sounds and patterns across a variety of words. Ruby tracks which patterns are secure and which need more practice, adjusting automatically.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  }

  if (hasSightError) {
    steps.push({
      stepNumber: 3,
      title: "High-frequency words",
      description: `${name} will build automatic recognition of the most common irregular words — like said, does, and was — so they no longer slow down reading. Ruby uses spaced repetition so each word is reviewed at exactly the right time.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  } else if (hasDecodeError) {
    steps.push({
      stepNumber: 3,
      title: "Longer words and fluency",
      description: `${name} will practise breaking longer words into manageable parts and reading them smoothly. Ruby builds up syllable by syllable, then moves to full words and short sentences.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  } else {
    steps.push({
      stepNumber: 3,
      title: "Reading fluency",
      description: `Once individual sounds are secure, ${name} will read longer sequences of words with increasing speed and accuracy. Ruby monitors hesitations and revisits any patterns that still slow ${name} down.`,
      estimate: "2–3 sessions · about 15–20 minutes each",
    });
  }

  steps.push({
    stepNumber: 4,
    title: "Reading in context",
    description: `Applying all the skills in short connected texts. ${name} will move from individual words to phrases and sentences, using phonics knowledge rather than guessing from pictures or context.`,
    estimate: "2–3 sessions · about 15–20 minutes each",
  });

  return steps;
}

// ─── Parent guidance ──────────────────────────────────────────────────────────

function buildParentGuidance(
  name: string,
  subject: "maths" | "reading",
  mainFocus: DiagnosticReportInput["domainScores"][0] | undefined,
  dominantErrors: string[]
): ReportContent["parentGuidance"] {
  if (subject === "maths") {
    const hasRepresentation = dominantErrors.some((e) =>
      ["ERR_FRACTION_FORM", "representation_confusion", "ERR_SYMBOLIC_ONLY", "ERR_CONCRETE_ONLY"].includes(e)
    );
    const hasEquality = dominantErrors.some((e) =>
      ["ERR_EQUALITY_MISREAD", "ERR_OP_MEANING"].includes(e)
    );

    const whatYouMayNotice = hasRepresentation
      ? `${name} may avoid or rush through questions that involve fractions or numbers shown in an unfamiliar format. ${name} can often follow a method correctly but may struggle when the same idea appears in a different way — on a number line instead of a diagram, for example. These are normal patterns when different representations of the same concept are still being connected.`
      : hasEquality
      ? `${name} may treat a missing-number problem — like 3 + ? = 7 — as two separate sums rather than a balance. When asked to explain an answer, ${name} may find it hard to say why rather than just how. These are very common patterns at this stage and will improve quickly with the right practice.`
      : `${name} may feel more confident on some question types than others, particularly when the same idea is shown in an unfamiliar way. This is normal — it means the underlying concept is there but not yet fully flexible. With practice it will become automatic.`;

    const howYouCanHelp = hasRepresentation
      ? `When fractions come up naturally — dividing food, reading a measuring cup, splitting something equally — ask ${name} to show you the same amount in two ways. For example, point to a piece and then find where it would sit on a number line. Short sessions of 10–15 minutes work better than longer ones for this kind of practice.`
      : hasEquality
      ? `Use balance language when maths comes up at home — "both sides have to match" rather than "work out the answer". Scales, see-saws, or anything that balances physically makes this concrete for ${name}. When ${name} makes an error, pause and ask "are both sides equal?" before offering the answer.`
      : `Keep any maths at home low-pressure and conversational. Ask ${name} to explain their thinking on problems they get right — not just the ones they find difficult. This builds the habit of reasoning, which is exactly what Ruby reinforces.`;

    return { whatYouMayNotice, howYouCanHelp };
  }

  // Reading
  const hasBlend = dominantErrors.some((e) => ["ERR_BLEND_FAIL", "ERR_SOUND_OMIT"].includes(e));
  const hasSight = dominantErrors.some((e) => ["ERR_SIGHT_MISS", "ERR_ORTHO_GUESS"].includes(e));

  const whatYouMayNotice = hasBlend
    ? `${name} may sound out each letter correctly but then struggle to merge them into the full word. You might also notice ${name} leaving out a sound in the middle of longer words. These are signs that blending — not letter knowledge — is the current gap, and it is very directly teachable.`
    : hasSight
    ? `${name} may hesitate on common words that appear frequently in books — like "said", "they", or "because". You might notice ${name} trying to decode these sound by sound rather than recognising them instantly. This slows reading down but will improve quickly once these words become automatic.`
    : `${name} may read carefully and accurately but slowly, pausing more than you would expect on words ${name} has seen before. This is a sign that decoding is working but not yet fully automatic — with practice, the hesitations reduce and fluency builds.`;

  const howYouCanHelp = hasBlend
    ? `When reading together, pause on a tricky word and say the sounds out loud slowly, then ask ${name} to say them faster and faster until it sounds like a word. Make it a game rather than a correction. Five minutes of this every couple of days makes a genuine difference.`
    : hasSight
    ? `Keep a small set of cards with the most common words ${name} hesitates on — four or five at a time is enough. Practise them for two minutes before a reading session, just recognition, not spelling. Change the set as ${name} masters them.`
    : `Read together for 5–10 minutes daily, taking turns — one sentence each. When ${name} hesitates, give a three-second pause before stepping in. This pause is important: it gives ${name} the chance to self-correct, which is a key reading skill.`;

  return { whatYouMayNotice, howYouCanHelp };
}
