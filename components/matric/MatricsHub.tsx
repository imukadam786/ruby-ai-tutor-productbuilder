"use client";

import { ActiveView } from "@/types";
import EduBackground from "@/components/EduBackground";

interface MatricsHubProps {
  onNavigate: (view: ActiveView) => void;
}

interface MatricCardProps {
  image: string;
  label: string;
  caption: string;
  badge?: string;
  badgeColor?: string;
  onClick: () => void;
}

function MatricCard({
  image,
  label,
  caption,
  badge,
  badgeColor = "bg-gray-100 text-gray-600",
  onClick,
}: MatricCardProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100 flex flex-col text-left transition-all active:opacity-80 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Square image header */}
      <div className="w-full flex-shrink-0" style={{ aspectRatio: "1 / 1" }}>
        <img src={image} alt={label} className="w-full h-full object-cover" />
      </div>
      {/* Label + caption + badge */}
      <div className="px-5 pt-4 pb-5 flex flex-col items-start gap-1.5">
        <span className="font-bold text-gray-900 text-xl">{label}</span>
        <span className="text-sm text-gray-500 leading-snug">{caption}</span>
        {badge && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap mt-2 ${badgeColor}`}>
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
  caption: string;
  image: string;
  badge?: string;
  badgeColor?: string;
}[] = [
  {
    view: "matric",
    label: "Past Papers",
    caption: "Full NSC papers with detailed memos",
    image: "/matric/past-papers.jpeg",
  },
  {
    view: "prep-papers-2026",
    label: "Prep Papers",
    caption: "2026 preparation papers and solutions",
    image: "/matric/prep-papers.jpeg",
  },
  {
    view: "study-guides",
    label: "Study Guides",
    caption: "In-depth subject guides and summaries",
    image: "/matric/study-guides.jpeg",
  },
];

export default function MatricsHub({ onNavigate }: MatricsHubProps) {
  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 pt-8 pb-8">

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

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Matrics</h1>
            <p className="text-gray-500 text-sm mt-1">Prepare for your matric exams with real papers and guides.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CARDS.map((card) => (
              <MatricCard
                key={card.label}
                image={card.image}
                label={card.label}
                caption={card.caption}
                badge={card.badge}
                badgeColor={card.badgeColor}
                onClick={() => onNavigate(card.view)}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
