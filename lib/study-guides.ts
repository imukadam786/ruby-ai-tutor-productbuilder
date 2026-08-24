// Maps a matric study-guide id (as used by the rubyaitutor.com cart) to the
// Supabase `study-guides` bucket filename(s) behind it. Subjects with more
// than one exam paper list every paper here — buyers receive one download
// link per paper, not one link per subject.

const SUPABASE_STUDY_GUIDES_BASE =
  "https://kmgnizvqkqkiulzgvkcb.supabase.co/storage/v1/object/public/study-guides";

export const STUDY_GUIDE_FILES: Record<string, string[]> = {
  accounting: [
    "accounting-p1-nov-2026-studyguide_compressed.pdf",
    "accounting-p2-nov-2026-studyguide_compressed.pdf",
  ],
  afrikaans: [
    "afrikaans-fal-p1-nov-2026-studyguide_compressed.pdf",
    "afrikaans-fal-p2-nov-2026-studyguide_compressed.pdf",
    "afrikaans-fal-p3-nov-2026-studyguide_compressed.pdf",
  ],
  businessstudies: [
    "business-studies-p1-nov-2026-studyguide_compressed.pdf",
    "BusinessStudies_Paper2_StudyGuide_Nov2026_compressed.pdf",
  ],
  cat: ["cat-p2-nov-2026-studyguide_compressed.pdf"],
  consumerstudies: ["consumer-studies-p1-nov-2026-studyguide_compressed.pdf"],
  economics: [
    "eco-p1-nov-2026-study-guide_compressed.pdf",
    "eco-p2-nov-2026-study-guide_compressed.pdf",
  ],
  english: [
    "English_HL_Paper1_Study_Guide_compressed.pdf",
    "english-hl-p2-nov-2026-studyguide_compressed.pdf",
    "english-hl-p3-nov-2026-studyguide_compressed.pdf",
  ],
  geo: [
    "geo-p1-nov-2026-study-guide_compressed.pdf",
    "geo-p2-nov-2026-study-guide.pdf",
  ],
  history: [
    "his-p1-nov-2026-study-guide_compressed.pdf",
    "his-p2-nov-2026-study-guide_compressed.pdf",
  ],
  hospitality: ["hospitality-p1-nov-2026-studyguide_compressed.pdf"],
  lifesci: [
    "life_sci_P1_study_guide_nov_2026_compressed.pdf",
    "life_sci_P2_study_guide_nov_2026_compressed.pdf",
  ],
  mathslit: [
    "math-lit-p1-nov-2026-study-guide_compressed.pdf",
    "mathslit-p2-nov-2026-studyguide_compressed.pdf",
  ],
  math: [
    "maths-p1-nov-2026-study-guide_compressed.pdf",
    "math_P2_study_guide_nov_2026 (1)_compressed.pdf",
  ],
  science: [
    "phy-sci-p1-nov-2026-study-guide_compressed.pdf",
    "physical-sciences-p2-nov-2026-studyguide_compressed.pdf",
  ],
  tourism: ["tourism-p1-nov-2026-studyguide_compressed.pdf"],
};

export const STUDY_GUIDE_NAMES: Record<string, string> = {
  accounting: "Accounting",
  afrikaans: "Afrikaans FAL",
  businessstudies: "Business Studies",
  cat: "Computer Applications Technology",
  consumerstudies: "Consumer Studies",
  economics: "Economics",
  english: "English Home Language",
  geo: "Geography",
  history: "History",
  hospitality: "Hospitality Studies",
  lifesci: "Life Sciences",
  mathslit: "Mathematical Literacy",
  math: "Mathematics",
  science: "Physical Sciences",
  tourism: "Tourism",
};

export const VALID_STUDY_GUIDE_IDS = Object.keys(STUDY_GUIDE_FILES);

export type StudyGuideDownload = { paper: number; url: string };

/** One entry per exam paper, in paper order — e.g. Mathematics returns Paper 1 and Paper 2. */
export function getStudyGuideDownloads(guideId: string): StudyGuideDownload[] {
  const files = STUDY_GUIDE_FILES[guideId] ?? [];
  return files.map((filename, i) => ({
    paper: i + 1,
    url: `${SUPABASE_STUDY_GUIDES_BASE}/${encodeURIComponent(filename)}`,
  }));
}
