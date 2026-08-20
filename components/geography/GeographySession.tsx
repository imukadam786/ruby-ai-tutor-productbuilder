"use client";
import QuizShell from "@/components/shared/QuizShell";
import { rewardEffortFloor, rewardSkillMastered } from "@/lib/reward-client";
import RubyLoader from "@/components/RubyLoader";
import Button from "@/components/ui/Button";
import ChoiceGrid from "@/components/ui/ChoiceGrid";
import { CONCEPT_C } from "@/lib/flags";

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
import FeedbackExplanation from "@/components/shared/FeedbackExplanation";
import { GEM_HEX } from "@/lib/design/gemColors";
import FeedbackFooter from "@/components/shared/FeedbackFooter";
import { scoreGeographyAnswer } from "@/lib/geography-scoring";
import GeographySkillTreeView from "./GeographySkillTreeView";
import { DataInterpretBlock } from "./DataInterpretBlock";
import SortBucketsQuestion from "./SortBucketsQuestion";
import SequenceQuestion from "./SequenceQuestion";
// Reused verbatim from History — props are structurally identical and no
// Geography highlight-source items ship today, so a copy would be dead code.
import HighlightSourceQuestion from "@/components/history/questions/HighlightSourceQuestion";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  getDomainForSkill,
  selectQuestion,
  bankQuestionToGenerated,
} from "@/lib/geography-selector";
import { fetchQuestionOrLocal } from "@/lib/offline/fetchQuestionOrLocal";
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
import {
  ACCURACY_TARGET,
  contentAbilityLevel,
  isContentMastered,
  requiredCoverageCount,
} from "@/lib/content-mastery";
import type {
  GeographyBank,
  GeographyBankQuestion,
  GeographyGeneratedQuestion,
  GeographySkillTree,
  GeographyStudentProfile,
  GeographySubmitAnswerRequest,
  GeographySubmitAnswerResponse,
} from "@/types/geography";

const tree = geographyTreeData as unknown as GeographySkillTree;
const bank = geographyBankData as unknown as GeographyBank;

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

type Phase = "tree" | "loading" | "question" | "feedback" | "mastered";

export default function GeographySession({ onBack }: { onBack?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<GeographyGeneratedQuestion | null>(null);
  const [result, setResult] = useState<GeographySubmitAnswerResponse | null>(null);
  // Feedback is scored client-side and shown instantly — no "Checking…" wait.
  const [submitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GeographyStudentProfile | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [didMasterTopic, setDidMasterTopic] = useState(false);

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
    async (
      topicId: string,
      currentProfile: GeographyStudentProfile | null,
      sessionCorrect = 0,
      sessionAttempts = 0,
    ) => {
      setPhase("loading");
      setError(null);
      const used = currentProfile ? getGeographyUsedRefs(currentProfile, topicId) : [];
      // Difficulty matching: derive ability from running accuracy (prior
      // recorded totals + this sitting's answers so far).
      const prior = currentProfile?.skill_mastery[topicId];
      const abilityLevel = contentAbilityLevel(
        (prior?.correct_count ?? 0) + sessionCorrect,
        (prior?.attempt_count ?? 0) + sessionAttempts,
      );
      try {
        const question = await fetchQuestionOrLocal<GeographyGeneratedQuestion>({
          url: "/api/geography/generate-question",
          body: {
            skill_id: topicId,
            used_refs: used,
            ability_level: abilityLevel,
          },
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
      setDidMasterTopic(false);
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

  // Deep-link from the Subjects hub: a tapped topic is stashed in sessionStorage,
  // so open it directly once the profile is ready — skipping the topic picker.
  const deepLinkConsumed = useRef(false);
  useEffect(() => {
    if (deepLinkConsumed.current || !profile || phase !== "tree") return;
    if (typeof window === "undefined") return;
    const target = sessionStorage.getItem("ruby_geography_target_skill");
    if (!target) return;
    deepLinkConsumed.current = true;
    sessionStorage.removeItem("ruby_geography_target_skill");
    if (findSkill(target)) handlePickTopic(target);
  }, [profile, phase, handlePickTopic]);

  // Apply a graded result: record the attempt, update mastery/coverage, and move
  // to feedback (or the mastered screen).
  const finalizeAttempt = useCallback(
    (data: GeographySubmitAnswerResponse, q: GeographyGeneratedQuestion, sId: string) => {
      setResult(data);

      // Mark this question used and work from the updated profile so the
      // coverage count includes the answer we just took.
      const workingProfile = profile
        ? markGeographyQuestionUsed(profile, sId, q.question_ref)
        : null;
      if (workingProfile) setProfile(workingProfile);

      const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
      const nextAttempts = attemptCount + 1;
      const nextConsecutiveWrong = data.is_correct ? 0 : consecutiveWrong + 1;
      setCorrectCount(nextCorrect);
      setAttemptCount(nextAttempts);
      setConsecutiveWrong(nextConsecutiveWrong);

      trackQuestionAnswered({
        subject: "geography",
        skill_id: sId,
        template: q.input_type,
        is_correct: data.is_correct,
        used_hint: false,
        attempt_number: nextAttempts,
        decision: data.is_correct ? "practice" : "reteach",
      });

      // ── Cumulative mastery check ────────────────────────────────────────
      // Coverage + accuracy are measured across all sittings, not just this
      // run. Prior totals live in skill_mastery; this run's deltas are the
      // session counters. Distinct coverage is deduped from used_questions.
      const prior = profile?.skill_mastery[sId];
      const cumulativeCorrect = (prior?.correct_count ?? 0) + nextCorrect;
      const cumulativeAttempts = (prior?.attempt_count ?? 0) + nextAttempts;
      const distinctAnswered = workingProfile
        ? new Set(getGeographyUsedRefs(workingProfile, sId)).size
        : nextAttempts;
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
        if (profile) {
          const finalProfile = recordGeographySkillResult(profile, sId, {
            correct: nextCorrect,
            attempts: nextAttempts,
            mastered: didMaster,
          });
          setProfile(finalProfile);
        }
        setDidMasterTopic(didMaster);
        if (didMaster) {
          trackSkillMastered({
            subject: "geography",
            skill_id: sId,
            level: findSkill(sId)?.level.id ?? 10,
            session_attempt_count: nextAttempts,
            session_correct: nextCorrect,
          });
        }
        trackSessionEnded({
          subject: "geography",
          questions_answered: nextAttempts,
          correct: nextCorrect,
          accuracy: nextAttempts > 0 ? nextCorrect / nextAttempts : 0,
        });
        // Rubies: effort floor for finishing the topic run + first-time mastery bonus.
        rewardEffortFloor("geography", sId);
        if (didMaster) rewardSkillMastered("geography", sId);
        void persistReport(sId, nextCorrect, nextAttempts, didMaster);
        setPhase("mastered");
      } else {
        setPhase("feedback");
      }
    },
    [attemptCount, consecutiveWrong, correctCount, persistReport, profile],
  );

  const handleSubmit = useCallback(
    async (rawAnswer: string) => {
      if (!question || !skillId || !rawAnswer.trim()) return;

      // Instant: score client-side (deterministic; the scorer's fields all ship
      // with the question). The server call runs in the background for usage
      // metering. The bank scorer reads `expected`, the client question carries
      // `expected_answer` — bridge that one field name.
      const { correct, score } = scoreGeographyAnswer(
        question.input_type,
        rawAnswer,
        { ...question, expected: question.expected_answer } as unknown as GeographyBankQuestion,
      );
      finalizeAttempt(
        {
          is_correct: correct,
          score,
          error_signals: [],
          feedback: correct ? "Correct." : "Not quite — let's look at this.",
          memo: question.memo ?? "",
          mastery_update: {
            skill_id: skillId,
            new_status: "in_progress",
            correct_count: correct ? 1 : 0,
            attempt_count: 1,
          },
          next_action: "continue_skill",
        },
        question,
        skillId,
      );
      // Background: record against the daily usage cap (may 429 → upgrade modal).
      void apiFetch("/api/geography/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        } as GeographySubmitAnswerRequest),
      }).catch(() => { /* non-blocking; feedback already shown */ });
    },
    [attemptCount, finalizeAttempt, profile, question, skillId],
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
    const m = profile?.skill_mastery[skillId];
    const cumAccuracy = m && m.attempt_count > 0 ? m.correct_count / m.attempt_count : 0;
    const size = poolSize(skillId);
    const required = requiredCount(skillId);
    const distinct = profile
      ? Math.min(new Set(getGeographyUsedRefs(profile, skillId)).size, size)
      : 0;
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

  // ─── Render: loading ───────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5]">
        <EduBackground />
        <RubyLoader className="relative" label="Loading…" />
      </div>
    );
  }

  // ─── Render: question / feedback ───────────────────────────────────────────

  if (!question || !skillId) return null;

  const distinctAnswered = profile ? new Set(getGeographyUsedRefs(profile, skillId)).size : 0;
  const required = requiredCount(skillId);

  return (
    <QuizShell
      accent="sky"
      topicTitle={findSkill(skillId)?.skill?.title ?? "Master this topic"}
      onExit={() => {
        setSkillId(null);
        setQuestion(null);
        setResult(null);
        setPhase("tree");
      }}
      questionNumber={Math.min(distinctAnswered, required) + 1}
      totalQuestions={required}
      difficulty={question.difficulty}
    >
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
                <span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                Checking…
              </span>
            </div>
          )}
        </div>
      )}

      {phase === "feedback" && result && (
        <FeedbackExplanation
          gemColor={GEM_HEX.sky}
          isCorrect={result.is_correct}
          note={result.is_correct ? result.memo : undefined}
          whyOverride={result.is_correct ? undefined : result.memo}
          footer={
            <FeedbackFooter
              isCorrect={result.is_correct}
              onNext={() => skillId && loadNextQuestion(skillId, profile, correctCount, attemptCount)}
              onRetry={() => { setResult(null); setError(null); setPhase("question"); }}
            />
          }
        />
      )}

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
      )}
    </QuizShell>
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
    if (CONCEPT_C) return <ChoiceGrid options={options} submitting={submitting} onSubmit={onSubmit} />;
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
