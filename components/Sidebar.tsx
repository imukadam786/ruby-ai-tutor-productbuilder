"use client";

import { useState, useEffect } from "react";
import { ActiveView } from "@/types";

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

const topItems: { id: ActiveView; emoji: string; label: string; desc: string }[] = [
  { id: "home",     emoji: "🏠", label: "Home",     desc: "Dashboard" },
  { id: "progress", emoji: "📊", label: "Progress", desc: "Your journey" },
];

const collapsibleSections = [
  {
    key: "general",
    label: "General Tutor",
    emoji: "💬",
    items: [
      { id: "chat" as ActiveView,  emoji: "📚", label: "Homework", desc: "Ask Ruby anything" },
      { id: "watch" as ActiveView, emoji: "▶️",  label: "Watch",    desc: "Video learning" },
    ],
  },
  {
    key: "maths",
    label: "Maths Engine",
    emoji: "🧮",
    items: [
      { id: "ruby" as ActiveView,       emoji: "🎯", label: "Maths",      desc: "Adaptive math tutor" },
      { id: "skill-tree" as ActiveView, emoji: "🌳", label: "Skill Tree", desc: "72 atomic skills" },
    ],
  },
  {
    key: "reading",
    label: "Reading Engine",
    emoji: "📖",
    items: [
      { id: "reading" as ActiveView,            emoji: "✏️", label: "Reading",    desc: "Reading & comprehension" },
      { id: "reading-skill-tree" as ActiveView, emoji: "🌳", label: "Skill Tree", desc: "Reading skills" },
    ],
  },
];

export default function Sidebar({
  activeView,
  onViewChange,
  isOpen,
  onClose,
  onSettings,
  onLogout,
}: SidebarProps) {
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
                <div className={`text-xs truncate ${activeView === id ? "text-blue-100" : "text-blue-400"}`}>{desc}</div>
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
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-blue-400 hover:text-blue-200 hover:bg-blue-800/40 transition-colors"
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
                        <div className={`text-xs truncate ${activeView === id ? "text-blue-100" : "text-blue-400"}`}>{desc}</div>
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
            onClick={onSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-blue-200 hover:bg-blue-800/60 hover:text-white"
          >
            <span className="text-lg flex-shrink-0">⚙️</span>
            <div className="min-w-0">
              <div className="font-medium text-sm">Settings</div>
              <div className="text-xs truncate text-blue-400">Preferences</div>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-blue-200 hover:bg-blue-800/60 hover:text-white"
          >
            <span className="text-lg flex-shrink-0">🚪</span>
            <div className="min-w-0">
              <div className="font-medium text-sm">Logout</div>
              <div className="text-xs truncate text-blue-400">Sign out</div>
            </div>
          </button>

          <p className="text-blue-500 text-xs text-center pt-2">Powered by Groq</p>
        </div>
      </aside>
    </>
  );
}
