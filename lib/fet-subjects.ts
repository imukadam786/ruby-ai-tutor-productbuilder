// ─── lib/fet-subjects.ts ─────────────────────────────────────────────────────
// The FET (Grade 10–12) subjects a learner picks during onboarding, plus the
// mapping from those picks to the Subjects-hub cards they unlock.
//
// Grades 1–9 never see the picker — their subjects are compulsory. For Grades
// 10–12 the saved selection (a list of FetSubjectKey values) filters the hub.

export type FetSubjectKey =
  | "english"
  | "mathematics"
  | "maths-literacy"
  | "physical-sciences"
  | "life-sciences"
  | "history"
  | "geography"
  | "business-studies"
  | "accounting"
  | "tourism";

export interface FetSubject {
  key: FetSubjectKey;
  label: string;
  // Locked subjects are always selected and cannot be unticked in the picker.
  locked?: boolean;
}

// Display order: English pinned first (locked-on), then the rest alphabetically
// to match how the hub already orders its cards.
export const FET_SUBJECTS: FetSubject[] = [
  { key: "english", label: "English", locked: true },
  { key: "accounting", label: "Accounting" },
  { key: "business-studies", label: "Business Studies" },
  { key: "geography", label: "Geography" },
  { key: "history", label: "History" },
  { key: "life-sciences", label: "Life Sciences" },
  { key: "maths-literacy", label: "Mathematical Literacy" },
  { key: "mathematics", label: "Mathematics" },
  { key: "physical-sciences", label: "Physical Sciences" },
  { key: "tourism", label: "Tourism" },
];

// Subjects that are always on regardless of what the learner ticks.
export const ALWAYS_ON_FET_KEYS: FetSubjectKey[] = ["english"];

// Maps a Subjects-hub SubjectMeta.id to its picker key. Hub cards with no entry
// here (Discover, Senior/Intermediate-Phase subjects, etc.) are not part of the
// FET picker and are never filtered out by a selection.
export const HUB_ID_TO_FET_KEY: Record<string, FetSubjectKey> = {
  english: "english",
  maths: "mathematics",
  "maths-literacy": "maths-literacy",
  "grade-10-phys-sci": "physical-sciences",
  "grade-11-phys-sci": "physical-sciences",
  "matric-phys-sci": "physical-sciences",
  "life-sciences": "life-sciences",
  history: "history",
  geography: "geography",
  "business-studies": "business-studies",
  accounting: "accounting",
  tourism: "tourism",
};

// The full default selection (everything ticked) — used as the starting state
// for the picker so a learner who taps "Continue" without changing anything
// keeps all their subjects.
export const ALL_FET_KEYS: FetSubjectKey[] = FET_SUBJECTS.map((s) => s.key);

// True when a learner of this grade should see / be filtered by the FET picker.
export function isFetGrade(grade: number | null | undefined): boolean {
  return grade != null && grade >= 10 && grade <= 12;
}

// ── Local cache of the saved selection ──────────────────────────────────────
// Lets the Subjects hub paint the right subset on the first frame of repeat
// visits (mirrors how the grade is cached) and lets the editor update it
// instantly after a save. null = no selection → "show all".
export const SUBJECTS_CACHE_KEY = "ruby_authorised_subjects";

export function readCachedSubjects(): FetSubjectKey[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SUBJECTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? (parsed as FetSubjectKey[]) : null;
  } catch {
    return null;
  }
}

export function writeCachedSubjects(subjects: FetSubjectKey[] | null): void {
  if (typeof window === "undefined") return;
  try {
    if (subjects && subjects.length) window.localStorage.setItem(SUBJECTS_CACHE_KEY, JSON.stringify(subjects));
    else window.localStorage.removeItem(SUBJECTS_CACHE_KEY);
  } catch {
    /* quota / private mode */
  }
}

// Fired (on window) after the learner edits their subjects, so a mounted
// Subjects hub can update without a full reload.
export const SUBJECTS_UPDATED_EVENT = "ruby-subjects-updated";
