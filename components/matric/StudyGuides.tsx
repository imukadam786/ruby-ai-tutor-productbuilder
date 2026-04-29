"use client";

import { useState } from "react";
import EduBackground from "@/components/EduBackground";
import PdfViewerModal from "@/components/matric/PdfViewerModal";
import { supabase } from "@/lib/supabase";

function getGuideUrl(filename: string) {
  const { data } = supabase.storage.from("study-guides").getPublicUrl(filename);
  return data.publicUrl;
}

interface Guide {
  label: string;
  description: string;
  filename: string;
}

interface Subject {
  emoji: string;
  label: string;
  color: string;
  guides?: Guide[];
}

const SUBJECTS: Subject[] = [
  {
    emoji: "📖",
    label: "English HL",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    guides: [
      {
        label: "Paper 1 — Comprehension & Language",
        description: "Reading comprehension, summary and language in context",
        filename: "eng-p1-may-jun-2026-studyguide1_compressed.pdf",
      },
      {
        label: "Paper 2 — Literature",
        description: "Poetry, drama, novel and short stories",
        filename: "eng-p2-may-jun-2026-studyguide2_compressed.pdf",
      },
      {
        label: "Paper 3 — Writing",
        description: "Essays, transactional writing and creative tasks",
        filename: "eng-p3-may-jun-2026-studyguide3_compressed.pdf",
      },
    ],
  },
  {
    emoji: "🗣️",
    label: "Afrikaans FAL",
    color: "bg-teal-50 text-teal-600 border-teal-100",
    guides: [
      {
        label: "Paper 1 — Comprehension & Language",
        description: "Begripstoets, opsomming en taalstrukture",
        filename: "afri-p1-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — Literature",
        description: "Poësie, drama en prosa",
        filename: "afri-p2-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 3 — Writing",
        description: "Opstel en transaksionele skryfwerk",
        filename: "afr-p3-may-jun-2026-studyguide_compressed.pdf",
      },
    ],
  },
  {
    emoji: "🔬",
    label: "Physical Sciences",
    color: "bg-green-50 text-green-600 border-green-100",
    guides: [
      {
        label: "Paper 1 — Physics",
        description: "Mechanics, waves, electricity and magnetism",
        filename: "physics-pp1-may-jun-studyguide-2026 (1)_compressed.pdf",
      },
      {
        label: "Paper 2 — Chemistry",
        description: "Matter & materials, chemical change and solutions",
        filename: "physics-pp2-may-jun-studyguide-2026_compressed.pdf",
      },
    ],
  },
  {
    emoji: "🏛️",
    label: "History",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    guides: [
      {
        label: "Paper 1 — South African History",
        description: "20th century South African and world history",
        filename: "his-pp1-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — World History",
        description: "Cold War, decolonisation and global change",
        filename: "his-pp2-may-jun-2026-studyguide_compressed.pdf",
      },
    ],
  },
];

interface StudyGuidesProps {
  onBack: () => void;
}

export default function StudyGuides({ onBack }: StudyGuidesProps) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [openGuide, setOpenGuide] = useState<{ url: string; title: string } | null>(null);

  function handleSubjectClick(subject: Subject) {
    if (subject.guides) setSelectedSubject(subject);
  }

  function handleGuideClick(guide: Guide, subjectLabel: string) {
    setOpenGuide({
      url: getGuideUrl(guide.filename),
      title: `${subjectLabel} — ${guide.label}`,
    });
  }

  if (openGuide) {
    return (
      <PdfViewerModal
        url={openGuide.url}
        title={openGuide.title}
        onClose={() => setOpenGuide(null)}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative max-w-4xl mx-auto px-6 sm:px-10 pt-8 pb-12">

        {/* Back button */}
        <button
          onClick={selectedSubject ? () => setSelectedSubject(null) : onBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">📚</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedSubject ? selectedSubject.label : "Study Guides"}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {selectedSubject
                  ? "Select a paper to open the study guide"
                  : "In-depth subject guides and summaries for matric learners."}
              </p>
            </div>
          </div>
          {!selectedSubject && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              More subjects being added — check back soon
            </div>
          )}
        </div>

        {/* Subject grid */}
        {!selectedSubject && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SUBJECTS.filter((s) => !!s.guides).map((s) => (
              <div
                key={s.label}
                onClick={() => handleSubjectClick(s)}
                className="rounded-2xl border bg-white p-5 flex flex-col items-center gap-3 text-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <span className="text-4xl">{s.emoji}</span>
                <span className="font-semibold text-gray-700 text-sm leading-snug">{s.label}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${s.color}`}>
                  {s.guides!.length} guide{s.guides!.length !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Guides list for selected subject */}
        {selectedSubject && (
          <div className="flex flex-col gap-4">
            {selectedSubject.guides!.map((guide) => (
              <button
                key={guide.filename}
                onClick={() => handleGuideClick(guide, selectedSubject.label)}
                className="w-full text-left bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                    <path d="M8.5 14.5h1.5v1.5H8.5zM8.5 11.5h7v1.5h-7zM8.5 17.5h7v1.5h-7z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{guide.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{guide.description}</p>
                </div>

                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
