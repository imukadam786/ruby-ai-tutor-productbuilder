"use client";

// Shared presentational shell for every subject's skill tree.
//
// This component owns the canonical "Look A" appearance (collapsible level
// cards with an L-badge + progress bar, skills rendered as small coloured
// emoji pill-tiles, a desktop accent header bar, and the compact "View full
// tree" toggle). Every subject view maps its own data + click handlers into
// the props below, so all trees look identical while each keeps its own
// back-end logic (status calc, grade locking, profiles, handlers).
//
// Nothing here computes mastery or status — callers pass a fully-resolved
// `status` per skill plus an optional `onClick`. Accent colours are looked up
// from a static map (Tailwind can't build class names dynamically).

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import EduBackground from "@/components/EduBackground";
import RubyIcon from "@/components/ui/RubyIcon";
import SkillTreePath from "@/components/shared/SkillTreePath";
import { CONCEPT_C } from "@/lib/flags";

// When a tree renders inside the Subjects hub, it opts into a more compact
// presentation: the header reads a plain "Skill Tree" (the subject name is
// already shown by the card next to it), the panel is transparent (no nested
// card / textured background), and an open level shows only the learner's
// current sub-section (tier) until they choose to expand it. Every other
// surface (standalone subject pages, the Progress page) leaves this `false`,
// so nothing there changes.
export interface HubTreeInfo {
  inHub: boolean;
  /** Subject thumbnail shown in the hub tree header (mirrors Ruby's chat avatar). */
  thumbnail?: string;
  /** Fallback emoji when a subject has no thumbnail image. */
  emoji?: string;
  /** Subject name shown as the hub header title (e.g. "Geography"). */
  label?: string;
  /** Subject accent gradient (Tailwind `from-*`/`to-*`) — paints the coloured
   *  frame around the hub thumbnail so each subject reads by its own colour. */
  accentFrom?: string;
  accentTo?: string;
}
export const HubTreeContext = createContext<HubTreeInfo>({ inHub: false });

// Statuses that mark a tier as "where the learner is working" — used to pick
// the single tier shown when an open level is collapsed in the hub.
const ACTIONABLE_STATUSES = new Set<SkillTreeStatus>([
  "current",
  "active",
  "available",
  "in_progress",
]);

export type SkillTreeAccent =
  | "blue"
  | "purple"
  | "rose"
  | "teal"
  | "emerald"
  | "amber"
  | "indigo"
  | "sky"
  | "cyan"
  | "violet"
  | "orange"
  | "lime"
  | "pink"
  | "slate";

export type SkillTreeStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "mastered"
  | "auto_complete"
  | "entry_point"
  | "hard_gate"
  | "active"
  | "current";

export interface TreeSkill {
  id: string;
  title: string;
  status: SkillTreeStatus;
  /** Replaces the default status label inside the tile's tooltip / a11y text. */
  label?: string;
  /** Tap handler. Omit to render a non-interactive tile. */
  onClick?: () => void;
  /** Small extra markers used by Maths/English placement features. */
  replay?: boolean;
  entry?: boolean;
  autoComplete?: boolean;
  /** Short note shown under a hard-gate skill, e.g. "Complete this to unlock". */
  hardGateNote?: string;
}

export interface TreeTier {
  id: string;
  title: string;
  skills: TreeSkill[];
}

export interface TreeLevel {
  id: string | number;
  /** Short badge shown in the level pill, e.g. "L1" or "G10". */
  badge: string;
  title: string;
  description?: string;
  progressPct: number;
  tiers: TreeTier[];
  isCurrent?: boolean;
  defaultOpen?: boolean;
  /** Amber divider rendered above the card (Maths/English hard gate). */
  preBarrier?: { text: string };
  /** Banner strip inside the top of the card. */
  banner?: { tone: "amber" | "green"; icon: string; text: string };
}

export interface SkillTreeShellProps {
  accent: SkillTreeAccent;
  /** Header title (desktop accent bar). */
  title: string;
  /** Header sub-line, e.g. "3/14 Levels · 5/40 Tiers · …". */
  statline?: string;
  levels: TreeLevel[];
  compact?: boolean;
  onBack?: () => void;
  /** Compact-mode footer toggle ("View full tree" / "Show only current level"). */
  footerToggle?: { label: string; onClick: () => void };
  /** Optional note rendered above the levels (e.g. "this grade is coming soon"). */
  notice?: ReactNode;
  /** Rendered instead of the levels when there is nothing to show. */
  emptyState?: ReactNode;
}

const ACCENTS: Record<
  SkillTreeAccent,
  {
    headerBg: string;
    headerTitle: string;
    headerSub: string;
    bar: string;
    currentBadge: string;
    currentCard: string;
    currentHeaderBg: string;
    currentPill: string;
    activeTile: string;
    activeRing: string;
    hoverRing: string;
  }
> = {
  blue: {
    headerBg: "bg-blue-50 border-blue-200",
    headerTitle: "text-blue-700",
    headerSub: "text-blue-400",
    bar: "bg-blue-500",
    currentBadge: "bg-blue-500 text-white",
    currentCard: "border-blue-300 shadow-md shadow-blue-500/10",
    currentHeaderBg: "bg-blue-50",
    currentPill: "bg-blue-100 text-blue-700",
    activeTile: "bg-blue-100 text-blue-800 border-blue-400",
    activeRing: "ring-2 ring-blue-500 ring-offset-1 animate-pulse shadow-sm shadow-blue-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-blue-300 hover:shadow-sm transition-all",
  },
  purple: {
    headerBg: "bg-purple-50 border-purple-200",
    headerTitle: "text-purple-700",
    headerSub: "text-purple-400",
    bar: "bg-purple-500",
    currentBadge: "bg-purple-500 text-white",
    currentCard: "border-purple-300 shadow-md shadow-purple-500/10",
    currentHeaderBg: "bg-purple-50",
    currentPill: "bg-purple-100 text-purple-700",
    activeTile: "bg-purple-100 text-purple-800 border-purple-400",
    activeRing: "ring-2 ring-purple-500 ring-offset-1 animate-pulse shadow-sm shadow-purple-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-purple-300 hover:shadow-sm transition-all",
  },
  rose: {
    headerBg: "bg-rose-50 border-rose-200",
    headerTitle: "text-rose-700",
    headerSub: "text-rose-400",
    bar: "bg-rose-500",
    currentBadge: "bg-rose-500 text-white",
    currentCard: "border-rose-300 shadow-md shadow-rose-500/10",
    currentHeaderBg: "bg-rose-50",
    currentPill: "bg-rose-100 text-rose-700",
    activeTile: "bg-rose-100 text-rose-800 border-rose-400",
    activeRing: "ring-2 ring-rose-500 ring-offset-1 animate-pulse shadow-sm shadow-rose-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-rose-300 hover:shadow-sm transition-all",
  },
  teal: {
    headerBg: "bg-teal-50 border-teal-200",
    headerTitle: "text-teal-700",
    headerSub: "text-teal-400",
    bar: "bg-teal-500",
    currentBadge: "bg-teal-500 text-white",
    currentCard: "border-teal-300 shadow-md shadow-teal-500/10",
    currentHeaderBg: "bg-teal-50",
    currentPill: "bg-teal-100 text-teal-700",
    activeTile: "bg-teal-100 text-teal-800 border-teal-400",
    activeRing: "ring-2 ring-teal-500 ring-offset-1 animate-pulse shadow-sm shadow-teal-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-teal-300 hover:shadow-sm transition-all",
  },
  emerald: {
    headerBg: "bg-emerald-50 border-emerald-200",
    headerTitle: "text-emerald-700",
    headerSub: "text-emerald-400",
    bar: "bg-emerald-500",
    currentBadge: "bg-emerald-500 text-white",
    currentCard: "border-emerald-300 shadow-md shadow-emerald-500/10",
    currentHeaderBg: "bg-emerald-50",
    currentPill: "bg-emerald-100 text-emerald-700",
    activeTile: "bg-emerald-100 text-emerald-800 border-emerald-400",
    activeRing: "ring-2 ring-emerald-500 ring-offset-1 animate-pulse shadow-sm shadow-emerald-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-emerald-300 hover:shadow-sm transition-all",
  },
  amber: {
    headerBg: "bg-amber-50 border-amber-200",
    headerTitle: "text-amber-700",
    headerSub: "text-amber-500",
    bar: "bg-amber-500",
    currentBadge: "bg-amber-500 text-white",
    currentCard: "border-amber-300 shadow-md shadow-amber-500/10",
    currentHeaderBg: "bg-amber-50",
    currentPill: "bg-amber-100 text-amber-700",
    activeTile: "bg-amber-100 text-amber-800 border-amber-400",
    activeRing: "ring-2 ring-amber-500 ring-offset-1 animate-pulse shadow-sm shadow-amber-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-amber-300 hover:shadow-sm transition-all",
  },
  indigo: {
    headerBg: "bg-indigo-50 border-indigo-200",
    headerTitle: "text-indigo-700",
    headerSub: "text-indigo-400",
    bar: "bg-indigo-500",
    currentBadge: "bg-indigo-500 text-white",
    currentCard: "border-indigo-300 shadow-md shadow-indigo-500/10",
    currentHeaderBg: "bg-indigo-50",
    currentPill: "bg-indigo-100 text-indigo-700",
    activeTile: "bg-indigo-100 text-indigo-800 border-indigo-400",
    activeRing: "ring-2 ring-indigo-500 ring-offset-1 animate-pulse shadow-sm shadow-indigo-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-indigo-300 hover:shadow-sm transition-all",
  },
  sky: {
    headerBg: "bg-sky-50 border-sky-200",
    headerTitle: "text-sky-700",
    headerSub: "text-sky-400",
    bar: "bg-sky-500",
    currentBadge: "bg-sky-500 text-white",
    currentCard: "border-sky-300 shadow-md shadow-sky-500/10",
    currentHeaderBg: "bg-sky-50",
    currentPill: "bg-sky-100 text-sky-700",
    activeTile: "bg-sky-100 text-sky-800 border-sky-400",
    activeRing: "ring-2 ring-sky-500 ring-offset-1 animate-pulse shadow-sm shadow-sky-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-sky-300 hover:shadow-sm transition-all",
  },
  cyan: {
    headerBg: "bg-cyan-50 border-cyan-200",
    headerTitle: "text-cyan-700",
    headerSub: "text-cyan-400",
    bar: "bg-cyan-500",
    currentBadge: "bg-cyan-500 text-white",
    currentCard: "border-cyan-300 shadow-md shadow-cyan-500/10",
    currentHeaderBg: "bg-cyan-50",
    currentPill: "bg-cyan-100 text-cyan-700",
    activeTile: "bg-cyan-100 text-cyan-800 border-cyan-400",
    activeRing: "ring-2 ring-cyan-500 ring-offset-1 animate-pulse shadow-sm shadow-cyan-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-cyan-300 hover:shadow-sm transition-all",
  },
  violet: {
    headerBg: "bg-violet-50 border-violet-200",
    headerTitle: "text-violet-700",
    headerSub: "text-violet-400",
    bar: "bg-violet-500",
    currentBadge: "bg-violet-500 text-white",
    currentCard: "border-violet-300 shadow-md shadow-violet-500/10",
    currentHeaderBg: "bg-violet-50",
    currentPill: "bg-violet-100 text-violet-700",
    activeTile: "bg-violet-100 text-violet-800 border-violet-400",
    activeRing: "ring-2 ring-violet-500 ring-offset-1 animate-pulse shadow-sm shadow-violet-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-violet-300 hover:shadow-sm transition-all",
  },
  orange: {
    headerBg: "bg-orange-50 border-orange-200",
    headerTitle: "text-orange-700",
    headerSub: "text-orange-400",
    bar: "bg-orange-500",
    currentBadge: "bg-orange-500 text-white",
    currentCard: "border-orange-300 shadow-md shadow-orange-500/10",
    currentHeaderBg: "bg-orange-50",
    currentPill: "bg-orange-100 text-orange-700",
    activeTile: "bg-orange-100 text-orange-800 border-orange-400",
    activeRing: "ring-2 ring-orange-500 ring-offset-1 animate-pulse shadow-sm shadow-orange-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-orange-300 hover:shadow-sm transition-all",
  },
  slate: {
    headerBg: "bg-slate-50 border-slate-200",
    headerTitle: "text-slate-700",
    headerSub: "text-slate-400",
    bar: "bg-slate-500",
    currentBadge: "bg-slate-600 text-white",
    currentCard: "border-slate-300 shadow-md shadow-slate-500/10",
    currentHeaderBg: "bg-slate-50",
    currentPill: "bg-slate-100 text-slate-700",
    activeTile: "bg-slate-100 text-slate-800 border-slate-400",
    activeRing: "ring-2 ring-slate-500 ring-offset-1 animate-pulse shadow-sm shadow-slate-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-slate-300 hover:shadow-sm transition-all",
  },
  lime: {
    headerBg: "bg-lime-50 border-lime-200",
    headerTitle: "text-lime-700",
    headerSub: "text-lime-500",
    bar: "bg-lime-500",
    currentBadge: "bg-lime-500 text-white",
    currentCard: "border-lime-300 shadow-md shadow-lime-500/10",
    currentHeaderBg: "bg-lime-50",
    currentPill: "bg-lime-100 text-lime-700",
    activeTile: "bg-lime-100 text-lime-800 border-lime-400",
    activeRing: "ring-2 ring-lime-500 ring-offset-1 animate-pulse shadow-sm shadow-lime-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-lime-300 hover:shadow-sm transition-all",
  },
  pink: {
    headerBg: "bg-pink-50 border-pink-200",
    headerTitle: "text-pink-700",
    headerSub: "text-pink-400",
    bar: "bg-pink-500",
    currentBadge: "bg-pink-500 text-white",
    currentCard: "border-pink-300 shadow-md shadow-pink-500/10",
    currentHeaderBg: "bg-pink-50",
    currentPill: "bg-pink-100 text-pink-700",
    activeTile: "bg-pink-100 text-pink-800 border-pink-400",
    activeRing: "ring-2 ring-pink-500 ring-offset-1 animate-pulse shadow-sm shadow-pink-300",
    hoverRing: "cursor-pointer hover:ring-2 hover:ring-pink-300 hover:shadow-sm transition-all",
  },
};

// Fixed (accent-independent) tile styling per status. `active`/`current` are
// handled separately because they pick up the subject's accent.
const STATUS_TILE: Record<
  Exclude<SkillTreeStatus, "active" | "current">,
  { bg: string; text: string; border: string; icon: string; label: string }
> = {
  locked:        { bg: "bg-gray-100",  text: "text-gray-400",   border: "border-gray-200",  icon: "🔒", label: "Locked" },
  available:     { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200", icon: "🚀", label: "Ready" },
  in_progress:   { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200",icon: "⚡", label: "In progress" },
  mastered:      { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200", icon: "🏆", label: "Mastered" },
  auto_complete: { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200", icon: "✦",  label: "Auto-completed" },
  entry_point:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-300",  icon: "🎯", label: "Entry point" },
  hard_gate:     { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-300", icon: "🔒", label: "Locked" },
};

const ACCENT_ICON: Record<"active" | "current", string> = {
  active: "▶",
  current: "🎯",
};
const ACCENT_LABEL: Record<"active" | "current", string> = {
  active: "Active",
  current: "Start here",
};

function SkillTile({ skill, accent }: { skill: TreeSkill; accent: typeof ACCENTS[SkillTreeAccent] }) {
  const [showHint, setShowHint] = useState(false);
  const isAccentStatus = skill.status === "active" || skill.status === "current";
  const tile = isAccentStatus
    ? null
    : STATUS_TILE[skill.status as Exclude<SkillTreeStatus, "active" | "current">];

  const bg = tile ? `${tile.bg} ${tile.text} ${tile.border}` : accent.activeTile;
  const icon = tile ? tile.icon : ACCENT_ICON[skill.status as "active" | "current"];
  const label = skill.label ?? (tile ? tile.label : ACCENT_LABEL[skill.status as "active" | "current"]);

  const clickable = !!skill.onClick;
  const className = [
    "px-3 py-1.5 rounded-lg border text-xs font-medium text-left",
    bg,
    skill.status === "active" ? accent.activeRing : "",
    skill.entry ? "ring-2 ring-blue-400 ring-offset-1" : "",
    clickable ? accent.hoverRing : "",
    !clickable && skill.status === "locked" ? "opacity-70 cursor-default" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span className="mr-1" aria-hidden>{icon}</span>
      {skill.title}
      {skill.replay && <span className="ml-1 text-current opacity-70" aria-hidden>🔁</span>}
      {skill.autoComplete && <span className="ml-1.5 text-green-500" title="Auto-completed via placement" aria-hidden>✦</span>}
      {skill.entry && <span className="ml-1.5 inline-flex" title="Placement entry point"><RubyIcon className="w-3.5 h-3.5" /></span>}
      {skill.hardGateNote && (
        <span className="block text-amber-600 text-[10px] leading-tight mt-0.5">{skill.hardGateNote}</span>
      )}
    </>
  );

  const title = `${skill.title} — ${label}`;

  // A locked skill the learner can't open yet. Instead of a dead tile with only
  // a hover tooltip (invisible on touch), let them tap it to reveal — in plain
  // words — what unlocks it. This is the signpost that was missing when learners
  // tapped a locked skill and nothing happened.
  const isLocked = skill.status === "locked";

  if (clickable) {
    return (
      <button type="button" onClick={skill.onClick} className={className} title={title} aria-label={title}>
        {inner}
      </button>
    );
  }

  if (isLocked) {
    return (
      <span className="inline-flex flex-col items-start align-top">
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          className={`${className} cursor-pointer`}
          title={title}
          aria-label={title}
          aria-expanded={showHint}
        >
          {inner}
        </button>
        {showHint && (
          <span className="mt-1 max-w-[13rem] text-gray-500 text-[10px] leading-tight">
            🔒 Master the skill before this one to unlock it.
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={className} title={title} aria-label={title}>
      {inner}
    </div>
  );
}

function LevelCard({
  level,
  accent,
  isOpen,
  onToggle,
  innerRef,
}: {
  level: TreeLevel;
  accent: typeof ACCENTS[SkillTreeAccent];
  isOpen: boolean;
  onToggle: () => void;
  innerRef?: (el: HTMLDivElement | null) => void;
}) {
  const progress = level.progressPct;
  const isCurrent = !!level.isCurrent;
  const inHub = useContext(HubTreeContext).inHub;

  // In the hub, an open level previews only the focus tier the learner is working
  // on, capped to a few skills — so every subject's card is the same compact size
  // no matter how many topics/skills the level holds (content subjects can have
  // 16+ per tier). The learner reveals the rest of the level with the toggle.
  const HUB_PREVIEW_SKILLS = 3;
  const [tiersExpanded, setTiersExpanded] = useState(false);
  const focusTierIndex = (() => {
    const next = level.tiers.findIndex((t) => t.skills.some((s) => ACTIONABLE_STATUSES.has(s.status)));
    if (next >= 0) return next;
    const firstUnlocked = level.tiers.findIndex((t) => t.skills.some((s) => s.status !== "locked"));
    return firstUnlocked >= 0 ? firstUnlocked : 0;
  })();
  const focusTier = level.tiers[focusTierIndex];
  // Start the preview at the actionable skill so "Start here" is always visible.
  const previewSkills = (() => {
    if (!focusTier) return [];
    const firstActionable = focusTier.skills.findIndex((s) => ACTIONABLE_STATUSES.has(s.status));
    const start = firstActionable > 0 ? firstActionable : 0;
    return focusTier.skills.slice(start, start + HUB_PREVIEW_SKILLS);
  })();
  const totalSkills = level.tiers.reduce((n, t) => n + t.skills.length, 0);
  const canCollapseTiers = inHub && totalSkills > previewSkills.length;
  const showAllTiers = !canCollapseTiers || tiersExpanded;

  return (
    <div ref={innerRef}>
      {level.preBarrier && (
        <div className="flex items-center gap-3 my-2 px-1">
          <div className="flex-1 h-px bg-amber-300" />
          <div className="bg-amber-100 border border-amber-300 rounded-xl px-3 py-1.5 flex items-center gap-2 text-amber-700 text-xs font-semibold">
            <span aria-hidden>🔒</span>
            <span>{level.preBarrier.text}</span>
          </div>
          <div className="flex-1 h-px bg-amber-300" />
        </div>
      )}
      <div
        className={`bg-white border rounded-2xl overflow-hidden transition-all ${
          isCurrent ? accent.currentCard : "border-gray-200"
        }`}
      >
        {level.banner && (
          <div
            className={`border-b px-5 py-2 flex items-center gap-2 ${
              level.banner.tone === "amber"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-green-50 border-green-100 text-green-700"
            }`}
          >
            <span aria-hidden>{level.banner.icon}</span>
            <p className="text-xs font-medium">{level.banner.text}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className={`w-full text-left px-5 py-4 ${isCurrent ? accent.currentHeaderBg : ""} hover:bg-gray-50 transition-colors`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                className={`min-w-[2.25rem] h-8 px-1.5 rounded-lg flex items-center justify-center text-sm font-bold ${
                  progress === 100
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? accent.currentBadge
                    : progress > 0
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {level.badge}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{level.title}</p>
                {level.description && <p className="text-gray-400 text-xs">{level.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              <div className="text-right">
                <p className={`text-sm font-bold ${progress === 100 ? "text-green-600" : "text-gray-600"}`}>
                  {progress}%
                </p>
                {isCurrent && (
                  <span className={`text-xs ${accent.currentPill} px-2 py-0.5 rounded-full font-medium`}>
                    Current
                  </span>
                )}
              </div>
              <svg
                aria-hidden
                className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : accent.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </button>

        {isOpen && (
          <div className="px-5 pb-4">
            {showAllTiers ? (
              level.tiers.map((tier) => (
                <div key={tier.id} className="mt-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{tier.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {tier.skills.map((skill) => (
                      <SkillTile key={skill.id} skill={skill} accent={accent} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="mt-3">
                {focusTier && (
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{focusTier.title}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {previewSkills.map((skill) => (
                    <SkillTile key={skill.id} skill={skill} accent={accent} />
                  ))}
                </div>
              </div>
            )}
            {canCollapseTiers && (
              <button
                type="button"
                onClick={() => setTiersExpanded((v) => !v)}
                className="mt-3 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                {tiersExpanded ? "Show less ▴" : `Show all ${totalSkills} skills ▾`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SkillTreeShell({
  accent: accentName,
  title,
  statline,
  levels,
  compact,
  onBack,
  footerToggle,
  notice,
  emptyState,
}: SkillTreeShellProps) {
  const accent = ACCENTS[accentName];
  const hub = useContext(HubTreeContext);
  const inHub = hub.inHub;

  // Per-level expand/collapse, seeded from each level's defaultOpen flag.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const isOpen = (lvl: TreeLevel) => overrides[String(lvl.id)] ?? !!lvl.defaultOpen;
  const toggle = (lvl: TreeLevel) =>
    setOverrides((prev) => ({ ...prev, [String(lvl.id)]: !(prev[String(lvl.id)] ?? !!lvl.defaultOpen) }));

  // Scroll the current level into view on full-page mounts (not compact embeds,
  // so the Subjects / Progress pages aren't yanked around).
  const currentRef = useRef<HTMLDivElement | null>(null);
  const currentKey = levels.find((l) => l.isCurrent)?.id;
  useEffect(() => {
    // The hub embeds trees mid-page; scrolling the current level into view
    // would yank the whole Subjects page, so treat hub like compact here.
    if (compact || inHub) return;
    const id = window.requestAnimationFrame(() => {
      currentRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [compact, currentKey]);

  // The levels + footer, shared by the hub and standalone layouts.
  const body = emptyState ? (
    emptyState
  ) : (
    <div className="space-y-4">
      {notice}
      {levels.map((level) => (
        <LevelCard
          key={level.id}
          level={level}
          accent={accent}
          isOpen={isOpen(level)}
          onToggle={() => toggle(level)}
          innerRef={level.isCurrent ? (el) => (currentRef.current = el) : undefined}
        />
      ))}

      {footerToggle && (
        <button
          type="button"
          onClick={footerToggle.onClick}
          className="w-full text-sm font-semibold text-[#1a2744] hover:text-brand py-2"
        >
          {footerToggle.label}
        </button>
      )}
    </div>
  );

  // ── Hub presentation ──────────────────────────────────────────────────────
  // Inside the Subjects hub there's no header bar and no subject title: the
  // learner sees only the subject thumbnail (with the stat-line beneath it) and
  // the skill-tree card beside it. The thumbnail is a fixed square — pinned to
  // the top, NOT stretched to the tree's height — so every subject's card reads
  // at the same size regardless of how tall its tree is. On mobile they stack.
  if (inHub) {
    const thumb = hub.thumbnail ? (
      <img src={hub.thumbnail} alt={hub.label ?? ""} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-5xl">
        {hub.emoji ?? "📘"}
      </div>
    );

    return (
      <div className="relative isolate">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Left: fixed-square thumbnail + stat-line. Just the image — no frame,
              border or padding — and a constant size across every subject. */}
          <div className="flex flex-col items-center md:items-stretch md:w-48 lg:w-56 md:flex-shrink-0">
            <div className="w-40 aspect-square md:w-full md:aspect-square rounded-2xl overflow-hidden">
              {thumb}
            </div>
            {statline && (
              <p className="text-center text-xs text-gray-500 mt-2">{statline}</p>
            )}
          </div>

          {/* Right: the skill-tree card */}
          <div className="flex-1 min-w-0">{body}</div>
        </div>
      </div>
    );
  }

  // ── Standalone / full-page presentation ───────────────────────────────────
  return (
    <div className={`relative isolate bg-gray-50 ${compact ? "" : "flex flex-col h-full"}`}>
      <div className="absolute inset-0 -z-10">
        <EduBackground />
      </div>

      <div className={`border-b px-6 py-4 ${accent.headerBg} hidden md:block`}>
        <div className="min-w-0">
          <h2 className={`font-semibold text-lg ${accent.headerTitle}`}>{title}</h2>
          {statline && <p className={`text-sm ${accent.headerSub}`}>{statline}</p>}
        </div>
      </div>

      <div className={compact ? "p-6" : "flex-1 overflow-y-auto p-6"}>
        {onBack && (
          <div className="max-w-2xl mx-auto mb-4">
            <button
              onClick={onBack}
              className="text-sm font-semibold text-[#1a2744] hover:text-brand flex items-center gap-1"
            >
              ← Subjects
            </button>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {CONCEPT_C && !compact && !emptyState ? (
            <SkillTreePath levels={levels} accent={accentName} />
          ) : (
            body
          )}
        </div>
      </div>
    </div>
  );
}
