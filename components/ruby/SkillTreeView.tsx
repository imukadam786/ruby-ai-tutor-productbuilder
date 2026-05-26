"use client";

import { useMemo } from "react";
import skillTreeData from "@/data/skill-tree.json";
import { StudentProfile } from "@/types/ruby";
import { getSkillStatus, getLevelById, friendlyMathsSkillName } from "@/lib/student-model";
import { getLevelProgress } from "@/lib/mastery-engine";
import EduBackground from "@/components/EduBackground";
import { useT } from "@/lib/i18n";

interface SkillTreeViewProps {
  profile: StudentProfile | null;
  /** When provided, skills the student has already completed/attained become
   *  tappable to replay (extra practice — no progression is changed). */
  onReplaySkill?: (skillId: string) => void;
  /** When provided, shows a "Continue where you left off" button (and makes the
   *  active skill tile tappable) that resumes the current skill's session.
   *  Mirrors the Afrikaans tree so every subject resumes the same way. */
  onContinue?: () => void;
  /** Optional back action — shows a "← Subjects" button when provided. */
  onBack?: () => void;
}

const statusConfig = {
  locked:        { bg: "bg-gray-100",  text: "text-gray-400",   border: "border-gray-200",  icon: "🔒", label: "Locked" },
  available:     { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200", icon: "🚀", label: "Ready" },
  in_progress:   { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200",icon: "⚡",  label: "In Progress" },
  mastered:      { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200", icon: "🏆", label: "Mastered" },
  active:        { bg: "bg-blue-100",  text: "text-blue-800",   border: "border-blue-400",  icon: "▶",  label: "Active" },
  hard_gate:     { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-300", icon: "🔒", label: "Locked" },
  auto_complete: { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200", icon: "✦",  label: "Auto-completed" },
  entry_point:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-300",  icon: "🎯", label: "Entry Point" },
};

export default function SkillTreeView({ profile, onReplaySkill, onContinue, onBack }: SkillTreeViewProps) {
  const { t } = useT();
  const levelProgress = useMemo(() => {
    if (!profile) return {};
    const result: Record<number, number> = {};
    for (const level of skillTreeData.levels) {
      const allSkillIds = level.tiers.flatMap((t) =>
        t.atomic_skills.map((s) => s.id)
      );
      result[level.id] = getLevelProgress(allSkillIds, profile.skill_mastery);
    }
    return result;
  }, [profile]);

  const autoCompletedIds = useMemo(
    () => new Set(profile?.placement?.autoCompletedSkillIds ?? []),
    [profile]
  );
  const entrySkillId = profile?.placement?.entrySkillId ?? null;
  const hardGatePassed = profile?.placement?.hardGatePassed ?? true;
  const currentSkillId = profile?.current_skill_id ?? null;

  function getExtendedStatus(skillId: string) {
    if (!profile) return "locked" as const;
    if (skillId === profile.current_skill_id) return "active" as const;
    if (skillId === entrySkillId && !autoCompletedIds.has(skillId)) return "entry_point" as const;
    if (autoCompletedIds.has(skillId)) return "auto_complete" as const;
    const base = getSkillStatus(skillId, profile);
    // Hard gate: locked skills at Level 5+ when gate has not been cleared
    if (!hardGatePassed && base === "locked") {
      const level = parseInt(skillId.split(".")[0].replace("L", ""));
      if (level >= 5) return "hard_gate" as const;
    }
    return base;
  }

  return (
    <div className="relative isolate flex flex-col h-full bg-gray-50">
      <div className="absolute inset-0 -z-10"><EduBackground /></div>
      <div className="hidden md:block bg-blue-50 border-b border-blue-200 px-6 py-4">
        <h2 className="font-semibold text-blue-700 text-lg">{t("nav.maths_skill_tree")}</h2>
        <p className="text-blue-400 text-sm">17 levels · 51 tiers · 72 atomic skills</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {onBack && (
          <div className="max-w-2xl mx-auto mb-4">
            <button
              onClick={onBack}
              className="text-sm font-semibold text-[#1a2744] hover:text-[#BE1832] flex items-center gap-1"
            >
              ← Subjects
            </button>
          </div>
        )}
        {!profile ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🌳</p>
            <p className="font-medium text-gray-600">Start a diagnostic session to unlock the skill tree</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Continue where you left off — jumps straight back into the
                current skill so the learner never has to hunt for it. Same
                button across Maths, Reading and Afrikaans. */}
            {onContinue && currentSkillId && (
              <button
                onClick={onContinue}
                className="w-full flex items-center gap-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-left hover:shadow-md active:scale-[0.99] transition-all"
              >
                <span className="text-3xl flex-shrink-0" aria-hidden>🚀</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Continue where you left off
                  </span>
                  <span className="block text-base font-bold text-[#1a2744] leading-tight truncate">
                    {friendlyMathsSkillName(currentSkillId)}
                  </span>
                </span>
                <span className="text-emerald-600 text-xl flex-shrink-0" aria-hidden>→</span>
              </button>
            )}

            {/* Placement summary banner */}
            {profile.placementCompleted && profile.placement && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-blue-800 font-semibold text-sm">Placement complete</p>
                  <p className="text-blue-600 text-xs">
                    {autoCompletedIds.size} skill{autoCompletedIds.size !== 1 ? "s" : ""} auto-completed
                    {" · "}Entry: <span className="font-semibold">{friendlyMathsSkillName(entrySkillId)}</span>
                    {!hardGatePassed && <span className="text-amber-600 font-medium"> · 🔒 Hard Gate active</span>}
                  </p>
                </div>
              </div>
            )}

            {skillTreeData.levels.map((level) => {
              const progress = levelProgress[level.id] || 0;
              const isCurrent = level.id === profile.current_level;
              const isHardGateLevel = level.id === 5;
              const showHardGateBarrier = level.id === 5 && !hardGatePassed && profile.placementCompleted;

              return (
                <div key={level.id}>
                  {/* Hard Gate barrier before Level 5 */}
                  {showHardGateBarrier && (
                    <div className="flex items-center gap-3 my-2 px-1">
                      <div className="flex-1 h-px bg-amber-300" />
                      <div className="bg-amber-100 border border-amber-300 rounded-xl px-3 py-1.5 flex items-center gap-2 text-amber-700 text-xs font-semibold">
                        <span>🔒</span>
                        <span>Hard Gate — master multiplication to unlock advanced maths</span>
                      </div>
                      <div className="flex-1 h-px bg-amber-300" />
                    </div>
                  )}
                  <div
                    className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                      isCurrent ? "border-blue-300 shadow-md shadow-blue-500/10" : "border-gray-200"
                    }`}
                  >
                    {/* Hard gate banner inside Level 5 card */}
                    {isHardGateLevel && !hardGatePassed && (
                      <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2">
                        <span className="text-amber-500">🔒</span>
                        <p className="text-amber-700 text-xs font-medium">
                          Hard Gate — multiplication mastery required before advancing
                        </p>
                      </div>
                    )}
                    {isHardGateLevel && hardGatePassed && profile.placementCompleted && (
                      <div className="bg-green-50 border-b border-green-100 px-5 py-2 flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        <p className="text-green-700 text-xs font-medium">Hard Gate passed</p>
                      </div>
                    )}

                    {/* Level header */}
                    <div className={`px-5 py-4 ${isCurrent ? "bg-blue-50" : ""}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`min-w-[2.25rem] h-8 px-1.5 rounded-lg flex items-center justify-center text-sm font-bold ${
                            progress === 100
                              ? "bg-green-500 text-white"
                              : isCurrent
                              ? "bg-blue-500 text-white"
                              : progress > 0
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}>
                            L{level.id}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{level.title}</p>
                            <p className="text-gray-400 text-xs">{level.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${progress === 100 ? "text-green-600" : "text-gray-600"}`}>
                            {progress}%
                          </p>
                          {isCurrent && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress === 100 ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Skills grid (only show for current and nearby levels) */}
                    {(isCurrent || progress > 0) && (
                      <div className="px-5 pb-4">
                        {level.tiers.map((tier) => (
                          <div key={tier.id} className="mt-3">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                              {tier.title}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {tier.atomic_skills.map((skill) => {
                                const extStatus = getExtendedStatus(skill.id);
                                const config = statusConfig[extStatus as keyof typeof statusConfig] ?? statusConfig.locked;
                                const isActive = extStatus === "active";
                                const isHardGateSkill = extStatus === "hard_gate";
                                // Replay is allowed only on skills the student has already
                                // completed/attained (mastered, or auto-completed via placement).
                                const canReplay = !!onReplaySkill && (extStatus === "mastered" || extStatus === "auto_complete");
                                // The active (current) skill resumes the session when tapped,
                                // so the ▶ tile isn't a dead click.
                                const canResume = !!onContinue && isActive;

                                const tileClass = `px-3 py-1.5 rounded-lg border text-xs font-medium text-left ${config.bg} ${config.text} ${config.border} ${
                                  isActive ? "ring-2 ring-blue-500 ring-offset-1 animate-pulse shadow-sm shadow-blue-300" : ""
                                } ${(canReplay || canResume) ? "cursor-pointer hover:ring-2 hover:ring-blue-300 hover:shadow-sm transition-all" : ""}`;
                                const tileInner = (
                                  <>
                                    <span className="mr-1">{config.icon}</span>
                                    {skill.title}
                                    {canReplay && <span className="ml-1 text-blue-400" aria-hidden>🔁</span>}
                                    {isHardGateSkill && (
                                      <span className="block text-amber-600 text-[10px] leading-tight mt-0.5">
                                        Complete this challenge to unlock
                                      </span>
                                    )}
                                  </>
                                );

                                return canReplay ? (
                                  <button
                                    key={skill.id}
                                    type="button"
                                    onClick={() => onReplaySkill!(skill.id)}
                                    className={tileClass}
                                    title={`${skill.title} — ${config.label} · Tap to practise again`}
                                  >
                                    {tileInner}
                                  </button>
                                ) : canResume ? (
                                  <button
                                    key={skill.id}
                                    type="button"
                                    onClick={onContinue}
                                    className={tileClass}
                                    title={`${skill.title} — ${config.label} · Tap to continue`}
                                  >
                                    {tileInner}
                                  </button>
                                ) : (
                                  <div
                                    key={skill.id}
                                    className={tileClass}
                                    title={`${skill.title} — ${config.label}${isActive ? " (current)" : ""}${isHardGateSkill ? " — complete multiplication gate first" : ""}`}
                                  >
                                    {tileInner}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
