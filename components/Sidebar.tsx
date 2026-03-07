"use client";

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

const sections = [
  {
    label: "General Tutor",
    items: [
      { id: "chat" as ActiveView, icon: "💬", label: "Chat Tutor", desc: "Ask anything" },
      { id: "lessons" as ActiveView, icon: "📚", label: "Lessons", desc: "Structured learning" },
      { id: "progress" as ActiveView, icon: "📊", label: "Progress", desc: "Track your growth" },
    ],
  },
  {
    label: "Ruby Math Engine",
    items: [
      { id: "ruby" as ActiveView, icon: "🎯", label: "Diagnostic Session", desc: "Adaptive math tutor" },
      { id: "skill-tree" as ActiveView, icon: "🌳", label: "Skill Tree", desc: "72 atomic skills" },
      { id: "student-dashboard" as ActiveView, icon: "📈", label: "Student Profile", desc: "Mastery & analytics" },
    ],
  },
];

export default function Sidebar({
  activeView,
  onViewChange,
  totalMessages,
  lessonsCompleted,
  topicsCount,
  isOpen,
  onClose,
}: SidebarProps) {
  const handleViewChange = (view: ActiveView) => {
    onViewChange(view);
    onClose();
  };

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
            <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center text-xl font-bold text-blue-900 shadow-lg">
              R
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Rub</h1>
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
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-blue-500 text-xs font-semibold uppercase tracking-widest px-2 mb-2">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                      activeView === item.id
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "text-blue-200 hover:bg-blue-800/60 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className={`text-xs ${activeView === item.id ? "text-blue-100" : "text-blue-400"}`}>
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Stats */}
        <div className="px-4 pb-5 space-y-3 flex-shrink-0">
          <div className="bg-blue-800/40 rounded-xl p-3 space-y-2">
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider">Quick Stats</p>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-blue-200 text-xs">Messages</span>
                <span className="text-white text-sm font-semibold">{totalMessages}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200 text-xs">Lessons Done</span>
                <span className="text-white text-sm font-semibold">{lessonsCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200 text-xs">Topics Studied</span>
                <span className="text-white text-sm font-semibold">{topicsCount}</span>
              </div>
            </div>
          </div>
          <p className="text-blue-500 text-xs text-center">Powered by Groq</p>
        </div>
      </aside>
    </>
  );
}
