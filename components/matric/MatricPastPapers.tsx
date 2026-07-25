"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { apiFetch } from "@/lib/fetch";
import EduBackground from "@/components/EduBackground";
import { Paper, SubQuestion, InfoSheet, getFlatSubQuestions, getTopicBreakdown } from "@/lib/matric/papers";
import { PAPER_INDEX, PaperMeta, loadPaperById } from "@/lib/matric/paper-index";
import { FORMULA_SHEETS } from "@/lib/matric/formula-sheets";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import MatricFeedbackCard, { RubricPoint } from "./MatricFeedbackCard";
import { resolvePrimarySkill } from "@/lib/phys-sci-topic-map";

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "subjects" | "papers" | "mode" | "session" | "summary";
type SessionMode = "practice" | "guided";

interface CoachMessage {
  type: "ai" | "system";
  content: string;
  marksEarned?: number;
  totalMarks?: number;
  breakdown?: RubricPoint[];
}

interface QuestionState {
  textWorking: string;
  calcAnswer: string;    // "calculation" type: final answer field
  col2Working: string;   // "two-column" / "answer-book": right column (answer-book stores JSON StatementRowData[])
  selectedOption?: string; // MCQ: "A" | "B" | "C" | "D"
  matchAnswers?: Record<string, string>; // match-group: row label → selected letter
  imageFile?: File;
  imagePreviewUrl?: string;
  imageData?: string;
  imageMimeType?: string;
  submitted: boolean;
  marksEarned: number;
  coachMessages: CoachMessage[];
  attemptCount: number;
}

interface StatementRowData { desc: string; amount: string }

function formatStatementForEvaluator(raw: string, label: string): string {
  if (!raw.trim()) return `${label}: (no statement provided)`;
  try {
    const rows = JSON.parse(raw) as StatementRowData[];
    if (Array.isArray(rows)) {
      const lines = rows
        .filter(r => r.desc?.trim() || r.amount?.trim())
        .map(r => `${(r.desc ?? "").padEnd(45)} ${r.amount ?? ""}`)
        .join("\n");
      return `${label}:\n${lines || "(no entries)"}`;
    }
  } catch { /* not JSON — use raw */ }
  return `${label}:\n${raw}`;
}

function hasStatementContent(raw: string): boolean {
  if (!raw.trim()) return false;
  try {
    const rows = JSON.parse(raw) as StatementRowData[];
    if (Array.isArray(rows)) return rows.some(r => r.desc?.trim() || r.amount?.trim());
  } catch { /* not JSON */ }
  return true;
}

const SA_LANGUAGES = [
  "English",
  "Afrikaans",
  "isiZulu",
  "isiXhosa",
  "Sesotho",
  "Setswana",
  "Sepedi",
  "Tshivenda",
  "Xitsonga",
  "siSwati",
  "isiNdebele",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Markdown renderer with math support ───────────────────────────────────────

function MathMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1">{children}</ol>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ── Subject data ───────────────────────────────────────────────────────────────

const CONTAIN_THUMBNAILS = new Set([
  "/thumbnails/afrikaans-fal.webp",
  "/thumbnails/business-studies.webp",
  "/thumbnails/economics.webp",
  "/thumbnails/tourism.webp",
]);

const SUBJECTS = [
  {
    id: "accounting",
    name: "Accounting",
    thumbnail: "/thumbnails/accounting.webp",
    color: "from-emerald-500 to-teal-600",
    available: true,
  },
  {
    id: "agricultural-sciences",
    name: "Agricultural Sciences",
    thumbnail: "/thumbnails/agricultural-science.webp",
    color: "from-lime-600 to-green-700",
    available: true,
  },
  {
    id: "afrikaans",
    name: "Afrikaans",
    thumbnail: "/thumbnails/afrikaans-fal.webp",
    color: "from-orange-400 to-amber-500",
    available: true,
  },
  {
    id: "business-studies",
    name: "Business Studies",
    thumbnail: "/thumbnails/business-studies.webp",
    color: "from-blue-500 to-indigo-600",
    available: true,
  },
  {
    id: "economics",
    name: "Economics",
    thumbnail: "/thumbnails/economics.webp",
    color: "from-green-600 to-emerald-700",
    available: true,
  },
  {
    id: "english",
    name: "English",
    thumbnail: "/thumbnails/english.webp",
    color: "from-sky-400 to-blue-500",
    available: true,
  },
  {
    id: "geography",
    name: "Geography",
    thumbnail: "/thumbnails/geography.webp",
    color: "from-lime-500 to-green-600",
    available: true,
  },
  {
    id: "history",
    name: "History",
    thumbnail: "/thumbnails/history.webp",
    color: "from-amber-500 to-yellow-600",
    available: true,
  },
  {
    id: "life-sciences",
    name: "Life Sciences",
    thumbnail: "/thumbnails/life-sciences.webp",
    color: "from-pink-500 to-rose-600",
    available: true,
  },
  {
    id: "mathematics",
    name: "Mathematics",
    thumbnail: "/thumbnails/mathematics.webp",
    color: "from-brand to-rose-700",
    available: true,
  },
  {
    id: "maths-literacy",
    name: "Maths Literacy",
    thumbnail: "/thumbnails/maths-literacy.webp",
    color: "from-violet-500 to-purple-600",
    available: true,
  },
  {
    id: "physical-science",
    name: "Physical Science",
    thumbnail: "/thumbnails/physical-science.webp",
    color: "from-cyan-500 to-blue-600",
    available: true,
  },
  {
    id: "tourism",
    name: "Tourism",
    thumbnail: "/thumbnails/tourism.webp",
    color: "from-teal-400 to-cyan-600",
    available: true,
  },
] as const;

type SubjectId = (typeof SUBJECTS)[number]["id"];

// ── Subject Select ─────────────────────────────────────────────────────────────

function SubjectSelect({ onSelect, onBack }: { onSelect: (subjectId: SubjectId) => void; onBack: () => void }) {
  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative max-w-3xl mx-auto px-5 py-10 space-y-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Past Papers</h1>
          <p className="text-gray-500 text-sm">Work through real past papers with step-by-step AI tutoring. Get feedback in your home language.</p>
        </div>

        {/* Subject cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Choose a subject</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUBJECTS.map((subject) => (
              <button
                key={subject.id}
                onClick={() => onSelect(subject.id as SubjectId)}
                className="relative rounded-2xl text-left transition-all group overflow-hidden bg-white border-2 border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-gray-300"
              >
                <div className="w-full aspect-square overflow-hidden">
                  <img
                    src={subject.thumbnail}
                    alt={subject.name}
                    className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${CONTAIN_THUMBNAILS.has(subject.thumbnail) ? "object-contain p-3" : "object-cover"}`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center">
          More subjects and papers added regularly. All papers are official NSC past exams.
        </p>
      </div>
    </div>
  );
}

// ── Progress helpers (Supabase) ────────────────────────────────────────────────

type PaperProgressStatus = "not_started" | "in_progress" | "completed";
interface PaperProgress { status: PaperProgressStatus; pct?: number }

async function getPaperProgress(paperId: string): Promise<PaperProgress> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: "not_started" };
    const { data } = await supabase
      .from("matric_paper_progress")
      .select("status, pct")
      .eq("user_id", user.id)
      .eq("paper_id", paperId)
      .maybeSingle();
    if (!data) return { status: "not_started" };
    return { status: data.status as PaperProgressStatus, pct: data.pct ?? undefined };
  } catch { return { status: "not_started" }; }
}

function savePaperProgress(paperId: string, status: "in_progress" | "completed", pct?: number) {
  void (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("matric_paper_progress").upsert(
        { user_id: user.id, paper_id: paperId, status, pct: pct ?? null, updated_at: new Date().toISOString() },
        { onConflict: "user_id,paper_id" }
      );
    } catch { /* non-critical */ }
  })();
}

// ── Paper List ─────────────────────────────────────────────────────────────────

const ALL_YEARS = [2025, 2024, 2023, 2022, 2021];

// Exam-session tabs. Year-end ("November") papers and mid-year ("May/June")
// papers can both exist for the same subject/year, so the list is split by tab.
type SessionTab = "June" | "November";
const SESSION_TAB_LABEL: Record<SessionTab, string> = {
  June: "May/June",
  November: "November",
};

function sessionTabOf(session: string): SessionTab | null {
  const s = session.toLowerCase();
  if (s.startsWith("nov")) return "November";
  if (s.includes("jun")) return "June"; // "May/June", "May-June"
  return null; // Prep/Predictive are filtered out before this runs
}

function PaperList({
  subjectId,
  onSelect,
  onBack,
}: {
  subjectId: SubjectId;
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  const subject = SUBJECTS.find((s) => s.id === subjectId)!;
  const papers: PaperMeta[] = PAPER_INDEX.filter(
    (p) =>
      p.subject.toLowerCase().replace(/\s+/g, "-") === subjectId &&
      !p.session.startsWith("Prep") &&
      !p.session.startsWith("Predictive")
  );
  const [expandedCode, setExpandedCode] = useState<"P1" | "P2" | null>("P1");
  const [progressMap, setProgressMap] = useState<Record<string, PaperProgress>>({});

  // Show the session toggle only when this subject actually has year-end papers.
  const hasNovember = papers.some((p) => sessionTabOf(p.session) === "November");
  const [sessionTab, setSessionTab] = useState<SessionTab>("June");
  const visiblePapers = papers.filter((p) => sessionTabOf(p.session) === sessionTab);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const paperIds = papers.map((p) => p.id);
      if (paperIds.length === 0) return;
      const { data } = await supabase
        .from("matric_paper_progress")
        .select("paper_id, status, pct")
        .eq("user_id", user.id)
        .in("paper_id", paperIds);
      if (!data) return;
      const map: Record<string, PaperProgress> = {};
      for (const row of data) {
        map[row.paper_id as string] = { status: row.status as PaperProgressStatus, pct: row.pct ?? undefined };
      }
      setProgressMap(map);
    })();
  }, [subjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const papersByCode = (code: "P1" | "P2") =>
    visiblePapers.filter((p) => p.paperCode === code).sort((a, b) => b.year - a.year);

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />
      <div className="relative max-w-2xl mx-auto px-5 py-10 space-y-8">

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All subjects
        </button>

        {/* Subject header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
            <img src={subject.thumbnail} alt={subject.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{subject.name}</h1>
            <p className="text-sm text-gray-400">{visiblePapers.length} {visiblePapers.length === 1 ? "paper" : "papers"} available</p>
          </div>
        </div>

        {/* Exam-session toggle — only when this subject has year-end papers */}
        {hasNovember && (
          <div className="inline-flex rounded-xl bg-gray-100 p-1 gap-1">
            {(["June", "November"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSessionTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  sessionTab === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {SESSION_TAB_LABEL[tab]}
              </button>
            ))}
          </div>
        )}

        {/* Accordion: one card per paper code */}
        <div className="space-y-3">
          {(["P1", "P2"] as const).map((code) => {
            const codeLabel = code === "P1" ? "1" : "2";
            const codeGroup = papersByCode(code);
            const isOpen = expandedCode === code;

            return (
              <div
                key={code}
                className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden transition-all"
              >
                {/* Accordion header */}
                <button
                  onClick={() => setExpandedCode(isOpen ? null : code)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                      <img
                        src={subject.thumbnail}
                        alt={subject.name}
                        className={`w-full h-full ${CONTAIN_THUMBNAILS.has(subject.thumbnail) ? "object-contain p-1" : "object-cover"}`}
                      />
                    </div>
                    <span className="font-bold text-gray-900 text-base">
                      {subject.name} Paper {codeLabel}
                    </span>
                    {codeGroup.length > 0 && (
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {codeGroup.length} available
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Year rows */}
                {isOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {ALL_YEARS.map((year) => {
                      const paper = codeGroup.find((p) => p.year === year);
                      const isLatest = year === 2025;

                      if (!paper) {
                        return (
                          <div
                            key={year}
                            className="px-5 py-4 flex items-center justify-between opacity-40 cursor-not-allowed"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-500">{SESSION_TAB_LABEL[sessionTab]} {year}</p>
                              <p className="text-xs text-gray-400 mt-0.5">Coming soon</p>
                            </div>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Soon</span>
                          </div>
                        );
                      }

                      const progress: PaperProgress = progressMap[paper.id] ?? { status: "not_started" };

                      return (
                        <button
                          key={year}
                          onClick={() => onSelect(paper.id)}
                          className={`w-full text-left px-5 group transition-colors ${
                            isLatest ? "py-5 hover:bg-rose-50" : "py-4 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            {/* Left: year + meta */}
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Session + year label */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-extrabold text-gray-900 ${isLatest ? "text-xl" : "text-base"}`}>
                                  {paper.session} {year}
                                </span>
                                {isLatest && (
                                  <span className="text-xs font-semibold bg-brand text-white px-2.5 py-0.5 rounded-full">
                                    Latest
                                  </span>
                                )}
                              </div>

                              {/* Stats row with icons */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <span>📝</span>
                                  <span className="font-medium">{paper.totalMarks} marks</span>
                                </span>
                                <span className="text-gray-200">·</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <span>⏱</span>
                                  <span className="font-medium">{paper.durationHours} hours</span>
                                </span>
                                <span className="text-gray-200">·</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <span>❓</span>
                                  <span className="font-medium">{paper.questionCount} questions</span>
                                </span>
                              </div>

                              {/* QP + Memo availability (non-clickable) */}
                              <div className="flex items-center gap-3">
                                {paper.hasQuestionPaper && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <span className="text-green-500">✅</span> Question Paper
                                  </span>
                                )}
                                {paper.hasMemo && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <span className="text-green-500">✅</span> Memo
                                  </span>
                                )}
                              </div>

                              {/* Progress bar */}
                              <div className="flex items-center gap-2">
                                {progress.status === "not_started" && (
                                  <>
                                    <div className="flex-1 max-w-[120px] h-1.5 bg-gray-100 rounded-full" />
                                    <span className="text-xs font-semibold text-brand">Get Started 🚀 · 0%</span>
                                  </>
                                )}
                                {progress.status === "in_progress" && (
                                  <>
                                    <div className="flex-1 max-w-[120px] h-1.5 bg-amber-100 rounded-full overflow-hidden">
                                      <div className="h-full w-1/3 bg-amber-400 rounded-full" />
                                    </div>
                                    <span className="text-xs text-amber-600 font-medium">In progress</span>
                                  </>
                                )}
                                {progress.status === "completed" && (
                                  <>
                                    <div className="flex-1 max-w-[120px] h-1.5 bg-green-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${progress.pct ?? 0}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-green-600 font-semibold">
                                      Completed · {progress.pct ?? 0}%
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Red chevron */}
                            <svg
                              className="w-5 h-5 text-brand flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
                              fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 text-center">All papers are official NSC past exams.</p>
      </div>
    </div>
  );
}

// ── Mode Select ────────────────────────────────────────────────────────────────

function ModeSelect({
  paper,
  onStart,
  onBack,
}: {
  paper: Paper;
  onStart: (mode: SessionMode, language: string) => void;
  onBack: () => void;
}) {
  // Guided Mode pre-selected as the recommended default
  const [mode, setMode] = useState<SessionMode>("guided");
  const [language, setLanguage] = useState("English");

  const SESSION_META: Record<SessionMode, string> = {
    practice: "3 hours · Timer starts immediately",
    guided: "Untimed · You can pause anytime",
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-5 py-10 space-y-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to papers
        </button>

        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            {paper.subject} · Paper {paper.paperCode} · {paper.session} {paper.year}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Choose your mode</h1>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              {
                id: "practice" as SessionMode,
                emoji: "🎯",
                title: "Practice Mode",
                subtitle: "Exam simulation",
                recommendation: "Recommended for exams",
                recommendationColor: "text-blue-600 bg-blue-50",
                bullets: [
                  "No AI help during the paper",
                  "Work through all questions",
                  "AI evaluates at the end",
                  "Full mark breakdown & report",
                ],
                color: "border-blue-200 bg-blue-50",
                activeColor: "border-blue-500 bg-blue-50 ring-2 ring-blue-400",
              },
              {
                id: "guided" as SessionMode,
                emoji: "📚",
                title: "Guided Mode",
                subtitle: "Learn with AI coaching",
                recommendation: "Best for learning",
                recommendationColor: "text-brand bg-rose-50",
                bullets: [
                  "AI evaluates after each question",
                  "Step-by-step hints available",
                  "Feedback in your home language",
                  "No time pressure",
                ],
                color: "border-rose-200 bg-rose-50",
                activeColor: "border-brand bg-rose-50 ring-2 ring-brand",
              },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`text-left rounded-2xl border-2 p-5 transition-all ${
                mode === m.id ? m.activeColor : m.color + " hover:opacity-80"
              }`}
            >
              {/* Recommendation badge */}
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-3 ${m.recommendationColor}`}>
                {m.recommendation}
              </span>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{m.emoji}</span>
                <div>
                  <p className="font-bold text-gray-800">{m.title}</p>
                  <p className="text-xs text-gray-500">{m.subtitle}</p>
                </div>
                {mode === m.id && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <ul className="space-y-1">
                {m.bullets.map((b) => (
                  <li key={b} className="text-sm text-gray-600 flex items-start gap-1.5">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0">·</span>
                    {b}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Language selector — elevated prominence */}
        <div className="bg-white rounded-2xl border-2 border-brand/20 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌍</span>
            <div>
              <label className="text-sm font-bold text-gray-800">Response language</label>
              <p className="text-xs text-gray-500 mt-0.5">Ruby will give you feedback in this language, choose your home language for the best experience.</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          >
            {SA_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Session info copy */}
        <p className="text-sm text-center text-gray-500 font-medium">
          {SESSION_META[mode]}
        </p>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => onStart(mode, language)}
        >
          {mode === "practice" ? "Start Practice Exam" : "Start Guided Session"}
        </Button>
      </div>
    </div>
  );
}

// ── Info Sheet Modal ───────────────────────────────────────────────────────────

function InfoSheetModal({ sheet, onClose }: { sheet: InfoSheet; onClose: () => void }) {
  const markdownContent = sheet.formulaSheetVariant
    ? FORMULA_SHEETS[sheet.formulaSheetVariant]
    : null;

  const isPdf = !!sheet.pdfUrl;
  const [pdfError, setPdfError] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* Drawer panel slides in from right */}
      <div className={`relative bg-white w-full sm:max-w-[520px] flex flex-col shadow-2xl ${isPdf ? "h-full" : "h-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="font-bold text-gray-800 text-sm">{sheet.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isPdf && (
              <a
                href={sheet.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand font-medium hover:underline px-2 py-1"
              >
                Open in new tab
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {/* Content */}
        {isPdf ? (
          pdfError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-semibold text-gray-600">Data sheet not yet uploaded</p>
              <p className="text-xs text-gray-400">Upload the PDF to Supabase storage as:<br /><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{sheet.pdfUrl?.split("/").pop()}</code></p>
            </div>
          ) : (
            <iframe
              src={sheet.pdfUrl}
              className="flex-1 w-full"
              title={sheet.title}
              onError={() => setPdfError(true)}
            />
          )
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 text-sm text-gray-700">
            {markdownContent && (
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h2: ({ children }) => <h2 className="text-base font-bold text-gray-800 mt-4 first:mt-0">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-700 mt-3">{children}</h3>,
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  hr: () => <hr className="border-gray-200 my-3" />,
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            )}
            {sheet.imageUrls?.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${sheet.title} page ${i + 1}`}
                className="w-full rounded-xl border border-gray-200"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Session View ───────────────────────────────────────────────────────────────


function SessionView({
  paper,
  mode,
  language,
  onFinish,
  onBack,
}: {
  paper: Paper;
  mode: SessionMode;
  language: string;
  onFinish: (attempts: Record<string, QuestionState>) => void;
  onBack: () => void;
}) {
  const flatQuestions = getFlatSubQuestions(paper);
  const totalQuestions = flatQuestions.length;

  // Map each top-level question to the first flat index
  const questionStartIndices = paper.questions.map((q) =>
    flatQuestions.findIndex((sq) => sq.id === q.subQuestions[0].id)
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, QuestionState>>(() => {
    const init: Record<string, QuestionState> = {};
    flatQuestions.forEach((sq) => {
      init[sq.id] = {
        textWorking: "",
        calcAnswer: "",
        col2Working: "",
        submitted: false,
        marksEarned: 0,
        coachMessages: [],
        attemptCount: 0,
      };
    });
    return init;
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmittingPaper, setIsSubmittingPaper] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [expandedDiagramUrl, setExpandedDiagramUrl] = useState<string | null>(null);
  const isMaths = paper.subject === "Mathematics";
  const STEP_LABELS = ["Step 1", "Step 2", "Step 3", "Step 4", "Final Answer"];

  const MATH_SYMBOLS: { label: string; insert: string }[] = [
    { label: "x²", insert: "²" }, { label: "x³", insert: "³" },
    { label: "√", insert: "√" },
    { label: "×", insert: "×" }, { label: "÷", insert: "÷" }, { label: "±", insert: "±" },
    { label: "≤", insert: "≤" }, { label: "≥", insert: "≥" }, { label: "≠", insert: "≠" },
    { label: "π", insert: "π" }, { label: "°", insert: "°" },
  ];

  const [mathsSteps, setMathsSteps] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    flatQuestions.forEach((sq) => { init[sq.id] = ["", "", "", "", ""]; });
    return init;
  });

  const [mobileTab, setMobileTab] = useState<"question" | "feedback">("question");
  const wasEvaluating = useRef(false);

  // Reset hint level and mobile tab when question changes
  useEffect(() => {
    setHintLevel(0);
    setMobileTab("question");
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-switch to feedback tab on mobile after evaluation completes
  useEffect(() => {
    if (wasEvaluating.current && !isEvaluating && mode === "guided") {
      setMobileTab("feedback");
    }
    wasEvaluating.current = isEvaluating;
  }, [isEvaluating, mode]);

  // Show scroll hint when question panel content overflows (mobile)
  useEffect(() => {
    const el = questionPanelRef.current;
    if (!el) return;
    el.scrollTop = 0;
    setShowScrollHint(el.scrollHeight > el.clientHeight + 8);
  }, [currentIdx]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coachEndRef = useRef<HTMLDivElement>(null);
  const mathsInputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const activeMathsKey = useRef<string | null>(null);
  const questionPanelRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const currentSQ = flatQuestions[currentIdx];
  const currentAttempt = attempts[currentSQ.id];

  // Derive 3-level hints from memoText — progressively more revealing, no AI call needed
  const buildHints = (memoText: string, marks: number, type?: string): [string, string, string] => {
    const text = memoText.trim();
    const marksLabel = `${marks} mark${marks !== 1 ? "s" : ""}`;

    // MCQ — detect by question type or memo pattern
    const mcqMatch = text.match(/correct answer:\s*([A-E])/i);
    if (type === "mcq" || mcqMatch) {
      const letter = mcqMatch?.[1]?.toUpperCase();
      const explanationLines = text.split("\n").map(l => l.trim()).filter(l => l && !l.match(/correct answer:/i));
      const explanation = explanationLines.join(" ").trim();
      return [
        `Multiple choice — read each option carefully and eliminate the ones that are clearly wrong. This question is worth ${marksLabel}.`,
        explanation ? `Think about this: ${explanation}` : "Consider what the question is really testing, then match it to the correct concept.",
        letter ? `The correct answer is ${letter}.${explanation ? ` ${explanation}` : ""}` : explanation || "Review the options again carefully.",
      ];
    }

    // Mark scheme format — "Mark 1: ...", "Mark 2: ..."
    const markLines = text.split("\n").filter(l => l.trim().match(/^mark \d+:/i));
    if (markLines.length > 0) {
      const clean = (line: string) => line.replace(/^mark \d+:\s*/i, "").trim();
      const steps = markLines.slice(0, 3).map(clean);
      return [
        `This question is worth ${marksLabel} across ${markLines.length} step${markLines.length !== 1 ? "s" : ""}. Plan your answer to cover each step.`,
        `Start with: ${steps[0]}`,
        steps.map((s, i) => `Step ${i + 1}: ${s}`).join("\n"),
      ];
    }

    // Calculation format — has "Working:" or "Answer:" sections
    const workingMatch = text.match(/working:?\s*([^\n]+)/i);
    const answerMatch = text.match(/answer:?\s*([^\n]+)/i);
    const teachingMatch = text.match(/teaching point:?\s*([^\n]+)/i);
    if (workingMatch || answerMatch) {
      const working = workingMatch?.[1]?.trim();
      const answer = answerMatch?.[1]?.trim();
      const teaching = teachingMatch?.[1]?.trim();
      return [
        `Show all working — each correct step earns marks. This question is worth ${marksLabel}.`,
        working ? `Approach: ${working}` : (teaching || "Write down your formula first, then substitute your values step by step."),
        [working && `Working: ${working}`, answer && `Answer: ${answer}`].filter(Boolean).join("\n") || teaching || text.substring(0, 150),
      ];
    }

    // Short/simple answer (1–3 lines, no mark structure)
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length <= 3 && !text.match(/any other relevant/i)) {
      const answer = lines[0];
      const words = answer.split(/\s+/);
      const partial = words.length <= 2
        ? `It starts with "${words[0].charAt(0)}…"`
        : answer.substring(0, Math.ceil(answer.length * 0.45)) + "…";
      return [
        `This question is worth ${marksLabel}. Think about the specific term or concept being asked for.`,
        partial,
        answer,
      ];
    }

    // Narrative/essay format (history, long answers)
    const contentLines = lines.filter(l => !l.match(/any other relevant|^\(\d|\(\d\s*x\s*\d/i));
    const hint2 = contentLines[0]
      ? `Your answer should include: "${contentLines[0].substring(0, 100)}${contentLines[0].length > 100 ? "…" : ""}"`
      : "Recall the key facts and evidence related to this topic.";
    const hint3 = contentLines.slice(0, 2).map(l => `• ${l.substring(0, 90)}${l.length > 90 ? "…" : ""}`).join("\n") || text.substring(0, 150);
    return [
      `This question is worth ${marksLabel}. Use specific facts, examples, or evidence in your answer.`,
      hint2,
      hint3,
    ];
  };
  const [hint1, hint2, hint3] = buildHints(currentSQ.memoText, currentSQ.marks, currentSQ.type);

  // Scroll coach panel to bottom when new messages arrive
  useEffect(() => {
    coachEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [attempts, currentIdx]);

  // Initialise coach welcome message for guided mode
  useEffect(() => {
    if (mode === "guided" && currentAttempt.coachMessages.length === 0 && !currentAttempt.submitted) {
      setAttempts((prev) => ({
        ...prev,
        [currentSQ.id]: {
          ...prev[currentSQ.id],
          coachMessages: [
            {
              type: "system",
              content:
                `Show me your working for **${currentSQ.label}** below. Type it out or upload a photo of your handwritten work.`,
            },
          ],
        },
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, mode]);

  const updateAttempt = useCallback(
    (id: string, patch: Partial<QuestionState>) => {
      setAttempts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    },
    []
  );

  const insertMathSymbol = useCallback((sym: string) => {
    const key = activeMathsKey.current;
    if (!key) return;
    const el = mathsInputRefs.current[key];
    if (!el) return;
    const [sqId, stepIdxStr] = key.split("::") as [string, string];
    const stepIdx = parseInt(stepIdxStr, 10);
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const newVal = el.value.slice(0, start) + sym + el.value.slice(end);
    const steps = mathsSteps[sqId] ?? ["", "", "", "", ""];
    const updated = [...steps];
    updated[stepIdx] = newVal;
    setMathsSteps((prev) => ({ ...prev, [sqId]: updated }));
    updateAttempt(sqId, {
      textWorking: updated
        .map((v, j) => (v.trim() ? `${STEP_LABELS[j]}: ${v.trim()}` : ""))
        .filter(Boolean)
        .join("\n"),
    });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + sym.length, start + sym.length);
    });
  }, [mathsSteps, updateAttempt]);

  const handleImageSelected = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    updateAttempt(currentSQ.id, {
      imageFile: file,
      imagePreviewUrl: previewUrl,
    });
  };

  const removeImage = () => {
    const prev = attempts[currentSQ.id];
    if (prev.imagePreviewUrl) URL.revokeObjectURL(prev.imagePreviewUrl);
    updateAttempt(currentSQ.id, {
      imageFile: undefined,
      imagePreviewUrl: undefined,
      imageData: undefined,
      imageMimeType: undefined,
    });
  };

  const evaluateQuestion = useCallback(
    async (sq: SubQuestion, attempt: QuestionState, finalMode?: "practice") => {
      const isFinal = finalMode === "practice";
      const isMCQ = sq.type === "mcq" && sq.options;
      const isCalc = sq.type === "calculation";
      const isTwoCol = sq.type === "two-column";
      const isAnswerBook = sq.type === "answer-book";
      const isMatchGroup = sq.type === "match-group" && sq.matchRows && sq.matchOptions;

      // Embed options into question text for MCQ / match-group so the AI has full context
      const questionText = isMCQ
        ? `${sq.questionText}\n\n${Object.keys(sq.options!)
            .sort()
            .filter((l) => sq.options![l as keyof typeof sq.options] !== undefined)
            .map((l) => `${l}) ${sq.options![l as keyof typeof sq.options]}`)
            .join("\n")}`
        : isMatchGroup
        ? `${sq.questionText}\n\nCOLUMN A:\n${sq.matchRows!.map((r) => `${r.label} — ${r.term}`).join("\n")}\n\nCOLUMN B:\n${Object.entries(sq.matchOptions!).map(([l, v]) => `${l} — ${v}`).join("\n")}`
        : sq.questionText;

      // Build studentText based on input type
      const studentText = isMCQ
        ? `Student selected: ${attempt.selectedOption ?? "(no answer selected)"}`
        : isMatchGroup
        ? sq.matchRows!.map((r) => `${r.label}: ${attempt.matchAnswers?.[r.label] ?? "(no answer)"}`).join("\n")
        : isCalc
        ? `WORKINGS:\n${attempt.textWorking}\n\nFINAL ANSWER: ${attempt.calcAnswer}`
        : isTwoCol
        ? `${sq.col1Label ?? "Column 1"}:\n${attempt.textWorking}\n\n${sq.col2Label ?? "Column 2"}:\n${attempt.col2Working}`
        : isAnswerBook
        ? formatStatementForEvaluator(attempt.col2Working, sq.col2Label ?? "STATEMENT")
        : attempt.textWorking;

      let imageData: string | undefined;
      let imageMimeType: string | undefined;

      if (!isMCQ && attempt.imageFile) {
        imageData = await fileToBase64(attempt.imageFile);
        imageMimeType = attempt.imageFile.type;
      }

      const res = await apiFetch("/api/matric/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionLabel: sq.label,
          questionText,
          memoText: sq.memoText,
          studentText,
          imageData,
          imageMimeType,
          language,
          mode: isFinal ? "practice" : mode,
          attemptCount: attempt.attemptCount,
          questionType: sq.type,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("[evaluate] HTTP", res.status, body);
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json() as {
        marksEarned?: number;
        totalMarks?: number;
        allCorrect?: boolean;
        feedback?: string;
        breakdown?: RubricPoint[];
      };

      return {
        marksEarned: data.marksEarned ?? 0,
        totalMarks: data.totalMarks ?? sq.marks,
        allCorrect: data.allCorrect ?? false,
        feedback: data.feedback ?? "Evaluation complete.",
        breakdown: data.breakdown,
      };
    },
    [language, mode]
  );

  const handleSubmitWorking = async () => {
    const isMCQ = currentSQ.type === "mcq";
    const isCalc = currentSQ.type === "calculation";
    const isTwoCol = currentSQ.type === "two-column";
    const isAnswerBook = currentSQ.type === "answer-book";
    const isMatchGroup = currentSQ.type === "match-group";
    const hasAnswer = isMCQ
      ? !!currentAttempt.selectedOption
      : isMatchGroup
      ? Object.keys(currentAttempt.matchAnswers ?? {}).length > 0
      : isCalc
      ? !!(currentAttempt.textWorking.trim() || currentAttempt.calcAnswer.trim())
      : isTwoCol
      ? !!(currentAttempt.textWorking.trim() || currentAttempt.col2Working.trim())
      : isAnswerBook
      ? hasStatementContent(currentAttempt.col2Working)
      : !!(currentAttempt.textWorking.trim() || currentAttempt.imageFile);
    if (!hasAnswer) return;
    setIsEvaluating(true);

    try {
      const result = await evaluateQuestion(currentSQ, currentAttempt);

      const newMsg: CoachMessage = {
        type: "ai",
        content: result.feedback,
        marksEarned: result.marksEarned,
        totalMarks: result.totalMarks,
        breakdown: result.breakdown,
      };

      updateAttempt(currentSQ.id, {
        submitted: true,
        marksEarned: result.marksEarned,
        attemptCount: currentAttempt.attemptCount + 1,
        coachMessages: [...currentAttempt.coachMessages, newMsg],
        imageData: currentAttempt.imageFile
          ? await fileToBase64(currentAttempt.imageFile)
          : undefined,
        imageMimeType: currentAttempt.imageFile?.type,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown error";
      console.error("[handleSubmitWorking] caught:", err);
      updateAttempt(currentSQ.id, {
        coachMessages: [
          ...currentAttempt.coachMessages,
          { type: "system", content: `Something went wrong (${msg}). Please try again.` },
        ],
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetry = () => {
    updateAttempt(currentSQ.id, {
      submitted: false,
      textWorking: "",
      calcAnswer: "",
      col2Working: "",
      matchAnswers: {},
      imageFile: undefined,
      imagePreviewUrl: undefined,
      imageData: undefined,
      coachMessages: [
        ...currentAttempt.coachMessages,
        {
          type: "system",
          content: `Try again for **${currentSQ.label}**. Show your updated working below.`,
        },
      ],
    });
  };

  // Practice mode — submit full paper
  const handleSubmitPaper = async () => {
    setIsSubmittingPaper(true);
    const updatedAttempts = { ...attempts };

    for (let i = 0; i < flatQuestions.length; i++) {
      const sq = flatQuestions[i];
      const attempt = updatedAttempts[sq.id];
      const hasAnswer = sq.type === "mcq"
        ? !!attempt.selectedOption
        : sq.type === "match-group"
        ? Object.keys(attempt.matchAnswers ?? {}).length > 0
        : sq.type === "calculation"
        ? !!(attempt.textWorking.trim() || attempt.calcAnswer.trim())
        : sq.type === "two-column"
        ? !!(attempt.textWorking.trim() || attempt.col2Working.trim())
        : sq.type === "answer-book"
        ? hasStatementContent(attempt.col2Working)
        : !!(attempt.textWorking.trim() || attempt.imageFile);
      if (!hasAnswer) {
        setSubmitProgress(i + 1);
        continue;
      }
      try {
        const result = await evaluateQuestion(sq, attempt, "practice");
        updatedAttempts[sq.id] = {
          ...attempt,
          submitted: true,
          marksEarned: result.marksEarned,
          coachMessages: [
            {
              type: "ai",
              content: result.feedback,
              marksEarned: result.marksEarned,
              totalMarks: result.totalMarks,
            },
          ],
        };
      } catch {
        updatedAttempts[sq.id] = { ...attempt, submitted: true, marksEarned: 0 };
      }
      setSubmitProgress(i + 1);
      setAttempts({ ...updatedAttempts });
    }

    setIsSubmittingPaper(false);
    onFinish(updatedAttempts);
  };

  const answeredCount = Object.entries(attempts).filter(([id, a]) => {
    const sq = flatQuestions.find((q) => q.id === id);
    if (!sq) return false;
    if (sq.type === "mcq") return !!a.selectedOption;
    if (sq.type === "match-group") return Object.keys(a.matchAnswers ?? {}).length > 0;
    if (sq.type === "calculation") return !!(a.textWorking.trim() || a.calcAnswer.trim());
    if (sq.type === "two-column") return !!(a.textWorking.trim() || a.col2Working.trim());
    if (sq.type === "answer-book") return hasStatementContent(a.col2Working);
    return !!(a.textWorking.trim() || a.imageFile);
  }).length;
  const submittedCount = Object.values(attempts).filter((a) => a.submitted).length;

  const goTo = (idx: number) => {
    if (idx >= 0 && idx < totalQuestions) setCurrentIdx(idx);
  };

  if (isSubmittingPaper) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#F4F4F5] gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-800">Evaluating your paper…</p>
          <p className="text-sm text-gray-500 mt-1">
            Question {submitProgress} of {totalQuestions}
          </p>
        </div>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-300"
            style={{ width: `${(submitProgress / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  const pctComplete = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Compact header: back + current Q info + info sheet */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-3 sm:px-4">
        <div className="flex items-center gap-2 py-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-brand bg-gray-100 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 leading-tight">
              {currentSQ.label}
              <span className="ml-1.5 text-xs font-semibold text-brand">
                · {currentSQ.marks} {currentSQ.marks === 1 ? "mk" : "mks"}
              </span>
            </p>
            <p className="text-[11px] text-gray-400 truncate hidden sm:block leading-tight mt-0.5">
              {paper.questions.find((q) => q.subQuestions.some((sq) => sq.id === currentSQ.id))?.title ?? ""}
            </p>
          </div>

          {mode === "practice" && language !== "English" && language !== "Afrikaans" && (
            <span className="flex items-center gap-1.5 text-xs flex-shrink-0">
              <span className="text-gray-500">{language}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">beta</span>
            </span>
          )}
          {paper.infoSheet && (
            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-1 flex-shrink-0"
              onClick={() => setShowInfoSheet(true)}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Info</span>
            </Button>
          )}
        </div>

        {/* Question progress dots — scrollable, grouped by parent question */}
        <div className="overflow-x-auto pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-end gap-2 w-max">
            {paper.questions.map((q, qi) => (
              <React.Fragment key={q.number}>
                {qi > 0 && <div className="w-px h-4 bg-gray-200 self-center flex-shrink-0" />}
                <div className="flex flex-col items-start gap-1 flex-shrink-0">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-none px-0.5">
                    Q{q.number}
                  </span>
                  <div className="flex items-center gap-1">
                    {q.subQuestions.map((sq) => {
                      const flatIdx = flatQuestions.findIndex((f) => f.id === sq.id);
                      const attempt = attempts[sq.id];
                      const isActive = flatIdx === currentIdx;
                      const isSubmitted = attempt?.submitted ?? false;
                      const isAnswered = (() => {
                        if (!attempt) return false;
                        if (sq.type === "mcq") return !!attempt.selectedOption;
                        if (sq.type === "match-group") return Object.keys(attempt.matchAnswers ?? {}).length > 0;
                        if (sq.type === "calculation") return !!(attempt.textWorking.trim() || attempt.calcAnswer.trim());
                        if (sq.type === "answer-book") return hasStatementContent(attempt.col2Working);
                        if (sq.type === "two-column") return !!(attempt.textWorking.trim() || attempt.col2Working.trim());
                        return !!(attempt.textWorking.trim() || attempt.imageFile);
                      })();
                      return (
                        <button
                          key={sq.id}
                          onClick={() => setCurrentIdx(flatIdx)}
                          title={`${sq.label} · ${sq.marks} ${sq.marks === 1 ? "mk" : "mks"}`}
                          className={`flex-shrink-0 rounded-full transition-all duration-150 ${
                            isActive ? "w-5 h-5 ring-2 ring-brand ring-offset-1" : "w-4 h-4 hover:scale-110"
                          } ${
                            isSubmitted ? "bg-brand" : isAnswered ? "bg-amber-400" : "bg-gray-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Info Sheet Modal */}
      {showInfoSheet && paper.infoSheet && (
        <InfoSheetModal sheet={paper.infoSheet} onClose={() => setShowInfoSheet(false)} />
      )}

      {/* Diagram panel — bottom sheet on mobile, right side panel on desktop (non-blocking) */}
      {expandedDiagramUrl && (
        <>
          {/* Mobile-only dim backdrop; desktop has no backdrop so working area stays interactive */}
          <div
            className="sm:hidden fixed inset-0 z-[39] bg-black/20"
            onClick={() => setExpandedDiagramUrl(null)}
          />
          <div className="fixed z-40 flex flex-col bg-white shadow-2xl
            bottom-0 left-0 right-0 h-[55%] rounded-t-2xl
            sm:top-0 sm:bottom-0 sm:left-auto sm:right-0 sm:h-full sm:w-[min(560px,45%)] sm:rounded-none">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
              <span className="font-bold text-sm text-gray-800">Reference</span>
              <button
                onClick={() => setExpandedDiagramUrl(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <img
                src={expandedDiagramUrl}
                alt="Reference diagram"
                className="w-full object-contain rounded-xl border border-gray-200"
              />
            </div>
          </div>
        </>
      )}

      {/* Mobile tab bar — guided mode only */}
      {mode === "guided" && (
        <div className="sm:hidden flex-shrink-0 flex border-b border-gray-100 bg-white">
          <button
            onClick={() => setMobileTab("question")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
              mobileTab === "question" ? "text-brand border-brand" : "text-gray-400 border-transparent"
            }`}
          >
            Question
          </button>
          <button
            onClick={() => setMobileTab("feedback")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
              mobileTab === "feedback" ? "text-brand border-brand" : "text-gray-400 border-transparent"
            }`}
          >
            Ruby Feedback
          </button>
        </div>
      )}

      {/* Split screen (guided) / Full screen (practice) */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0">
        {/* ── LEFT PANEL: Question + Working ── */}
        <div className={`flex flex-col border-b sm:border-b-0 sm:border-r border-gray-200 overflow-hidden ${
          mode === "practice"
            ? "flex-1"
            : `flex-1 sm:w-[60%] sm:flex-none ${mobileTab === "feedback" ? "hidden sm:flex" : ""}`
        }`}>
          {/* Content area — no scroll, flex column */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Question text + diagram (scrollable together) */}
            <div
              ref={questionPanelRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                setShowScrollHint(el.scrollHeight - el.scrollTop > el.clientHeight + 20);
              }}
              className="relative flex-shrink-0 overflow-y-auto border-b border-gray-100 max-h-[30%] sm:max-h-[45%] bg-rose-50/20"
            >
              {/* "QUESTION" badge — clear visual separator from answer area */}
              <div className="sticky top-0 z-10 flex items-center gap-2 px-3 sm:px-5 pt-2 pb-1 bg-rose-50/90 backdrop-blur-sm border-b border-rose-100/60">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand/70">Question</span>
                <span className="text-[10px] text-gray-400">·</span>
                <span className="text-[10px] font-semibold text-gray-500">{currentSQ.label}</span>
              </div>
              <div className="px-3 sm:px-5 py-2 sm:py-3">
                <div className="text-sm text-gray-800 leading-relaxed">
                  <MathMarkdown content={currentSQ.questionText} />
                </div>
              {/* Sources (History) + Diagram */}
              {(() => {
                const parentQ = paper.questions.find((q) =>
                  q.subQuestions.some((sq) => sq.id === currentSQ.id)
                );
                const diagramUrls: string[] = (() => {
                  if (currentSQ.diagramUrls?.length) return currentSQ.diagramUrls;
                  if (currentSQ.diagramUrl) return [currentSQ.diagramUrl];
                  const pq = parentQ as any;
                  if (pq?.diagramUrls?.length) return pq.diagramUrls;
                  if (pq?.diagramUrl) return [pq.diagramUrl];
                  return [];
                })();

                // History: pull required sources for this sub-question
                const requiredIds: string[] = (currentSQ as any).requiredSources ?? [];
                const allSources: any[] = (parentQ as any)?.sources ?? [];
                const neededSources = allSources.filter((s) => requiredIds.includes(s.id));

                return (
                  <>
                    {neededSources.map((source) => (
                      <div key={source.id} className="mt-3 rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
                        <div className="px-3 py-1.5 bg-amber-100 border-b border-amber-200">
                          <span className="text-xs font-bold text-amber-900">{source.title}</span>
                        </div>
                        {source.type === "text" && source.content && (
                          <p className="px-3 py-2 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {source.content}
                          </p>
                        )}
                        {source.type === "image" && source.imageUrl && (
                          <div className="p-2 flex justify-center">
                            <button
                              onClick={() => setExpandedDiagramUrl(source.imageUrl)}
                              className="relative group block rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-w-[200px]"
                              title="Tap to expand"
                            >
                              <img
                                src={source.imageUrl}
                                alt={source.title}
                                className="w-full object-contain max-h-28"
                              />
                              <div className="absolute inset-0 flex items-end justify-center pb-1.5 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                                <span className="text-[10px] font-semibold bg-black/40 text-white px-2 py-0.5 rounded-full">Tap to expand</span>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Regular diagram(s) (non-History) */}
                    {diagramUrls.length > 0 && (
                      <div className="mt-3 flex flex-col items-center gap-2">
                        {diagramUrls.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setExpandedDiagramUrl(url)}
                            className="relative group block rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-w-[220px]"
                            title="Tap to expand"
                          >
                            <img
                              src={url}
                              alt={`Diagram ${diagramUrls.length > 1 ? i + 1 : ""} for ${currentSQ.label}`}
                              className="w-full object-contain max-h-28"
                            />
                            <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full">Tap to expand</span>
                            </div>
                            <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                              <span className="text-[10px] font-semibold bg-black/40 text-white px-2 py-0.5 rounded-full">Tap to expand</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
              {currentAttempt.submitted && mode === "guided" && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold">
                  {currentAttempt.marksEarned >= currentSQ.marks ? (
                    <span className="text-green-600">✓ {currentAttempt.marksEarned}/{currentSQ.marks} marks earned</span>
                  ) : (
                    <span className="text-amber-600">
                      {currentAttempt.marksEarned}/{currentSQ.marks} marks earned
                    </span>
                  )}
                </div>
              )}

              {/* Mobile scroll hint — only shown when content is clipped */}
              {showScrollHint && (
                <div className="sm:hidden sticky bottom-0 left-0 right-0 -mx-3 px-3 pt-4 pb-1.5 pointer-events-none bg-gradient-to-t from-rose-50 via-rose-50/90 to-transparent flex justify-center">
                  <span className="animate-bounce flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                    Scroll for more
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              )}
            </div>{/* end inner padding div */}
            </div>{/* end question panel */}

            {/* Working area — grows to fill remaining space */}
            <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-5 pt-2 pb-2 sm:pt-2.5 sm:pb-3 gap-1.5 sm:gap-2">
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your answer</span>
              </div>

              {currentSQ.type === "mcq" && currentSQ.options ? (
                /* ── MCQ Option Cards ── */
                <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                  {Object.keys(currentSQ.options!).sort().map((letter) => {
                    const text = currentSQ.options![letter as keyof typeof currentSQ.options]!;
                    const isSelected = currentAttempt.selectedOption === letter;
                    return (
                      <button
                        key={letter}
                        onClick={() => !currentAttempt.submitted && updateAttempt(currentSQ.id, { selectedOption: letter })}
                        disabled={currentAttempt.submitted}
                        className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-brand bg-rose-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        } ${currentAttempt.submitted ? "cursor-default" : "cursor-pointer"}`}
                      >
                        <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isSelected ? "bg-brand text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          {letter}
                        </span>
                        <span className="text-sm text-gray-700 leading-relaxed pt-0.5">{text}</span>
                      </button>
                    );
                  })}
                </div>
              ) : currentSQ.type === "calculation" ? (
                /* ── Calculation: Workings textarea + Answer field ── */
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                  <div className="flex-1 flex flex-col min-h-0">
                    <label className="text-xs font-semibold text-gray-500 mb-1">WORKINGS</label>
                    <textarea
                      value={currentAttempt.textWorking}
                      onChange={(e) => updateAttempt(currentSQ.id, { textWorking: e.target.value })}
                      placeholder="Show all your working steps here…"
                      disabled={currentAttempt.submitted}
                      className="flex-1 min-h-0 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand resize-none font-mono disabled:opacity-60"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">FINAL ANSWER</label>
                    <input
                      type="text"
                      value={currentAttempt.calcAnswer}
                      onChange={(e) => updateAttempt(currentSQ.id, { calcAnswer: e.target.value })}
                      placeholder="e.g. R 1 234 500"
                      disabled={currentAttempt.submitted}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-60"
                    />
                  </div>
                </div>
              ) : currentSQ.type === "two-column" ? (
                /* ── Two-column: side-by-side labelled textareas ── */
                <div className="flex-1 flex gap-2 min-h-0">
                  <div className="flex-1 flex flex-col min-h-0">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      {currentSQ.col1Label ?? "Column 1"}
                    </label>
                    <textarea
                      value={currentAttempt.textWorking}
                      onChange={(e) => updateAttempt(currentSQ.id, { textWorking: e.target.value })}
                      placeholder={`Enter ${currentSQ.col1Label ?? "column 1"} here…`}
                      disabled={currentAttempt.submitted}
                      className="flex-1 min-h-0 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand resize-none disabled:opacity-60"
                    />
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      {currentSQ.col2Label ?? "Column 2"}
                    </label>
                    <textarea
                      value={currentAttempt.col2Working}
                      onChange={(e) => updateAttempt(currentSQ.id, { col2Working: e.target.value })}
                      placeholder={`Enter ${currentSQ.col2Label ?? "column 2"} here…`}
                      disabled={currentAttempt.submitted}
                      className="flex-1 min-h-0 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand resize-none disabled:opacity-60"
                    />
                  </div>
                </div>
              ) : currentSQ.type === "answer-book" ? (
                /* ── Answer Book: Statement table only (no workings) ── */
                (() => {
                  const statementRows: StatementRowData[] = (() => {
                    const raw = currentAttempt.col2Working;
                    if (!raw.trim()) return [{ desc: "", amount: "" }];
                    try {
                      const parsed = JSON.parse(raw) as StatementRowData[];
                      if (Array.isArray(parsed) && parsed.length) return parsed;
                    } catch { /* not JSON */ }
                    return [{ desc: raw, amount: "" }];
                  })();

                  const updateRows = (rows: StatementRowData[]) => {
                    updateAttempt(currentSQ.id, { col2Working: JSON.stringify(rows) });
                  };

                  return (
                    <div className="flex-1 flex flex-col min-h-0">
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex-shrink-0">
                        {currentSQ.col2Label ?? "Statement (R)"}
                      </label>
                      <div className="flex-1 min-h-0 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
                        {/* Table header */}
                        <div className="flex-shrink-0 flex border-b border-gray-200 bg-gray-50">
                          <div className="flex-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Description
                          </div>
                          <div className="w-32 sm:w-40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-l border-gray-200 text-right">
                            Amount (R)
                          </div>
                        </div>
                        {/* Editable rows */}
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                          {statementRows.map((row, i) => (
                            <div key={i} className="flex items-stretch min-h-[36px]">
                              <input
                                value={row.desc}
                                onChange={(e) => {
                                  const next = statementRows.map((r, j) =>
                                    j === i ? { ...r, desc: e.target.value } : r
                                  );
                                  updateRows(next);
                                }}
                                disabled={currentAttempt.submitted}
                                placeholder={i === 0 ? "e.g. Revenue / Sales" : "Line item…"}
                                className="flex-1 px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-300 focus:outline-none focus:bg-blue-50/30 disabled:opacity-60 bg-transparent"
                              />
                              <input
                                value={row.amount}
                                onChange={(e) => {
                                  const next = statementRows.map((r, j) =>
                                    j === i ? { ...r, amount: e.target.value } : r
                                  );
                                  updateRows(next);
                                }}
                                disabled={currentAttempt.submitted}
                                placeholder="0"
                                className="w-32 sm:w-40 px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-300 border-l border-gray-200 focus:outline-none focus:bg-blue-50/30 disabled:opacity-60 bg-transparent text-right"
                              />
                            </div>
                          ))}
                        </div>
                        {/* Add row button */}
                        {!currentAttempt.submitted && (
                          <button
                            onClick={() => updateRows([...statementRows, { desc: "", amount: "" }])}
                            className="flex-shrink-0 w-full py-2 text-xs text-gray-400 hover:text-brand hover:bg-rose-50 transition-colors border-t border-gray-100 flex items-center justify-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add row
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : currentSQ.type === "match-group" && currentSQ.matchRows && currentSQ.matchOptions ? (
                /* ── Match-group: COLUMN B reference + per-row letter selectors ── */
                <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto">
                  {/* COLUMN B reference panel */}
                  <div className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Column B</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {Object.entries(currentSQ.matchOptions).map(([letter, value]) => (
                        <span key={letter} className="text-xs text-gray-700">
                          <span className="font-bold text-gray-900">{letter}</span> — {value}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Per-row selectors */}
                  <div className="flex-1 space-y-2">
                    {currentSQ.matchRows.map((row) => {
                      const selected = currentAttempt.matchAnswers?.[row.label];
                      return (
                        <div key={row.label} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-gray-400 mr-1.5">{row.label}</span>
                            <span className="text-sm text-gray-800">{row.term}</span>
                          </div>
                          <div className="flex-shrink-0 flex gap-1.5 flex-wrap justify-end">
                            {Object.keys(currentSQ.matchOptions!).map((letter) => {
                              const isChosen = selected === letter;
                              return (
                                <button
                                  key={letter}
                                  disabled={currentAttempt.submitted}
                                  onClick={() => {
                                    const next = { ...(currentAttempt.matchAnswers ?? {}) };
                                    if (isChosen) { delete next[row.label]; }
                                    else { next[row.label] = letter; }
                                    updateAttempt(currentSQ.id, { matchAnswers: next });
                                  }}
                                  className={`w-8 h-8 rounded-lg text-sm font-bold border-2 transition-all ${
                                    isChosen
                                      ? "bg-brand border-brand text-white"
                                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                                  } disabled:cursor-default`}
                                >
                                  {letter}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : isMaths ? (
                /* ── Maths: Symbol toolbar + Step-by-step inputs ── */
                <>
                  {/* Symbol toolbar */}
                  {!currentAttempt.submitted && (
                    <div className="flex-shrink-0 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                      {MATH_SYMBOLS.map(({ label, insert }) => (
                        <button
                          key={label}
                          onMouseDown={(e) => { e.preventDefault(); insertMathSymbol(insert); }}
                          className="flex-shrink-0 h-8 min-w-[2rem] px-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-mono hover:border-brand hover:text-brand hover:bg-rose-50 active:scale-95 transition-all"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5 pr-0.5">
                    {STEP_LABELS.map((label, i) => {
                      const steps = mathsSteps[currentSQ.id] ?? ["", "", "", "", ""];
                      const refKey = `${currentSQ.id}::${i}`;
                      return (
                        <div key={label} className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-xs font-semibold text-gray-400 mt-2 w-14 sm:w-20 text-right">{label}</span>
                          <textarea
                            ref={(el) => { mathsInputRefs.current[refKey] = el; }}
                            onFocus={() => { activeMathsKey.current = refKey; }}
                            value={steps[i]}
                            disabled={currentAttempt.submitted}
                            onChange={(e) => {
                              const updated = [...steps];
                              updated[i] = e.target.value;
                              setMathsSteps((prev) => ({ ...prev, [currentSQ.id]: updated }));
                              updateAttempt(currentSQ.id, {
                                textWorking: updated
                                  .map((v, j) => (v.trim() ? `${STEP_LABELS[j]}: ${v.trim()}` : ""))
                                  .filter(Boolean)
                                  .join("\n"),
                              });
                            }}
                            placeholder={i < 4 ? `Working for ${label.toLowerCase()}…` : "Final answer…"}
                            rows={2}
                            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand resize-none font-mono disabled:opacity-60"
                            style={{ minHeight: "clamp(2.5rem, 8vh, 4.5rem)" }}
                            onInput={(e) => {
                              const t = e.target as HTMLTextAreaElement;
                              t.style.height = "auto";
                              t.style.height = `${t.scrollHeight}px`;
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* Upload + hint row */}
                  <div className="flex items-center justify-center gap-4 flex-shrink-0">
                    {!currentAttempt.imagePreviewUrl && (
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <span className="text-base leading-none">✏️</span>
                          Upload handwritten working
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageSelected(file);
                            e.target.value = "";
                          }}
                        />
                      </>
                    )}
                    {hintLevel < 3 && (
                      <button
                        onClick={() => setHintLevel((p) => Math.min(p + 1, 3))}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          hintLevel === 0 ? "text-yellow-500 hover:text-yellow-700" :
                          hintLevel === 1 ? "text-orange-500 hover:text-orange-700" :
                                            "text-blue-500 hover:text-blue-700"
                        }`}
                      >
                        <span className="text-base leading-none">💡</span>
                        {hintLevel === 0 ? "Get a hint" : hintLevel === 1 ? "A bit more help" : "Show me the first step"}
                      </button>
                    )}
                  </div>
                  {currentAttempt.imagePreviewUrl && (
                    <div className="relative flex-shrink-0">
                      <img
                        src={currentAttempt.imagePreviewUrl}
                        alt="Your working"
                        className="w-full rounded-xl border border-gray-200 max-h-32 object-contain bg-gray-50"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {hintLevel > 0 && (
                    <div className={`flex-shrink-0 rounded-xl px-4 py-3 border flex items-start gap-2.5 ${
                      hintLevel === 1 ? "bg-yellow-50 border-yellow-200" :
                      hintLevel === 2 ? "bg-orange-50 border-orange-200" :
                                        "bg-blue-50 border-blue-200"
                    }`}>
                      <span className="text-base leading-none flex-shrink-0 mt-0.5">💡</span>
                      <p className={`text-sm leading-relaxed ${
                        hintLevel === 1 ? "text-yellow-800" :
                        hintLevel === 2 ? "text-orange-800" :
                                          "text-blue-800"
                      }`}>
                        <span className="font-semibold">
                          {hintLevel === 1 ? "Hint: " : hintLevel === 2 ? "More help: " : "First step: "}
                        </span>
                        {hintLevel === 1 ? hint1 : hintLevel === 2 ? hint2 : hint3}
                      </p>
                    </div>
                  )}
                </>
              ) : currentSQ.wordBank ? (
                /* ── Word bank: tappable chips ── */
                <>
                  <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {currentSQ.wordBank.map((word) => {
                        const isSelected = currentAttempt.textWorking === word;
                        return (
                          <button
                            key={word}
                            disabled={currentAttempt.submitted}
                            onClick={() =>
                              updateAttempt(currentSQ.id, {
                                textWorking: isSelected ? "" : word,
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                              isSelected
                                ? "border-brand bg-rose-50 text-brand"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            } disabled:cursor-default`}
                          >
                            {word}
                          </button>
                        );
                      })}
                    </div>
                    {currentAttempt.textWorking && (
                      <p className="text-sm text-gray-500 flex-shrink-0">
                        Selected: <span className="font-semibold text-gray-800">{currentAttempt.textWorking}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-center flex-shrink-0">
                    {hintLevel < 3 && (
                      <button
                        onClick={() => setHintLevel((p) => Math.min(p + 1, 3))}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          hintLevel === 0 ? "text-yellow-500 hover:text-yellow-700" :
                          hintLevel === 1 ? "text-orange-500 hover:text-orange-700" :
                                            "text-blue-500 hover:text-blue-700"
                        }`}
                      >
                        <span className="text-base leading-none">💡</span>
                        {hintLevel === 0 ? "Get a hint" : hintLevel === 1 ? "A bit more help" : "Show me the first step"}
                      </button>
                    )}
                  </div>
                  {hintLevel > 0 && (
                    <div className={`flex-shrink-0 rounded-xl px-4 py-3 border flex items-start gap-2.5 ${
                      hintLevel === 1 ? "bg-yellow-50 border-yellow-200" :
                      hintLevel === 2 ? "bg-orange-50 border-orange-200" :
                                        "bg-blue-50 border-blue-200"
                    }`}>
                      <span className="text-base leading-none flex-shrink-0 mt-0.5">💡</span>
                      <p className={`text-sm leading-relaxed ${
                        hintLevel === 1 ? "text-yellow-800" :
                        hintLevel === 2 ? "text-orange-800" :
                                          "text-blue-800"
                      }`}>
                        <span className="font-semibold">
                          {hintLevel === 1 ? "Hint: " : hintLevel === 2 ? "More help: " : "First step: "}
                        </span>
                        {hintLevel === 1 ? hint1 : hintLevel === 2 ? hint2 : hint3}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* ── Physics / other: large textarea ── */
                <>
                  <textarea
                    value={currentAttempt.textWorking}
                    onChange={(e) =>
                      updateAttempt(currentSQ.id, { textWorking: e.target.value })
                    }
                    placeholder="Show your working here"
                    className="flex-1 min-h-0 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand resize-none font-mono"
                  />

                  {/* Below textarea: camera + hint — centred */}
                  <div className="flex items-center justify-center gap-4 flex-shrink-0">
                    {!currentAttempt.imagePreviewUrl && (
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <span className="text-base leading-none">✏️</span>
                          Upload handwritten working
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageSelected(file);
                            e.target.value = "";
                          }}
                        />
                      </>
                    )}
                    {hintLevel < 3 && (
                      <button
                        onClick={() => setHintLevel((p) => Math.min(p + 1, 3))}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          hintLevel === 0 ? "text-yellow-500 hover:text-yellow-700" :
                          hintLevel === 1 ? "text-orange-500 hover:text-orange-700" :
                                            "text-blue-500 hover:text-blue-700"
                        }`}
                      >
                        <span className="text-base leading-none">💡</span>
                        {hintLevel === 0 ? "Get a hint" : hintLevel === 1 ? "A bit more help" : "Show me the first step"}
                      </button>
                    )}
                  </div>

                  {/* Image preview */}
                  {currentAttempt.imagePreviewUrl && (
                    <div className="relative flex-shrink-0">
                      <img
                        src={currentAttempt.imagePreviewUrl}
                        alt="Your working"
                        className="w-full rounded-xl border border-gray-200 max-h-32 object-contain bg-gray-50"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Hint display */}
                  {hintLevel > 0 && (
                    <div className={`flex-shrink-0 rounded-xl px-4 py-3 border flex items-start gap-2.5 ${
                      hintLevel === 1 ? "bg-yellow-50 border-yellow-200" :
                      hintLevel === 2 ? "bg-orange-50 border-orange-200" :
                                        "bg-blue-50 border-blue-200"
                    }`}>
                      <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        hintLevel === 1 ? "text-yellow-500" :
                        hintLevel === 2 ? "text-orange-500" :
                                          "text-blue-500"
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303 0l-.347-.347a5 5 0 117.072 0z" />
                      </svg>
                      <p className={`text-sm leading-relaxed ${
                        hintLevel === 1 ? "text-yellow-800" :
                        hintLevel === 2 ? "text-orange-800" :
                                          "text-blue-800"
                      }`}>
                        <span className="font-semibold">
                          {hintLevel === 1 ? "Hint: " : hintLevel === 2 ? "More help: " : "First step: "}
                        </span>
                        {hintLevel === 1 ? hint1 : hintLevel === 2 ? hint2 : hint3}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Action buttons */}
              {mode === "guided" ? (
                currentAttempt.submitted ? (
                  <div className="flex gap-2 flex-shrink-0">
                    {currentSQ.type !== "mcq" && currentSQ.type !== "match-group" && (
                      <button
                        onClick={handleRetry}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Try again
                      </button>
                    )}
                    <Button
                      variant="primary"
                      size="md"
                      className="flex-1"
                      onClick={() => goTo(currentIdx + 1)}
                      disabled={currentIdx === totalQuestions - 1}
                    >
                      Next question →
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => goTo(currentIdx + 1)}
                      disabled={currentIdx === totalQuestions - 1}
                      className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                    >
                      Skip
                    </button>
                    <Button
                      variant="primary"
                      size="md"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={handleSubmitWorking}
                      disabled={
                        isEvaluating || (() => {
                          if (currentSQ.type === "mcq") return !currentAttempt.selectedOption;
                          if (currentSQ.type === "match-group") return Object.keys(currentAttempt.matchAnswers ?? {}).length === 0;
                          if (currentSQ.type === "calculation") return !currentAttempt.textWorking.trim() && !currentAttempt.calcAnswer.trim();
                          if (currentSQ.type === "two-column" || currentSQ.type === "answer-book") return !currentAttempt.textWorking.trim() && !currentAttempt.col2Working.trim();
                          return !currentAttempt.textWorking.trim() && !currentAttempt.imageFile;
                        })()
                      }
                    >
                      {isEvaluating ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Evaluating…
                        </>
                      ) : currentSQ.type === "mcq" ? "Submit answer" : "Submit working"}
                    </Button>
                  </div>
                )
              ) : (
                /* Practice mode — prev / save & next / skip */
                <div className="flex justify-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => goTo(currentIdx - 1)}
                    disabled={currentIdx === 0}
                    className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  >
                    ← Prev
                  </button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      if (currentAttempt.textWorking.trim() || currentAttempt.imageFile) {
                        updateAttempt(currentSQ.id, { submitted: false });
                      }
                      goTo(currentIdx + 1);
                    }}
                    disabled={currentIdx === totalQuestions - 1}
                  >
                    Save & Next →
                  </Button>
                  <button
                    onClick={() => goTo(currentIdx + 1)}
                    disabled={currentIdx === totalQuestions - 1}
                    className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ── Sub-question navigator (pinned bottom) ── */}
          {(() => {
            const currentTopLevelQ = paper.questions.find((q) =>
              q.subQuestions.some((sq) => sq.id === currentSQ.id)
            );
            const subQsForQ = currentTopLevelQ?.subQuestions ?? [];
            return (
              <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-2 space-y-1.5">
                {mode === "practice" && answeredCount > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmitPaper}
                    >
                      Submit Paper
                    </Button>
                  </div>
                )}
                {/* Sub-question pills — hidden for Mathematics and guided mode */}
                {paper.subject !== "Mathematics" && mode !== "guided" && (
                  <div className="flex flex-wrap gap-1.5">
                    {subQsForQ.map((sq) => {
                      const flatIdx = flatQuestions.findIndex((f) => f.id === sq.id);
                      const a = attempts[sq.id];
                      const hasContent = !!(a.textWorking.trim() || a.imageFile);
                      const isDone = a.submitted;
                      const isCurrent = sq.id === currentSQ.id;
                      return (
                        <button
                          key={sq.id}
                          onClick={() => setCurrentIdx(flatIdx)}
                          className={`px-2.5 h-7 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            isCurrent
                              ? "bg-brand text-white shadow"
                              : isDone
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : hasContent
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-400 border border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {sq.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* ── RIGHT PANEL: AI Coach (guided mode only) ── */}
        {mode === "guided" && <div className={`flex flex-col overflow-hidden bg-white border-t sm:border-t-0 sm:w-[40%] ${mobileTab === "question" ? "hidden sm:flex" : "flex-1 sm:flex-none"}`}>
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                <img src="/icons/icon-192.png" alt="Ruby" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Ruby</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{language}</span>
              {language !== "English" && language !== "Afrikaans" && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">beta</span>
              )}
            </div>

          </div>

          {/* Coach messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <>
              {currentAttempt.coachMessages.length === 0 && (
                  <div className="text-sm text-gray-400 italic text-center py-8">
                    Submit your working to get feedback.
                  </div>
                )}

                {currentAttempt.coachMessages.map((msg, i) => (
                  <div key={i}>
                    {msg.type === "system" ? (
                      <div className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
                        <MathMarkdown content={msg.content} />
                      </div>
                    ) : (
                      <MatricFeedbackCard
                        content={msg.content}
                        marksEarned={msg.marksEarned}
                        totalMarks={msg.totalMarks}
                        breakdown={msg.breakdown}
                        modelAnswerImageUrl={
                          i === currentAttempt.coachMessages.length - 1 ? currentSQ.memoImageUrl : undefined
                        }
                        onExpandImage={setExpandedDiagramUrl}
                      />
                    )}
                  </div>
                ))}

                {isEvaluating && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                    <svg className="w-4 h-4 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Looking this over…
                  </div>
                )}

                <div ref={coachEndRef} />
            </>
          </div>
        </div>}
      </div>
    </div>
  );
}

// ── Summary View ───────────────────────────────────────────────────────────────

function SummaryView({
  paper,
  attempts,
  mode,
  onRetry,
  onBack,
  onPractiseSkill,
}: {
  paper: Paper;
  attempts: Record<string, QuestionState>;
  mode: SessionMode;
  onRetry: () => void;
  onBack: () => void;
  onPractiseSkill?: (skillId: string, context: string) => void;
}) {
  // The topic→skill link only exists for Physical Sciences today. Gate on subject
  // so other subjects' reports are unchanged.
  const isPhysSci = /phys/i.test(paper.subject);
  const [showReview, setShowReview] = useState(false);
  const flatQuestions = getFlatSubQuestions(paper);
  const totalEarned = flatQuestions.reduce(
    (sum, sq) => sum + (attempts[sq.id]?.marksEarned ?? 0),
    0
  );
  const totalPossible = flatQuestions.reduce((sum, sq) => sum + sq.marks, 0);
  const pct = Math.round((totalEarned / totalPossible) * 100);

  const topicBreakdown = getTopicBreakdown(paper, attempts);
  const sortedTopics = Object.entries(topicBreakdown).sort(
    ([, a], [, b]) => a.earned / a.total - b.earned / b.total
  );

  const getGrade = (p: number) => {
    if (p >= 80) return { label: "Outstanding", color: "text-green-600" };
    if (p >= 70) return { label: "Meritorious", color: "text-green-500" };
    if (p >= 60) return { label: "Achievement", color: "text-blue-600" };
    if (p >= 50) return { label: "Satisfactory", color: "text-blue-500" };
    if (p >= 40) return { label: "Adequate", color: "text-amber-600" };
    if (p >= 30) return { label: "Elementary", color: "text-orange-500" };
    return { label: "Not Achieved", color: "text-red-500" };
  };

  const grade = getGrade(pct);

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5]">
      <div className="max-w-2xl mx-auto px-5 py-10 space-y-8">
        {/* Score hero */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
          <div className="text-5xl font-black text-brand">{pct}%</div>
          <div>
            <p className={`font-bold text-lg ${grade.color}`}>{grade.label}</p>
            <p className="text-gray-400 text-sm mt-1">
              {totalEarned} / {totalPossible} marks · {paper.subject} {paper.paperCode} {paper.session} {paper.year}
            </p>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Topic Breakdown</h2>
          {sortedTopics.map(([topic, { earned, total }]) => {
            const topicPct = Math.round((earned / total) * 100);
            // Offer remediation on weak topics that map to a skill (Phys Sci only).
            const practiseSkill =
              isPhysSci && onPractiseSkill && topicPct < 70 ? resolvePrimarySkill(topic) : null;
            return (
              <div key={topic} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{topic}</span>
                  <span className="text-sm font-bold text-gray-800">
                    {earned}/{total}
                    <span className="text-xs text-gray-400 font-normal ml-1">({topicPct}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      topicPct >= 60 ? "bg-green-400" : topicPct >= 40 ? "bg-amber-400" : "bg-red-400"
                    }`}
                    style={{ width: `${topicPct}%` }}
                  />
                </div>
                {practiseSkill && (
                  <button
                    onClick={() =>
                      onPractiseSkill!(
                        practiseSkill,
                        `Practising ${topic} — from your ${paper.subject} ${paper.paperCode} ${paper.session} ${paper.year} paper`,
                      )
                    }
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                  >
                    Practise this →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Weakest area callout */}
        {sortedTopics.length > 0 && (() => {
          const [weakTopic, { earned, total }] = sortedTopics[0];
          const weakSkill = isPhysSci && onPractiseSkill ? resolvePrimarySkill(weakTopic) : null;
          return (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm space-y-2">
              <p className="font-semibold text-amber-800">Focus area</p>
              <p className="text-amber-700">
                Your weakest topic was <strong>{weakTopic}</strong> ({Math.round((earned / total) * 100)}%).
                {weakSkill ? " Practise it to close the gap." : " Practice atomic skills in this area to improve."}
              </p>
              {weakSkill && (
                <button
                  onClick={() =>
                    onPractiseSkill!(
                      weakSkill,
                      `Practising ${weakTopic} — from your ${paper.subject} ${paper.paperCode} ${paper.session} ${paper.year} paper`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
                >
                  Practise {weakTopic} →
                </button>
              )}
            </div>
          );
        })()}

        {/* Answer review */}
        <div className="space-y-3">
          <button
            onClick={() => setShowReview((v) => !v)}
            className="w-full flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>Review your answers</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showReview ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showReview && (
            <div className="space-y-3">
              {flatQuestions.map((sq) => {
                const attempt = attempts[sq.id];
                const earned = attempt?.marksEarned ?? 0;
                const isCorrect = earned >= sq.marks;
                const isPartial = earned > 0 && earned < sq.marks;
                const studentAnswer = (() => {
                  if (sq.type === "mcq") return attempt?.selectedOption ? `Option ${attempt.selectedOption}` : null;
                  if (sq.type === "two-column") return attempt?.col2Working?.trim() || null;
                  if (sq.type === "answer-book") return [attempt?.textWorking?.trim(), attempt?.col2Working?.trim()].filter(Boolean).join("\n\n") || null;
                  return attempt?.textWorking?.trim() || null;
                })();

                return (
                  <div
                    key={sq.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                      isCorrect ? "border-green-200" : isPartial ? "border-amber-200" : "border-red-100"
                    }`}
                  >
                    {/* Header row */}
                    <div className={`flex items-center justify-between px-4 py-2.5 ${
                      isCorrect ? "bg-green-50" : isPartial ? "bg-amber-50" : "bg-red-50"
                    }`}>
                      <span className="text-xs font-bold text-gray-700">Question {sq.label}</span>
                      <span className={`text-xs font-bold ${
                        isCorrect ? "text-green-700" : isPartial ? "text-amber-700" : "text-red-600"
                      }`}>
                        {earned}/{sq.marks} marks
                      </span>
                    </div>

                    <div className="px-4 py-3 space-y-2.5 text-xs text-gray-700">
                      {/* Question text */}
                      <p className="font-medium text-gray-500 leading-relaxed line-clamp-3">{sq.questionText}</p>

                      {/* Student answer */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Your answer</p>
                        {attempt?.submitted ? (
                          <p className="leading-relaxed whitespace-pre-wrap">
                            {studentAnswer ?? <em className="text-gray-400">No answer recorded</em>}
                          </p>
                        ) : (
                          <p className="text-gray-400 italic">Not attempted</p>
                        )}
                      </div>

                      {/* Correct answer */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Correct answer</p>
                        <p className="leading-relaxed whitespace-pre-wrap text-gray-700">{sq.memoText}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onRetry}
          >
            Try this paper again
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={onBack}
          >
            Choose another paper
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MatricPastPapers({
  onBack,
  onPractiseSkill,
}: {
  onBack?: () => void;
  /** Route to the skill tree to practise a topic's skill (from the report). */
  onPractiseSkill?: (skillId: string, context: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("subjects");
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode>("guided");
  const [language, setLanguage] = useState("English");
  const [finalAttempts, setFinalAttempts] = useState<Record<string, QuestionState> | null>(null);

  const handleSubjectSelect = (subjectId: SubjectId) => {
    setSelectedSubject(subjectId);
    setPhase("papers");
  };

  const handlePaperSelect = async (id: string) => {
    const paper = await loadPaperById(id);
    if (!paper) return;
    setSelectedPaper(paper);
    setPhase("mode");
  };

  const handleStart = (mode: SessionMode, lang: string) => {
    setSessionMode(mode);
    setLanguage(lang);
    setFinalAttempts(null);
    if (selectedPaper) savePaperProgress(selectedPaper.id, "in_progress");
    setPhase("session");
  };

  const handleFinish = (attempts: Record<string, QuestionState>) => {
    if (selectedPaper) {
      const flatQs = getFlatSubQuestions(selectedPaper);
      const earned = flatQs.reduce((s, q) => s + (attempts[q.id]?.marksEarned ?? 0), 0);
      const total = flatQs.reduce((s, q) => s + q.marks, 0);
      const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
      savePaperProgress(selectedPaper.id, "completed", pct);
    }
    setFinalAttempts(attempts);
    setPhase("summary");
  };

  const handleRetry = () => {
    setFinalAttempts(null);
    setPhase("mode");
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedPaper(null);
    setFinalAttempts(null);
    setPhase("subjects");
  };

  const handleBackToPapers = () => {
    setSelectedPaper(null);
    setFinalAttempts(null);
    setPhase("papers");
  };

  if (phase === "subjects") {
    return <SubjectSelect onSelect={handleSubjectSelect} onBack={onBack ?? (() => {})} />;
  }

  if (phase === "papers" && selectedSubject) {
    return (
      <PaperList
        subjectId={selectedSubject}
        onSelect={handlePaperSelect}
        onBack={handleBackToSubjects}
      />
    );
  }

  if (phase === "mode" && selectedPaper) {
    return (
      <ModeSelect
        paper={selectedPaper}
        onStart={handleStart}
        onBack={handleBackToPapers}
      />
    );
  }

  if (phase === "session" && selectedPaper) {
    return (
      <SessionView
        key={`${selectedPaper.id}-${sessionMode}-${language}`}
        paper={selectedPaper}
        mode={sessionMode}
        language={language}
        onFinish={handleFinish}
        onBack={handleBackToPapers}
      />
    );
  }

  if (phase === "summary" && selectedPaper && finalAttempts) {
    return (
      <SummaryView
        paper={selectedPaper}
        attempts={finalAttempts}
        mode={sessionMode}
        onRetry={handleRetry}
        onBack={handleBackToPapers}
        onPractiseSkill={onPractiseSkill}
      />
    );
  }

  return null;
}
