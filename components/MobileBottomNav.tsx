"use client";

import React from "react";
import { ActiveView } from "@/types";
import { useT } from "@/lib/i18n";
import { CONCEPT_C } from "@/lib/flags";

interface MobileBottomNavProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  onSettings?: () => void;
  grade?: number | null;
}

/**
 * Mobile-only bottom navigation bar. Replaces the hamburger drawer on phones —
 * every primary destination is one tap away. Hidden on md+ where the left
 * Sidebar takes over. Each tab is an emoji stacked over its label.
 */
export default function MobileBottomNav({
  activeView,
  onViewChange,
  onSettings,
  grade,
}: MobileBottomNavProps) {
  const { t } = useT();
  // Matric is a Grade 12-only experience — fail closed, same rule as the sidebar.
  const showMatric = grade === 12;

  // Subjects tab stays lit for any screen reached through the subjects hub.
  const subjectsActive =
    activeView === "subjects" ||
    activeView === "discover" ||
    activeView === "discover-maths" ||
    activeView === "discover-reading" ||
    activeView === "ruby" ||
    activeView === "skill-tree" ||
    activeView === "reading" ||
    activeView === "reading-skill-tree";

  const matricsActive =
    activeView === "matrics" ||
    activeView === "matric" ||
    activeView === "prep-papers-2026";

  const settingsActive = activeView === "settings";

  type Item = { id: ActiveView; emoji: string; label: string; active: boolean; onClick: () => void };

  const items: Item[] = [
    { id: "home",     emoji: "🏠", label: t("sidebar.home"),     active: activeView === "home",  onClick: () => onViewChange("home") },
    { id: "progress", emoji: "📊", label: t("sidebar.progress"), active: activeView === "progress", onClick: () => onViewChange("progress") },
    { id: "chat",     emoji: "💬", label: t("sidebar.homework"), active: activeView === "chat",  onClick: () => onViewChange("chat") },
    { id: "subjects", emoji: "📚", label: "Revision",            active: subjectsActive,         onClick: () => onViewChange("subjects") },
    ...(showMatric
      ? [{ id: "matrics" as ActiveView, emoji: "🎓", label: "Matrics", active: matricsActive, onClick: () => onViewChange("matrics") }]
      : []),
    { id: "settings", emoji: "⚙️", label: t("sidebar.settings"), active: settingsActive, onClick: () => (onSettings ? onSettings() : onViewChange("settings")) },
  ];

  return (
    <nav
      data-tutorial="bottom-nav"
      className="md:hidden flex-shrink-0 z-30 flex items-stretch bg-white border-t border-gray-200 shadow-[0_-1px_4px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]"
    >
      {items.map(({ id, emoji, label, active, onClick }) => (
        <button
          key={id}
          onClick={onClick}
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
            active ? (CONCEPT_C ? "text-ruby" : "text-brand") : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className={`text-xl leading-none ${active ? "" : "opacity-80"}`}>{emoji}</span>
          <span className={`text-[10px] leading-none truncate max-w-full ${active ? "font-semibold" : "font-medium"}`}>
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}
