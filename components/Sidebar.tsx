"use client";

import React, { useState, useEffect } from "react";
import { ActiveView } from "@/types";
import { useT } from "@/lib/i18n";

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
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

  const topItems: { id: ActiveView; icon: React.ReactNode; label: string; desc: string }[] = [
    {
      id: "home",
      label: t("sidebar.home"),
      desc: t("sidebar.home_desc"),
      icon: <svg className="w-5 h-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    },
    {
      id: "progress",
      label: t("sidebar.progress"),
      desc: t("sidebar.progress_desc"),
      icon: <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
    {
      id: "matric",
      label: "Matric Prep",
      desc: "Past papers · Exam guidance",
      icon: <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
    },
  ];

  const collapsibleSections = [
    {
      key: "general",
      label: t("sidebar.general_tutor"),
      sectionIcon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
      items: [
        {
          id: "chat" as ActiveView,
          label: t("sidebar.homework"),
          desc: t("sidebar.homework_desc"),
          icon: <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" /></svg>,
        },
        {
          id: "watch" as ActiveView,
          label: t("sidebar.watch"),
          desc: t("sidebar.watch_desc"),
          icon: <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
        },
      ],
    },
    {
      key: "maths",
      label: t("sidebar.maths_engine"),
      sectionIcon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19V5a1 1 0 011-1h14a1 1 0 011 1v14a2 2 0 01-2 2H6a2 2 0 01-2-2z" /></svg>,
      items: [
        {
          id: "ruby" as ActiveView,
          label: t("sidebar.maths"),
          desc: t("sidebar.maths_desc"),
          icon: <svg className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19V5a1 1 0 011-1h14a1 1 0 011 1v14a2 2 0 01-2 2H6a2 2 0 01-2-2z" /></svg>,
        },
        {
          id: "skill-tree" as ActiveView,
          label: t("sidebar.skill_tree"),
          desc: t("sidebar.skill_tree_desc"),
          icon: <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
        },
      ],
    },
    {
      key: "reading",
      label: t("sidebar.reading_engine"),
      sectionIcon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      items: [
        {
          id: "reading" as ActiveView,
          label: t("sidebar.reading"),
          desc: t("sidebar.reading_desc"),
          icon: <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        },
        {
          id: "reading-skill-tree" as ActiveView,
          label: t("sidebar.skill_tree"),
          desc: t("sidebar.reading_skill_tree_desc"),
          icon: <svg className="w-5 h-5 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
        },
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
        ? "bg-white/25 text-white shadow-lg shadow-black/10"
        : "text-white/75 hover:bg-white/15 hover:text-white"
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
          bg-gradient-to-b from-[#BE1832] to-[#E8305A]
          flex flex-col h-full shadow-xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/20 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
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
            <div>
              <h1 className="text-white font-bold text-xl leading-none">Ruby</h1>
              <p className="text-white/70 text-sm mt-0.5">AI Tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
          {/* Language picker — desktop only (mobile has it in top bar) */}
          <button
            onClick={onOpenLangPicker}
            className="hidden md:block p-1.5 rounded-lg transition-opacity hover:opacity-80"
            aria-label="Change language"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
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
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">

          {/* Top-level items */}
          {topItems.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={navItemClass(activeView === id)}
            >
              <span className="flex-shrink-0">{icon}</span>
              <div className="font-medium text-base">{label}</div>
            </button>
          ))}

          <div className="pt-2" />

          {/* Collapsible sections */}
          {collapsibleSections.map((section) => (
            <div key={section.key} className="space-y-1">
              {/* Section heading */}
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 mr-1">
                  <span className="flex-shrink-0 opacity-70">{section.sectionIcon}</span>
                  <span className="text-sm font-semibold leading-tight">{section.label}</span>
                </div>
                <ChevronIcon open={openSections[section.key]} />
              </button>

              {/* Items */}
              {openSections[section.key] && (
                <div className="space-y-1 pl-1">
                  {section.items.map(({ id, icon, label, desc }) => (
                    <button
                      key={id + label}
                      onClick={() => handleNav(id)}
                      className={navItemClass(activeView === id)}
                    >
                      <span className="flex-shrink-0">{icon}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-base">{label}</div>
                        <div className={`text-sm truncate ${activeView === id ? "text-white/90" : "text-white/55"}`}>{desc}</div>
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-white/75 hover:bg-white/15 hover:text-white"
          >
            <span className="text-lg flex-shrink-0">⚙️</span>
            <div className="font-medium text-base">{t("sidebar.settings")}</div>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-white/75 hover:bg-white/15 hover:text-white"
          >
            <span className="text-lg flex-shrink-0">🚪</span>
            <div className="font-medium text-base">{t("sidebar.logout")}</div>
          </button>

          <p className="text-white/50 text-sm text-center pt-2">Powered by Hula</p>
        </div>
      </aside>
    </>
  );
}
