"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";
import { prefetchTTS, useTTS } from "@/lib/tts";
import lifeSkillsTreeData from "@/data/life-skills-skill-tree.json";
import lifeSkillsBankData from "@/data/life-skills-question-bank.json";
import EduBackground from "@/components/EduBackground";
import LifeSkillsSkillTreeView from "./LifeSkillsSkillTreeView";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  getLifeSkillsMasteryMap,
  getLifeSkillsUsedRefs,
  getOrCreateLifeSkillsProfile,
  hydrateLifeSkillsProfileFromSupabase,
  linkLifeSkillsProfileToAuth,
  loadLifeSkillsProfile,
  recordLifeSkillsAnswer,
  saveLifeSkillsProfile,
  setLifeSkillsMastery,
} from "@/lib/life-skills-student-model";
import {
  trackQuestionAnswered,
  trackSessionStarted,
  trackSessionEnded,
  trackSkillMastered,
} from "@/lib/analytics";
import type {
  LifeSkillsBank,
  LifeSkillsGeneratedQuestion,
  LifeSkillsGenerateQuestionResponse,
  LifeSkillsSkillTree,
  LifeSkillsSubmitAnswerRequest,
  LifeSkillsSubmitAnswerResponse,
} from "@/types/life-skills";

const tree = lifeSkillsTreeData as unknown as LifeSkillsSkillTree;
const bank = lifeSkillsBankData as unknown as LifeSkillsBank;

// Mastery rule: the learner answers ALL questions in the topic. The session
// only ends when every authored item has been attempted. Mastery (vs just
// "complete") is judged after the fact by overall accuracy ≥ pass_threshold.
function targetItemCount(skillId: string): number {
  const topic = bank.topics[skillId];
  if (topic) return topic.questions.length;
  // Fallback if the topic somehow isn't in the bank.
  return skillId.startsWith("LS.L3.") ? 20 : 15;
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

type TopicMastery = "available" | "in_progress" | "mastered";

// Progress (mastery status + used-question pool + totals) is persisted by
// lib/life-skills-student-model.ts: localStorage as the working store, mirrored
// to Supabase `student_profiles` so it restores across devices — same model as
// Maths and Afrikaans.

// ─── Component ───────────────────────────────────────────────────────────────

type Phase = "tree" | "loading" | "question" | "feedback" | "mastered";

export default function LifeSkillsSession() {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<LifeSkillsGeneratedQuestion | null>(null);
  const [result, setResult] = useState<LifeSkillsSubmitAnswerResponse | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-topic session state — resets when the user picks a topic
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [mastery, setMastery] = useState<Record<string, TopicMastery>>({});

  const { speak, stop, playing } = useTTS();
  const sessionStartRef = useRef<number>(Date.now());

  // Resolve the learner's profile on mount: prefer localStorage; if empty,
  // restore from Supabase (returning learner / new device); otherwise create
  // one for their grade. Then link it to the authenticated user and seed the
  // mastery map for the tree UI.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchAuthorisedGrade();
      const grade = data?.grade ?? 1;
      const name = data?.name ?? "Learner";
      // No local progress (incl. legacy) → try restoring from the cloud first.
      if (!loadLifeSkillsProfile()) {
        const restored = await hydrateLifeSkillsProfileFromSupabase();
        if (restored) saveLifeSkillsProfile(restored);
      }
      const profile = getOrCreateLifeSkillsProfile(grade, name);
      void linkLifeSkillsProfileToAuth(profile.id);
      if (!cancelled) setMastery(getLifeSkillsMasteryMap());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Audio: prefetch + auto-speak when a new question arrives ──────────────
  useEffect(() => {
    if (!question) return;
    const text = question.ruby_prompt || question.question;
    prefetchTTS(text);
    // Pre-warm each option too so per-option playback is instant on tap.
    question.options?.forEach((opt) => prefetchTTS(opt));
    // Auto-speak on Foundation Phase since many learners cannot read fluently.
    speak(text);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  const persistReport = useCallback(
    async (topicId: string, correct: number, attempts: number, didMaster: boolean) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;
        const found = findSkill(topicId);
        const accuracy = attempts > 0 ? correct / attempts : 0;
        const inputData = {
          subject: "life-skills",
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
          subject: "life-skills",
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
        if (reportError) console.error("[LifeSkillsSession] student_reports insert failed:", reportError);
      } catch (err) {
        console.error("[LifeSkillsSession] persistReport failed:", err);
      }
    },
    [],
  );

  // ─── Load next question for the current topic ──────────────────────────────
  const loadNextQuestion = useCallback(async (topicId: string) => {
    setPhase("loading");
    setError(null);
    setAnswer("");
    setSequenceOrder([]);
    const used = getLifeSkillsUsedRefs(topicId);
    try {
      const res = await apiFetch("/api/life-skills/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: topicId, used_refs: used }),
      });
      if (!res.ok) {
        setError("Could not load a question. Please try again.");
        setPhase("feedback");
        return;
      }
      const data = (await res.json()) as LifeSkillsGenerateQuestionResponse;
      if (!data.question) {
        setError("No more questions on this topic right now.");
        setPhase("feedback");
        return;
      }
      setQuestion(data.question);
      // Initialise sequence ordering (shuffle of options) for sequence input
      if (data.question.input_type === "sequence" && data.question.options) {
        setSequenceOrder([...data.question.options].sort(() => Math.random() - 0.5));
      }
      setResult(null);
      setPhase("question");
    } catch (err) {
      console.error("[LifeSkillsSession] generate-question failed:", err);
      setError("Could not load a question. Please try again.");
      setPhase("feedback");
    }
  }, []);

  // ─── Topic picked from the tree ────────────────────────────────────────────
  const handlePickTopic = useCallback(
    (topicId: string) => {
      const found = findSkill(topicId);
      setSkillId(topicId);
      setCorrectCount(0);
      setAttemptCount(0);
      setConsecutiveWrong(0);
      sessionStartRef.current = Date.now();
      trackSessionStarted({
        subject: "life-skills",
        current_skill_id: topicId,
        current_level: found?.level.id ?? 1,
      });
      void loadNextQuestion(topicId);
    },
    [loadNextQuestion],
  );

  // ─── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (rawAnswer: string) => {
      if (!question || !skillId || !rawAnswer) return;
      setSubmitting(true);
      try {
        const payload: LifeSkillsSubmitAnswerRequest = {
          student_id: "local",
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
        const res = await apiFetch("/api/life-skills/submit-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          setError("Could not check your answer. Please try again.");
          return;
        }
        const data = (await res.json()) as LifeSkillsSubmitAnswerResponse;
        setResult(data);

        // Mark question as used (so the next call avoids it) and roll up totals.
        recordLifeSkillsAnswer(skillId, question.question_ref, data.is_correct);

        const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
        const nextAttempts = attemptCount + 1;
        const nextConsecutiveWrong = data.is_correct ? 0 : consecutiveWrong + 1;
        setCorrectCount(nextCorrect);
        setAttemptCount(nextAttempts);
        setConsecutiveWrong(nextConsecutiveWrong);

        trackQuestionAnswered({
          subject: "life-skills",
          skill_id: skillId,
          template: question.input_type,
          is_correct: data.is_correct,
          used_hint: false,
          attempt_number: nextAttempts,
          decision: data.is_correct ? "practice" : "reteach",
        });

        // Mark topic as in_progress on first attempt
        if (mastery[skillId] !== "mastered" && mastery[skillId] !== "in_progress") {
          const next = { ...mastery, [skillId]: "in_progress" as TopicMastery };
          setMastery(next);
          setLifeSkillsMastery(skillId, "in_progress");
        }

        // Topic ends when every authored question has been attempted.
        // Mastery decided after the fact by accuracy ≥ pass_threshold (default 0.6).
        const allAnswered = nextAttempts >= targetItemCount(skillId);
        if (allAnswered) {
          const accuracy = nextAttempts > 0 ? nextCorrect / nextAttempts : 0;
          const didMaster = accuracy >= passThreshold(skillId);
          const nextStatus: TopicMastery = didMaster ? "mastered" : "in_progress";
          const next = { ...mastery, [skillId]: nextStatus };
          setMastery(next);
          setLifeSkillsMastery(skillId, nextStatus);
          if (didMaster) {
            trackSkillMastered({
              subject: "life-skills",
              skill_id: skillId,
              level: findSkill(skillId)?.level.id ?? 1,
              session_attempt_count: nextAttempts,
              session_correct: nextCorrect,
            });
          }
          trackSessionEnded({
            subject: "life-skills",
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
        console.error("[LifeSkillsSession] submit-answer failed:", err);
        setError("Could not check your answer. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [attemptCount, consecutiveWrong, correctCount, mastery, persistReport, question, skillId],
  );

  // ─── Render: tree (default) ────────────────────────────────────────────────
  if (phase === "tree") {
    return <LifeSkillsSkillTreeView onPickTopic={handlePickTopic} masteryStatus={mastery} />;
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
            {didMaster ? "You did it!" : "All done!"}
          </h2>
          <p className="text-gray-600 text-base">
            {didMaster ? (
              <>You mastered <span className="font-semibold">{skill?.title ?? "this topic"}</span>.</>
            ) : (
              <>You finished <span className="font-semibold">{skill?.title ?? "this topic"}</span>. Try it again to master it.</>
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
        {/* Header bar */}
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
          {skillId && (
            <span className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              Q {Math.min(attemptCount + 1, targetItemCount(skillId))} / {targetItemCount(skillId)} · ⭐ {correctCount}
            </span>
          )}
        </div>

        {/* Question card */}
        {question && (
          <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-5">
            {/* Audio replay button — large, obvious */}
            <div className="flex items-start gap-3">
              <button
                onClick={() => {
                  if (playing) stop();
                  else speak(question.ruby_prompt || question.question);
                }}
                aria-label={playing ? "Stop reading" : "Read question aloud"}
                className="flex-shrink-0 w-14 h-14 rounded-full bg-[#BE1832] hover:bg-[#a01528] text-white text-2xl flex items-center justify-center shadow-md"
              >
                {playing ? "⏹" : "🔊"}
              </button>
              <p className="text-lg sm:text-xl text-[#1a2744] font-medium leading-snug">
                {question.ruby_prompt || question.question}
              </p>
            </div>

            {/* Context (e.g. image description) */}
            {question.context && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-900">
                <p className="font-semibold mb-1">Picture:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {question.context.split(/[.;]\s*/).filter(Boolean).map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Input — branches on input_type */}
            {phase === "question" && (
              <AnswerInput
                question={question}
                value={answer}
                sequenceOrder={sequenceOrder}
                onSequenceChange={setSequenceOrder}
                onChange={setAnswer}
                onSubmit={handleSubmit}
                submitting={submitting}
                speak={speak}
              />
            )}

            {/* Feedback after submission */}
            {phase === "feedback" && result && (
              <div
                className={`rounded-2xl p-5 ${
                  result.is_correct
                    ? "bg-green-50 border border-green-200"
                    : "bg-rose-50 border border-rose-200"
                }`}
              >
                <p className={`text-lg font-bold ${result.is_correct ? "text-green-700" : "text-rose-700"}`}>
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
                onClick={() => skillId && loadNextQuestion(skillId)}
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

// ─── Answer input (input_type-specific) ──────────────────────────────────────

interface AnswerInputProps {
  question: LifeSkillsGeneratedQuestion;
  value: string;
  sequenceOrder: string[];
  onSequenceChange: (next: string[]) => void;
  onChange: (next: string) => void;
  onSubmit: (answer: string) => void;
  submitting: boolean;
  speak: (text: string) => void;
}

// Small reusable "play option aloud" icon button. Its onClick uses
// stopPropagation so it never triggers the surrounding option button's submit.
function PlayIcon({ text, speak, dark }: { text: string; speak: (t: string) => void; dark?: boolean }) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Read aloud: ${text}`}
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          speak(text);
        }
      }}
      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
        dark
          ? "bg-white/20 hover:bg-white/30 text-white"
          : "bg-white border border-amber-300 hover:bg-amber-100 text-[#BE1832]"
      }`}
    >
      🔊
    </span>
  );
}

function AnswerInput({
  question,
  value,
  sequenceOrder,
  onSequenceChange,
  onChange,
  onSubmit,
  submitting,
  speak,
}: AnswerInputProps) {
  const { input_type, options } = question;

  // Choice / image-match / audio-tap — large tappable option buttons
  if ((input_type === "choice" || input_type === "image-match" || input_type === "audio-tap") && options) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            disabled={submitting}
            onClick={() => onSubmit(opt)}
            className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-300 rounded-2xl px-5 py-5 flex items-center gap-3 text-left text-base sm:text-lg font-semibold text-[#1a2744] active:scale-95 transition-all"
          >
            <span className="flex-1">{opt}</span>
            <PlayIcon text={opt} speak={speak} />
          </button>
        ))}
      </div>
    );
  }

  // True/false — two big buttons
  if (input_type === "true-false") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={submitting}
          onClick={() => onSubmit("true")}
          className="bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-2xl px-5 py-6 flex items-center justify-center gap-2 text-xl font-bold text-green-800 active:scale-95"
        >
          <span>✓ True</span>
          <PlayIcon text="True" speak={speak} />
        </button>
        <button
          disabled={submitting}
          onClick={() => onSubmit("false")}
          className="bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 rounded-2xl px-5 py-6 flex items-center justify-center gap-2 text-xl font-bold text-rose-800 active:scale-95"
        >
          <span>✗ False</span>
          <PlayIcon text="False" speak={speak} />
        </button>
      </div>
    );
  }

  // Sequence — tap an item to pick it up, tap another to swap.
  if (input_type === "sequence" && options) {
    return (
      <SequenceInput
        order={sequenceOrder}
        onChange={onSequenceChange}
        onSubmit={() => onSubmit(sequenceOrder.join(","))}
        submitting={submitting}
        speak={speak}
      />
    );
  }

  // Text / numeric / fallback — single input
  return (
    <div className="space-y-3">
      <input
        type={input_type === "numeric" ? "number" : "text"}
        inputMode={input_type === "numeric" ? "numeric" : "text"}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
        }}
        placeholder="Type your answer"
        className="w-full px-5 py-4 text-lg font-semibold border-2 border-amber-200 focus:border-amber-400 focus:outline-none rounded-2xl bg-amber-50 text-[#1a2744]"
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

// ─── Sequence input (tap-to-swap) ────────────────────────────────────────────

interface SequenceInputProps {
  order: string[];
  onChange: (next: string[]) => void;
  onSubmit: () => void;
  submitting: boolean;
  speak: (text: string) => void;
}

function SequenceInput({ order, onChange, onSubmit, submitting, speak }: SequenceInputProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleTap = (idx: number) => {
    if (submitting) return;
    if (selectedIdx === null) {
      setSelectedIdx(idx);
      return;
    }
    if (selectedIdx === idx) {
      setSelectedIdx(null);
      return;
    }
    const next = [...order];
    [next[selectedIdx], next[idx]] = [next[idx], next[selectedIdx]];
    onChange(next);
    setSelectedIdx(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Tap an item, then tap where it should go. They swap places.
      </p>
      <ol className="space-y-2">
        {order.map((item, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => handleTap(idx)}
                disabled={submitting}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all active:scale-[0.99] ${
                  isSelected
                    ? "bg-[#BE1832] border-2 border-[#BE1832] text-white shadow-md"
                    : "bg-amber-50 border-2 border-amber-200 text-[#1a2744] hover:bg-amber-100"
                }`}
                aria-pressed={isSelected}
              >
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center ${
                    isSelected ? "bg-white text-[#BE1832]" : "bg-[#BE1832] text-white"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="flex-1 text-base sm:text-lg font-semibold">{item}</span>
                <PlayIcon text={item} speak={speak} dark={isSelected} />
              </button>
            </li>
          );
        })}
      </ol>
      <button
        disabled={submitting}
        onClick={onSubmit}
        className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] text-white font-bold text-lg"
      >
        Check answer
      </button>
    </div>
  );
}
