"use client";

import { ActiveView } from "@/types";

interface HomeScreenProps {
  onNavigate: (view: ActiveView) => void;
}

const learningModes = [
  {
    id: "chat" as ActiveView,
    title: "Chat",
    description: "Enhance your language skills by chatting with Ruby",
    icon: (
      <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
        <svg className="w-7 h-7 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </div>
    ),
  },
  {
    id: "lessons" as ActiveView,
    title: "Homework",
    description: "Complete your daily homework with Ruby",
    icon: (
      <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
        <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
        </svg>
      </div>
    ),
  },
  {
    id: "ruby" as ActiveView,
    title: "Study",
    description: "Take an assessment to prepare for your next test",
    icon: (
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
        <svg className="w-7 h-7 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
        </svg>
      </div>
    ),
  },
];

const quickActions = [
  {
    id: "continue",
    title: "Continue",
    subtitle: "Continue where you left off",
    bg: "bg-green-500",
    iconBg: "bg-green-400",
    view: "chat" as ActiveView,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
  },
  {
    id: "quickstart",
    title: "Quick Start",
    subtitle: "Explain Fractions with a story",
    bg: "bg-yellow-400",
    iconBg: "bg-yellow-300",
    view: "chat" as ActiveView,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
      </svg>
    ),
  },
  {
    id: "challenge",
    title: "Daily Challenge",
    subtitle: "Answer a question, earn 5 rubies",
    bg: "bg-orange-500",
    iconBg: "bg-orange-400",
    view: "ruby" as ActiveView,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
      </svg>
    ),
  },
  {
    id: "watchparty",
    title: "Watch Party",
    subtitle: "Learn by watching a Video",
    bg: "bg-blue-500",
    iconBg: "bg-blue-400",
    view: "watch" as ActiveView,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
      </svg>
    ),
  },
];

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="flex h-full bg-gray-100 overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Welcome banner */}
        <div
          className="w-full rounded-2xl p-8 mb-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #22c55e 0%, #a3e635 45%, #facc15 100%)",
            minHeight: "140px",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-white/20" />
          <div className="absolute right-28 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/15" />
          <h2 className="text-2xl font-bold text-gray-800 relative z-10">Welcome to Ruby!</h2>
        </div>

        {/* Learning modes */}
        <h3 className="text-base font-semibold text-gray-800 mb-3">Learning modes</h3>
        <div className="flex flex-col gap-3">
          {learningModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onNavigate(mode.id)}
              className="bg-white rounded-2xl p-5 flex items-center justify-between border border-gray-100 hover:shadow-md transition-shadow text-left w-full"
            >
              <div>
                <p className="font-semibold text-gray-800 text-base">{mode.title}</p>
                <p className="text-gray-400 text-sm mt-0.5">{mode.description}</p>
              </div>
              {mode.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Right panel - Quick Actions */}
      <div className="hidden lg:flex w-[280px] flex-col flex-shrink-0 p-6 gap-4 overflow-y-auto bg-gray-100">
        <h3 className="text-base font-semibold text-gray-800">Quick Actions</h3>
        <div className="flex flex-col gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.view)}
              className={`${action.bg} rounded-2xl p-4 flex items-center gap-3 text-left hover:opacity-90 transition-opacity`}
            >
              <div className={`${action.iconBg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                {action.icon}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{action.title}</p>
                <p className="text-white/80 text-xs mt-0.5">{action.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
