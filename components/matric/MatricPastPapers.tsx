"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { apiFetch } from "@/lib/fetch";
import EduBackground from "@/components/EduBackground";
import { PAPERS, Paper, SubQuestion, getFlatSubQuestions, getTopicBreakdown } from "@/lib/matric/papers";

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

const SUBJECTS = [
  {
    id: "accounting",
    name: "Accounting",
    emoji: "📒",
    color: "from-emerald-500 to-teal-600",
    available: false,
  },
  {
    id: "afrikaans",
    name: "Afrikaans",
    emoji: "🇿🇦",
    color: "from-orange-400 to-amber-500",
    available: false,
  },
  {
    id: "english",
    name: "English",
    emoji: "✏️",
    color: "from-sky-400 to-blue-500",
    available: false,
  },
  {
    id: "geography",
    name: "Geography",
    emoji: "🌍",
    color: "from-lime-500 to-green-600",
    available: false,
  },
  {
    id: "history",
    name: "History",
    emoji: "📜",
    color: "from-amber-500 to-yellow-600",
    available: false,
  },
  {
    id: "life-sciences",
    name: "Life Sciences",
    emoji: "🧬",
    color: "from-pink-500 to-rose-600",
    available: false,
  },
  {
    id: "mathematics",
    name: "Mathematics",
    emoji: "📐",
    color: "from-[#BE1832] to-rose-700",
    available: true,
  },
  {
    id: "maths-literacy",
    name: "Maths Literacy",
    emoji: "🔢",
    color: "from-violet-500 to-purple-600",
    available: false,
  },
  {
    id: "physical-science",
    name: "Physical Science",
    emoji: "⚗️",
    color: "from-cyan-500 to-blue-600",
    available: false,
  },
] as const;

type SubjectId = (typeof SUBJECTS)[number]["id"];

// ── Subject Select ─────────────────────────────────────────────────────────────

function SubjectSelect({ onSelect }: { onSelect: (subjectId: SubjectId) => void }) {
  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative max-w-3xl mx-auto px-5 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Matric Exam Prep</h1>
          <p className="text-gray-500 text-sm">Work through real past papers with step-by-step AI tutoring. Get feedback in your home language.</p>
        </div>

        {/* Subject cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Choose a subject</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUBJECTS.map((subject) => (
              <button
                key={subject.id}
                onClick={() => subject.available && onSelect(subject.id as SubjectId)}
                disabled={!subject.available}
                className={`relative rounded-2xl p-5 text-left transition-all group ${
                  subject.available
                    ? "shadow-sm hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Card gradient background */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${subject.color} opacity-10 group-hover:opacity-15 transition-opacity`} />
                <div className="absolute inset-0 rounded-2xl bg-white border-2 border-gray-300" style={{ zIndex: -1 }} />

                <div className="relative space-y-3">
                  {/* Emoji icon */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-xl shadow-sm`}>
                    {subject.emoji}
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-snug">{subject.name}</p>
                    {subject.available ? (
                      <p className="text-xs text-[#BE1832] font-medium mt-0.5">Papers available →</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">Coming soon</p>
                    )}
                  </div>
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

// ── Paper List ─────────────────────────────────────────────────────────────────

function PaperList({
  subjectId,
  onSelect,
  onBack,
}: {
  subjectId: SubjectId;
  onSelect: (paper: Paper) => void;
  onBack: () => void;
}) {
  const subject = SUBJECTS.find((s) => s.id === subjectId)!;
  const papers = PAPERS.filter((p) => p.subject.toLowerCase().replace(" ", "-") === subjectId || subjectId === "mathematics");

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
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
            {subject.emoji}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{subject.name}</h1>
            <p className="text-sm text-gray-400">{papers.length} {papers.length === 1 ? "paper" : "papers"} available</p>
          </div>
        </div>

        {/* Paper cards */}
        <div className="space-y-3">
          {papers.map((paper) => (
            <button
              key={paper.id}
              onClick={() => onSelect(paper)}
              className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-rose-200 transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold bg-rose-50 text-[#BE1832] px-2.5 py-1 rounded-full">
                      {paper.paperCode}
                    </span>
                    <span className="text-xs text-gray-400">{paper.session} {paper.year}</span>
                  </div>
                  <p className="font-bold text-gray-800">
                    {paper.subject} — Paper {paper.paperCode}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{paper.totalMarks} marks</span>
                    <span>·</span>
                    <span>{paper.durationHours} hours</span>
                    <span>·</span>
                    <span>{paper.questions.length} questions</span>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-300 group-hover:text-[#BE1832] flex-shrink-0 transition-colors"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
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
  const [mode, setMode] = useState<SessionMode | null>(null);
  const [language, setLanguage] = useState("English");

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5]">
      <div className="max-w-2xl mx-auto px-5 py-10 space-y-8">
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
                bullets: [
                  "AI evaluates after each question",
                  "Step-by-step hints available",
                  "Feedback in your home language",
                  "No time pressure",
                ],
                color: "border-rose-200 bg-rose-50",
                activeColor: "border-[#BE1832] bg-rose-50 ring-2 ring-[#BE1832]",
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

        {/* Language selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Response language</label>
          <p className="text-xs text-gray-400">Ruby will give feedback in this language.</p>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#BE1832]"
          >
            {SA_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => mode && onStart(mode, language)}
          disabled={!mode}
          className="w-full bg-[#BE1832] hover:bg-[#a31529] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
        >
          {mode === "practice"
            ? "Start Practice Exam"
            : mode === "guided"
            ? "Start Guided Session"
            : "Select a mode to continue"}
        </button>
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coachEndRef = useRef<HTMLDivElement>(null);

  const currentSQ = flatQuestions[currentIdx];
  const currentAttempt = attempts[currentSQ.id];

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
      let imageData: string | undefined;
      let imageMimeType: string | undefined;

      if (attempt.imageFile) {
        imageData = await fileToBase64(attempt.imageFile);
        imageMimeType = attempt.imageFile.type;
      }

      const res = await apiFetch("/api/matric/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionLabel: sq.label,
          questionText: sq.questionText,
          memoText: sq.memoText,
          studentText: attempt.textWorking,
          imageData,
          imageMimeType,
          language,
          mode: isFinal ? "practice" : mode,
          attemptCount: attempt.attemptCount,
        }),
      });

      if (!res.ok) throw new Error("Evaluation failed");

      const data = await res.json() as {
        marksEarned?: number;
        totalMarks?: number;
        allCorrect?: boolean;
        feedback?: string;
      };

      return {
        marksEarned: data.marksEarned ?? 0,
        totalMarks: data.totalMarks ?? sq.marks,
        allCorrect: data.allCorrect ?? false,
        feedback: data.feedback ?? "Evaluation complete.",
      };
    },
    [language, mode]
  );

  const handleSubmitWorking = async () => {
    if (!currentAttempt.textWorking.trim() && !currentAttempt.imageFile) return;
    setIsEvaluating(true);

    try {
      const result = await evaluateQuestion(currentSQ, currentAttempt);

      const newMsg: CoachMessage = {
        type: "ai",
        content: result.feedback,
        marksEarned: result.marksEarned,
        totalMarks: result.totalMarks,
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
    } catch {
      updateAttempt(currentSQ.id, {
        coachMessages: [
          ...currentAttempt.coachMessages,
          { type: "system", content: "Something went wrong. Please try again." },
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
      if (!attempt.textWorking.trim() && !attempt.imageFile) {
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

  const answeredCount = Object.values(attempts).filter(
    (a) => a.textWorking.trim() || a.imageFile
  ).length;
  const submittedCount = Object.values(attempts).filter((a) => a.submitted).length;

  const goTo = (idx: number) => {
    if (idx >= 0 && idx < totalQuestions) setCurrentIdx(idx);
  };

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
          <p className="text-sm text-gray-500 mt-1">
            Question {submitProgress} of {totalQuestions}
          </p>
        </div>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#BE1832] rounded-full transition-all duration-300"
            style={{ width: `${(submitProgress / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top progress bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Exit
        </button>
        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">
          {paper.subject} {paper.paperCode}
        </span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#BE1832] rounded-full transition-all"
            style={{ width: `${(submittedCount / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {submittedCount}/{totalQuestions}
        </span>
      </div>

      {/* Split screen (guided) / Full screen (practice) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── LEFT PANEL: Question + Working ── */}
        <div className={`${mode === "practice" ? "flex-1" : "w-1/2"} flex flex-col border-r border-gray-200 overflow-hidden`}>
          {/* Question navigation header */}
          <div className="flex-shrink-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <select
              value={paper.questions.findIndex((q) => q.subQuestions.some((sq) => sq.id === currentSQ.id))}
              onChange={(e) => {
                const idx = questionStartIndices[Number(e.target.value)];
                if (idx >= 0) setCurrentIdx(idx);
              }}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#BE1832]"
            >
              {paper.questions.map((q, i) => (
                <option key={q.number} value={i}>
                  Q{q.number} — {q.title}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
              {currentSQ.marks} {currentSQ.marks === 1 ? "mark" : "marks"}
            </span>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            {/* Question text */}
            <div className="px-5 py-5 border-b border-gray-100">
              <div className="text-sm text-gray-800 leading-relaxed">
                <MathMarkdown content={currentSQ.questionText} />
              </div>

              {currentAttempt.submitted && mode === "guided" && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold">
                  {currentAttempt.marksEarned >= currentSQ.marks ? (
                    <span className="text-green-600">✓ {currentAttempt.marksEarned}/{currentSQ.marks} marks earned</span>
                  ) : (
                    <span className="text-amber-600">
                      {currentAttempt.marksEarned}/{currentSQ.marks} marks earned
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Working area */}
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Your Working
              </p>

              {/* Text area */}
              <textarea
                value={currentAttempt.textWorking}
                onChange={(e) =>
                  updateAttempt(currentSQ.id, { textWorking: e.target.value })
                }
                placeholder="Type your working here…"
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BE1832] resize-none"
              />

              {/* Image upload */}
              {!currentAttempt.imagePreviewUrl ? (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:text-[#BE1832] hover:border-[#BE1832] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">Upload Image</span>
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
              ) : (
                <div className="relative">
                  <img
                    src={currentAttempt.imagePreviewUrl}
                    alt="Your working"
                    className="w-full rounded-xl border border-gray-200 max-h-48 object-contain bg-gray-50"
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

              {/* Submit / action buttons */}
              {mode === "guided" ? (
                currentAttempt.submitted ? (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleRetry}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Try again
                    </button>
                    <button
                      onClick={() => goTo(currentIdx + 1)}
                      disabled={currentIdx === totalQuestions - 1}
                      className="flex-1 py-2.5 rounded-xl bg-[#BE1832] text-white text-sm font-medium hover:bg-[#a31529] disabled:opacity-40 transition-colors"
                    >
                      Next question →
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitWorking}
                    disabled={
                      isEvaluating ||
                      (!currentAttempt.textWorking.trim() && !currentAttempt.imageFile)
                    }
                    className="w-full py-2.5 rounded-xl bg-[#BE1832] text-white text-sm font-semibold hover:bg-[#a31529] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isEvaluating ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Evaluating…
                      </>
                    ) : (
                      "Submit working"
                    )}
                  </button>
                )
              ) : (
                /* Practice mode — save & next */
                <button
                  onClick={() => {
                    if (currentAttempt.textWorking.trim() || currentAttempt.imageFile) {
                      updateAttempt(currentSQ.id, { submitted: false });
                    }
                    goTo(currentIdx + 1);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#BE1832] text-white text-sm font-semibold hover:bg-[#a31529] transition-colors"
                >
                  {currentIdx < totalQuestions - 1 ? "Save & Next →" : "Save"}
                </button>
              )}
            </div>

            {/* Question dot navigator */}
            <div className="px-5 pb-5">
              <div className="flex flex-wrap gap-1.5">
                {flatQuestions.map((sq, idx) => {
                  const a = attempts[sq.id];
                  const hasContent = a.textWorking.trim() || a.imageFile;
                  const isDone = a.submitted;
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={sq.id}
                      onClick={() => setCurrentIdx(idx)}
                      title={sq.label}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-[#BE1832] text-white shadow"
                          : isDone
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : hasContent
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-gray-100 text-gray-400 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {answeredCount}/{totalQuestions} answered
              </p>
              {mode === "practice" && answeredCount > 0 && (
                <button
                  onClick={handleSubmitPaper}
                  className="mt-3 w-full py-2.5 rounded-xl bg-[#BE1832] text-white font-semibold text-sm hover:bg-[#a31529] transition-colors"
                >
                  Submit Paper for Evaluation
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: AI Coach (guided mode only) ── */}
        {mode === "guided" && <div className="w-1/2 flex flex-col overflow-hidden bg-white">
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                <img src="/icons/icon-192.png" alt="Ruby" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Ruby</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{language}</span>
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
                      <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-4 space-y-3">
                        {msg.marksEarned !== undefined && msg.totalMarks !== undefined && (
                          <div className="flex items-center gap-2">
                            <div
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                msg.marksEarned === msg.totalMarks
                                  ? "bg-green-100 text-green-700"
                                  : msg.marksEarned > 0
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {msg.marksEarned}/{msg.totalMarks} marks
                            </div>
                            {msg.marksEarned === msg.totalMarks && (
                              <span className="text-xs text-green-600 font-medium">Full marks!</span>
                            )}
                          </div>
                        )}
                        <div className="text-sm text-gray-700 leading-relaxed">
                          <MathMarkdown content={msg.content} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isEvaluating && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                    <svg className="w-4 h-4 animate-spin text-[#BE1832]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Evaluating your working…
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
}: {
  paper: Paper;
  attempts: Record<string, QuestionState>;
  mode: SessionMode;
  onRetry: () => void;
  onBack: () => void;
}) {
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
          <div className="text-5xl font-black text-[#BE1832]">{pct}%</div>
          <div>
            <p className={`font-bold text-lg ${grade.color}`}>{grade.label}</p>
            <p className="text-gray-400 text-sm mt-1">
              {totalEarned} / {totalPossible} marks · {paper.subject} {paper.paperCode} {paper.session} {paper.year}
            </p>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#BE1832] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Topic Breakdown</h2>
          {sortedTopics.map(([topic, { earned, total }]) => {
            const topicPct = Math.round((earned / total) * 100);
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
              </div>
            );
          })}
        </div>

        {/* Weakest area callout */}
        {sortedTopics.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm space-y-1">
            <p className="font-semibold text-amber-800">Focus area</p>
            <p className="text-amber-700">
              Your weakest topic was <strong>{sortedTopics[0][0]}</strong> (
              {Math.round((sortedTopics[0][1].earned / sortedTopics[0][1].total) * 100)}%). Practice atomic skills in this area to improve.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-xl border-2 border-[#BE1832] text-[#BE1832] font-semibold text-sm hover:bg-rose-50 transition-colors"
          >
            Try this paper again
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl bg-[#BE1832] text-white font-semibold text-sm hover:bg-[#a31529] transition-colors"
          >
            Choose another paper
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MatricPastPapers() {
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

  const handlePaperSelect = (paper: Paper) => {
    setSelectedPaper(paper);
    setPhase("mode");
  };

  const handleStart = (mode: SessionMode, lang: string) => {
    setSessionMode(mode);
    setLanguage(lang);
    setFinalAttempts(null);
    setPhase("session");
  };

  const handleFinish = (attempts: Record<string, QuestionState>) => {
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
    return <SubjectSelect onSelect={handleSubjectSelect} />;
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
      />
    );
  }

  return null;
}
