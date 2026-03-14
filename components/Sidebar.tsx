"use client";

import { useState, useEffect } from "react";
import { ActiveView } from "@/types";
import { useT } from "@/lib/i18n";

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  totalMessages: number;
  lessonsCompleted: number;
  topicsCount: number;
  isOpen: boolean;
  onClose: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onOpenLangPicker?: () => void;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function Sidebar({
  activeView,
  onViewChange,
  isOpen,
  onClose,
  onSettings,
  onLogout,
  onOpenLangPicker,
}: SidebarProps) {
  const { t } = useT();

  const topItems: { id: ActiveView; emoji: string; label: string; desc: string }[] = [
    { id: "home",     emoji: "🏠", label: t("sidebar.home"),     desc: t("sidebar.home_desc") },
    { id: "progress", emoji: "📊", label: t("sidebar.progress"), desc: t("sidebar.progress_desc") },
  ];

  const collapsibleSections = [
    {
      key: "general",
      label: t("sidebar.general_tutor"),
      emoji: "💬",
      items: [
        { id: "chat" as ActiveView,  emoji: "📚", label: t("sidebar.homework"), desc: t("sidebar.homework_desc") },
        { id: "watch" as ActiveView, emoji: "▶️",  label: t("sidebar.watch"),    desc: t("sidebar.watch_desc") },
      ],
    },
    {
      key: "maths",
      label: t("sidebar.maths_engine"),
      emoji: "🧮",
      items: [
        { id: "ruby" as ActiveView,       emoji: "🎯", label: t("sidebar.maths"),      desc: t("sidebar.maths_desc") },
        { id: "skill-tree" as ActiveView, emoji: "🌳", label: t("sidebar.skill_tree"), desc: t("sidebar.skill_tree_desc") },
      ],
    },
    {
      key: "reading",
      label: t("sidebar.reading_engine"),
      emoji: "📖",
      items: [
        { id: "reading" as ActiveView,            emoji: "✏️", label: t("sidebar.reading"),    desc: t("sidebar.reading_desc") },
        { id: "reading-skill-tree" as ActiveView, emoji: "🌳", label: t("sidebar.skill_tree"), desc: t("sidebar.reading_skill_tree_desc") },
      ],
    },
  ];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: false,
    maths: false,
    reading: false,
  });

  useEffect(() => {
    if (isOpen) {
      setOpenSections({ general: false, maths: false, reading: false });
    }
  }, [isOpen]);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleNav = (view: ActiveView) => {
    onViewChange(view);
    onClose();
  };

  const navItemClass = (active: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
      active
        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
        : "text-purple-200 hover:bg-purple-800/60 hover:text-white"
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          md:static md:z-auto md:translate-x-0
          bg-gradient-to-b from-violet-800 to-purple-950
          flex flex-col h-full shadow-xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-purple-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded-full bg-white shadow-lg flex-shrink-0">
              <img
                src="/ruby-avatar.png"
                alt="Ruby"
                className="w-full h-full object-fill"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = "flex";
                }}
              />
              <div
                className="w-full h-full bg-orange-400 items-center justify-center text-xl font-bold text-orange-900"
                style={{ display: "none" }}
              >
                R
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Ruby</h1>
              <p className="text-purple-300 text-xs mt-0.5">AI Tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
          {/* Globe — language picker, desktop only (mobile has it in top bar) */}
          <button
            onClick={onOpenLangPicker}
            className="hidden md:block p-1 rounded-lg transition-opacity hover:opacity-80"
            aria-label="Change language"
          >
            <span className="text-2xl leading-none">🌍</span>
          </button>
          <button
            onClick={onClose}
            className="md:hidden text-purple-300 hover:text-white p-1.5 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">

          {/* Top-level items */}
          {topItems.map(({ id, emoji, label, desc }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={navItemClass(activeView === id)}
            >
              <span className="text-lg flex-shrink-0">{emoji}</span>
              <div className="min-w-0">
                <div className="font-medium text-sm">{label}</div>
                <div className={`text-xs truncate ${activeView === id ? "text-purple-100" : "text-purple-400"}`}>{desc}</div>
              </div>
            </button>
          ))}

          <div className="pt-2" />

          {/* Collapsible sections */}
          {collapsibleSections.map((section) => (
            <div key={section.key} className="space-y-1">
              {/* Section heading */}
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-purple-400 hover:text-purple-200 hover:bg-purple-800/40 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 mr-1">
                  <span className="text-base flex-shrink-0">{section.emoji}</span>
                  <span className="text-xs font-semibold uppercase tracking-normal leading-tight">{section.label}</span>
                </div>
                <ChevronIcon open={openSections[section.key]} />
              </button>

              {/* Items */}
              {openSections[section.key] && (
                <div className="space-y-1 pl-1">
                  {section.items.map(({ id, emoji, label, desc }) => (
                    <button
                      key={id + label}
                      onClick={() => handleNav(id)}
                      className={navItemClass(activeView === id)}
                    >
                      <span className="text-lg flex-shrink-0">{emoji}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{label}</div>
                        <div className={`text-xs truncate ${activeView === id ? "text-purple-100" : "text-purple-400"}`}>{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-5 flex-shrink-0 space-y-1">
          <button
            onClick={() => { onSettings?.(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-purple-200 hover:bg-purple-800/60 hover:text-white"
          >
            <span className="text-lg flex-shrink-0">⚙️</span>
            <div className="min-w-0">
              <div className="font-medium text-sm">{t("sidebar.settings")}</div>
              <div className="text-xs truncate text-purple-400">{t("sidebar.settings_desc")}</div>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-purple-200 hover:bg-purple-800/60 hover:text-white"
          >
            <span className="text-lg flex-shrink-0">🚪</span>
            <div className="min-w-0">
              <div className="font-medium text-sm">{t("sidebar.logout")}</div>
              <div className="text-xs truncate text-purple-400">{t("sidebar.logout_desc")}</div>
            </div>
          </button>

          <p className="text-purple-400 text-xs text-center pt-2">{t("sidebar.powered_by")}</p>
        </div>
      </aside>
    </>
  );
}
