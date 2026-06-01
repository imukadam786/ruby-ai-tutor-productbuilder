"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";
import lifeSciencesTreeData from "@/data/life-sciences-skill-tree.json";
import lifeSciencesBankData from "@/data/life-sciences-question-bank.json";
import EduBackground from "@/components/EduBackground";
import LifeSciencesSkillTreeView from "./LifeSciencesSkillTreeView";
import { DataInterpretBlock } from "./DataInterpretBlock";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  getLifeSciencesUsedRefs,
  getOrCreateLifeSciencesProfile,
  hydrateLifeSciencesProfileFromSupabase,
  linkLifeSciencesProfileToAuth,
  loadLifeSciencesProfile,
  markLifeSciencesQuestionUsed,
  markLifeSciencesSkillInProgress,
  recordLifeSciencesSkillResult,
  saveLifeSciencesProfile,
} from "@/lib/life-sciences-student-model";
import {
  trackQuestionAnswered,
  trackSessionStarted,
  trackSessionEnded,
  trackSkillMastered,
} from "@/lib/analytics";
import type {
  LifeSciencesBank,
  LifeSciencesGeneratedQuestion,
  LifeSciencesGenerateQuestionResponse,
  LifeSciencesSkillTree,
  LifeSciencesStudentProfile,
  LifeSciencesSubmitAnswerRequest,
  LifeSciencesSubmitAnswerResponse,
} from "@/types/life-sciences";

const tree = lifeSciencesTreeData as unknown as LifeSciencesSkillTree;
const bank = lifeSciencesBankData as unknown as LifeSciencesBank;

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

export default function LifeSciencesSession({ onBack }: { onBack?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<LifeSciencesGeneratedQuestion | null>(null);
  const [result, setResult] = useState<LifeSciencesSubmitAnswerResponse | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LifeSciencesStudentProfile | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  const sessionStartRef = useRef<number>(Date.now());

  // Resolve learner profile on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchAuthorisedGrade();
      const grade = data?.grade ?? 10;
      const name = data?.name ?? "Learner";
      if (!loadLifeSciencesProfile()) {
        const restored = await hydrateLifeSciencesProfileFromSupabase();
        if (restored) saveLifeSciencesProfile(restored);
      }
      const p = getOrCreateLifeSciencesProfile(grade, name);
      void linkLifeSciencesProfileToAuth(p.id);
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
          subject: "life-sciences",
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
          subject: "life-sciences",
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
        if (reportError) console.error("[LifeSciencesSession] student_reports insert failed:", reportError);
      } catch (err) {
        console.error("[LifeSciencesSession] persistReport failed:", err);
      }
    },
    [],
  );

  const loadNextQuestion = useCallback(
    async (topicId: string, currentProfile: LifeSciencesStudentProfile | null) => {
      setPhase("loading");
      setError(null);
      setAnswer("");
      const used = currentProfile ? getLifeSciencesUsedRefs(currentProfile, topicId) : [];
      try {
        const res = await apiFetch("/api/life-sciences/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill_id: topicId, used_refs: used }),
        });
        if (!res.ok) {
          setError("Could not load a question. Please try again.");
          setPhase("feedback");
          return;
        }
        const data = (await res.json()) as LifeSciencesGenerateQuestionResponse;
        if (!data.question) {
          setError("No more questions on this topic right now.");
          setPhase("feedback");
          return;
        }
        setQuestion(data.question);
        setResult(null);
        setPhase("question");
      } catch (err) {
        console.error("[LifeSciencesSession] generate-question failed:", err);
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
      // Mark skill in_progress immediately so the tree UI updates on return.
      if (profile) {
        const updated = markLifeSciencesSkillInProgress(profile, topicId);
        setProfile(updated);
      }
      trackSessionStarted({
        subject: "life-sciences",
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
        const payload: LifeSciencesSubmitAnswerRequest = {
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
          rubric: question.rubric,
        };
        const res = await apiFetch("/api/life-sciences/submit-answer", {
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
        const data = (await res.json()) as LifeSciencesSubmitAnswerResponse;
        setResult(data);

        if (profile) {
          const updated = markLifeSciencesQuestionUsed(profile, skillId, question.question_ref);
          setProfile(updated);
        }

        const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
        const nextAttempts = attemptCount + 1;
        const nextConsecutiveWrong = data.is_correct ? 0 : consecutiveWrong + 1;
        setCorrectCount(nextCorrect);
        setAttemptCount(nextAttempts);
        setConsecutiveWrong(nextConsecutiveWrong);

        trackQuestionAnswered({
          subject: "life-sciences",
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
            const finalProfile = recordLifeSciencesSkillResult(profile, skillId, {
              correct: nextCorrect,
              attempts: nextAttempts,
              mastered: didMaster,
            });
            setProfile(finalProfile);
          }
          if (didMaster) {
            trackSkillMastered({
              subject: "life-sciences",
              skill_id: skillId,
              level: findSkill(skillId)?.level.id ?? 10,
              session_attempt_count: nextAttempts,
              session_correct: nextCorrect,
            });
          }
          trackSessionEnded({
            subject: "life-sciences",
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
        console.error("[LifeSciencesSession] submit-answer failed:", err);
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
      <LifeSciencesSkillTreeView
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
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                  Master this topic
                </span>
                <span className="text-sm font-semibold text-emerald-700">
                  Q {Math.min(attemptCount + 1, targetItemCount(skillId))} of {targetItemCount(skillId)} · ⭐ {correctCount}
                </span>
              </div>
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width: `${Math.round(
                      (Math.min(attemptCount, targetItemCount(skillId)) /
                        targetItemCount(skillId)) *
                        100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-emerald-700 mt-1.5">
                Pass mark: {Math.round(passThreshold(skillId) * 100)}% of {targetItemCount(skillId)}
              </p>
            </div>
          )}

          {question && (
            <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-5">
              <p className="text-lg sm:text-xl text-[#1a2744] font-medium leading-snug whitespace-pre-line">
                {question.question}
              </p>

              {/* Diagram image for diagram-label items. */}
              {question.input_type === "diagram-label" && question.image_refs?.[0] && (
                <DiagramImage imageKey={question.image_refs[0]} alt={question.question} />
              )}

              {/* Inline data block for data-interpret items. */}
              {question.input_type === "data-interpret" && question.data && (
                <DataInterpretBlock data={question.data} />
              )}

              {question.context && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-900">
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
                    <AnswerInput
                      question={question}
                      value={answer}
                      onChange={setAnswer}
                      onSubmit={handleSubmit}
                      submitting={submitting}
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

// ─── Diagram image (with png → svg → text fallback) ─────────────────────────

const LSC_IMAGE_EXTS = ["png", "svg", "jpg"];

function DiagramImage({ imageKey, alt }: { imageKey: string; alt: string }) {
  const [extIdx, setExtIdx] = useState(0);
  if (extIdx >= LSC_IMAGE_EXTS.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-4 text-center text-sm italic text-emerald-700">
        Diagram described in the question above.
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/life-sciences/${imageKey}.${LSC_IMAGE_EXTS[extIdx]}`}
        alt={alt}
        onError={() => setExtIdx((i) => i + 1)}
        className="max-h-80 rounded-2xl border border-emerald-200 bg-white"
      />
    </div>
  );
}

// ─── Answer input — dispatches on input_type ────────────────────────────────

interface AnswerInputProps {
  question: LifeSciencesGeneratedQuestion;
  value: string;
  onChange: (next: string) => void;
  onSubmit: (answer: string) => void;
  submitting: boolean;
}

function AnswerInput({ question, value, onChange, onSubmit, submitting }: AnswerInputProps) {
  const { input_type, options } = question;

  // Short-response → multi-line textarea + check button. Grading runs through
  // the must_mention rubric judge on the server.
  if (input_type === "short-response") {
    return (
      <div className="space-y-3">
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your answer in 1–3 sentences."
          rows={4}
          className="w-full px-4 py-3 text-base border-2 border-emerald-200 focus:border-emerald-400 focus:outline-none rounded-2xl bg-emerald-50/40 text-[#1a2744] resize-none"
        />
        <button
          disabled={submitting || !value.trim()}
          onClick={() => onSubmit(value.trim())}
          className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] disabled:bg-gray-300 text-white font-bold text-lg"
        >
          Check answer
        </button>
      </div>
    );
  }

  // True/false — two large buttons.
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

  // All other option-driven types (choice, cloze, match, sequence, scenario,
  // diagram-label, data-interpret) — tappable button grid. Single-column on
  // narrow screens, double on wider so long option strings stay readable.
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
            className="bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl px-5 py-5 text-left text-base sm:text-lg font-semibold text-[#1a2744] active:scale-95 transition-all whitespace-pre-line"
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  // Fallback — single text input (shouldn't happen for Life Sciences but kept
  // as a safety net so an unexpected schema doesn't blank the screen).
  return (
    <div className="space-y-3">
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
        }}
        placeholder="Type your answer"
        className="w-full px-5 py-4 text-lg font-semibold border-2 border-emerald-200 focus:border-emerald-400 focus:outline-none rounded-2xl bg-emerald-50/40 text-[#1a2744]"
      />
      <button
        disabled={submitting || !value.trim()}
        onClick={() => onSubmit(value.trim())}
        className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] disabled:bg-gray-300 text-white font-bold text-lg"
      >
        Check answer
      </button>
    </div>
  );
}
