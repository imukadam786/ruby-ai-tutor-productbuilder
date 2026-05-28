"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import readingSkillTreeData from "@/data/reading-skill-tree.json";
import { ReadingStudentProfile } from "@/types/reading";
import { getReadingSkillStatus, getReadingLevelProgress } from "@/lib/reading-student-model";
import EduBackground from "@/components/EduBackground";
import { useT } from "@/lib/i18n";

interface ReadingSkillTreeViewProps {
  profile: ReadingStudentProfile | null;
  /** When provided, skills the student has already completed/attained become
   *  tappable to replay (extra practice — no progression is changed). */
  onReplaySkill?: (skillId: string) => void;
  /** When provided, shows a "Continue where you left off" button (and makes the
   *  active skill tile tappable) that resumes the current skill's session.
   *  Mirrors the Afrikaans tree so every subject resumes the same way. */
  onContinue?: () => void;
  /** Optional back action — shows a "← Subjects" button when provided. */
  onBack?: () => void;
  /** When true, renders only the learner's current level by default and
   *  exposes a "View full tree" toggle. */
  compact?: boolean;
}

const statusConfig = {
  locked:        { bg: "bg-gray-100",    text: "text-gray-400",    border: "border-gray-200",    icon: "🔒", label: "Locked" },
  available:     { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",   icon: "🚀", label: "Ready" },
  in_progress:   { bg: "bg-orange-50",   text: "text-orange-700",  border: "border-orange-200",  icon: "⚡", label: "In Progress" },
  mastered:      { bg: "bg-green-50",    text: "text-green-700",   border: "border-green-200",   icon: "🏆", label: "Mastered" },
  auto_complete: { bg: "bg-green-50",    text: "text-green-600",   border: "border-green-200",   icon: "✦",  label: "Auto-completed" },
  entry_point:   { bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-300",    icon: "🎯", label: "Entry Point" },
  active:        { bg: "bg-purple-100",  text: "text-purple-800",  border: "border-purple-400",  icon: "▶",  label: "Active" },
  hard_gate:     { bg: "bg-amber-50",    text: "text-amber-600",   border: "border-amber-300",   icon: "🔒", label: "Locked" },
};

type TreeData = {
  levels: Array<{
    id: number;
    title: string;
    description: string;
    tiers: Array<{
      id: string;
      title: string;
      atomic_skills: Array<{ id: string; title: string }>;
    }>;
  }>;
};

const treeData = readingSkillTreeData as unknown as TreeData;

export default function ReadingSkillTreeView({ profile, onReplaySkill, onContinue, onBack, compact }: ReadingSkillTreeViewProps) {
  const { t } = useT();
  // Per-level expand/collapse. Default: only the learner's current level is
  // expanded — others are collapsed so the page stays scannable.
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(
    () => new Set(profile ? [profile.current_level] : [1]),
  );
  const [showAllLevels, setShowAllLevels] = useState<boolean>(!compact);
  useEffect(() => { setShowAllLevels(!compact); }, [compact]);
  const currentLevelId = profile?.current_level ?? 1;
  const visibleLevels = useMemo(
    () => (showAllLevels ? treeData.levels : treeData.levels.filter((l) => l.id === currentLevelId)),
    [showAllLevels, currentLevelId],
  );
  const toggleLevel = (id: number) =>
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const levelProgress = useMemo(() => {
    if (!profile) return {};
    const result: Record<number, number> = {};
    for (const level of treeData.levels) {
      const allSkillIds = level.tiers.flatMap((t) => t.atomic_skills.map((s) => s.id));
      result[level.id] = getReadingLevelProgress(allSkillIds, profile.skill_mastery);
    }
    return result;
  }, [profile]);

  const { totalLevels, totalTiers, totalSkills, masteredLevels, masteredTiers, masteredSkills } = useMemo(() => {
    let totalTiers = 0, totalSkills = 0, masteredTiers = 0, masteredSkills = 0, masteredLevels = 0;
    const mastery = (profile?.skill_mastery ?? {}) as Record<string, { status?: string }>;
    const isMastered = (id: string) => {
      const s = mastery[id]?.status;
      return s === "mastered" || s === "assumed";
    };
    for (const level of treeData.levels) {
      totalTiers += level.tiers.length;
      let levelSkillCount = 0;
      let levelMasteredCount = 0;
      for (const tier of level.tiers) {
        totalSkills += tier.atomic_skills.length;
        const tierMastered = tier.atomic_skills.filter((s) => isMastered(s.id)).length;
        masteredSkills += tierMastered;
        levelSkillCount += tier.atomic_skills.length;
        levelMasteredCount += tierMastered;
        if (tier.atomic_skills.length > 0 && tierMastered === tier.atomic_skills.length) masteredTiers++;
      }
      if (levelSkillCount > 0 && levelMasteredCount === levelSkillCount) masteredLevels++;
    }
    return {
      totalLevels: treeData.levels.length,
      totalTiers,
      totalSkills,
      masteredLevels,
      masteredTiers,
      masteredSkills,
    };
  }, [profile]);

  const currentLevelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!profile) return;
    const id = window.requestAnimationFrame(() => {
      currentLevelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [profile?.current_level]);

  const autoCompletedIds = useMemo(
    () => new Set(profile?.placement?.autoCompletedSkillIds ?? []),
    [profile]
  );
  const entrySkillId = profile?.placement?.entrySkillId ?? null;
  const hardGatePassed = profile?.placement?.hardGatePassed ?? true;
  const currentSkillId = profile?.current_skill_id ?? null;

  function getExtendedStatus(skillId: string) {
    if (skillId === profile?.current_skill_id) return "active";
    if (skillId === entrySkillId) return "entry_point";
    if (autoCompletedIds.has(skillId)) return "auto_complete";
    const base = getReadingSkillStatus(skillId, profile!);
    // Hard gate: locked skills at Level 2+ appear as hard_gate when the gate is not cleared
    if (!hardGatePassed && base === "locked") {
      const level = parseInt(skillId.split(".")[0].replace("R", ""));
      if (level >= 2) return "hard_gate";
    }
    return base;
  }

  return (
    <div className="relative isolate flex flex-col h-full bg-gray-50">
      <div className="absolute inset-0 -z-10"><EduBackground /></div>
      <div className="hidden md:block bg-purple-50 border-b border-purple-200 px-6 py-4">
        <h2 className="font-semibold text-purple-700 text-lg">{t("nav.reading_skill_tree")}</h2>
        <p className="text-purple-400 text-sm">
          {masteredLevels}/{totalLevels} Levels · {masteredTiers}/{totalTiers} Tiers · {masteredSkills}/{totalSkills} Atomic skills
        </p>
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
            <p className="font-medium text-gray-600">Start an English session to unlock the skill tree</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {visibleLevels.map((level) => {
              const progress = levelProgress[level.id] || 0;
              const isCurrent = level.id === profile.current_level;
              // Hard gate barrier appears before Level 2 when gate is not cleared
              const isHardGateLevel = level.id === 3;
              const showHardGateBarrier = level.id === 2 && !hardGatePassed && profile.placementCompleted;
              const isExpanded = expandedLevels.has(level.id);

              return (
                <div key={level.id} ref={isCurrent ? currentLevelRef : undefined}>
                {/* Hard Gate barrier before Level 2 */}
                {showHardGateBarrier && (
                  <div className="flex items-center gap-3 my-2 px-1">
                    <div className="flex-1 h-px bg-amber-300" />
                    <div className="bg-amber-100 border border-amber-300 rounded-xl px-3 py-1.5 flex items-center gap-2 text-amber-700 text-xs font-semibold">
                      <span>🔒</span>
                      <span>Hard Gate — master encoding skills to unlock advanced phonics</span>
                    </div>
                    <div className="flex-1 h-px bg-amber-300" />
                  </div>
                )}
                <div
                  className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                    isCurrent ? "border-purple-300 shadow-md shadow-purple-500/10" : "border-gray-200"
                  }`}
                >
                  {/* Hard gate banner for Level 3 */}
                  {isHardGateLevel && !hardGatePassed && (
                    <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2">
                      <span className="text-amber-500">🔒</span>
                      <p className="text-amber-700 text-xs font-medium">
                        Hard Gate — encoding mastery required before advancing
                      </p>
                    </div>
                  )}
                  {isHardGateLevel && hardGatePassed && profile.placementCompleted && (
                    <div className="bg-green-50 border-b border-green-100 px-5 py-2 flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      <p className="text-green-700 text-xs font-medium">Hard Gate passed</p>
                    </div>
                  )}

                  {/* Level header — click to expand/collapse */}
                  <button
                    type="button"
                    onClick={() => toggleLevel(level.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`reading-level-body-${level.id}`}
                    className={`w-full text-left px-5 py-4 ${isCurrent ? "bg-purple-50" : ""} hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`min-w-[2.25rem] h-8 px-1.5 rounded-lg flex items-center justify-center text-sm font-bold ${
                          progress === 100
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-purple-500 text-white"
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
                      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                        <div className="text-right">
                          <p className={`text-sm font-bold ${progress === 100 ? "text-green-600" : "text-gray-600"}`}>
                            {progress}%
                          </p>
                          {isCurrent && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <svg
                          aria-hidden
                          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-purple-500"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>

                  {/* Skills grid — collapsed by default; user expands per level. */}
                  {isExpanded && (
                    <div id={`reading-level-body-${level.id}`} className="px-5 pb-4">
                      {level.tiers.map((tier) => (
                        <div key={tier.id} className="mt-3">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                            {tier.title}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tier.atomic_skills.map((skill) => {
                              const extStatus = getExtendedStatus(skill.id);
                              const config = statusConfig[extStatus as keyof typeof statusConfig] ?? statusConfig.locked;
                              const isAutoComplete = autoCompletedIds.has(skill.id);
                              const isEntry = skill.id === entrySkillId;
                              const isActive = extStatus === "active";
                              const isHardGate = extStatus === "hard_gate";
                              // Replay is allowed only on skills the student has already
                              // completed/attained (mastered, or auto-completed via placement).
                              const canReplay = !!onReplaySkill && (extStatus === "mastered" || extStatus === "auto_complete");
                              // The active (current) skill resumes the session when tapped,
                              // so the ▶ tile isn't a dead click.
                              const canResume = !!onContinue && isActive;

                              const tileClass = `px-3 py-1.5 rounded-lg border text-xs font-medium text-left ${config.bg} ${config.text} ${config.border} ${
                                isActive ? "ring-2 ring-purple-500 ring-offset-1 animate-pulse shadow-sm shadow-purple-300" : ""
                              } ${isEntry ? "ring-2 ring-blue-400 ring-offset-1" : ""} ${
                                (canReplay || canResume) ? "cursor-pointer hover:ring-2 hover:ring-purple-300 hover:shadow-sm transition-all" : ""
                              }`;
                              const tileInner = (
                                <>
                                  <span className="mr-1">{config.icon}</span>
                                  {skill.title}
                                  {canReplay && <span className="ml-1 text-purple-400" aria-hidden>🔁</span>}
                                  {isAutoComplete && (
                                    <span className="ml-1.5 text-green-500 text-xs" title="Auto-completed via placement">✦</span>
                                  )}
                                  {isEntry && (
                                    <span className="ml-1.5 text-blue-500 text-xs" title="Placement entry point">★</span>
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
                                  title={`${skill.title} — ${config.label}${isActive ? " (current)" : ""}${isHardGate ? " — unlock encoding gate first" : ""}`}
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
        )}
      </div>
    </div>
  );
}
