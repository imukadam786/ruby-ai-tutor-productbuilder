"use client";

import React from "react";
import { ActiveView } from "@/types";
import { useT } from "@/lib/i18n";

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onOpenLangPicker?: () => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapse,
  onSettings,
  onLogout,
  onOpenLangPicker,
}: SidebarProps) {
  const { t } = useT();

  const handleNav = (view: ActiveView) => {
    onViewChange(view);
    onClose();
  };

  const navItemClass = (active: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
      active
        ? "bg-white/25 text-white shadow-lg shadow-black/10"
        : "text-white/90 hover:bg-white/15 hover:text-white"
    }`;

  // Subjects view is active when on the subjects screen OR any sub-view reached via subjects
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

  const navItems: { id: ActiveView; emoji: string; label: string }[] = [
    { id: "home",     emoji: "🏠", label: t("sidebar.home") },
    { id: "progress", emoji: "📊", label: t("sidebar.progress") },
    { id: "chat",     emoji: "💬", label: t("sidebar.homework") },
    { id: "subjects", emoji: "📚", label: "Subjects" },
    { id: "matrics",  emoji: "🎓", label: "Matrics" },
  ];

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
          fixed inset-y-0 left-0 z-50
          md:static md:z-auto md:translate-x-0
          bg-gradient-to-b from-[#BE1832] to-[#E8305A]
          flex flex-col h-full shadow-xl
          transition-all duration-300 ease-in-out
          overflow-x-hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "md:w-14" : "w-64"}
        `}
      >
        {/* Logo */}
        <div className={`py-4 border-b border-white/20 flex items-center flex-shrink-0 ${collapsed ? "px-2 justify-center" : "px-4 justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-white">
                <img
                  src="/icons/icon-192.png"
                  alt="Ruby"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = "flex";
                  }}
                />
                <div
                  className="w-full h-full bg-rose-400 items-center justify-center text-xl font-bold text-rose-900"
                  style={{ display: "none" }}
                >
                  R
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-white font-bold text-xl leading-none">Ruby</h1>
                <p className="text-white/70 text-sm mt-0.5">AI Tutor</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!collapsed && (
              <button
                onClick={onOpenLangPicker}
                className="hidden md:block p-1.5 rounded-lg transition-opacity hover:opacity-80"
                aria-label="Change language"
              >
                <span className="text-xl leading-none">🌍</span>
              </button>
            )}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {collapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
            <button
              onClick={onClose}
              className="md:hidden text-white/70 hover:text-white p-1.5 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 ${collapsed ? "px-1" : "px-4"}`}>
          {navItems.map(({ id, emoji, label }) => {
            const active =
              id === "subjects" ? subjectsActive :
              id === "matrics"  ? matricsActive :
              activeView === id;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                title={collapsed ? label : undefined}
                className={`${navItemClass(active)} ${collapsed ? "justify-center px-0" : ""}`}
              >
                <span className="text-lg flex-shrink-0">{emoji}</span>
                {!collapsed && (
                  <span className="font-medium text-base">{label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`pb-5 flex-shrink-0 space-y-1 ${collapsed ? "px-1" : "px-4"}`}>
          <button
            onClick={() => { onSettings?.(); onClose(); }}
            title={collapsed ? t("sidebar.settings") : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-white/90 hover:bg-white/15 hover:text-white ${collapsed ? "justify-center px-0" : ""}`}
          >
            <span className="text-lg flex-shrink-0">⚙️</span>
            {!collapsed && <span className="font-medium text-base">{t("sidebar.settings")}</span>}
          </button>

          <button
            onClick={onLogout}
            title={collapsed ? t("sidebar.logout") : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-white/90 hover:bg-white/15 hover:text-white ${collapsed ? "justify-center px-0" : ""}`}
          >
            <span className="text-lg flex-shrink-0">🚪</span>
            {!collapsed && <span className="font-medium text-base">{t("sidebar.logout")}</span>}
          </button>

          {!collapsed && <p className="text-white/50 text-sm text-center pt-2">Powered by Hula</p>}
        </div>
      </aside>
    </>
  );
}
