"use client";

import { useMemo } from "react";
import skillTreeData from "@/data/skill-tree.json";
import { StudentProfile, Level } from "@/types/ruby";
import LearningForecastGraph from "@/components/LearningForecastGraph";

interface Props {
  profile: StudentProfile | null;
  dailyActivity?: Record<string, number>;
}

type LevelState = "skipped" | "earned" | "active" | "coming_up";

interface LevelInfo {
  level: Level;
  state: LevelState;
  isPlacementEntry: boolean;
  masteredInLevel: number;
  totalInLevel: number;
}

// Each node cell is 40px wide; connectors between them are 18px wide.
const NODE_W = 40;
const CONN_W = 18;

function NodeCircle({ state, levelId }: { state: LevelState; levelId: number }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0";
  if (state === "skipped")
    return (
      <div className={`${base} bg-green-100 text-green-500 ring-2 ring-green-300`}>✓</div>
    );
  if (state === "earned")
    return <div className={`${base} bg-green-500 text-white shadow-sm`}>✓</div>;
  if (state === "active")
    return (
      <div className={`${base} bg-amber-400 text-white shadow-md ring-4 ring-amber-100`}>▶</div>
    );
  return (
    <div className={`${base} bg-gray-100 text-gray-300 text-xs ring-1 ring-gray-200`}>
      {levelId}
    </div>
  );
}

export default function MathsJourneyRail({ profile, dailyActivity = {} }: Props) {
  const { levelInfos, totalSkills, masteredCount, entryLevel, skippedCount } = useMemo(() => {
    const autoIds = new Set(profile?.placement?.autoCompletedSkillIds ?? []);
    const mastery = profile?.skill_mastery ?? {};
    const currentLevel = profile?.current_level ?? 0;
    const entryLevel = profile?.placement?.entryLevel ?? currentLevel;

    let masteredCount = 0;
    let totalSkills = 0;
    let skippedCount = 0;

    const levelInfos: LevelInfo[] = (skillTreeData.levels as unknown as Level[]).map((level) => {
      const allSkillIds = level.tiers.flatMap((t) => t.atomic_skills.map((s) => s.id));
      totalSkills += allSkillIds.length;

      const autoCount = allSkillIds.filter((id) => autoIds.has(id)).length;
      const earnedCount = allSkillIds.filter(
        (id) =>
          !autoIds.has(id) &&
          (mastery[id]?.status === "mastered" || mastery[id]?.status === "assumed")
      ).length;
      masteredCount += autoCount + earnedCount;

      let state: LevelState;
      if (!profile || currentLevel === 0) {
        state = "coming_up";
      } else if (autoCount > 0 && autoCount === allSkillIds.length) {
        state = "skipped";
        skippedCount++;
      } else if (level.id === currentLevel) {
        state = "active";
      } else if (level.id < currentLevel) {
        state = "earned";
      } else {
        state = "coming_up";
      }

      return {
        level,
        state,
        isPlacementEntry: level.id === entryLevel,
        masteredInLevel: autoCount + earnedCount,
        totalInLevel: allSkillIds.length,
      };
    });

    return { levelInfos, totalSkills, masteredCount, entryLevel, skippedCount };
  }, [profile]);

  if (!profile?.placementCompleted) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center space-y-2">
        <p className="text-4xl">🧭</p>
        <p className="font-semibold text-blue-700 text-base">
          Take the placement test to start your Maths journey
        </p>
        <p className="text-blue-400 text-sm">
          Your personalised skill path will appear here once you&apos;ve been placed
        </p>
      </div>
    );
  }

  const remaining = totalSkills - masteredCount;

  const activeIdx = levelInfos.findIndex((l) => l.state === "active");
  const activeLevel = activeIdx >= 0 ? levelInfos[activeIdx] : null;
  const nextLevel = activeIdx >= 0 ? levelInfos[activeIdx + 1] : null;

  const skippedLabel =
    skippedCount > 1
      ? `Levels 1–${skippedCount}`
      : skippedCount === 1
      ? "Level 1"
      : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      {/* ── Header ── */}
      <div className="mb-1">
        <h3 className="font-semibold text-gray-800 text-base">📐 Your Maths Journey</h3>
        <p className="text-sm text-blue-600 mt-0.5">
          Your test placed you at Level {entryLevel}
          {skippedLabel && <> — you already knew {skippedLabel}!</>}
        </p>
      </div>

      {/* ── Plain-language summary ── */}
      <p className="text-sm text-gray-500 mb-3">
        You&apos;ve mastered{" "}
        <span className="font-semibold text-green-600">
          {masteredCount} skill{masteredCount !== 1 ? "s" : ""}
        </span>
        .{" "}
        <span className="font-semibold text-gray-600">
          {remaining} skill{remaining !== 1 ? "s" : ""}
        </span>{" "}
        still to unlock.
      </p>

      {/* ── Forecast graph ── */}
      {activeLevel && (
        <LearningForecastGraph
          masteredInLevel={activeLevel.masteredInLevel}
          totalInLevel={activeLevel.totalInLevel}
          nextLevelName={nextLevel?.level.title}
          dailyActivity={dailyActivity}
          color="blue"
        />
      )}

      {/* ── Direction labels ── */}
      <div className="flex justify-between text-xs text-gray-300 font-medium mb-2 px-0.5">
        <span>START</span>
        <span>FINISH</span>
      </div>

      {/* ── Rail ── */}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        {/* Row 1: TEST badges – same column widths as rows 2 & 3 */}
        <div className="flex mb-1" style={{ minWidth: "max-content" }}>
          {levelInfos.map((item, i) => {
            const isLast = i === levelInfos.length - 1;
            const colW = isLast ? NODE_W : NODE_W + CONN_W;
            return (
              <div
                key={item.level.id}
                style={{ width: colW, flexShrink: 0 }}
                className="flex justify-center"
              >
                {item.isPlacementEntry && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 leading-tight">
                    TEST
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Row 2: Nodes + connectors (items-center keeps the connector on the node midline) */}
        <div className="flex items-center" style={{ minWidth: "max-content" }}>
          {levelInfos.map((item, i) => {
            const isLast = i === levelInfos.length - 1;
            const connectorGreen =
              item.state === "skipped" || item.state === "earned";
            return (
              <div key={item.level.id} className="flex items-center flex-shrink-0">
                <div style={{ width: NODE_W }} className="flex justify-center">
                  <NodeCircle state={item.state} levelId={item.level.id} />
                </div>
                {!isLast && (
                  <div
                    style={{ width: CONN_W, flexShrink: 0 }}
                    className={`h-0.5 ${connectorGreen ? "bg-green-300" : "bg-gray-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Row 3: Level numbers + status words */}
        <div className="flex mt-1.5" style={{ minWidth: "max-content" }}>
          {levelInfos.map((item, i) => {
            const isLast = i === levelInfos.length - 1;
            const colW = isLast ? NODE_W : NODE_W + CONN_W;
            const { state, level } = item;
            return (
              <div
                key={level.id}
                style={{ width: colW, flexShrink: 0 }}
                className="flex flex-col items-center"
              >
                <span
                  className={`text-xs font-medium ${
                    state === "active"
                      ? "text-amber-500"
                      : state === "coming_up"
                      ? "text-gray-300"
                      : "text-gray-400"
                  }`}
                >
                  L{level.id}
                </span>
                <span
                  className={`text-xs leading-tight ${
                    state === "skipped"
                      ? "text-green-400"
                      : state === "earned"
                      ? "text-green-500"
                      : state === "active"
                      ? "text-amber-400 font-medium"
                      : "text-transparent select-none"
                  }`}
                >
                  {state === "skipped"
                    ? "skipped"
                    : state === "earned"
                    ? "done"
                    : state === "active"
                    ? "here"
                    : "·"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Legend (inline, no header) ── */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-100 ring-1 ring-green-300 inline-block" />
          Skipped by test
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          You earned this
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          Working on now
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-100 ring-1 ring-gray-200 inline-block" />
          Coming up
        </span>
      </div>
    </div>
  );
}
