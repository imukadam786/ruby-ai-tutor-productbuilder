// ─── lib/tutors.ts ──────────────────────────────────────────────────────────
// Single source of truth for the six tutor characters: the artwork shown on the
// Home screen, the subjects each one covers, and the personalised quick-action
// prompts shown above the chat textbox when a student opens that tutor's chat.
//
// Subject ownership matches the mascots in the November 2026 study guides
// (e.g. Business Studies → Nova, CAT → Luna, Agricultural Sciences → Terra).
// Subjects with no guide (the primary and Senior Phase subjects) go to the
// tutor whose guide subjects are closest. Each subject records the grade
// bands it is taught in, with the app's subject id for that band, so the chat
// can later look up the matching skill-tree slice.
//
// The AI engine itself is unchanged per tutor (still Ruby) — opening a tutor's
// chat only personalises the header label, the avatar, and these quick actions.

/** CAPS phases: Foundation (R–3), Intermediate (4–6), Senior (7–9), FET (10–12). */
export type GradeBand = "foundation" | "intermediate" | "senior" | "fet";

export const ALL_BANDS: GradeBand[] = ["foundation", "intermediate", "senior", "fet"];

/** Map a grade (0 = Grade R, 1–12) to its CAPS phase. null when unknown. */
export function gradeBand(grade: number | null | undefined): GradeBand | null {
  if (grade === null || grade === undefined || isNaN(grade)) return null;
  if (grade <= 3) return "foundation";
  if (grade <= 6) return "intermediate";
  if (grade <= 9) return "senior";
  return "fet";
}

export interface TutorSubject {
  /** Display name, also used as a keyword by lib/homeworkRouting.ts. */
  label: string;
  /** The app's subject id in each grade band this tutor covers it in. A band
      that is missing means the tutor doesn't cover this subject at that grade. */
  ids: Partial<Record<GradeBand, string>>;
}

export interface TutorQuickAction {
  label: string;
  prompt: string;
  /** Grade bands this prompt is shown to. Omitted = every band. */
  bands?: GradeBand[];
}

export interface Tutor {
  name: string;
  /** Short personality tagline shown alongside the name, e.g. "The Language Expert". */
  role: string;
  img: string;
  /** Every subject this tutor covers, across all grades, with per-band ids. */
  subjectsByBand: TutorSubject[];
  /** Flat list of every subject label (all grades). Used for homework routing
      and the photo classifier, which don't know the learner's grade. */
  subjects: string[];
  /** Short badge labels describing what this tutor can help with. The underlying AI
      is shared across all tutors (see app/api/chat/route.ts), so these describe real
      app capabilities rather than per-tutor differences. */
  capabilities: string[];
  quickActions: TutorQuickAction[];
}

// Shared across every tutor — the chat backend doesn't differentiate by persona,
// so these badges describe what the app can actually do, not tutor-specific skills.
const SHARED_CAPABILITIES = [
  "Explains homework",
  "Reads worksheets & photos",
  "Voice questions & answers",
  "Hints without giving away the answer",
];

/** Shown when a tutor covers none of the learner's grade's subjects. */
const GENERIC_QUICK_ACTIONS: TutorQuickAction[] = [
  { label: "Help me with homework", prompt: "Help me with my homework." },
];

const F: GradeBand = "foundation";
const I: GradeBand = "intermediate";
const S: GradeBand = "senior";
const E: GradeBand = "fet";

type TutorInput = Omit<Tutor, "subjects">;

const TUTOR_INPUTS: TutorInput[] = [
  {
    name: "Lex",
    role: "The Language Expert",
    img: "/characters/Lex.webp",
    subjectsByBand: [
      { label: "English", ids: { foundation: "english", intermediate: "english", senior: "english", fet: "english" } },
      { label: "Afrikaans", ids: { foundation: "afrikaans", intermediate: "afrikaans", senior: "afrikaans", fet: "afrikaans" } },
    ],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help with English homework", prompt: "Help me with my English homework." },
      { label: "Help me with Afrikaans", prompt: "Help me with Afrikaans — ask me what I'm working on, then explain it and check my understanding." },
      { label: "Help me read a story", prompt: "Help me practise reading. Give me a short story at my level, then ask me questions about it.", bands: [F] },
      { label: "Teach me 5 new words", prompt: "Teach me 5 new English words, with simple meanings and example sentences.", bands: [F] },
      { label: "Teach me 10 English words", prompt: "Teach me 10 new English words I should know, with simple definitions and example sentences.", bands: [I, S, E] },
      { label: "Improve my writing", prompt: "Help me improve my writing. Ask me for a piece of writing, then give me feedback step by step.", bands: [I, S, E] },
    ],
  },
  {
    name: "Nova",
    role: "The Maths Whiz",
    img: "/characters/Nova.webp",
    subjectsByBand: [
      { label: "Maths", ids: { foundation: "maths", intermediate: "maths", senior: "maths", fet: "maths" } },
      { label: "Maths Literacy", ids: { fet: "maths-literacy" } },
      { label: "Business Studies", ids: { fet: "business-studies" } },
      { label: "Consumer Studies", ids: { fet: "consumer-studies" } },
    ],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help with Maths homework", prompt: "Help me with my Maths homework." },
      { label: "Practise my sums", prompt: "Help me practise adding and taking away with small numbers, one question at a time.", bands: [F] },
      { label: "Practise times tables", prompt: "Help me practise my times tables, one question at a time, and check my answers.", bands: [I] },
      { label: "Help me solve for x", prompt: "Help me solve for x. I'll share the equation in my next message — please walk me through it step by step.", bands: [S] },
      { label: "Explain a Maths concept", prompt: "Explain a Maths concept to me. Ask me which topic I'm working on, then teach it simply with an example.", bands: [F, I, S] },
      { label: "Help with Maths Literacy", prompt: "Help me with Maths Literacy — ask me what I'm working on and guide me through it.", bands: [E] },
      { label: "Help with Business Studies", prompt: "Help me with Business Studies — ask me what topic I'm working on, then explain it.", bands: [E] },
      { label: "Help with Consumer Studies", prompt: "Help me with Consumer Studies — ask me what topic I'm working on, then explain it.", bands: [E] },
    ],
  },
  {
    name: "Luna",
    role: "The Business Brain",
    img: "/characters/Luna.webp",
    subjectsByBand: [
      { label: "Accounting", ids: { fet: "accounting" } },
      { label: "Economics", ids: { fet: "economics" } },
      { label: "Computer Applications Technology", ids: { fet: "cat" } },
      { label: "Information Technology", ids: { fet: "information-technology" } },
      { label: "EMS", ids: { senior: "ems-sp" } },
    ],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help me with EMS", prompt: "Help me with Economic and Management Sciences (EMS) — ask me what topic I'm working on, then explain it.", bands: [S] },
      { label: "Quiz me on business terms", prompt: "Quiz me on important business and economics terms, one at a time, and check my answers.", bands: [S] },
      { label: "Explain an Accounting concept", prompt: "Explain an Accounting concept to me. Ask me which topic, then teach it step by step with an example.", bands: [E] },
      { label: "Help me with Economics", prompt: "Help me with Economics — ask me what I'm stuck on and guide me through it.", bands: [E] },
      { label: "Help with CAT", prompt: "Help me with Computer Applications Technology (CAT) — ask me what topic I'm working on, then explain it.", bands: [E] },
      { label: "Help with IT", prompt: "Help me with Information Technology — ask me what topic I'm working on, then explain it.", bands: [E] },
    ],
  },
  {
    name: "Terra",
    role: "The History & Geography Guide",
    img: "/characters/Terra.webp",
    subjectsByBand: [
      { label: "Geography", ids: { fet: "geography" } },
      { label: "History", ids: { fet: "history" } },
      { label: "Agricultural Sciences", ids: { fet: "agricultural-sciences" } },
      { label: "Social Sciences", ids: { intermediate: "social-sciences", senior: "social-sciences-sp" } },
    ],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help with Social Sciences", prompt: "Help me with Social Sciences — ask me whether it's History or Geography and what topic, then explain it.", bands: [I, S] },
      { label: "Help me with Geography", prompt: "Help me with Geography — ask me what topic I'm working on, then explain it.", bands: [E] },
      { label: "Help me with History", prompt: "Help me with History — ask me what topic I'm working on, then explain it.", bands: [E] },
      { label: "Help with Agricultural Sciences", prompt: "Help me with Agricultural Sciences — ask me what topic I'm working on, then explain it.", bands: [E] },
      { label: "Explain a map skill", prompt: "Explain a Geography map-work skill to me. Ask me which one, then teach it step by step.", bands: [I, S, E] },
      { label: "Quiz me on a History topic", prompt: "Quiz me on a History topic of my choice, one question at a time, and check my answers.", bands: [I, S] },
    ],
  },
  {
    name: "Stella",
    role: "The Life Skills Star",
    img: "/characters/Stella.webp",
    subjectsByBand: [
      { label: "Life Skills", ids: { foundation: "life-skills", intermediate: "life-skills" } },
      { label: "Life Orientation", ids: { senior: "life-orientation-sp", fet: "life-orientation" } },
      { label: "Creative Arts", ids: { senior: "creative-arts-sp" } },
      { label: "Tourism", ids: { fet: "tourism" } },
      { label: "Hospitality Studies", ids: { fet: "hospitality-studies" } },
    ],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help me with Life Skills", prompt: "Help me with Life Skills — ask me what I'm working on and guide me through it.", bands: [F, I] },
      { label: "Teach me about staying healthy", prompt: "Teach me something about keeping my body healthy and safe, then ask me a question about it.", bands: [F, I] },
      { label: "Help with Life Orientation", prompt: "Help me with Life Orientation — ask me what topic I'm working on, then explain it.", bands: [S, E] },
      { label: "Help with Creative Arts", prompt: "Help me with Creative Arts — ask me whether it's Music or Visual Arts and what topic, then explain it.", bands: [S] },
      { label: "Help me with Tourism", prompt: "Help me with Tourism — ask me what topic I'm working on, then explain it.", bands: [E] },
      { label: "Help with Hospitality Studies", prompt: "Help me with Hospitality Studies — ask me what topic I'm working on, then explain it.", bands: [E] },
    ],
  },
  {
    name: "Sol",
    role: "The Science Genius",
    img: "/characters/Sol.webp",
    subjectsByBand: [
      { label: "Natural Sciences and Technology", ids: { intermediate: "nst" } },
      { label: "Natural Sciences", ids: { senior: "natural-sciences-sp" } },
      { label: "Technology", ids: { senior: "technology-sp" } },
      { label: "Physical Sciences", ids: { fet: "physical-sciences" } },
      { label: "Life Sciences", ids: { fet: "life-sciences" } },
    ],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help with Natural Sciences & Technology", prompt: "Help me with Natural Sciences and Technology — ask me what I'm stuck on and guide me through it.", bands: [I] },
      { label: "Help with Natural Sciences", prompt: "Help me with Natural Sciences — ask me what I'm stuck on and guide me through it.", bands: [S] },
      { label: "Help with Technology", prompt: "Help me with Technology — ask me what topic I'm working on, then explain it.", bands: [S] },
      { label: "Help with Physical Sciences", prompt: "Help me with Physical Sciences — ask me what topic I'm working on, then explain it.", bands: [E] },
      { label: "Help with Life Sciences", prompt: "Help me with Life Sciences — ask me what topic I'm working on, then explain it.", bands: [E] },
      { label: "Explain a Science concept", prompt: "Explain a Science concept to me. Ask me which topic, then teach it simply with an example.", bands: [I, S, E] },
      { label: "Quiz me on Science", prompt: "Quiz me on a Science topic of my choice, one question at a time, and check my answers.", bands: [I, S, E] },
    ],
  },
];

export const TUTORS: Tutor[] = TUTOR_INPUTS.map((t) => ({
  ...t,
  subjects: t.subjectsByBand.map((s) => s.label),
}));

/** Resolve a tutor by name. Returns null for the default (Ruby) chat. */
export function getTutor(name?: string | null): Tutor | null {
  if (!name) return null;
  return TUTORS.find((tu) => tu.name === name) ?? null;
}

/** The tutor's subjects taught at this grade. Unknown grade → every subject. */
export function subjectsForGrade(tutor: Tutor, grade: number | null | undefined): TutorSubject[] {
  const band = gradeBand(grade);
  if (!band) return tutor.subjectsByBand;
  return tutor.subjectsByBand.filter((s) => s.ids[band]);
}

/** Quick actions for this grade, at most four. Unknown grade → the first four
    prompts. A tutor with nothing for this grade gets a generic homework prompt. */
export function quickActionsForGrade(tutor: Tutor, grade: number | null | undefined): TutorQuickAction[] {
  const band = gradeBand(grade);
  const actions = band
    ? tutor.quickActions.filter((a) => !a.bands || a.bands.includes(band))
    : tutor.quickActions;
  return (actions.length ? actions : GENERIC_QUICK_ACTIONS).slice(0, 4);
}
