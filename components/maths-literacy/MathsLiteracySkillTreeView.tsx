"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMathsLiteracyLevels,
  getMathsLiteracyProfile,
  getMathsLiteracySkillStatus,
  type MathsLiteracySkillStatus,
} from "@/lib/maths-literacy-student-model";
import type { MathsLiteracyStudentProfile } from "@/types/maths-literacy";

interface Props {
  profile?: MathsLiteracyStudentProfile | null;
  onReplaySkill?: (skillId: string) => void;
  onContinue?: () => void;
  onBack?: () => void;
  /** When true, only the level containing the current skill renders by
   *  default. A toggle reveals the full tree. */
  compact?: boolean;
}

const STATUS_STYLE: Record<
  MathsLiteracySkillStatus,
  { dot: string; label: string; badge: string }
> = {
  locked:      { dot: "bg-gray-300",   label: "Locked",       badge: "bg-gray-100 text-gray-500" },
  available:   { dot: "bg-blue-500",   label: "Available",    badge: "bg-blue-50 text-blue-700" },
  in_progress: { dot: "bg-amber-500",  label: "In progress",  badge: "bg-amber-50 text-amber-700" },
  mastered:    { dot: "bg-green-500",  label: "Mastered",     badge: "bg-green-50 text-green-700" },
};

export default function MathsLiteracySkillTreeView({
  profile: profileProp,
  onReplaySkill,
  onContinue,
  onBack,
  compact,
}: Props) {
  const allLevels = useMemo(() => getMathsLiteracyLevels(), []);
  const [showAllLevels, setShowAllLevels] = useState<boolean>(!compact);
  useEffect(() => { setShowAllLevels(!compact); }, [compact]);
  const currentLevelId = useMemo(() => {
    const current = profileProp?.current_skill_id ?? "L1.T1.A1";
    const m = current.match(/^L(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }, [profileProp?.current_skill_id]);
  const levels = useMemo(
    () => (showAllLevels ? allLevels : allLevels.filter((l) => l.id === currentLevelId)),
    [allLevels, showAllLevels, currentLevelId],
  );
  const [loadedProfile, setLoadedProfile] = useState<MathsLiteracyStudentProfile | null>(
    profileProp ?? null
  );
  useEffect(() => {
    if (profileProp === undefined) setLoadedProfile(getMathsLiteracyProfile());
    else setLoadedProfile(profileProp);
  }, [profileProp]);
  const profile = loadedProfile;
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() => {
    // Default: expand the level containing the current skill, else level 1.
    const current = profileProp?.current_skill_id ?? "L1.T1.A1";
    const m = current.match(/^L(\d+)/);
    const lvl = m ? parseInt(m[1], 10) : 1;
    return { [lvl]: true };
  });

  const toggleLevel = (id: number) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const counts = useMemo(() => {
    let mastered = 0;
    let total = 0;
    for (const lvl of levels) {
      for (const tier of lvl.tiers) {
        for (const skill of tier.atomic_skills) {
          total += 1;
          if (profile?.skill_mastery[skill.id]?.status === "mastered") mastered += 1;
        }
      }
    }
    return { mastered, total };
  }, [levels, profile]);

  return (
    <div className={`bg-white ${compact ? "" : "flex flex-col h-full"}`}>
      <header className="border-b border-gray-200 px-4 py-3 flex items-center gap-3 bg-white">
        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900"
            aria-label="Back"
          >
            ← Back
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900">Maths Literacy skill tree</div>
          <div className="text-xs text-gray-500">
            {counts.mastered} of {counts.total} skills mastered
          </div>
        </div>
        {onContinue && (
          <button
            onClick={onContinue}
            className="px-3 py-1.5 rounded-lg bg-[#BE1832] hover:bg-[#a01528] text-white text-xs font-semibold"
          >
            Continue →
          </button>
        )}
      </header>

      <div className={compact ? "" : "flex-1 overflow-y-auto"}>
        <div className="max-w-3xl mx-auto p-4 space-y-3">
          {levels.map((level) => {
            const isOpen = !!expanded[level.id];
            const tiersCount = level.tiers.length;
            const skillsCount = level.tiers.reduce((n, t) => n + t.atomic_skills.length, 0);
            return (
              <section
                key={level.id}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white"
              >
                <button
                  onClick={() => toggleLevel(level.id)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Level {level.id}</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {level.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-gray-500">
                      {tiersCount} tier{tiersCount === 1 ? "" : "s"} · {skillsCount} skill{skillsCount === 1 ? "" : "s"}
                    </span>
                    <span className="text-gray-400 text-sm">{isOpen ? "▾" : "▸"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    {level.tiers.map((tier) => (
                      <div key={tier.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                        <div className="text-xs font-semibold text-gray-600 mb-2">
                          {tier.id} · {tier.title}
                        </div>
                        <ul className="space-y-1">
                          {tier.atomic_skills.map((skill) => {
                            const status = getMathsLiteracySkillStatus(skill.id, profile);
                            const style = STATUS_STYLE[status];
                            const mastery = profile?.skill_mastery[skill.id];
                            const clickable = status !== "locked" && !!onReplaySkill;
                            return (
                              <li key={skill.id}>
                                <button
                                  disabled={!clickable}
                                  onClick={() => clickable && onReplaySkill?.(skill.id)}
                                  className={`w-full text-left rounded-lg px-3 py-2 flex items-center gap-3 transition-colors ${
                                    clickable ? "hover:bg-gray-50" : "opacity-60 cursor-default"
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm text-gray-900 truncate">
                                      {skill.title}
                                    </span>
                                    <span className="block text-[11px] text-gray-500 truncate">
                                      {skill.id}
                                    </span>
                                  </span>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>
                                    {status === "in_progress" && mastery
                                      ? `${mastery.correct_count}/${skill.mastery_criteria.correct_required}`
                                      : style.label}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {compact && (
            <button
              type="button"
              onClick={() => setShowAllLevels((v) => !v)}
              className="w-full text-sm font-semibold text-[#1a2744] hover:text-[#BE1832] py-2"
            >
              {showAllLevels ? "Show only current level ▲" : "View full tree ▼"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
