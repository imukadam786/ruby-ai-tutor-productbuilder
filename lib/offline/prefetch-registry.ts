// Maps a subject id (as used in SubjectsHub's card list) to the dynamic-import
// thunks for that subject's heavy chunks. Each subject is code-split, so its
// question TEXT and tree structure live inside these chunks — calling the thunk
// makes the browser fetch the chunk, which the service worker then caches
// (see the static-assets rule in next.config.js). That is what lets a downloaded
// subject's practice work with no connection.
//
// Keep this in step with the dynamic imports in app/page.tsx. A subject missing
// here simply isn't pre-warmed (it still works online, and falls back to lazy
// loading) — so partial coverage is safe, not broken.

type ImportThunk = () => Promise<unknown>;

export const PREFETCH_REGISTRY: Record<string, ImportThunk[]> = {
  maths: [
    () => import("@/components/ruby/SkillTreeView"),
    () => import("@/components/ruby/DiagnosticSession"),
  ],
  english: [
    () => import("@/components/reading/ReadingSkillTreeView"),
    () => import("@/components/reading/ReadingSession"),
  ],
  "life-skills": [
    () => import("@/components/life-skills/LifeSkillsSkillTreeView"),
    () => import("@/components/life-skills/LifeSkillsSession"),
  ],
  afrikaans: [
    () => import("@/components/afrikaans/AfrikaansSkillTreeView"),
    () => import("@/components/afrikaans/AfrikaansSession"),
  ],
  "social-sciences": [
    () => import("@/components/social-sciences/SocialSciencesSkillTreeView"),
    () => import("@/components/social-sciences/SocialSciencesSession"),
  ],
  nst: [
    () => import("@/components/nst/NstSkillTreeView"),
    () => import("@/components/nst/NstSession"),
  ],
  // matric / grade-10 / grade-11 phys-sci all render through the same chunk.
  "matric-phys-sci": [
    () => import("@/components/matric-phys-sci/MatricPhysSciSkillTreeView"),
    () => import("@/components/matric-phys-sci/MatricPhysSciSession"),
  ],
  "grade-10-phys-sci": [
    () => import("@/components/matric-phys-sci/MatricPhysSciSkillTreeView"),
    () => import("@/components/matric-phys-sci/MatricPhysSciSession"),
  ],
  "grade-11-phys-sci": [
    () => import("@/components/matric-phys-sci/MatricPhysSciSkillTreeView"),
    () => import("@/components/matric-phys-sci/MatricPhysSciSession"),
  ],
  "maths-literacy": [
    () => import("@/components/maths-literacy/MathsLiteracySkillTreeView"),
    () => import("@/components/maths-literacy/MathsLiteracyEngine"),
  ],
  "life-sciences": [
    () => import("@/components/life-sciences/LifeSciencesSkillTreeView"),
    () => import("@/components/life-sciences/LifeSciencesSession"),
  ],
  history: [
    () => import("@/components/history/HistorySkillTreeView"),
    () => import("@/components/history/HistorySession"),
  ],
  accounting: [
    () => import("@/components/accounting/AccountingSkillTreeView"),
    () => import("@/components/accounting/AccountingSession"),
  ],
  economics: [
    () => import("@/components/economics/EconomicsSkillTreeView"),
    () => import("@/components/economics/EconomicsSession"),
  ],
  "business-studies": [
    () => import("@/components/business-studies/BusinessStudiesSkillTreeView"),
    () => import("@/components/business-studies/BusinessStudiesSession"),
  ],
  tourism: [
    () => import("@/components/tourism/TourismSkillTreeView"),
    () => import("@/components/tourism/TourismSession"),
  ],
  geography: [
    () => import("@/components/geography/GeographySkillTreeView"),
    () => import("@/components/geography/GeographySession"),
  ],
  "natural-sciences-sp": [
    () => import("@/components/natural-sciences-sp/NaturalSciencesSpSkillTreeView"),
    () => import("@/components/natural-sciences-sp/NaturalSciencesSpSession"),
  ],
  "social-sciences-sp": [
    () => import("@/components/social-sciences-sp/SocialSciencesSpSkillTreeView"),
    () => import("@/components/social-sciences-sp/SocialSciencesSpSession"),
  ],
  "ems-sp": [
    () => import("@/components/ems-sp/EmsSpSkillTreeView"),
    () => import("@/components/ems-sp/EmsSpSession"),
  ],
  "technology-sp": [
    () => import("@/components/technology-sp/TechnologySpSkillTreeView"),
    () => import("@/components/technology-sp/TechnologySpSession"),
  ],
  "life-orientation-sp": [
    () => import("@/components/life-orientation-sp/LifeOrientationSpSkillTreeView"),
    () => import("@/components/life-orientation-sp/LifeOrientationSpSession"),
  ],
  "creative-arts-sp": [
    () => import("@/components/creative-arts-sp/CreativeArtsSpSkillTreeView"),
    () => import("@/components/creative-arts-sp/CreativeArtsSpSession"),
  ],
};

// Subjects whose PRACTICE actually works offline — i.e. their next-question
// loader falls back to on-device selection (piece 5, Tier 1). Only these get the
// "Available offline" badge, so we never promise offline on a subject whose
// questions still need the server. Maths, English/Reading, Maths Literacy and
// Physical Sciences are deliberately excluded until their offline paths land.
export const OFFLINE_CAPABLE_SUBJECTS = new Set<string>([
  "history",
  "economics",
  "geography",
  "life-sciences",
  "life-skills",
  "afrikaans",
  "business-studies",
  "accounting",
  "tourism",
  "social-sciences",
  "nst",
  "natural-sciences-sp",
  "social-sciences-sp",
  "ems-sp",
  "technology-sp",
  "life-orientation-sp",
  "creative-arts-sp",
]);

/** True when a subject's practice runs fully offline (and so may be downloaded). */
export function isOfflineEligible(id: string): boolean {
  return OFFLINE_CAPABLE_SUBJECTS.has(id);
}
