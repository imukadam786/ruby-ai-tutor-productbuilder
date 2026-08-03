"use client";

// Shown when the learner opens the Homework tab (before a tutor is chosen).
// Leads with "what's your homework", not "pick a character" — the AI figures
// out the right tutor from what's typed or uploaded, and only asks the
// learner to confirm when more than one tutor plausibly fits. Full tutor
// browsing (personalities, badges) still exists one tap away via
// onBrowseTutors, it just isn't the default gate anymore.

import { useRef, useState } from "react";
import EduBackground from "@/components/EduBackground";
import { getTutor } from "@/lib/tutors";
import { matchTutorByText, tutorForSubject, RoutingResult } from "@/lib/homeworkRouting";
import { getLastTutor, getRecentSessions, formatRelativeTime } from "@/lib/homeworkHistory";

interface HomeworkStartProps {
  /** Learner is ready to chat: tutor (undefined = general Ruby chat), plus
      whatever they already typed/attached so it carries into the first message. */
  onStart: (tutorName: string | undefined, text: string, file: File | null) => void;
  /** One-tap resume with an already-open thread — no new message needed. */
  onContinue: (tutorName: string) => void;
  onBrowseTutors: () => void;
}

const EXAMPLE_PROMPTS = [
  { emoji: "💬", label: "Explain this question", prompt: "Can you explain this question to me?" },
  { emoji: "📷", label: "Solve from photo", prompt: "" },
  { emoji: "📄", label: "Summarise this page", prompt: "Can you summarise this page for me?" },
  { emoji: "📝", label: "Check my answer", prompt: "Can you check if my answer is correct?" },
] as const;

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

export default function HomeworkStart({ onStart, onContinue, onBrowseTutors }: HomeworkStartProps) {
  const [input, setInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [recommendation, setRecommendation] = useState<RoutingResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const lastSession = getLastTutor();
  const lastTutor = lastSession ? getTutor(lastSession.tutorName) : null;
  const history = getRecentSessions(5).filter((s) => !lastSession || s.timestamp !== lastSession.timestamp);

  const handleFile = (file: File) => {
    setAttachedFile(file);
    setRecommendation(null);
    if (file.type.startsWith("image/")) {
      setAttachedPreview(URL.createObjectURL(file));
    } else {
      setAttachedPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const removeAttachment = () => {
    if (attachedPreview) URL.revokeObjectURL(attachedPreview);
    setAttachedFile(null);
    setAttachedPreview(null);
    setRecommendation(null);
  };

  const beginChat = (tutorName: string | undefined) => {
    onStart(tutorName, input, attachedFile);
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed && !attachedFile) return;

    if (trimmed) {
      const result = matchTutorByText(trimmed);
      if (result.confidence === "high" && result.tutor) {
        beginChat(result.tutor.name);
        return;
      }
      if (result.confidence === "ambiguous") {
        setRecommendation(result);
        return;
      }
      // No keyword hit on the text — fall through to image classification if
      // there's a photo attached, otherwise go straight to the general chat.
      if (!attachedFile) {
        beginChat(undefined);
        return;
      }
    }

    if (attachedFile && attachedFile.type.startsWith("image/")) {
      setClassifying(true);
      try {
        const imageData = await fileToBase64(attachedFile);
        const res = await fetch("/api/classify-subject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData, imageMimeType: attachedFile.type }),
        });
        const body = await res.json().catch(() => ({}));
        const tutor = body?.subject ? tutorForSubject(body.subject) : null;
        setClassifying(false);
        if (tutor) {
          setRecommendation({ tutor, alternates: [], subject: body.subject, confidence: "ambiguous" });
          return;
        }
      } catch {
        setClassifying(false);
      }
    }

    beginChat(undefined);
  };

  const handleExamplePrompt = (prompt: (typeof EXAMPLE_PROMPTS)[number]) => {
    if (prompt.label === "Solve from photo") {
      cameraInputRef.current?.click();
      return;
    }
    setShowTextInput(true);
    setInput(prompt.prompt);
  };

  const hasDraft = !!input.trim() || !!attachedFile;

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

          {/* Hidden file inputs, shared by the action row and the photo example prompt */}
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,application/pdf" className="hidden" onChange={handleFileChange} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

          {recommendation ? (
            /* ── Recommended tutor confirmation ─────────────────────────── */
            <div className="text-center">
              <p className="text-sm font-semibold text-amber-500 mb-2">⭐ Recommended</p>
              <div className="flex flex-col items-center gap-3 mb-4">
                <img
                  src={recommendation.tutor!.img}
                  alt={recommendation.tutor!.name}
                  className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-brand/20"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{recommendation.tutor!.name}</h1>
                  <p className="text-gray-500 text-sm">
                    Best for {recommendation.subject ?? "this"} homework
                  </p>
                </div>
              </div>
              <button
                onClick={() => beginChat(recommendation.tutor!.name)}
                className="w-full bg-brand text-white font-semibold rounded-2xl px-6 py-4 shadow-lip active:translate-y-[3px] active:shadow-none transition-all mb-4"
              >
                Start Chat with {recommendation.tutor!.name}
              </button>
              {recommendation.alternates.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-2">Not quite? Try one of these instead:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {recommendation.alternates.map((alt) => (
                      <button
                        key={alt.name}
                        onClick={() => beginChat(alt.name)}
                        className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-brand/40 transition-colors"
                      >
                        {alt.name} — {alt.role}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => setRecommendation(null)}
                className="text-sm text-gray-400 hover:text-gray-600 mt-2"
              >
                ← Back
              </button>
            </div>
          ) : (
            <>
              {/* ── Header ── */}
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">What do you need help with?</h1>
                <p className="text-gray-500 text-base mt-1">We&apos;ll match you with the best tutor for you.</p>
              </div>

              {/* ── Attachment preview ── */}
              {attachedFile && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  {attachedPreview ? (
                    <div className="relative inline-flex">
                      <img src={attachedPreview} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-gray-200" />
                      <button
                        onClick={removeAttachment}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full text-xs flex items-center justify-center leading-none"
                      >×</button>
                    </div>
                  ) : (
                    <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 flex items-center gap-1.5">
                      📎 {attachedFile.name}
                      <button onClick={removeAttachment} className="ml-1 text-blue-400 hover:text-blue-600 font-bold leading-none">×</button>
                    </span>
                  )}
                </div>
              )}

              {/* ── Ask row ── */}
              {!showTextInput && !attachedFile && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 bg-white rounded-2xl border-2 border-gray-100 shadow-lip active:translate-y-[3px] active:shadow-none transition-all px-3 py-5"
                  >
                    <span className="text-3xl" aria-hidden>📷</span>
                    <span className="text-xs font-semibold text-gray-700 text-center leading-tight">Take Photo</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 bg-white rounded-2xl border-2 border-gray-100 shadow-lip active:translate-y-[3px] active:shadow-none transition-all px-3 py-5"
                  >
                    <span className="text-3xl" aria-hidden>🖼️</span>
                    <span className="text-xs font-semibold text-gray-700 text-center leading-tight">Upload Image</span>
                  </button>
                  <button
                    onClick={() => setShowTextInput(true)}
                    className="flex flex-col items-center gap-2 bg-white rounded-2xl border-2 border-gray-100 shadow-lip active:translate-y-[3px] active:shadow-none transition-all px-3 py-5"
                  >
                    <span className="text-3xl" aria-hidden>✍️</span>
                    <span className="text-xs font-semibold text-gray-700 text-center leading-tight">Type Question</span>
                  </button>
                </div>
              )}

              {/* ── Text input (shown once "Type Question" is tapped, or once there's a draft) ── */}
              {(showTextInput || attachedFile) && (
                <div className="mb-4">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your homework question..."
                    rows={3}
                    autoFocus={showTextInput}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-400 text-base resize-none outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all shadow-sm"
                  />
                  {!attachedFile && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="text-xs font-medium text-brand hover:text-brand-hover px-3 py-1.5 rounded-full border border-brand/20 hover:bg-brand/5 transition-colors"
                      >
                        📷 Add a photo too
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Start Chat CTA — appears once there's something to send ── */}
              {hasDraft && (
                <button
                  onClick={handleSubmit}
                  disabled={classifying}
                  className="w-full bg-brand text-white font-semibold rounded-2xl px-6 py-4 shadow-lip active:translate-y-[3px] active:shadow-none disabled:opacity-60 transition-all mb-6"
                >
                  {classifying ? "Reading your photo…" : "Start Chat"}
                </button>
              )}

              {/* ── Continue with last tutor ── */}
              {!hasDraft && lastTutor && lastSession && (
                <button
                  onClick={() => onContinue(lastTutor.name)}
                  className="w-full flex items-center gap-3 bg-white rounded-2xl border-2 border-gray-100 shadow-lip active:translate-y-[3px] active:shadow-none transition-all px-4 py-3 mb-6 text-left"
                >
                  <img src={lastTutor.img} alt={lastTutor.name} className="w-11 h-11 rounded-xl object-cover object-top flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">Continue with {lastTutor.name}</p>
                    <p className="text-xs text-gray-400">Last used {formatRelativeTime(lastSession.timestamp)}</p>
                  </div>
                  <span className="text-lg text-gray-300 flex-shrink-0" aria-hidden>→</span>
                </button>
              )}

              {/* ── Example prompts ── */}
              {!hasDraft && (
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Not sure what to ask?</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => handleExamplePrompt(p)}
                        className="px-3 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-brand/40 transition-colors"
                      >
                        {p.emoji} {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Homework history ── */}
              {!hasDraft && history.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Homework history</p>
                  <div className="space-y-2">
                    {history.map((session) => {
                      const t = getTutor(session.tutorName);
                      if (!t) return null;
                      return (
                        <button
                          key={session.timestamp}
                          onClick={() => onContinue(t.name)}
                          className="w-full flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-2.5 hover:border-brand/30 transition-colors text-left"
                        >
                          <img src={t.img} alt={t.name} className="w-8 h-8 rounded-lg object-cover object-top flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-700 truncate">{session.snippet}</p>
                            <p className="text-[11px] text-gray-400">with {t.name} · {formatRelativeTime(session.timestamp)}</p>
                          </div>
                          <span className="text-sm text-gray-300 flex-shrink-0">Continue →</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Meet your tutors ── */}
              {!hasDraft && (
                <div className="text-center">
                  <button onClick={onBrowseTutors} className="text-sm font-medium text-brand hover:text-brand-hover">
                    Meet your tutors →
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
