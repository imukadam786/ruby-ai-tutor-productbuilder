// ─── lib/tutors.ts ──────────────────────────────────────────────────────────
// Single source of truth for the six tutor characters: the artwork shown on the
// Home screen, the subjects each one covers, and the personalised quick-action
// prompts shown above the chat textbox when a student opens that tutor's chat.
//
// The AI engine itself is unchanged per tutor (still Ruby) — opening a tutor's
// chat only personalises the header label, the avatar, and these quick actions.

export interface TutorQuickAction {
  label: string;
  prompt: string;
}

export interface Tutor {
  name: string;
  /** Short personality tagline shown alongside the name, e.g. "The Language Expert". */
  role: string;
  img: string;
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

export const TUTORS: Tutor[] = [
  {
    name: "Lex",
    role: "The Language Expert",
    img: "/characters/Lex.webp",
    subjects: ["English", "Afrikaans", "Languages"],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help with English homework", prompt: "Help me with my English homework." },
      { label: "Teach me 10 English words", prompt: "Teach me 10 new English words I should know, with simple definitions and example sentences." },
      { label: "Help me with Afrikaans", prompt: "Help me with Afrikaans — ask me what I'm working on, then explain it and check my understanding." },
      { label: "Improve my writing", prompt: "Help me improve my writing. Ask me for a piece of writing, then give me feedback step by step." },
    ],
  },
  {
    name: "Nova",
    role: "The Maths Whiz",
    img: "/characters/Nova.webp",
    subjects: ["Maths", "Maths Literacy"],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help with Maths homework", prompt: "Help me with my Maths homework." },
      { label: "Help me solve for x", prompt: "Help me solve for x. I'll share the equation in my next message — please walk me through it step by step." },
      { label: "Explain a Maths concept", prompt: "Explain a Maths concept to me. Ask me which topic I'm working on, then teach it simply with an example." },
      { label: "Help with Maths Literacy", prompt: "Help me with Maths Literacy — ask me what I'm working on and guide me through it." },
    ],
  },
  {
    name: "Luna",
    role: "The Business Brain",
    img: "/characters/Luna.webp",
    subjects: ["Business Studies", "Accounting", "Economics"],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help with Business Studies", prompt: "Help me with Business Studies — ask me what topic I'm working on, then explain it." },
      { label: "Explain an Accounting concept", prompt: "Explain an Accounting concept to me. Ask me which topic, then teach it step by step with an example." },
      { label: "Help me with Economics", prompt: "Help me with Economics — ask me what I'm stuck on and guide me through it." },
      { label: "Quiz me on business terms", prompt: "Quiz me on important business and economics terms, one at a time, and check my answers." },
    ],
  },
  {
    name: "Terra",
    role: "The History & Geography Guide",
    img: "/characters/Terra.webp",
    subjects: ["Geography", "History"],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help me with Geography", prompt: "Help me with Geography — ask me what topic I'm working on, then explain it." },
      { label: "Help me with History", prompt: "Help me with History — ask me what topic I'm working on, then explain it." },
      { label: "Explain a map skill", prompt: "Explain a Geography map-work skill to me. Ask me which one, then teach it step by step." },
      { label: "Quiz me on a History topic", prompt: "Quiz me on a History topic of my choice, one question at a time, and check my answers." },
    ],
  },
  {
    name: "Stella",
    role: "The Life Skills Star",
    img: "/characters/Stella.webp",
    subjects: ["Tourism", "Life Skills", "Social Studies", "NST"],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help me with Tourism", prompt: "Help me with Tourism — ask me what topic I'm working on, then explain it." },
      { label: "Help me with Life Skills", prompt: "Help me with Life Skills — ask me what I'm working on and guide me through it." },
      { label: "Help with Social Studies", prompt: "Help me with Social Studies — ask me what topic I'm working on, then explain it." },
      { label: "Explain an NST topic", prompt: "Explain a Natural Sciences & Technology topic to me. Ask me which one, then teach it step by step." },
    ],
  },
  {
    name: "Sol",
    role: "The Science Genius",
    img: "/characters/Sol.webp",
    subjects: ["Natural Science", "Physical Sciences"],
    capabilities: SHARED_CAPABILITIES,
    quickActions: [
      { label: "Help with Physical Sciences", prompt: "Help me with Physical Sciences — ask me what topic I'm working on, then explain it." },
      { label: "Explain a Science concept", prompt: "Explain a Science concept to me. Ask me which topic, then teach it simply with an example." },
      { label: "Help with Natural Science", prompt: "Help me with Natural Science — ask me what I'm stuck on and guide me through it." },
      { label: "Quiz me on Science", prompt: "Quiz me on a Science topic of my choice, one question at a time, and check my answers." },
    ],
  },
];

/** Resolve a tutor by name. Returns null for the default (Ruby) chat. */
export function getTutor(name?: string | null): Tutor | null {
  if (!name) return null;
  return TUTORS.find((tu) => tu.name === name) ?? null;
}
