"use client";

import { useEffect, useState } from "react";
import treeData from "@/data/matric-physical-sciences-skill-tree.json";
import EduBackground from "@/components/EduBackground";
import { getMatricPhysSciMasteryMap } from "@/lib/matric-phys-sci-student-model";
import type {
  MatricPhysSciLevel,
  MatricPhysSciSkillTree,
} from "@/types/matric-phys-sci";

const tree = treeData as unknown as MatricPhysSciSkillTree;

interface Props {
  onPickSkill: (skillId: string) => void;
  masteryStatus?: Record<string, "mastered" | "in_progress" | "available">;
  onBack?: () => void;
}

function groupLevelsByPaper(levels: MatricPhysSciLevel[]): {
  p1: MatricPhysSciLevel[];
  p2: MatricPhysSciLevel[];
} {
  return {
    p1: levels.filter((l) => l.paper === "P1"),
    p2: levels.filter((l) => l.paper === "P2"),
  };
}

export default function MatricPhysSciSkillTreeView({
  onPickSkill,
  masteryStatus,
  onBack,
}: Props) {
  // Mastery may be passed in by the parent session; otherwise read it from local profile.
  const [localMastery, setLocalMastery] = useState<Record<string, "mastered" | "in_progress" | "available">>({});
  useEffect(() => {
    if (!masteryStatus) setLocalMastery(getMatricPhysSciMasteryMap());
  }, [masteryStatus]);
  const mastery = masteryStatus ?? localMastery;

  const { p1, p2 } = groupLevelsByPaper(tree.levels);

  function renderLevel(level: MatricPhysSciLevel) {
    const skills = level.tiers.flatMap((t) => t.atomic_skills);
    return (
      <section key={level.id} className="mb-6">
        <div className="flex items-baseline gap-2 mb-3 px-1">
          <span className="text-xs font-bold text-gray-400">L{level.id}</span>
          <h3 className="text-base sm:text-lg font-bold text-[#1a2744]">{level.title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skills.map((skill) => {
            const status = mastery[skill.id] ?? "available";
            const ringClass =
              status === "mastered"
                ? "ring-2 ring-green-400 bg-green-50"
                : status === "in_progress"
                ? "ring-2 ring-amber-400 bg-amber-50"
                : "bg-white";
            return (
              <button
                key={skill.id}
                onClick={() => onPickSkill(skill.id)}
                className={`${ringClass} rounded-2xl shadow-sm hover:shadow-md transition-all p-4 text-left border border-gray-100 active:scale-[0.98]`}
                aria-label={skill.title}
              >
                <div className="text-[11px] font-semibold text-gray-400 mb-1">{skill.id}</div>
                <div className="text-sm sm:text-base font-bold text-[#1a2744] leading-snug mb-1">
                  {skill.title}
                </div>
                {status === "mastered" && (
                  <div className="text-xs font-semibold text-green-700">Mastered</div>
                )}
                {status === "in_progress" && (
                  <div className="text-xs font-semibold text-amber-700">In progress</div>
                )}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-5 pb-12 w-full">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 text-sm font-semibold text-[#1a2744] hover:text-[#BE1832] flex items-center gap-1"
            >
              ← Subjects
            </button>
          )}

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2744]">
              Matric Physical Sciences
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Grade 12 NSC · pick a skill to practise. Each skill has around 20 questions, including
              past-paper lifts and freshly authored items.
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#BE1832] mb-3">Paper 1 · Physics</h2>
            {p1.map(renderLevel)}
          </div>

          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#BE1832] mb-3">Paper 2 · Chemistry</h2>
            {p2.map(renderLevel)}
          </div>
        </div>
      </div>
    </div>
  );
}
