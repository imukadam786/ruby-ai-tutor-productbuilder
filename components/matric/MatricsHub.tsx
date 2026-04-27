"use client";

import { ActiveView } from "@/types";
import EduBackground from "@/components/EduBackground";

interface MatricsHubProps {
  onNavigate: (view: ActiveView) => void;
}

interface MatricCardProps {
  emoji: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  accentFrom: string;
  accentTo: string;
  disabled?: boolean;
  onClick: () => void;
}

function MatricCard({
  emoji,
  label,
  badge,
  badgeColor = "bg-gray-100 text-gray-600",
  accentFrom,
  accentTo,
  disabled,
  onClick,
}: MatricCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100 flex flex-col text-left transition-all ${disabled ? "opacity-60 cursor-not-allowed" : "active:opacity-80 hover:shadow-md"}`}
    >
      {/* Gradient header with large emoji — 4:3 ratio to match SubjectsHub */}
      <div
        className={`w-full bg-gradient-to-br ${accentFrom} ${accentTo} flex items-center justify-center flex-shrink-0`}
        style={{ aspectRatio: "4 / 3" }}
      >
        <span className="text-6xl">{emoji}</span>
      </div>
      {/* Label + badge stacked */}
      <div className="px-4 pt-3 pb-4 flex flex-col items-start gap-2">
        <span className="font-bold text-gray-900 text-base">{label}</span>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}

const CARDS: {
  view: ActiveView;
  label: string;
  emoji: string;
  accentFrom: string;
  accentTo: string;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
}[] = [
  {
    view: "matric",
    label: "Past Papers",
    emoji: "📝",
    accentFrom: "from-[#BE1832]",
    accentTo: "to-[#C94060]",
  },
  {
    view: "prep-papers-2026",
    label: "Prep Papers",
    emoji: "📋",
    accentFrom: "from-blue-600",
    accentTo: "to-blue-700",
  },
  {
    view: "matric",
    label: "Study Guides",
    emoji: "📚",
    accentFrom: "from-purple-600",
    accentTo: "to-purple-700",
    badge: "Coming Soon",
    badgeColor: "bg-gray-100 text-gray-500",
    disabled: true,
  },
];

export default function MatricsHub({ onNavigate }: MatricsHubProps) {
  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 sm:px-8 pt-8 pb-6">

          {/* Back button */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-6 transition-colors self-start"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Matrics</h1>
            <p className="text-gray-500 text-sm mt-1">Prepare for your matric exams with real papers and guides.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CARDS.map((card) => (
              <MatricCard
                key={card.label}
                emoji={card.emoji}
                label={card.label}
                badge={card.badge}
                badgeColor={card.badgeColor}
                accentFrom={card.accentFrom}
                accentTo={card.accentTo}
                disabled={card.disabled}
                onClick={() => !card.disabled && onNavigate(card.view)}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
