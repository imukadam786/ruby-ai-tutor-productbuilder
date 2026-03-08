"use client";

import { useState } from "react";
import { ActiveView } from "@/types";

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  totalMessages: number;
  lessonsCompleted: number;
  topicsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

// ── SVG icon helpers ──────────────────────────────────────────────────────────
function HomeIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function ProgressIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function HomeworkIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function WatchIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
function MathsIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19V5a1 1 0 011-1h14a1 1 0 011 1v14a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
    </svg>
  );
}
function SkillTreeIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}
function ReadingIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const topItems: { id: ActiveView; label: string; Icon: () => JSX.Element }[] = [
  { id: "home",     label: "Home",     Icon: HomeIcon },
  { id: "progress", label: "Progress", Icon: ProgressIcon },
];

const collapsibleSections = [
  {
    key: "general",
    label: "General Tutor",
    items: [
      { id: "chat" as ActiveView,  label: "Homework", Icon: HomeworkIcon },
      { id: "watch" as ActiveView, label: "Watch",    Icon: WatchIcon },
    ],
  },
  {
    key: "maths",
    label: "Maths Learning Engine",
    items: [
      { id: "ruby" as ActiveView,       label: "Maths",      Icon: MathsIcon },
      { id: "skill-tree" as ActiveView, label: "Skill Tree", Icon: SkillTreeIcon },
    ],
  },
  {
    key: "reading",
    label: "Reading Learning Engine",
    items: [
      { id: "reading" as ActiveView,            label: "Reading",    Icon: ReadingIcon },
      { id: "reading-skill-tree" as ActiveView, label: "Skill Tree", Icon: SkillTreeIcon },
    ],
  },
];

export default function Sidebar({
  activeView,
  onViewChange,
  isOpen,
  onClose,
}: SidebarProps) {
  // All sections open by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    maths: true,
    reading: true,
  });

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleNav = (view: ActiveView) => {
    onViewChange(view);
    onClose();
  };

  const navItemClass = (active: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
      active
        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
        : "text-blue-200 hover:bg-blue-800/60 hover:text-white"
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
          bg-gradient-to-b from-blue-900 to-blue-950
          flex flex-col h-full shadow-xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-blue-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded-xl shadow-lg flex-shrink-0">
              <img
                src="/ruby-avatar.png"
                alt="Ruby"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = "flex";
                }}
              />
              <div
                className="w-full h-full bg-blue-400 items-center justify-center text-xl font-bold text-blue-900"
                style={{ display: "none" }}
              >
                R
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Ruby</h1>
              <p className="text-blue-300 text-xs mt-0.5">AI Tutor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-blue-300 hover:text-white p-1.5 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">

          {/* Top-level items: Home, Progress */}
          {topItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={navItemClass(activeView === id)}
            >
              <Icon />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}

          <div className="pt-2" />

          {/* Collapsible sections */}
          {collapsibleSections.map((section) => (
            <div key={section.key} className="space-y-1">
              {/* Section heading — clickable to collapse */}
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-blue-400 hover:text-blue-200 hover:bg-blue-800/40 transition-colors"
              >
                <span className="text-xs font-semibold uppercase tracking-widest">{section.label}</span>
                <ChevronIcon open={openSections[section.key]} />
              </button>

              {/* Items */}
              {openSections[section.key] && (
                <div className="space-y-1 pl-1">
                  {section.items.map(({ id, label, Icon }) => (
                    <button
                      key={id + label}
                      onClick={() => handleNav(id)}
                      className={navItemClass(activeView === id)}
                    >
                      <Icon />
                      <span className="font-medium text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-5 flex-shrink-0">
          <p className="text-blue-500 text-xs text-center">Powered by Groq</p>
        </div>
      </aside>
    </>
  );
}
