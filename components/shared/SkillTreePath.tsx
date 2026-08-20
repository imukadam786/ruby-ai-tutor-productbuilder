"use client";

// ─── SkillTreePath (Concept C) ───────────────────────────────────────────────
// The "Skills" winding path — one gem per atomic skill, laid out down a single
// zig-zag trail. Levels/tiers become sections: the first skill of each level
// carries a section pill, and each level ends with a checkpoint (gold when the
// level is complete). The underlying data is already an ordered list with a
// computed status per skill, so the path never needs to draw branches — the
// prerequisite logic upstream just decides which gems are locked.
//
// Rendered by SkillTreeShell when the CONCEPT_C flag is on. Same props/handlers
// as the card view, so back-end behaviour is unchanged.

import { useEffect, useState } from "react";
import Gem from "@/components/ui/Gem";
import { GEM_HEX, RUBY, type GemColor, type GemState } from "@/lib/design/gemColors";
import type { TreeLevel, TreeSkill, SkillTreeAccent } from "@/components/shared/SkillTreeShell";

const ROW = 92;          // vertical px between nodes
const X = [50, 69, 50, 31]; // winding offsets (percent of width), cycles

type Node =
  | { kind: "skill"; skill: TreeSkill; levelBadge?: string; levelTitle?: string }
  | { kind: "checkpoint"; complete: boolean; levelBadge?: string; levelTitle?: string };

/** A skill's status → how its gem is drawn. `current` gets the ruby treatment. */
function gemStateFor(status: TreeSkill["status"]): { state: GemState; current: boolean } {
  switch (status) {
    case "mastered":
    case "auto_complete":
      return { state: "polished", current: false };
    case "in_progress":
      return { state: "cutting", current: false };
    case "current":
    case "active":
      return { state: "polished", current: true };
    case "locked":
    case "hard_gate":
      return { state: "locked", current: false };
    default: // available, entry_point
      return { state: "rough", current: false };
  }
}

/** The short caption line under each gem — the "milestone card" context. */
const STATUS_CAPTION: Record<TreeSkill["status"], { text: string; className: string }> = {
  mastered: { text: "✓ Completed", className: "text-green-600" },
  auto_complete: { text: "✓ Completed", className: "text-green-600" },
  in_progress: { text: "⚡ In progress", className: "text-orange-600" },
  current: { text: "▶ Continue", className: "text-ruby font-black" },
  active: { text: "▶ Continue", className: "text-ruby font-black" },
  locked: { text: "🔒 Locked", className: "text-gray-400" },
  hard_gate: { text: "🔒 Locked", className: "text-gray-400" },
  available: { text: "Ready", className: "text-gray-500" },
  entry_point: { text: "Ready", className: "text-gray-500" },
};

function isMastered(status: TreeSkill["status"]) {
  return status === "mastered" || status === "auto_complete";
}
function isLockedStatus(status: TreeSkill["status"]) {
  return status === "locked" || status === "hard_gate";
}

/** One gem + its milestone chip. Own component so the locked tap-to-reveal
 *  hint (mirrors SkillTile's in the card view) can hold its own state. */
function GemNode({
  skill,
  color,
  delayMs,
}: {
  skill: TreeSkill;
  color: string;
  delayMs: number;
}) {
  const [showHint, setShowHint] = useState(false);
  const { state, current } = gemStateFor(skill.status);
  const mastered = isMastered(skill.status);
  const locked = isLockedStatus(skill.status);
  const clickable = !!skill.onClick;
  const caption = skill.label
    ? { text: skill.label, className: current ? "text-ruby font-black" : "text-gray-500" }
    : STATUS_CAPTION[skill.status];

  const gem = (
    <span className="relative inline-block">
      {current && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 animate-pulse rounded-full blur-md"
          style={{ background: RUBY, opacity: 0.4 }}
        />
      )}
      <Gem
        color={current ? RUBY : color}
        state={state}
        className="w-12 h-14"
        title={`${skill.title} — ${skill.status}`}
      />
      {mastered && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[9px] font-black text-white shadow-lip-sm"
        >
          ✓
        </span>
      )}
      {locked && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 text-[9px] shadow-lip-sm"
        >
          🔒
        </span>
      )}
    </span>
  );

  const handleClick = clickable ? skill.onClick : locked ? () => setShowHint((v) => !v) : undefined;

  return (
    <div
      className="animate-fade-in-up flex flex-col items-center"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {handleClick ? (
        <button
          type="button"
          onClick={handleClick}
          className="rounded-full transition-transform active:translate-y-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby/40"
          aria-label={`${skill.title} — ${skill.status}`}
          aria-expanded={!clickable && locked ? showHint : undefined}
        >
          {gem}
        </button>
      ) : (
        gem
      )}

      <div
        className={`mt-1.5 max-w-[7rem] rounded-xl px-2 py-1 text-center ${
          current ? "bg-white shadow-lip-sm" : ""
        }`}
      >
        <p className="text-[10px] font-bold leading-tight text-gray-700">{skill.title}</p>
        <p className={`text-[9px] font-semibold leading-tight ${caption.className}`}>{caption.text}</p>
      </div>

      {!clickable && locked && showHint && (
        <p className="mt-1 max-w-[7rem] text-center text-[9px] leading-tight text-gray-400">
          Master the skill before this one to unlock it.
        </p>
      )}
    </div>
  );
}

/** Term/level progress bar — "Grade 10 ██████░░░░ 6/16 Topics Complete". */
function LevelProgressBar({ level, color }: { level: TreeLevel; color: string }) {
  const allSkills = level.tiers.flatMap((t) => t.skills);
  const total = allSkills.length;
  const mastered = allSkills.filter((s) => isMastered(s.status)).length;
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  // Animate the fill in from 0 on mount rather than painting already-full.
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setWidth(pct));
    return () => window.cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="mx-auto mb-6 max-w-md rounded-2xl bg-white px-4 py-3 shadow-lip-sm">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-extrabold text-gray-700">{level.title}</p>
        <p className="text-xs font-bold text-gray-500">
          {mastered}/{total} Topics Complete
        </p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function SkillTreePath({
  levels,
  accent,
}: {
  levels: TreeLevel[];
  accent: SkillTreeAccent;
}) {
  const color = GEM_HEX[accent as GemColor] ?? RUBY;
  const progressLevel = levels.find((l) => l.isCurrent) ?? levels[0];

  // Flatten levels → tiers → skills into one ordered node list, tagging the
  // first node of each level and adding a checkpoint at each level's end.
  const nodes: Node[] = [];
  for (const level of levels) {
    let firstOfLevel = true;
    for (const tier of level.tiers) {
      for (const skill of tier.skills) {
        nodes.push({
          kind: "skill",
          skill,
          levelBadge: firstOfLevel ? level.badge : undefined,
          levelTitle: firstOfLevel ? level.title : undefined,
        });
        firstOfLevel = false;
      }
    }
    nodes.push({ kind: "checkpoint", complete: level.progressPct === 100 });
  }

  const height = nodes.length * ROW;
  // Climb bottom-to-top: node 0 (the first skill) sits at the bottom of the
  // trail and later nodes climb upward, Duolingo-style.
  const points = nodes.map((_, i) => ({ x: X[i % X.length], y: height - (i * ROW + ROW / 2) }));
  const trail = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div>
      {progressLevel && <LevelProgressBar level={progressLevel} color={color} />}

      <div className="relative mx-auto max-w-md" style={{ height }}>
        {/* winding trail behind the gems */}
        <svg
          className="absolute inset-0"
          width="100%"
          height={height}
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={trail}
            fill="none"
            stroke={color}
            strokeOpacity={0.28}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {nodes.map((node, i) => {
          const p = points[i];
          const style = { left: `${p.x}%`, top: `${p.y}px`, transform: "translate(-50%,-50%)" };

          if (node.kind === "checkpoint") {
            return (
              <div
                key={`cp-${i}`}
                className="animate-fade-in-up absolute z-10 flex flex-col items-center"
                style={{ ...style, animationDelay: `${i * 40}ms` }}
              >
                <div
                  className={`text-3xl transition-transform ${node.complete ? "" : "opacity-40 grayscale"}`}
                  title={node.complete ? "Checkpoint complete" : "Checkpoint"}
                >
                  🎁
                </div>
              </div>
            );
          }

          const { skill, levelBadge, levelTitle } = node;

          return (
            <div key={skill.id} className="absolute z-10" style={style}>
              {/* section pill on the first skill of a level */}
              {levelBadge && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold shadow-lip-sm"
                    style={{ color }}
                  >
                    <span className="rounded-md px-1.5 py-0.5 text-white text-[10px]" style={{ background: color }}>
                      {levelBadge}
                    </span>
                    {levelTitle}
                  </span>
                </div>
              )}

              <GemNode skill={skill} color={color} delayMs={i * 40} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
