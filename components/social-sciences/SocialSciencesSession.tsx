"use client";
import RubyBalance from "@/components/RubyBalance";
import MasteryHeader from "@/components/shared/MasteryHeader";
import { rewardEffortFloor, rewardSkillMastered } from "@/lib/reward-client";
import RubyLoader from "@/components/RubyLoader";
import Button from "@/components/ui/Button";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import SpeakButton from "@/components/SpeakButton";
import { supabase } from "@/lib/supabase";
import { prefetchTTS, useTTS } from "@/lib/tts";
import socialSciencesTreeData from "@/data/social-sciences-skill-tree.json";
import socialSciencesBankData from "@/data/social-sciences-question-bank.json";
import EduBackground from "@/components/EduBackground";
import FeedbackExplanation from "@/components/shared/FeedbackExplanation";
import FeedbackFooter from "@/components/shared/FeedbackFooter";
import { scoreSocialSciences } from "@/lib/social-sciences-scoring";
import {
  getDomainForSkill,
  selectQuestion,
  bankQuestionToGenerated,
} from "@/lib/social-sciences-selector";
import { fetchQuestionOrLocal } from "@/lib/offline/fetchQuestionOrLocal";
import SocialSciencesSkillTreeView from "./SocialSciencesSkillTreeView";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  addSocialSciencesSkillCounts,
  getSocialSciencesMasteryMap,
  getSocialSciencesSkillCounts,
  getSocialSciencesUsedRefs,
  getOrCreateSocialSciencesProfile,
  hydrateSocialSciencesProfileFromSupabase,
  linkSocialSciencesProfileToAuth,
  loadSocialSciencesProfile,
  recordSocialSciencesAnswer,
  saveSocialSciencesProfile,
  setSocialSciencesMastery,
} from "@/lib/social-sciences-student-model";
import {
  trackQuestionAnswered,
  trackSessionStarted,
  trackSessionEnded,
  trackSkillMastered,
} from "@/lib/analytics";
import {
  ACCURACY_TARGET,
  contentAbilityLevel,
  isContentMastered,
  requiredCoverageCount,
} from "@/lib/content-mastery";
import type {
  SocialSciencesBank,
  SocialSciencesGeneratedQuestion,
  SocialSciencesSkillTree,
  SocialSciencesSubmitAnswerRequest,
  SocialSciencesSubmitAnswerResponse,
} from "@/types/social-sciences";

const tree = socialSciencesTreeData as unknown as SocialSciencesSkillTree;
const bank = socialSciencesBankData as unknown as SocialSciencesBank;

// Content-mastery rule (shared with the other FET/IP content subjects — see
// lib/content-mastery.ts). A topic is mastered when the learner has covered
// enough distinct questions (80% of the pool, capped at 20) AND answered at
// least 75% correctly, both measured cumulatively across every sitting.

// Total distinct questions authored for a topic — the coverage denominator.
function poolSize(skillId: string): number {
  return bank.topics[skillId]?.questions.length ?? 0;
}

// Distinct questions the student must answer to master this topic
// (80% of the pool, capped at 20 — see lib/content-mastery.ts).
function requiredCount(skillId: string): number {
  return requiredCoverageCount(poolSize(skillId));
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
type Phase = "tree" | "loading" | "question" | "feedback" | "mastered";

export default function SocialSciencesSession({ onBack }: { onBack?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<SocialSciencesGeneratedQuestion | null>(null);
  const [result, setResult] = useState<SocialSciencesSubmitAnswerResponse | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);
  const [submitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [mastery, setMastery] = useState<Record<string, TopicMastery>>({});
  const [didMasterTopic, setDidMasterTopic] = useState(false);

  const { speak, stop, playing } = useTTS();
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchAuthorisedGrade();
      const grade = data?.grade ?? 4;
      const name = data?.name ?? "Learner";
      if (!loadSocialSciencesProfile()) {
        const restored = await hydrateSocialSciencesProfileFromSupabase();
        if (restored) saveSocialSciencesProfile(restored);
      }
      const profile = getOrCreateSocialSciencesProfile(grade, name);
      void linkSocialSciencesProfileToAuth(profile.id);
      if (!cancelled) setMastery(getSocialSciencesMasteryMap());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!question) return;
    const text = question.ruby_prompt || question.question;
    prefetchTTS(text);
    question.options?.forEach((opt) => prefetchTTS(opt));
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
          subject: "social-sciences",
          topic_id: topicId,
          topic_title: found?.skill.title ?? topicId,
          grade: found?.level.grade ?? null,
          correct_count: correct,
          attempt_count: attempts,
          accuracy,
          target_item_count: requiredCount(topicId),
          pass_threshold: ACCURACY_TARGET,
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
          subject: "social-sciences",
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
        if (reportError) console.error("[SocialSciencesSession] student_reports insert failed:", reportError);
      } catch (err) {
        console.error("[SocialSciencesSession] persistReport failed:", err);
      }
    },
    [],
  );

  const loadNextQuestion = useCallback(
    async (topicId: string, sessionCorrect = 0, sessionAttempts = 0) => {
    setPhase("loading");
    setError(null);
    setAnswer("");
    setSequenceOrder([]);
    const used = getSocialSciencesUsedRefs(topicId);
    // Difficulty matching: derive ability from running accuracy (prior recorded
    // per-topic totals + this sitting's answers so far).
    const prior = getSocialSciencesSkillCounts(topicId);
    const abilityLevel = contentAbilityLevel(
      prior.correct_count + sessionCorrect,
      prior.attempt_count + sessionAttempts,
    );
    try {
      const question = await fetchQuestionOrLocal<SocialSciencesGeneratedQuestion>({
        url: "/api/social-sciences/generate-question",
        body: { skill_id: topicId, used_refs: used, ability_level: abilityLevel },
        localSelect: () => {
          const domainId = getDomainForSkill(topicId);
          const bankQ = domainId
            ? selectQuestion(domainId, used, false, topicId, abilityLevel)
            : null;
          return bankQ ? bankQuestionToGenerated(bankQ, topicId) : null;
        },
      });
      if (!question) {
        setError("No more questions on this topic right now.");
        setPhase("feedback");
        return;
      }
      setQuestion(question);
      if (question.input_type === "sequence" && question.options) {
        setSequenceOrder([...question.options].sort(() => Math.random() - 0.5));
      }
      setResult(null);
      setPhase("question");
    } catch (err) {
      console.error("[SocialSciencesSession] generate-question failed:", err);
      setError("Could not load a question. Please try again.");
      setPhase("feedback");
    }
  }, []);


  const handlePickTopic = useCallback(
    (topicId: string) => {
      const found = findSkill(topicId);
      setSkillId(topicId);
      setCorrectCount(0);
      setAttemptCount(0);
      setConsecutiveWrong(0);
      setDidMasterTopic(false);
      sessionStartRef.current = Date.now();
      trackSessionStarted({
        subject: "social-sciences",
        current_skill_id: topicId,
        current_level: found?.level.id ?? 4,
      });
      void loadNextQuestion(topicId);
    },
    [loadNextQuestion],
  );

  // Deep-link from the Subjects hub: a tapped topic is stashed in sessionStorage,
  // so open it directly on mount — skipping the in-session topic picker.
  const deepLinkConsumed = useRef(false);
  useEffect(() => {
    if (deepLinkConsumed.current || phase !== "tree") return;
    if (typeof window === "undefined") return;
    const target = sessionStorage.getItem("ruby_social-sciences_target_skill");
    if (!target) return;
    deepLinkConsumed.current = true;
    sessionStorage.removeItem("ruby_social-sciences_target_skill");
    if (findSkill(target)) handlePickTopic(target);
  }, [phase, handlePickTopic]);

  // Apply a graded result: record the attempt, update mastery/coverage, and
  // move to feedback (or the mastered screen). All Social Sciences types are
  // deterministic, so this is only ever driven by the instant client-scored path.
  const finalizeAttempt = useCallback(
    (
      data: SocialSciencesSubmitAnswerResponse,
      q: SocialSciencesGeneratedQuestion,
      sId: string,
    ) => {
      setResult(data);

      // Mark this question used (recordSocialSciencesAnswer appends to
      // used_questions and persists), so the coverage count below includes
      // the answer we just took — the analogue of History's
      // markHistoryQuestionUsed.
      recordSocialSciencesAnswer(sId, q.question_ref, data.is_correct);

      const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
      const nextAttempts = attemptCount + 1;
      const nextConsecutiveWrong = data.is_correct ? 0 : consecutiveWrong + 1;
      setCorrectCount(nextCorrect);
      setAttemptCount(nextAttempts);
      setConsecutiveWrong(nextConsecutiveWrong);

      trackQuestionAnswered({
        subject: "social-sciences",
        skill_id: sId,
        template: q.input_type,
        is_correct: data.is_correct,
        used_hint: false,
        attempt_number: nextAttempts,
        decision: data.is_correct ? "practice" : "reteach",
      });

      if (mastery[sId] !== "mastered" && mastery[sId] !== "in_progress") {
        const next = { ...mastery, [sId]: "in_progress" as TopicMastery };
        setMastery(next);
        setSocialSciencesMastery(sId, "in_progress");
      }

      // ── Cumulative mastery check ────────────────────────────────────────
      // Coverage + accuracy are measured across all sittings, not just this
      // run. Prior per-topic totals live in skill_counts; this run's deltas
      // are the session counters. Distinct coverage is deduped from the
      // freshly-saved used_questions for this topic.
      const prior = getSocialSciencesSkillCounts(sId);
      const cumulativeCorrect = prior.correct_count + nextCorrect;
      const cumulativeAttempts = prior.attempt_count + nextAttempts;
      const distinctAnswered = new Set(getSocialSciencesUsedRefs(sId)).size;
      const size = poolSize(sId);
      const required = requiredCount(sId);

      const didMaster = isContentMastered(
        distinctAnswered,
        size,
        cumulativeCorrect,
        cumulativeAttempts,
      );

      // End the run when the topic is mastered, when this sitting has covered
      // a full batch, or when the pool is exhausted — otherwise keep going.
      const runOver =
        didMaster || nextAttempts >= required || distinctAnswered >= size;

      if (runOver) {
        // Accumulate this run's per-topic counts (not overwrite), then set
        // the topic status via the inline persistence mechanism.
        addSocialSciencesSkillCounts(sId, nextCorrect, nextAttempts);
        const nextStatus: TopicMastery = didMaster ? "mastered" : "in_progress";
        const next = { ...mastery, [sId]: nextStatus };
        setMastery(next);
        setSocialSciencesMastery(sId, nextStatus);
        setDidMasterTopic(didMaster);
        if (didMaster) {
          trackSkillMastered({
            subject: "social-sciences",
            skill_id: sId,
            level: findSkill(sId)?.level.id ?? 4,
            session_attempt_count: nextAttempts,
            session_correct: nextCorrect,
          });
        }
        trackSessionEnded({
          subject: "social-sciences",
          questions_answered: nextAttempts,
          correct: nextCorrect,
          accuracy: nextAttempts > 0 ? nextCorrect / nextAttempts : 0,
        });
        // Rubies: effort floor for finishing the topic run + first-time mastery bonus.
        rewardEffortFloor("social-sciences", sId);
        if (didMaster) rewardSkillMastered("social-sciences", sId);
        void persistReport(sId, nextCorrect, nextAttempts, didMaster);
        setPhase("mastered");
      } else {
        setPhase("feedback");
      }
    },
    [attemptCount, consecutiveWrong, correctCount, mastery, persistReport],
  );

  const handleSubmit = useCallback(
    async (rawAnswer: string) => {
      if (!question || !skillId || !rawAnswer) return;

      // ── Instant path: every Social Sciences type is deterministic, so the
      // answer is scored client-side (the expected answer ships with the
      // question) and feedback shows immediately. The server call still runs in
      // the background for usage metering.
      const isCorrect = scoreSocialSciences(
        question.input_type,
        rawAnswer,
        question.expected_answer,
      );
      finalizeAttempt(
        {
          is_correct: isCorrect,
          error_signals: [],
          feedback: isCorrect ? "Correct." : "Not quite — let's look at this.",
          memo: question.memo ?? "",
          mastery_update: {
            skill_id: skillId,
            new_status: "in_progress",
            correct_count: isCorrect ? 1 : 0,
            attempt_count: 1,
          },
          next_action: "continue_skill",
        },
        question,
        skillId,
      );

      // Background: record against the daily usage cap (may 429 → upgrade modal).
      const payload: SocialSciencesSubmitAnswerRequest = {
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
      void apiFetch("/api/social-sciences/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => { /* non-blocking; feedback already shown */ });
    },
    [attemptCount, finalizeAttempt, question, skillId],
  );

  // ─── Render: tree (default) ────────────────────────────────────────────────
  if (phase === "tree") {
    return <SocialSciencesSkillTreeView onPickTopic={handlePickTopic} masteryStatus={mastery} onBack={onBack} />;
  }

  // ─── Render: end-of-topic ─────────────────────────────────────────────────
  if (phase === "mastered" && skillId) {
    const skill = findSkill(skillId)?.skill;
    const counts = getSocialSciencesSkillCounts(skillId);
    const cumAccuracy = counts.attempt_count > 0 ? counts.correct_count / counts.attempt_count : 0;
    const size = poolSize(skillId);
    const required = requiredCount(skillId);
    const distinct = Math.min(new Set(getSocialSciencesUsedRefs(skillId)).size, size);
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5] p-6">
        <EduBackground />
        <div className="relative bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-6xl">{didMasterTopic ? "🎉" : "💪"}</div>
          <h2 className="text-2xl font-bold text-[#1a2744]">
            {didMasterTopic ? "Topic mastered" : "Keep going"}
          </h2>
          <p className="text-gray-600 text-base">
            {didMasterTopic ? (
              <>You mastered <span className="font-semibold">{skill?.title ?? "this topic"}</span> — {Math.round(cumAccuracy * 100)}% correct overall.</>
            ) : (
              <>You&apos;ve answered <span className="font-semibold">{distinct} of {required}</span> questions on {skill?.title ?? "this topic"}. Master it by reaching {required} at {Math.round(ACCURACY_TARGET * 100)}% correct.</>
            )}
          </p>
          <p className="text-sm text-gray-500">{correctCount} of {attemptCount} correct this round.</p>
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={() => {
              setSkillId(null);
              setQuestion(null);
              setResult(null);
              setPhase("tree");
            }}
          >
            Pick another topic
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5]">
        <EduBackground />
        <RubyLoader className="relative" label="Loading…" />
      </div>
    );
  }

  // ─── Render: question / feedback ───────────────────────────────────────────

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
            <span className="hidden md:inline-flex flex-shrink-0"><RubyBalance theme="light" size="lg" /></span>
        </div>

        {skillId && (
          <MasteryHeader
            title={findSkill(skillId)?.skill?.title ?? "Master this topic"}
            distinctAnswered={new Set(getSocialSciencesUsedRefs(skillId)).size}
            requiredCount={requiredCount(skillId)}
            correctCount={correctCount}
            attemptCount={attemptCount}
            mastered={mastery[skillId] === "mastered"}
          />
        )}

        {question && (
          <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-5">
            <div className="flex items-start gap-2">
              <p className="flex-1 text-lg sm:text-xl text-[#1a2744] font-medium leading-snug">
                {question.ruby_prompt || question.question}
              </p>
              <SpeakButton
                playing={playing}
                onClick={() => (playing ? stop() : speak(question.ruby_prompt || question.question))}
              />
            </div>

            {phase === "question" && (
              <div className="relative">
                <div className={submitting ? "opacity-40 pointer-events-none transition-opacity" : "transition-opacity"}>
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
              <FeedbackExplanation
                isCorrect={result.is_correct}
                note={result.is_correct ? result.memo : undefined}
                whyOverride={result.is_correct ? undefined : result.memo}
                footer={
                <FeedbackFooter
                  isCorrect={result.is_correct}
                  onNext={() => skillId && loadNextQuestion(skillId, correctCount, attemptCount)}
                  onRetry={() => { setAnswer(""); setResult(null); setError(null); setPhase("question"); }}
                />
              }
              />
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
  question: SocialSciencesGeneratedQuestion;
  value: string;
  sequenceOrder: string[];
  onSequenceChange: (next: string[]) => void;
  onChange: (next: string) => void;
  onSubmit: (answer: string) => void;
  submitting: boolean;
  speak: (text: string) => void;
}

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
          : "bg-white border border-violet-300 hover:bg-violet-100 text-[#BE1832]"
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

  if (input_type === "choice" && options) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            disabled={submitting}
            onClick={() => onSubmit(opt)}
            className="bg-violet-50 hover:bg-violet-100 border-2 border-violet-200 hover:border-violet-300 rounded-2xl px-5 py-5 flex items-center gap-3 text-left text-base sm:text-lg font-semibold text-[#1a2744] active:scale-95 transition-all"
          >
            <span className="flex-1">{opt}</span>
            <PlayIcon text={opt} speak={speak} />
          </button>
        ))}
      </div>
    );
  }

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

  // text fallback — single input
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
        className="w-full px-5 py-4 text-lg font-semibold border-2 border-violet-200 focus:border-violet-400 focus:outline-none rounded-2xl bg-violet-50 text-[#1a2744]"
      />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={submitting || !value.trim()}
        onClick={() => onSubmit(value.trim())}
      >
        Check answer
      </Button>
    </div>
  );
}

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
                    : "bg-violet-50 border-2 border-violet-200 text-[#1a2744] hover:bg-violet-100"
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
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={submitting}
        onClick={onSubmit}
      >
        Check answer
      </Button>
    </div>
  );
}
