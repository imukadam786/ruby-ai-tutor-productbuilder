"use client";

import { ActiveView } from "@/types";
import EduBackground from "@/components/EduBackground";

interface MatricsHubProps {
  onNavigate: (view: ActiveView) => void;
}

const CARDS = [
  {
    view: "matric" as ActiveView,
    title: "Past Papers",
    description: "Work through real NSC past exams with AI tutoring",
    emoji: "📝",
    from: "from-[#BE1832]",
    to: "to-[#C94060]",
  },
  {
    view: "prep-papers-2026" as ActiveView,
    title: "Prep Papers",
    description: "Practice with 2026 preparation papers",
    emoji: "📋",
    from: "from-blue-600",
    to: "to-blue-700",
  },
  {
    view: "matric" as ActiveView,
    title: "Study Guides",
    description: "Structured guides for every topic",
    emoji: "📚",
    from: "from-purple-600",
    to: "to-purple-700",
    comingSoon: true,
  },
];

export default function MatricsHub({ onNavigate }: MatricsHubProps) {
  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Matrics</h1>
            <p className="text-gray-500 text-sm mt-1">Prepare for your matric exams with real papers and guides.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CARDS.map((card) => (
              <button
                key={card.title}
                onClick={() => !card.comingSoon && onNavigate(card.view)}
                className={`relative rounded-2xl bg-gradient-to-br ${card.from} ${card.to} p-6 text-left shadow-sm hover:shadow-lg transition-all active:scale-[0.98] ${card.comingSoon ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {card.comingSoon && (
                  <span className="absolute top-3 right-3 bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
                <span className="text-3xl mb-3 block">{card.emoji}</span>
                <p className="font-bold text-white text-lg leading-tight">{card.title}</p>
                <p className="text-white/75 text-sm mt-1 leading-relaxed">{card.description}</p>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
