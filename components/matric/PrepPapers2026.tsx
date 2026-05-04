"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { apiFetch } from "@/lib/fetch";
import EduBackground from "@/components/EduBackground";
import { PAPERS, Paper, SubQuestion, InfoSheet, getFlatSubQuestions, getTopicBreakdown } from "@/lib/matric/papers";
import { FORMULA_SHEETS } from "@/lib/matric/formula-sheets";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "subjects" | "papers" | "mode" | "session" | "summary";
type SessionMode = "practice" | "guided";

interface CoachMessage {
  type: "ai" | "system";
  content: string;
  marksEarned?: number;
  totalMarks?: number;
}

interface QuestionState {
  textWorking: string;
  selectedOption?: string;
  imageFile?: File;
  imagePreviewUrl?: string;
  imageData?: string;
  imageMimeType?: string;
  submitted: boolean;
  marksEarned: number;
  coachMessages: CoachMessage[];
  attemptCount: number;
}

const SA_LANGUAGES = [
  "English","Afrikaans","isiZulu","isiXhosa","Sesotho","Setswana",
  "Sepedi","Tshivenda","Xitsonga","siSwati","isiNdebele",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

// ── Prep papers data ───────────────────────────────────────────────────────────

const PREP_PAPERS = PAPERS.filter((p) => p.session.startsWith("Prep") || p.session.startsWith("Predictive"));

const PREP_SUBJECTS = [
  {
    id: "mathematics",
    name: "Mathematics",
    thumbnail: "/thumbnails/mathematics.jpeg",
    color: "from-[#BE1832] to-rose-700",
    available: true,
  },
  {
    id: "physical-science",
    name: "Physical Science",
    thumbnail: "/thumbnails/physical-science.jpeg",
    color: "from-cyan-500 to-blue-600",
    available: true,
  },
  {
    id: "english",
    name: "English",
    thumbnail: "/thumbnails/english.jpeg",
    color: "from-sky-400 to-blue-500",
    available: true,
  },
  {
    id: "life-sciences",
    name: "Life Sciences",
    thumbnail: "/thumbnails/life-sciences.jpeg",
    color: "from-green-500 to-emerald-600",
    available: true,
  },
  {
    id: "geography",
    name: "Geography",
    thumbnail: "/thumbnails/geography.jpeg",
    color: "from-teal-500 to-green-600",
    available: true,
  },
  {
    id: "accounting",
    name: "Accounting",
    thumbnail: "/thumbnails/accounting.jpeg",
    color: "from-violet-500 to-purple-600",
    available: true,
  },
  {
    id: "history",
    name: "History",
    thumbnail: "/thumbnails/history.jpeg",
    color: "from-amber-500 to-orange-600",
    available: true,
  },
  {
    id: "afrikaans",
    name: "Afrikaans",
    thumbnail: "/thumbnails/afrikaans.jpeg",
    color: "from-orange-400 to-amber-500",
    available: true,
  },
] as const;

type PrepSubjectId = (typeof PREP_SUBJECTS)[number]["id"];

// ── Progress helpers (Supabase) ────────────────────────────────────────────────

type PaperProgressStatus = "not_started" | "in_progress" | "completed";
interface PaperProgress { status: PaperProgressStatus; pct?: number }

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

// ── Subject Select ─────────────────────────────────────────────────────────────

function SubjectSelect({ onSelect, onBack }: { onSelect: (subjectId: PrepSubjectId) => void; onBack: () => void }) {
  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />
      <div className="relative max-w-5xl mx-auto px-5 py-6 space-y-6">
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
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-[#BE1832]/10 border border-[#BE1832]/20 text-[#BE1832] text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BE1832]" />
            Predictive 2026
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Prep Papers 2026</h1>
          <p className="text-gray-500 text-sm">Predictive papers created by the Ruby AI Tutor team. Work through each with step-by-step AI tutoring.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Choose a subject</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PREP_SUBJECTS.map((subject) => (
              <button
                key={subject.id}
                onClick={() => onSelect(subject.id as PrepSubjectId)}
                className="relative rounded-2xl text-left transition-all group overflow-hidden bg-white border-2 border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-gray-300"
              >
                <div className="w-full aspect-[4/3] overflow-hidden">
                  <img
                    src={subject.thumbnail}
                    alt={subject.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="px-3 py-2.5">
                  <p className="font-semibold text-gray-800 text-sm">{subject.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          More subjects added as prep papers are released. All papers are original Ruby AI Tutor predictive papers.
        </p>
      </div>
    </div>
  );
}

// ── Paper List ─────────────────────────────────────────────────────────────────

function PaperList({
  subjectId,
  onSelect,
  onBack,
}: {
  subjectId: PrepSubjectId;
  onSelect: (paper: Paper) => void;
  onBack: () => void;
}) {
  const subject = PREP_SUBJECTS.find((s) => s.id === subjectId)!;
  const papers = PREP_PAPERS.filter(
    (p) => p.subject.toLowerCase().replace(/\s+/g, "-") === subjectId
  );
  const [progressMap, setProgressMap] = useState<Record<string, PaperProgress>>({});

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

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />
      <div className="relative max-w-2xl mx-auto px-5 py-10 space-y-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All subjects
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
            <img src={subject.thumbnail} alt={subject.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{subject.name}</h1>
            <p className="text-sm text-gray-400">{papers.length} prep {papers.length === 1 ? "paper" : "papers"} available</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Choose a paper</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {papers.map((paper) => {
              const progress: PaperProgress = progressMap[paper.id] ?? { status: "not_started" };
              const variant = paper.session.replace("Prep ", "");
              return (
                <button
                  key={paper.id}
                  onClick={() => onSelect(paper)}
                  className="text-left bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#BE1832]/40 transition-all group p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0`}>
                      {variant}
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900 text-lg">Paper {variant}</p>
                      <p className="text-xs text-gray-400">{subject.name} · {paper.paperCode} · {paper.totalMarks} marks · {paper.durationHours} hours</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>❓</span>
                      <span>{paper.questions.length} questions · {getFlatSubQuestions(paper).length} sub-questions</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {paper.questions.map((q) => (
                        <span key={q.number} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          Q{q.number}: {q.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {progress.status === "not_started" && (
                      <span className="text-xs font-semibold text-[#BE1832]">Start Paper {variant} 🚀</span>
                    )}
                    {progress.status === "in_progress" && (
                      <>
                        <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-amber-400 rounded-full" />
                        </div>
                        <span className="text-xs text-amber-600 font-medium">In progress</span>
                      </>
                    )}
                    {progress.status === "completed" && (
                      <>
                        <div className="flex-1 h-1.5 bg-green-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress.pct ?? 0}%` }} />
                        </div>
                        <span className="text-xs text-green-600 font-semibold">Completed · {progress.pct ?? 0}%</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#BE1832] font-semibold group-hover:underline">Select paper →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
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
  const [mode, setMode] = useState<SessionMode>("guided");
  const [language, setLanguage] = useState("English");

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-5 py-5 space-y-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to papers
        </button>

        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Mathematics · {paper.session} · {paper.totalMarks} marks
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Choose your mode</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            {
              id: "practice" as SessionMode,
              emoji: "🎯",
              title: "Practice Mode",
              subtitle: "Exam simulation",
              recommendation: "Recommended for exams",
              recommendationColor: "text-blue-600 bg-blue-50",
              bullets: ["No AI help during the paper","Work through all questions","AI evaluates at the end","Full mark breakdown & report"],
              color: "border-blue-200 bg-blue-50",
              activeColor: "border-blue-500 bg-blue-50 ring-2 ring-blue-400",
            },
            {
              id: "guided" as SessionMode,
              emoji: "📚",
              title: "Guided Mode",
              subtitle: "Learn with AI coaching",
              recommendation: "Best for learning",
              recommendationColor: "text-[#BE1832] bg-rose-50",
              bullets: ["AI evaluates after each question","Step-by-step hints available","Feedback in your home language","No time pressure"],
              color: "border-rose-200 bg-rose-50",
              activeColor: "border-[#BE1832] bg-rose-50 ring-2 ring-[#BE1832]",
            },
          ] as const).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`text-left rounded-2xl border-2 p-5 transition-all ${mode === m.id ? m.activeColor : m.color + " hover:opacity-80"}`}
            >
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
                  <div className="ml-auto w-5 h-5 rounded-full bg-[#BE1832] flex items-center justify-center flex-shrink-0">
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

        <div className="bg-white rounded-2xl border-2 border-[#BE1832]/20 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌍</span>
            <div>
              <label className="text-sm font-bold text-gray-800">Response language</label>
              <p className="text-xs text-gray-500 mt-0.5">Ruby will give you feedback in this language.</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#BE1832] focus:border-[#BE1832]"
          >
            {SA_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <button
          onClick={() => onStart(mode, language)}
          className="w-full bg-[#BE1832] hover:bg-[#a31529] text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
        >
          {mode === "practice" ? "Start Practice Exam" : "Start Guided Session"}
        </button>
      </div>
    </div>
  );
}

// ── Info Sheet Modal ───────────────────────────────────────────────────────────

function InfoSheetModal({ sheet, onClose }: { sheet: InfoSheet; onClose: () => void }) {
  const markdownContent = sheet.formulaSheetVariant ? FORMULA_SHEETS[sheet.formulaSheetVariant] : null;
  const isPdf = !!sheet.pdfUrl;
  const [pdfError, setPdfError] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-[520px] flex flex-col shadow-2xl h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#BE1832]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="font-bold text-gray-800 text-sm">{sheet.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {isPdf ? (
          pdfError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-sm font-semibold text-gray-600">Data sheet not yet uploaded</p>
            </div>
          ) : (
            <iframe src={sheet.pdfUrl} className="flex-1 w-full" title={sheet.title} onError={() => setPdfError(true)} />
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
              <img key={i} src={url} alt={`${sheet.title} page ${i + 1}`} className="w-full rounded-xl border border-gray-200" />
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
  const questionStartIndices = paper.questions.map((q) =>
    flatQuestions.findIndex((sq) => sq.id === q.subQuestions[0].id)
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, QuestionState>>(() => {
    const init: Record<string, QuestionState> = {};
    flatQuestions.forEach((sq) => {
      init[sq.id] = { textWorking: "", submitted: false, marksEarned: 0, coachMessages: [], attemptCount: 0 };
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
  const [mathsSteps, setMathsSteps] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    flatQuestions.forEach((sq) => { init[sq.id] = ["", "", "", "", ""]; });
    return init;
  });

  const [mobileTab, setMobileTab] = useState<"question" | "feedback">("question");
  const wasEvaluating = useRef(false);

  useEffect(() => {
    setHintLevel(0);
    setMobileTab("question");
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (wasEvaluating.current && !isEvaluating && mode === "guided") {
      setMobileTab("feedback");
    }
    wasEvaluating.current = isEvaluating;
  }, [isEvaluating, mode]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coachEndRef = useRef<HTMLDivElement>(null);
  const currentSQ = flatQuestions[currentIdx];
  const currentAttempt = attempts[currentSQ.id];

  const buildHints = (memoText: string, marks: number): [string, string, string] => {
    const lines = memoText.split("\n").filter((l) => l.trim().startsWith("Mark"));
    const markCount = lines.length;
    const nudge = `This question is worth ${marks} mark${marks !== 1 ? "s" : ""}. There ${markCount > 1 ? `are ${markCount} mark steps` : "is 1 mark step"} — identify each one before writing your answer.`;
    const process = lines[0] ? `First mark: ${lines[0].replace(/^Mark \d+:\s*/i, "").trim()}` : "Start by identifying what the question is asking for, then apply the relevant formula or method.";
    const worked = lines.slice(0, 2).join(" → ").replace(/Mark \d+:\s*/gi, "").trim() || "See the memo for the full worked solution.";
    return [nudge, process, worked];
  };
  const [hint1, hint2, hint3] = buildHints(currentSQ.memoText, currentSQ.marks);

  useEffect(() => { coachEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [attempts, currentIdx]);

  useEffect(() => {
    if (mode === "guided" && currentAttempt.coachMessages.length === 0 && !currentAttempt.submitted) {
      setAttempts((prev) => ({
        ...prev,
        [currentSQ.id]: {
          ...prev[currentSQ.id],
          coachMessages: [{ type: "system", content: `Show me your working for **${currentSQ.label}** below. Type it out or upload a photo of your handwritten work.` }],
        },
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, mode]);

  const updateAttempt = useCallback((id: string, patch: Partial<QuestionState>) => {
    setAttempts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const handleImageSelected = (file: File) => {
    updateAttempt(currentSQ.id, { imageFile: file, imagePreviewUrl: URL.createObjectURL(file) });
  };

  const removeImage = () => {
    const prev = attempts[currentSQ.id];
    if (prev.imagePreviewUrl) URL.revokeObjectURL(prev.imagePreviewUrl);
    updateAttempt(currentSQ.id, { imageFile: undefined, imagePreviewUrl: undefined, imageData: undefined, imageMimeType: undefined });
  };

  const evaluateQuestion = useCallback(async (sq: SubQuestion, attempt: QuestionState, finalMode?: "practice") => {
    const isFinal = finalMode === "practice";
    const isMCQ = sq.type === "mcq" && sq.options;
    const questionText = isMCQ ? `${sq.questionText}\n\nA) ${sq.options!.A}\nB) ${sq.options!.B}\nC) ${sq.options!.C}\nD) ${sq.options!.D}` : sq.questionText;
    const studentText = isMCQ ? `Student selected: ${attempt.selectedOption ?? "(no answer selected)"}` : attempt.textWorking;
    let imageData: string | undefined;
    let imageMimeType: string | undefined;
    if (!isMCQ && attempt.imageFile) {
      imageData = await fileToBase64(attempt.imageFile);
      imageMimeType = attempt.imageFile.type;
    }
    const res = await apiFetch("/api/matric/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionLabel: sq.label, questionText, memoText: sq.memoText, studentText, imageData, imageMimeType, language, mode: isFinal ? "practice" : mode, attemptCount: attempt.attemptCount }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[evaluate] HTTP", res.status, body);
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json() as { marksEarned?: number; totalMarks?: number; allCorrect?: boolean; feedback?: string };
    return { marksEarned: data.marksEarned ?? 0, totalMarks: data.totalMarks ?? sq.marks, allCorrect: data.allCorrect ?? false, feedback: data.feedback ?? "Evaluation complete." };
  }, [language, mode]);

  const handleSubmitWorking = async () => {
    const isMCQ = currentSQ.type === "mcq";
    if (isMCQ ? !currentAttempt.selectedOption : (!currentAttempt.textWorking.trim() && !currentAttempt.imageFile)) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateQuestion(currentSQ, currentAttempt);
      updateAttempt(currentSQ.id, {
        submitted: true, marksEarned: result.marksEarned, attemptCount: currentAttempt.attemptCount + 1,
        coachMessages: [...currentAttempt.coachMessages, { type: "ai", content: result.feedback, marksEarned: result.marksEarned, totalMarks: result.totalMarks }],
        imageData: currentAttempt.imageFile ? await fileToBase64(currentAttempt.imageFile) : undefined,
        imageMimeType: currentAttempt.imageFile?.type,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown error";
      console.error("[handleSubmitWorking] caught:", err);
      updateAttempt(currentSQ.id, { coachMessages: [...currentAttempt.coachMessages, { type: "system", content: `Something went wrong (${msg}). Please try again.` }] });
    } finally { setIsEvaluating(false); }
  };

  const handleRetry = () => {
    updateAttempt(currentSQ.id, {
      submitted: false, textWorking: "", imageFile: undefined, imagePreviewUrl: undefined, imageData: undefined,
      coachMessages: [...currentAttempt.coachMessages, { type: "system", content: `Try again for **${currentSQ.label}**. Show your updated working below.` }],
    });
  };

  const handleSubmitPaper = async () => {
    setIsSubmittingPaper(true);
    const updatedAttempts = { ...attempts };
    for (let i = 0; i < flatQuestions.length; i++) {
      const sq = flatQuestions[i];
      const attempt = updatedAttempts[sq.id];
      const hasAnswer = sq.type === "mcq" ? !!attempt.selectedOption : !!(attempt.textWorking.trim() || attempt.imageFile);
      if (!hasAnswer) { setSubmitProgress(i + 1); continue; }
      try {
        const result = await evaluateQuestion(sq, attempt, "practice");
        updatedAttempts[sq.id] = { ...attempt, submitted: true, marksEarned: result.marksEarned, coachMessages: [{ type: "ai", content: result.feedback, marksEarned: result.marksEarned, totalMarks: result.totalMarks }] };
      } catch { updatedAttempts[sq.id] = { ...attempt, submitted: true, marksEarned: 0 }; }
      setSubmitProgress(i + 1);
      setAttempts({ ...updatedAttempts });
    }
    setIsSubmittingPaper(false);
    onFinish(updatedAttempts);
  };

  const answeredCount = Object.entries(attempts).filter(([id, a]) => {
    const sq = flatQuestions.find((q) => q.id === id);
    return sq?.type === "mcq" ? !!a.selectedOption : !!(a.textWorking.trim() || a.imageFile);
  }).length;

  const goTo = (idx: number) => { if (idx >= 0 && idx < totalQuestions) setCurrentIdx(idx); };

  if (isSubmittingPaper) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#F4F4F5] gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-[#BE1832]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-800">Evaluating your paper…</p>
          <p className="text-sm text-gray-500 mt-1">Question {submitProgress} of {totalQuestions}</p>
        </div>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#BE1832] rounded-full transition-all duration-300" style={{ width: `${(submitProgress / totalQuestions) * 100}%` }} />
        </div>
      </div>
    );
  }

  const pctComplete = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-3 sm:px-4">
        <div className="flex items-center gap-2 py-2">
          <button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#BE1832] bg-gray-100 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{currentSQ.label}</span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-xs font-semibold text-[#BE1832] whitespace-nowrap">{currentSQ.marks} {currentSQ.marks === 1 ? "mk" : "mks"}</span>
          <span className="text-gray-300 text-xs hidden sm:inline">·</span>
          <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:inline">{pctComplete}% done</span>
          <div className="hidden sm:block w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
            <div className="h-full bg-[#BE1832] rounded-full transition-all" style={{ width: `${pctComplete}%` }} />
          </div>
          {paper.infoSheet && (
            <button onClick={() => setShowInfoSheet(true)} className="ml-auto flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0 bg-[#BE1832] text-white hover:bg-[#a31529]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Info</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 pb-2 sm:hidden">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#BE1832] rounded-full transition-all" style={{ width: `${pctComplete}%` }} />
          </div>
          <span className="text-[11px] text-gray-500 whitespace-nowrap flex-shrink-0">{pctComplete}% done</span>
          <select
            value={paper.questions.findIndex((q) => q.subQuestions.some((sq) => sq.id === currentSQ.id))}
            onChange={(e) => { const idx = questionStartIndices[Number(e.target.value)]; if (idx >= 0) setCurrentIdx(idx); }}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#BE1832] max-w-[120px] flex-shrink-0"
          >
            {paper.questions.map((q, i) => <option key={q.number} value={i}>Q{q.number}: {q.title}</option>)}
          </select>
        </div>
        <div className="hidden sm:flex items-center gap-2 pb-2">
          <select
            value={paper.questions.findIndex((q) => q.subQuestions.some((sq) => sq.id === currentSQ.id))}
            onChange={(e) => { const idx = questionStartIndices[Number(e.target.value)]; if (idx >= 0) setCurrentIdx(idx); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#BE1832] max-w-[260px]"
          >
            {paper.questions.map((q, i) => <option key={q.number} value={i}>Q{q.number}: {q.title}</option>)}
          </select>
        </div>
      </div>

      {showInfoSheet && paper.infoSheet && <InfoSheetModal sheet={paper.infoSheet} onClose={() => setShowInfoSheet(false)} />}

      {expandedDiagramUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setExpandedDiagramUrl(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button onClick={() => setExpandedDiagramUrl(null)} className="absolute -top-10 right-0 text-white/80 hover:text-white p-1">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={expandedDiagramUrl} alt="Diagram" className="max-h-[85vh] max-w-full object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {/* Mobile tab bar — guided mode only */}
      {mode === "guided" && (
        <div className="sm:hidden flex-shrink-0 flex border-b border-gray-100 bg-white">
          <button
            onClick={() => setMobileTab("question")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
              mobileTab === "question" ? "text-[#BE1832] border-[#BE1832]" : "text-gray-400 border-transparent"
            }`}
          >
            Question
          </button>
          <button
            onClick={() => setMobileTab("feedback")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
              mobileTab === "feedback" ? "text-[#BE1832] border-[#BE1832]" : "text-gray-400 border-transparent"
            }`}
          >
            Ruby Feedback
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0">
        {/* Left panel */}
        <div className={`flex flex-col border-b sm:border-b-0 sm:border-r border-gray-200 overflow-hidden ${
          mode === "practice"
            ? "flex-1"
            : `flex-1 sm:w-[60%] sm:flex-none ${mobileTab === "feedback" ? "hidden sm:flex" : ""}`
        }`}>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-shrink-0 overflow-y-auto px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-100 max-h-[30%] sm:max-h-[45%]">
              {(() => {
                const parentQ = paper.questions.find((q) => q.subQuestions.some((sq) => sq.id === currentSQ.id));
                const sqIndex = parentQ?.subQuestions.findIndex((sq) => sq.id === currentSQ.id) ?? -1;
                let passageText: string | undefined = parentQ?.passageText;
                if (parentQ && sqIndex >= 0) {
                  for (let i = 0; i <= sqIndex; i++) {
                    if (parentQ.subQuestions[i].passageText) passageText = parentQ.subQuestions[i].passageText;
                  }
                }
                const diagramUrls: string[] = (() => {
                  if (currentSQ.diagramUrls?.length) return currentSQ.diagramUrls;
                  if (currentSQ.diagramUrl) return [currentSQ.diagramUrl];
                  if (parentQ?.diagramUrls?.length) return parentQ.diagramUrls;
                  if (parentQ?.diagramUrl) return [parentQ.diagramUrl];
                  return [];
                })();
                return (
                  <>
                    {passageText && (
                      <div className="mb-3 px-3 py-2.5 bg-stone-50 border-l-4 border-stone-300 rounded-r-md">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap font-serif leading-relaxed">{passageText}</p>
                      </div>
                    )}
                    <div className="text-base text-gray-800 leading-relaxed">
                      <MathMarkdown content={currentSQ.questionText} />
                    </div>
                    {diagramUrls.length > 0 && (
                      <div className="mt-3 flex flex-col items-center gap-2">
                        {diagramUrls.map((url, i) => (
                          <button key={i} onClick={() => setExpandedDiagramUrl(url)} className="relative group block rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-w-[220px]" title="Tap to expand">
                            <img src={url} alt={`Diagram ${diagramUrls.length > 1 ? i + 1 : ""} for ${currentSQ.label}`} className="w-full object-contain max-h-28" />
                            <div className="absolute inset-0 flex items-end justify-center pb-2">
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
                    <span className="text-amber-600">{currentAttempt.marksEarned}/{currentSQ.marks} marks earned</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-5 py-2 sm:py-3 gap-1.5 sm:gap-2">
              {isMaths ? (
                <>
                  <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5 pr-0.5">
                    {STEP_LABELS.map((label, i) => {
                      const steps = mathsSteps[currentSQ.id] ?? ["", "", "", "", ""];
                      return (
                        <div key={label} className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-xs font-semibold text-gray-400 mt-2 w-14 sm:w-20 text-right">{label}</span>
                          <textarea
                            value={steps[i]}
                            disabled={currentAttempt.submitted}
                            onChange={(e) => {
                              const updated = [...steps]; updated[i] = e.target.value;
                              setMathsSteps((prev) => ({ ...prev, [currentSQ.id]: updated }));
                              updateAttempt(currentSQ.id, { textWorking: updated.map((v, j) => (v.trim() ? `${STEP_LABELS[j]}: ${v.trim()}` : "")).filter(Boolean).join("\n") });
                            }}
                            placeholder={i < 4 ? `Working for ${label.toLowerCase()}…` : "Final answer…"}
                            rows={2}
                            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BE1832] resize-none font-mono disabled:opacity-60"
                            style={{ minHeight: "clamp(2.5rem, 8vh, 4.5rem)" }}
                            onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = `${t.scrollHeight}px`; }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-4 flex-shrink-0">
                    {!currentAttempt.imagePreviewUrl && (
                      <>
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors">
                          <span className="text-base leading-none">✏️</span> Upload handwritten working
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelected(f); e.target.value = ""; }} />
                      </>
                    )}
                    {hintLevel < 3 && (
                      <button onClick={() => setHintLevel((p) => Math.min(p + 1, 3))} className={`flex items-center gap-1.5 text-sm transition-colors ${hintLevel === 0 ? "text-yellow-500 hover:text-yellow-700" : hintLevel === 1 ? "text-orange-500 hover:text-orange-700" : "text-blue-500 hover:text-blue-700"}`}>
                        <span className="text-base leading-none">💡</span>
                        {hintLevel === 0 ? "Get a hint" : hintLevel === 1 ? "A bit more help" : "Show me the first step"}
                      </button>
                    )}
                  </div>
                  {currentAttempt.imagePreviewUrl && (
                    <div className="relative flex-shrink-0">
                      <img src={currentAttempt.imagePreviewUrl} alt="Your working" className="w-full rounded-xl border border-gray-200 max-h-32 object-contain bg-gray-50" />
                      <button onClick={removeImage} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                  {hintLevel > 0 && (
                    <div className={`flex-shrink-0 rounded-xl px-4 py-3 border flex items-start gap-2.5 ${hintLevel === 1 ? "bg-yellow-50 border-yellow-200" : hintLevel === 2 ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"}`}>
                      <span className="text-base leading-none flex-shrink-0 mt-0.5">💡</span>
                      <p className={`text-sm leading-relaxed ${hintLevel === 1 ? "text-yellow-800" : hintLevel === 2 ? "text-orange-800" : "text-blue-800"}`}>
                        <span className="font-semibold">{hintLevel === 1 ? "Hint: " : hintLevel === 2 ? "More help: " : "First step: "}</span>
                        {hintLevel === 1 ? hint1 : hintLevel === 2 ? hint2 : hint3}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <textarea
                    value={currentAttempt.textWorking}
                    onChange={(e) => updateAttempt(currentSQ.id, { textWorking: e.target.value })}
                    placeholder="Show your working here"
                    className="flex-1 min-h-0 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BE1832] resize-none font-mono"
                  />
                  <div className="flex items-center justify-center gap-4 flex-shrink-0">
                    {!currentAttempt.imagePreviewUrl && (
                      <>
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors">
                          <span className="text-base leading-none">✏️</span> Upload handwritten working
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelected(f); e.target.value = ""; }} />
                      </>
                    )}
                    {hintLevel < 3 && (
                      <button onClick={() => setHintLevel((p) => Math.min(p + 1, 3))} className={`flex items-center gap-1.5 text-sm transition-colors ${hintLevel === 0 ? "text-yellow-500 hover:text-yellow-700" : hintLevel === 1 ? "text-orange-500 hover:text-orange-700" : "text-blue-500 hover:text-blue-700"}`}>
                        <span className="text-base leading-none">💡</span>
                        {hintLevel === 0 ? "Get a hint" : hintLevel === 1 ? "A bit more help" : "Show me the first step"}
                      </button>
                    )}
                  </div>
                  {currentAttempt.imagePreviewUrl && (
                    <div className="relative flex-shrink-0">
                      <img src={currentAttempt.imagePreviewUrl} alt="Your working" className="w-full rounded-xl border border-gray-200 max-h-32 object-contain bg-gray-50" />
                      <button onClick={removeImage} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                  {hintLevel > 0 && (
                    <div className={`flex-shrink-0 rounded-xl px-4 py-3 border flex items-start gap-2.5 ${hintLevel === 1 ? "bg-yellow-50 border-yellow-200" : hintLevel === 2 ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"}`}>
                      <span className="text-base leading-none flex-shrink-0 mt-0.5">💡</span>
                      <p className={`text-sm leading-relaxed ${hintLevel === 1 ? "text-yellow-800" : hintLevel === 2 ? "text-orange-800" : "text-blue-800"}`}>
                        <span className="font-semibold">{hintLevel === 1 ? "Hint: " : hintLevel === 2 ? "More help: " : "First step: "}</span>
                        {hintLevel === 1 ? hint1 : hintLevel === 2 ? hint2 : hint3}
                      </p>
                    </div>
                  )}
                </>
              )}

              {mode === "guided" ? (
                currentAttempt.submitted ? (
                  <div className="flex gap-2 flex-shrink-0">
                    {currentSQ.type !== "mcq" && (
                      <button onClick={handleRetry} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Try again</button>
                    )}
                    <button onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === totalQuestions - 1} className="flex-1 py-2.5 rounded-xl bg-[#BE1832] text-white text-sm font-medium hover:bg-[#a31529] disabled:opacity-40 transition-colors">
                      Next question →
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitWorking}
                    disabled={isEvaluating || (!currentAttempt.textWorking.trim() && !currentAttempt.imageFile)}
                    className="flex-shrink-0 w-full py-2.5 rounded-xl bg-[#BE1832] text-white text-sm font-semibold hover:bg-[#a31529] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isEvaluating ? (
                      <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Evaluating…</>
                    ) : "Submit working"}
                  </button>
                )
              ) : (
                <div className="flex justify-center gap-3 flex-shrink-0">
                  <button onClick={() => goTo(currentIdx - 1)} disabled={currentIdx === 0} className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors">← Prev</button>
                  <button onClick={() => { if (currentAttempt.textWorking.trim() || currentAttempt.imageFile) updateAttempt(currentSQ.id, { submitted: false }); goTo(currentIdx + 1); }} disabled={currentIdx === totalQuestions - 1} className="py-2.5 px-5 rounded-xl bg-[#BE1832] text-white text-sm font-semibold hover:bg-[#a31529] disabled:opacity-40 transition-colors">Save & Next →</button>
                  <button onClick={() => goTo(currentIdx + 1)} disabled={currentIdx === totalQuestions - 1} className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors">Skip</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-2 space-y-1.5">
            {mode === "practice" && answeredCount > 0 && (
              <div className="flex justify-end">
                <button onClick={handleSubmitPaper} className="text-xs font-semibold bg-[#BE1832] text-white px-3 py-1.5 rounded-lg hover:bg-[#a31529] transition-colors">Submit Paper</button>
              </div>
            )}
          </div>
        </div>

        {/* Right panel — AI coach (guided only) */}
        {mode === "guided" && (
          <div className={`flex flex-col overflow-hidden bg-white border-t sm:border-t-0 sm:w-[40%] ${mobileTab === "question" ? "hidden sm:flex" : "flex-1 sm:flex-none"}`}>
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                <img src="/icons/icon-192.png" alt="Ruby" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Ruby</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{language}</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {currentAttempt.coachMessages.length === 0 && (
                <div className="text-sm text-gray-400 italic text-center py-8">Submit your working to get feedback.</div>
              )}
              {currentAttempt.coachMessages.map((msg, i) => (
                <div key={i}>
                  {msg.type === "system" ? (
                    <div className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3"><MathMarkdown content={msg.content} /></div>
                  ) : (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-4 space-y-3">
                      <div className="text-sm text-gray-700 leading-relaxed"><MathMarkdown content={msg.content} /></div>
                      {currentSQ.memoImageUrl && i === currentAttempt.coachMessages.length - 1 && (
                        <div className="pt-2 space-y-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Model Answer</p>
                          <button onClick={() => setExpandedDiagramUrl(currentSQ.memoImageUrl!)} className="relative group block rounded-xl overflow-hidden border border-rose-200 bg-white max-w-[220px]" title="Tap to expand">
                            <img src={currentSQ.memoImageUrl} alt="Model answer sketch" className="w-full object-contain max-h-28" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full transition-opacity">Expand</span>
                            </div>
                          </button>
                        </div>
                      )}
                      {msg.marksEarned !== undefined && msg.totalMarks !== undefined && (
                        <div className="flex items-center gap-2 pt-1 border-t border-rose-100">
                          <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${msg.marksEarned === msg.totalMarks ? "bg-green-100 text-green-700" : msg.marksEarned > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                            {msg.marksEarned}/{msg.totalMarks} marks
                          </div>
                          {msg.marksEarned === msg.totalMarks && <span className="text-xs text-green-600 font-medium">Full marks!</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isEvaluating && (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <svg className="w-4 h-4 animate-spin text-[#BE1832]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  Looking this over…
                </div>
              )}
              <div ref={coachEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Summary View ───────────────────────────────────────────────────────────────

function SummaryView({
  paper,
  attempts,
  onRetry,
  onBack,
}: {
  paper: Paper;
  attempts: Record<string, QuestionState>;
  onRetry: () => void;
  onBack: () => void;
}) {
  const flatQuestions = getFlatSubQuestions(paper);
  const totalEarned = flatQuestions.reduce((sum, sq) => sum + (attempts[sq.id]?.marksEarned ?? 0), 0);
  const totalPossible = flatQuestions.reduce((sum, sq) => sum + sq.marks, 0);
  const pct = Math.round((totalEarned / totalPossible) * 100);
  const topicBreakdown = getTopicBreakdown(paper, attempts);
  const sortedTopics = Object.entries(topicBreakdown).sort(([, a], [, b]) => a.earned / a.total - b.earned / b.total);

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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
          <div className="text-5xl font-black text-[#BE1832]">{pct}%</div>
          <div>
            <p className={`font-bold text-lg ${grade.color}`}>{grade.label}</p>
            <p className="text-gray-400 text-sm mt-1">{totalEarned} / {totalPossible} marks · Mathematics {paper.session} 2026</p>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#BE1832] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Topic Breakdown</h2>
          {sortedTopics.map(([topic, { earned, total }]) => {
            const topicPct = Math.round((earned / total) * 100);
            return (
              <div key={topic} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{topic}</span>
                  <span className="text-sm font-bold text-gray-800">{earned}/{total}<span className="text-xs text-gray-400 font-normal ml-1">({topicPct}%)</span></span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${topicPct >= 60 ? "bg-green-400" : topicPct >= 40 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${topicPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {sortedTopics.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm space-y-1">
            <p className="font-semibold text-amber-800">Focus area</p>
            <p className="text-amber-700">Your weakest topic was <strong>{sortedTopics[0][0]}</strong> ({Math.round((sortedTopics[0][1].earned / sortedTopics[0][1].total) * 100)}%). Practice these concepts to improve.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onRetry} className="flex-1 py-3 rounded-xl border-2 border-[#BE1832] text-[#BE1832] font-semibold text-sm hover:bg-rose-50 transition-colors">Try this paper again</button>
          <button onClick={onBack} className="flex-1 py-3 rounded-xl bg-[#BE1832] text-white font-semibold text-sm hover:bg-[#a31529] transition-colors">Choose another paper</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PrepPapers2026({ onBack }: { onBack?: () => void }) {
  const [phase, setPhase] = useState<Phase>("subjects");
  const [selectedSubject, setSelectedSubject] = useState<PrepSubjectId | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode>("guided");
  const [language, setLanguage] = useState("English");
  const [finalAttempts, setFinalAttempts] = useState<Record<string, QuestionState> | null>(null);

  const handleSubjectSelect = (subjectId: PrepSubjectId) => { setSelectedSubject(subjectId); setPhase("papers"); };
  const handlePaperSelect = (paper: Paper) => { setSelectedPaper(paper); setPhase("mode"); };

  const handleStart = (mode: SessionMode, lang: string) => {
    setSessionMode(mode); setLanguage(lang); setFinalAttempts(null);
    if (selectedPaper) savePaperProgress(selectedPaper.id, "in_progress");
    setPhase("session");
  };

  const handleFinish = (attempts: Record<string, QuestionState>) => {
    if (selectedPaper) {
      const flatQs = getFlatSubQuestions(selectedPaper);
      const earned = flatQs.reduce((s, q) => s + (attempts[q.id]?.marksEarned ?? 0), 0);
      const total = flatQs.reduce((s, q) => s + q.marks, 0);
      savePaperProgress(selectedPaper.id, "completed", total > 0 ? Math.round((earned / total) * 100) : 0);
    }
    setFinalAttempts(attempts); setPhase("summary");
  };

  const handleRetry = () => { setFinalAttempts(null); setPhase("mode"); };
  const handleBackToSubjects = () => { setSelectedSubject(null); setSelectedPaper(null); setFinalAttempts(null); setPhase("subjects"); };
  const handleBackToPapers = () => { setSelectedPaper(null); setFinalAttempts(null); setPhase("papers"); };

  if (phase === "subjects") return <SubjectSelect onSelect={handleSubjectSelect} onBack={onBack ?? (() => {})} />;
  if (phase === "papers" && selectedSubject) return <PaperList subjectId={selectedSubject} onSelect={handlePaperSelect} onBack={handleBackToSubjects} />;
  if (phase === "mode" && selectedPaper) return <ModeSelect paper={selectedPaper} onStart={handleStart} onBack={handleBackToPapers} />;
  if (phase === "session" && selectedPaper) return <SessionView key={`${selectedPaper.id}-${sessionMode}-${language}`} paper={selectedPaper} mode={sessionMode} language={language} onFinish={handleFinish} onBack={handleBackToPapers} />;
  if (phase === "summary" && selectedPaper && finalAttempts) return <SummaryView paper={selectedPaper} attempts={finalAttempts} onRetry={handleRetry} onBack={handleBackToPapers} />;
  return null;
}
