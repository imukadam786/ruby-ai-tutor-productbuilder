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

export default function SkillTreePath({
  levels,
  accent,
}: {
  levels: TreeLevel[];
  accent: SkillTreeAccent;
}) {
  const color = GEM_HEX[accent as GemColor] ?? RUBY;

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
  const points = nodes.map((_, i) => ({ x: X[i % X.length], y: i * ROW + ROW / 2 }));
  const trail = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
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
            <div key={`cp-${i}`} className="absolute z-10 flex flex-col items-center" style={style}>
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
        const { state, current } = gemStateFor(skill.status);
        const clickable = !!skill.onClick;

        const gem = (
          <Gem
            color={current ? RUBY : color}
            state={state}
            className="w-12 h-14"
            title={`${skill.title} — ${skill.status}`}
          />
        );

        return (
          <div key={skill.id} className="absolute z-10 flex flex-col items-center" style={style}>
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

            {current && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full border-2 border-ruby-soft bg-white px-2.5 py-0.5 text-[10px] font-black tracking-wide text-ruby shadow-lip-sm">
                START
              </span>
            )}

            {clickable ? (
              <button
                type="button"
                onClick={skill.onClick}
                className="transition-transform active:translate-y-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby/40 rounded-full"
                aria-label={`${skill.title} — ${skill.status}`}
              >
                {gem}
              </button>
            ) : (
              gem
            )}

            <span className="mt-1 max-w-[6.5rem] text-center text-[10px] font-bold leading-tight text-gray-600">
              {skill.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
