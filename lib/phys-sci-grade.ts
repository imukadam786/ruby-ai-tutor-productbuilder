// ─── Physical Sciences grade registry ────────────────────────────────────────
//
// Physical Sciences is authored per grade (10, 11, 12). Grade 12 keeps its
// original "matric" data files, storage key and subject string so existing
// learner progress is preserved unchanged. Grades 10 and 11 use their own
// tap-native banks and trees. All three share the bespoke MatricPhysSci
// components, selector, student-model and API routes, which take an optional
// `grade` parameter that defaults to 12 (the original behaviour).

import g10tree from "@/data/grade-10-physical-sciences-skill-tree.json";
import g10bank from "@/data/grade-10-physical-sciences-question-bank.json";
import g11tree from "@/data/grade-11-physical-sciences-skill-tree.json";
import g11bank from "@/data/grade-11-physical-sciences-question-bank.json";
import g12tree from "@/data/matric-physical-sciences-skill-tree.json";
import g12bank from "@/data/matric-physical-sciences-question-bank.json";
import type { MatricPhysSciBank, MatricPhysSciSkillTree } from "@/types/matric-phys-sci";
import type { Subject } from "@/lib/analytics";

export type PhysSciGrade = 10 | 11 | 12;

export interface PhysSciGradeConfig {
  grade: PhysSciGrade;
  tree: MatricPhysSciSkillTree;
  bank: MatricPhysSciBank;
  /** localStorage key for the per-grade learner profile. */
  storageKey: string;
  /** `student_profiles` / `student_reports` subject string. */
  subject: Subject;
  /** Title shown above the skill tree. */
  treeTitle: string;
}

export const PHYS_SCI_GRADE_CONFIG: Record<PhysSciGrade, PhysSciGradeConfig> = {
  10: {
    grade: 10,
    tree: g10tree as unknown as MatricPhysSciSkillTree,
    bank: g10bank as unknown as MatricPhysSciBank,
    storageKey: "grade-10-phys-sci-profile-v1",
    subject: "grade-10-physical-sciences",
    treeTitle: "Grade 10 Physical Sciences Skill Tree",
  },
  11: {
    grade: 11,
    tree: g11tree as unknown as MatricPhysSciSkillTree,
    bank: g11bank as unknown as MatricPhysSciBank,
    storageKey: "grade-11-phys-sci-profile-v1",
    subject: "grade-11-physical-sciences",
    treeTitle: "Grade 11 Physical Sciences Skill Tree",
  },
  12: {
    grade: 12,
    tree: g12tree as unknown as MatricPhysSciSkillTree,
    bank: g12bank as unknown as MatricPhysSciBank,
    // Preserved from the original matric implementation — do not change.
    storageKey: "matric-phys-sci-profile-v1",
    subject: "matric-physical-sciences",
    treeTitle: "Physical Sciences Skill Tree",
  },
};

export function physSciConfig(grade: PhysSciGrade = 12): PhysSciGradeConfig {
  return PHYS_SCI_GRADE_CONFIG[grade] ?? PHYS_SCI_GRADE_CONFIG[12];
}

/** Narrows an arbitrary number to a valid PhysSciGrade, defaulting to 12. */
export function asPhysSciGrade(value: unknown): PhysSciGrade {
  return value === 10 || value === 11 || value === 12 ? value : 12;
}
