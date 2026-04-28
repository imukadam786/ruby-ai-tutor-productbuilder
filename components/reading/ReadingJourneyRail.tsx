"use client";

import { useMemo } from "react";
import readingSkillTreeData from "@/data/reading-skill-tree.json";
import { ReadingStudentProfile, ReadingLevel } from "@/types/reading";
import LearningForecastGraph from "@/components/LearningForecastGraph";

interface Props {
  profile: ReadingStudentProfile | null;
  dailyActivity?: Record<string, number>;
}

type LevelState = "skipped" | "earned" | "active" | "coming_up";

interface LevelInfo {
  level: ReadingLevel;
  state: LevelState;
  isPlacementEntry: boolean;
  masteredInLevel: number;
  totalInLevel: number;
}

// Reading has 5 levels — nodes are wider so titles can fit
const NODE_W = 64;
const CONN_W = 28;

function NodeCircle({ state, levelId }: { state: LevelState; levelId: number }) {
  const base =
    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0";
  if (state === "skipped")
    return (
      <div className={`${base} bg-purple-100 text-purple-400 ring-2 ring-purple-200`}>✓</div>
    );
  if (state === "earned")
    return <div className={`${base} bg-purple-500 text-white shadow-sm`}>✓</div>;
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

type TreeData = {
  levels: ReadingLevel[];
};

const treeData = readingSkillTreeData as unknown as TreeData;

// Derive entry level number from entrySkillId (e.g. "R3.T1.A1" → 3)
function parseEntryLevel(entrySkillId: string): number {
  const match = entrySkillId.match(/^R(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// Short level titles for display
const SHORT_TITLES: Record<number, string> = {
  1: "Oral & Sounds",
  2: "Letters & Blending",
  3: "Decoding",
  4: "Fluency",
  5: "Comprehension",
};

export default function ReadingJourneyRail({ profile, dailyActivity = {} }: Props) {
  const { levelInfos, totalSkills, masteredCount, entryLevel, skippedCount } = useMemo(() => {
    const autoIds = new Set(profile?.placement?.autoCompletedSkillIds ?? []);
    const mastery = profile?.skill_mastery ?? {};
    const currentLevel = profile?.current_level ?? 0;
    const entrySkillId = profile?.placement?.entrySkillId ?? "";
    const entryLevel = parseEntryLevel(entrySkillId) || currentLevel;

    let masteredCount = 0;
    let totalSkills = 0;
    let skippedCount = 0;

    const levelInfos: LevelInfo[] = treeData.levels.map((level) => {
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
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 text-center space-y-2">
        <p className="text-4xl">📖</p>
        <p className="font-semibold text-purple-700 text-base">
          Take the placement test to start your Reading journey
        </p>
        <p className="text-purple-400 text-sm">
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
        <h3 className="font-semibold text-gray-800 text-base">📚 Your Reading Journey</h3>
        <p className="text-sm text-purple-600 mt-0.5">
          Your test placed you at Level {entryLevel}
          {skippedLabel && <> — you already knew {skippedLabel}!</>}
        </p>
      </div>

      {/* ── Plain-language summary ── */}
      <p className="text-sm text-gray-500 mb-3">
        You&apos;ve mastered{" "}
        <span className="font-semibold text-purple-600">
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
          color="purple"
        />
      )}

      {/* ── Direction labels ── */}
      <div className="flex justify-between text-xs text-gray-300 font-medium mb-2 px-0.5">
        <span>START</span>
        <span>FINISH</span>
      </div>

      {/* ── Rail ── */}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        {/* Row 1: TEST badges */}
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

        {/* Row 2: Nodes + connectors */}
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
                    className={`h-0.5 ${connectorGreen ? "bg-purple-300" : "bg-gray-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Row 3: Level numbers + short titles */}
        <div className="flex mt-1.5" style={{ minWidth: "max-content" }}>
          {levelInfos.map((item, i) => {
            const isLast = i === levelInfos.length - 1;
            const colW = isLast ? NODE_W : NODE_W + CONN_W;
            const { state, level } = item;
            return (
              <div
                key={level.id}
                style={{ width: colW, flexShrink: 0 }}
                className="flex flex-col items-center text-center px-0.5"
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
                  className={`text-xs leading-tight mt-0.5 ${
                    state === "skipped"
                      ? "text-purple-400"
                      : state === "earned"
                      ? "text-purple-500"
                      : state === "active"
                      ? "text-amber-400 font-medium"
                      : "text-gray-300"
                  }`}
                >
                  {state === "active"
                    ? "here"
                    : state === "skipped"
                    ? "skipped"
                    : state === "earned"
                    ? "done"
                    : SHORT_TITLES[level.id] ?? `Level ${level.id}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-100 ring-1 ring-purple-300 inline-block" />
          Skipped by test
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
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
