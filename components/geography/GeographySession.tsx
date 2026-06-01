"use client";

// GeographySession — clone of HistorySession with a dispatcher widened for the
// Geography bank. Key points:
//   • No free-text — every mechanic is tap/choice.
//   • Option-driven types (choice / true-false / cloze / scenario / match /
//     diagram-label / data-interpret) call onSubmit immediately on tap.
//   • Structured types manage their own state and call onSubmit with a
//     JSON-stringified payload (parsed server-side by lib/geography-scoring.ts):
//       - sort-buckets → { itemId: bucketId }
//       - sequence     → [orderedItemId, …]
//       - highlight-source → [selectedPhrase, …]
//   • data-interpret renders a `data.table` above the option grid.
//   • diagram-label renders an image (with a graceful placeholder when the
//     SVG/PNG for the image_ref does not exist yet).

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";
import geographyTreeData from "@/data/geography-skill-tree.json";
import geographyBankData from "@/data/geography-question-bank.json";
import EduBackground from "@/components/EduBackground";
import GeographySkillTreeView from "./GeographySkillTreeView";
import { DataInterpretBlock } from "./DataInterpretBlock";
import SortBucketsQuestion from "./SortBucketsQuestion";
import SequenceQuestion from "./SequenceQuestion";
// Reused verbatim from History — props are structurally identical and no
// Geography highlight-source items ship today, so a copy would be dead code.
import HighlightSourceQuestion from "@/components/history/questions/HighlightSourceQuestion";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  getGeographyUsedRefs,
  getOrCreateGeographyProfile,
  hydrateGeographyProfileFromSupabase,
  linkGeographyProfileToAuth,
  loadGeographyProfile,
  markGeographyQuestionUsed,
  markGeographySkillInProgress,
  recordGeographySkillResult,
  saveGeographyProfile,
} from "@/lib/geography-student-model";
import {
  trackQuestionAnswered,
  trackSessionStarted,
  trackSessionEnded,
  trackSkillMastered,
} from "@/lib/analytics";
import type {
  GeographyBank,
  GeographyGeneratedQuestion,
  GeographyGenerateQuestionResponse,
  GeographySkillTree,
  GeographyStudentProfile,
  GeographySubmitAnswerRequest,
  GeographySubmitAnswerResponse,
} from "@/types/geography";

const tree = geographyTreeData as unknown as GeographySkillTree;
const bank = geographyBankData as unknown as GeographyBank;

function targetItemCount(skillId: string): number {
  const topic = bank.topics[skillId];
  if (topic) return topic.target_item_count ?? topic.questions.length;
  return 20;
}

function passThreshold(skillId: string): number {
  return bank.topics[skillId]?.pass_threshold ?? 0.6;
}

function findSkill(skillId: string) {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const found = tier.atomic_skills.find((s) => s.id === skillId);
      if (found) return { skill: found, level, tier };
    }
  }
  return null;
}

type Phase = "tree" | "loading" | "question" | "feedback" | "mastered";

export default function GeographySession({ onBack }: { onBack?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<GeographyGeneratedQuestion | null>(null);
  const [result, setResult] = useState<GeographySubmitAnswerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GeographyStudentProfile | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchAuthorisedGrade();
      const grade = data?.grade ?? 10;
      const name = data?.name ?? "Learner";
      if (!loadGeographyProfile()) {
        const restored = await hydrateGeographyProfileFromSupabase();
        if (restored) saveGeographyProfile(restored);
      }
      const p = getOrCreateGeographyProfile(grade, name);
      void linkGeographyProfileToAuth(p.id);
      if (!cancelled) setProfile(p);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistReport = useCallback(
    async (topicId: string, correct: number, attempts: number, didMaster: boolean) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;
        const found = findSkill(topicId);
        const accuracy = attempts > 0 ? correct / attempts : 0;
        const inputData = {
          subject: "geography",
          topic_id: topicId,
          topic_title: found?.skill.title ?? topicId,
          grade: found?.level.grade ?? null,
          correct_count: correct,
          attempt_count: attempts,
          accuracy,
          target_item_count: targetItemCount(topicId),
          pass_threshold: passThreshold(topicId),
          mastered: didMaster,
          duration_ms: Date.now() - sessionStartRef.current,
        };
        const contentData = {
          summary: didMaster
            ? `Mastered "${found?.skill.title ?? topicId}" with ${correct}/${attempts} correct.`
            : `Completed "${found?.skill.title ?? topicId}" with ${correct}/${attempts} correct.`,
          topic_id: topicId,
        };
        const { error: reportError } = await supabase.from("student_reports").insert({
          user_id: user.id,
          subject: "geography",
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
        if (reportError) console.error("[GeographySession] student_reports insert failed:", reportError);
      } catch (err) {
        console.error("[GeographySession] persistReport failed:", err);
      }
    },
    [],
  );

  const loadNextQuestion = useCallback(
    async (topicId: string, currentProfile: GeographyStudentProfile | null) => {
      setPhase("loading");
      setError(null);
      const used = currentProfile ? getGeographyUsedRefs(currentProfile, topicId) : [];
      try {
        const res = await apiFetch("/api/geography/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill_id: topicId, used_refs: used }),
        });
        if (!res.ok) {
          setError("Could not load a question. Please try again.");
          setPhase("feedback");
          return;
        }
        const data = (await res.json()) as GeographyGenerateQuestionResponse;
        if (!data.question) {
          setError("No more questions on this topic right now.");
          setPhase("feedback");
          return;
        }
        setQuestion(data.question);
        setResult(null);
        setPhase("question");
      } catch (err) {
        console.error("[GeographySession] generate-question failed:", err);
        setError("Could not load a question. Please try again.");
        setPhase("feedback");
      }
    },
    [],
  );

  const handlePickTopic = useCallback(
    (topicId: string) => {
      const found = findSkill(topicId);
      setSkillId(topicId);
      setCorrectCount(0);
      setAttemptCount(0);
      setConsecutiveWrong(0);
      sessionStartRef.current = Date.now();
      if (profile) {
        const updated = markGeographySkillInProgress(profile, topicId);
        setProfile(updated);
      }
      trackSessionStarted({
        subject: "geography",
        current_skill_id: topicId,
        current_level: found?.level.id ?? 10,
      });
      void loadNextQuestion(topicId, profile);
    },
    [loadNextQuestion, profile],
  );

  const handleSubmit = useCallback(
    async (rawAnswer: string) => {
      if (!question || !skillId || !rawAnswer.trim()) return;
      setSubmitting(true);
      try {
        const payload: GeographySubmitAnswerRequest = {
          student_id: profile?.id ?? "local",
          question_id: question.id,
          skill_id: skillId,
          question_ref: question.question_ref,
          input_type: question.input_type,
          question: question.question,
          student_answer: rawAnswer,
          expected_answer: question.expected_answer,
          attempt_number: attemptCount + 1,
          used_hint: false,
        };
        const res = await apiFetch("/api/geography/submit-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // 429 = shared daily limit reached; apiFetch already surfaced the
          // upgrade modal, so don't also flash an inline error.
          if (res.status !== 429) setError("Could not check your answer. Please try again.");
          return;
        }
        const data = (await res.json()) as GeographySubmitAnswerResponse;
        setResult(data);

        if (profile) {
          const updated = markGeographyQuestionUsed(profile, skillId, question.question_ref);
          setProfile(updated);
        }

        const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
        const nextAttempts = attemptCount + 1;
        const nextConsecutiveWrong = data.is_correct ? 0 : consecutiveWrong + 1;
        setCorrectCount(nextCorrect);
        setAttemptCount(nextAttempts);
        setConsecutiveWrong(nextConsecutiveWrong);

        trackQuestionAnswered({
          subject: "geography",
          skill_id: skillId,
          template: question.input_type,
          is_correct: data.is_correct,
          used_hint: false,
          attempt_number: nextAttempts,
          decision: data.is_correct ? "practice" : "reteach",
        });

        const allAnswered = nextAttempts >= targetItemCount(skillId);
        if (allAnswered) {
          const accuracy = nextAttempts > 0 ? nextCorrect / nextAttempts : 0;
          const didMaster = accuracy >= passThreshold(skillId);
          if (profile) {
            const finalProfile = recordGeographySkillResult(profile, skillId, {
              correct: nextCorrect,
              attempts: nextAttempts,
              mastered: didMaster,
            });
            setProfile(finalProfile);
          }
          if (didMaster) {
            trackSkillMastered({
              subject: "geography",
              skill_id: skillId,
              level: findSkill(skillId)?.level.id ?? 10,
              session_attempt_count: nextAttempts,
              session_correct: nextCorrect,
            });
          }
          trackSessionEnded({
            subject: "geography",
            questions_answered: nextAttempts,
            correct: nextCorrect,
            accuracy,
          });
          void persistReport(skillId, nextCorrect, nextAttempts, didMaster);
          setPhase("mastered");
        } else {
          setPhase("feedback");
        }
      } catch (err) {
        console.error("[GeographySession] submit-answer failed:", err);
        setError("Could not check your answer. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [attemptCount, consecutiveWrong, correctCount, persistReport, profile, question, skillId],
  );

  // ─── Render: tree ──────────────────────────────────────────────────────────
  if (phase === "tree") {
    return (
      <GeographySkillTreeView
        onPickSkill={handlePickTopic}
        profile={profile}
        onBack={onBack}
      />
    );
  }

  // ─── Render: end-of-topic ─────────────────────────────────────────────────
  if (phase === "mastered" && skillId) {
    const skill = findSkill(skillId)?.skill;
    const accuracy = attemptCount > 0 ? correctCount / attemptCount : 0;
    const didMaster = accuracy >= passThreshold(skillId);
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5] p-6">
        <EduBackground />
        <div className="relative bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-6xl">{didMaster ? "🎉" : "💪"}</div>
          <h2 className="text-2xl font-bold text-[#1a2744]">
            {didMaster ? "Topic complete" : "Keep going"}
          </h2>
          <p className="text-gray-600 text-base">
            {didMaster ? (
              <>You passed <span className="font-semibold">{skill?.title ?? "this topic"}</span> at {Math.round(accuracy * 100)}%.</>
            ) : (
              <>You finished <span className="font-semibold">{skill?.title ?? "this topic"}</span>. Try it again to pass — you need 60%.</>
            )}
          </p>
          <p className="text-sm text-gray-500">{correctCount} of {attemptCount} correct.</p>
          <button
            onClick={() => {
              setSkillId(null);
              setQuestion(null);
              setResult(null);
              setPhase("tree");
            }}
            className="w-full py-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-base"
          >
            Pick another topic
          </button>
        </div>
      </div>
    );
  }

  // ─── Render: loading ───────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5]">
        <EduBackground />
        <p className="relative text-gray-500 text-lg">Loading…</p>
      </div>
    );
  }

  // ─── Render: question / feedback ───────────────────────────────────────────
  const showRecoveryHint = consecutiveWrong >= 2 && skillId !== null;
  const recoveryHint = showRecoveryHint ? findSkill(skillId!)?.skill.recovery_strategy ?? null : null;

  return (
    <div className="relative flex flex-col h-full bg-[#F4F4F5]">
      <EduBackground />
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-4 pb-12 w-full space-y-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSkillId(null);
                setQuestion(null);
                setResult(null);
                setPhase("tree");
              }}
              className="text-sm text-[#1a2744] font-semibold underline decoration-2 underline-offset-4"
            >
              ← Topics
            </button>
          </div>

          {skillId && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-sky-800">
                  Master this topic
                </span>
                <span className="text-sm font-semibold text-sky-700">
                  Q {Math.min(attemptCount + 1, targetItemCount(skillId))} of {targetItemCount(skillId)} · ⭐ {correctCount}
                </span>
              </div>
              <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{
                    width: `${Math.round(
                      (Math.min(attemptCount, targetItemCount(skillId)) /
                        targetItemCount(skillId)) *
                        100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-sky-700 mt-1.5">
                Pass mark: {Math.round(passThreshold(skillId) * 100)}% of {targetItemCount(skillId)}
              </p>
            </div>
          )}

          {question && (
            <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-5">
              <p className="text-lg sm:text-xl text-[#1a2744] font-medium leading-snug whitespace-pre-line">
                {question.question}
              </p>

              {/* Diagram image for diagram-label items (graceful placeholder
                  when the image_ref SVG/PNG does not exist yet). */}
              {question.input_type === "diagram-label" && question.image_refs?.[0] && (
                <DiagramImage imageKey={question.image_refs[0]} alt={question.question} />
              )}

              {/* Inline data table for data-interpret items. */}
              {question.input_type === "data-interpret" && question.data && (
                <DataInterpretBlock data={question.data} />
              )}

              {question.context && (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 text-sm text-sky-900">
                  {question.context}
                </div>
              )}

              {phase === "question" && (
                <div className="relative">
                  <div
                    className={
                      submitting
                        ? "opacity-40 pointer-events-none transition-opacity"
                        : "transition-opacity"
                    }
                  >
                    <AnswerDispatcher
                      question={question}
                      submitting={submitting}
                      onSubmit={handleSubmit}
                    />
                  </div>
                  {submitting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex items-center gap-2 bg-white/90 rounded-full px-4 py-2 shadow text-[#1a2744] font-semibold text-sm">
                        <span className="w-4 h-4 border-2 border-[#BE1832] border-t-transparent rounded-full animate-spin" />
                        Checking…
                      </span>
                    </div>
                  )}
                </div>
              )}

              {phase === "feedback" && result && (
                <div
                  className={`rounded-2xl p-5 ${
                    result.is_correct
                      ? "bg-green-50 border border-green-200"
                      : "bg-rose-50 border border-rose-200"
                  }`}
                >
                  <p
                    className={`text-lg font-bold ${
                      result.is_correct ? "text-green-700" : "text-rose-700"
                    }`}
                  >
                    {result.is_correct ? "✓ " : "✗ "}
                    {result.feedback}
                  </p>
                  {!result.is_correct && result.score > 0 && (
                    <p className="text-xs text-rose-700 mt-1">
                      Partial credit: {Math.round(result.score * 100)}%
                    </p>
                  )}
                  {result.memo && (
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{result.memo}</p>
                  )}
                  {recoveryHint && !result.is_correct && (
                    <p className="text-sm text-amber-700 mt-3 bg-amber-100 rounded-xl px-3 py-2">
                      💡 {recoveryHint}
                    </p>
                  )}
                </div>
              )}

              {phase === "feedback" && (
                <button
                  onClick={() => skillId && loadNextQuestion(skillId, profile)}
                  disabled={submitting}
                  className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] text-white font-bold text-lg"
                >
                  Next question →
                </button>
              )}

              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Diagram image (with png → svg → jpg → text fallback) ───────────────────
const GEO_IMAGE_EXTS = ["png", "svg", "jpg", "jpeg", "webp"];

function DiagramImage({ imageKey, alt }: { imageKey: string; alt: string }) {
  const [extIdx, setExtIdx] = useState(0);
  if (extIdx >= GEO_IMAGE_EXTS.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50 p-4 text-center text-sm italic text-sky-700">
        Diagram described in the question above.
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/geography/${imageKey}.${GEO_IMAGE_EXTS[extIdx]}`}
        alt={alt}
        onError={() => setExtIdx((i) => i + 1)}
        className="max-h-80 rounded-2xl border border-sky-200 bg-white"
      />
    </div>
  );
}

// ─── Answer dispatcher — routes input_type to the right renderer ─────────────

interface AnswerDispatcherProps {
  question: GeographyGeneratedQuestion;
  submitting: boolean;
  onSubmit: (rawAnswer: string) => void;
}

function AnswerDispatcher({ question, submitting, onSubmit }: AnswerDispatcherProps) {
  const { input_type, options } = question;

  // ── True / false ────────────────────────────────────────────────────────────
  if (input_type === "true-false" && options) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isTrue = opt.toLowerCase() === "true";
          return (
            <button
              key={opt}
              disabled={submitting}
              onClick={() => onSubmit(opt)}
              className={`rounded-2xl px-5 py-6 flex items-center justify-center gap-2 text-xl font-bold active:scale-95 transition-all border-2 ${
                isTrue
                  ? "bg-green-50 hover:bg-green-100 border-green-200 text-green-800"
                  : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800"
              }`}
            >
              {isTrue ? "✓ " : "✗ "}{opt}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Sort buckets ────────────────────────────────────────────────────────────
  if (input_type === "sort-buckets" && question.buckets && question.items) {
    return (
      <SortBucketsQuestion
        buckets={question.buckets}
        items={question.items}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Sequence (order the steps) ──────────────────────────────────────────────
  if (input_type === "sequence" && question.items && question.items.length > 0) {
    return (
      <SequenceQuestion
        items={question.items}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Highlight source ────────────────────────────────────────────────────────
  if (input_type === "highlight-source" && question.source_text && question.targets) {
    return (
      <HighlightSourceQuestion
        sourceText={question.source_text}
        task={question.task ?? "Tap the phrases that match the task."}
        targets={question.targets}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Option grids (choice / cloze / scenario / match / diagram-label /
  //    data-interpret) ─────────────────────────────────────────────────────────
  if (options && options.length > 0) {
    const wide = options.some((o) => o.length > 40);
    const gridCols = wide ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";
    return (
      <div className={`grid ${gridCols} gap-3`}>
        {options.map((opt) => (
          <button
            key={opt}
            disabled={submitting}
            onClick={() => onSubmit(opt)}
            className="bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 hover:border-sky-300 rounded-2xl px-5 py-5 text-left text-base sm:text-lg font-semibold text-[#1a2744] active:scale-95 transition-all whitespace-pre-line"
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  // ── Last-resort fallback ────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
      This question is missing its options. Skip to the next one.
    </div>
  );
}
