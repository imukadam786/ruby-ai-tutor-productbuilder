// ─── Gem colour tokens ───────────────────────────────────────────────────────
// Single source of truth for the Concept C gem palette. Each subject's gem takes
// its own colour, mirroring the app's existing per-subject accents (the
// SkillTreeShell accent keys). Two tiers are reserved and never used for a
// single subject: ruby-red for the brand, gold for a rare gem. Grey is a rough
// (unlearned) stone.
//
// Sciences (the "rose" accent) are intentionally mapped to coral, NOT red, so
// ruby-red always reads as the Ruby brand and never as one subject.

export type GemColor =
  | "blue" | "purple" | "rose" | "teal" | "emerald" | "amber" | "indigo"
  | "sky" | "cyan" | "violet" | "orange" | "lime" | "pink" | "slate";

/** Accent key → gem hex. Reuses the app's existing per-subject accents. */
export const GEM_HEX: Record<GemColor, string> = {
  blue:    "#3B82F6",
  purple:  "#A855F7",
  rose:    "#FF6F61", // coral — the sciences; deliberately OFF brand-red
  teal:    "#0D9488",
  emerald: "#10B981",
  amber:   "#D97706",
  indigo:  "#4F46E5",
  sky:     "#0EA5E9",
  cyan:    "#06B6D4",
  violet:  "#8B5CF6",
  orange:  "#F97316",
  lime:    "#84CC16",
  pink:    "#EC4899",
  slate:   "#64748B",
};

/** Reserved tiers — never a single subject's colour. */
export const RUBY = "#E11D48";      // brand: streak, "you are here", the app
export const GEM_GOLD = "#FFB323";  // rare — finishing a whole topic
export const GEM_ROUGH = "#D8C7D0"; // rough stone — not learned yet

export type GemState = "rough" | "cutting" | "polished" | "rare" | "locked";

/** The four answer-option colours — a fixed set, the same on every question so
 *  it becomes familiar. Each carries a darker "lip" for the chunky offset
 *  shadow. Colour never implies correctness: right/wrong is only shown on submit
 *  (a tick + a "gem cut" pop, or a dim), and every option also has a letter and
 *  its text, so a colour-blind learner never relies on hue alone. */
export const ANSWER_COLORS = [
  { key: "A", bg: "#FF5D73", lip: "#D83C53" }, // coral
  { key: "B", bg: "#FFB323", lip: "#D68E10" }, // amber
  { key: "C", bg: "#12C99B", lip: "#0E9E78" }, // teal
  { key: "D", bg: "#2EA6FF", lip: "#1F7FD0" }, // sky
] as const;

export type AnswerColor = (typeof ANSWER_COLORS)[number];
