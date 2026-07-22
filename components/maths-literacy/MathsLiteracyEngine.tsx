"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import MathsLiteracyMarkdown from "@/components/maths-literacy/MathsLiteracyMarkdown";
import { rewardEffortFloor, rewardSkillMastered } from "@/lib/reward-client";
import Button from "@/components/ui/Button";
import SignToggle from "@/components/ui/SignToggle";
import { seedForGrade } from "@/lib/maths-literacy-grade-map";
import {
  getMathsLiteracyProfile,
  getMathsLiteracySkillById,
  getNextMathsLiteracySkillId,
  saveMathsLiteracyProfile,
  updateMathsLiteracySkillMastery,
} from "@/lib/maths-literacy-student-model";
import { requiredCoverageCount } from "@/lib/content-mastery";
import MasteryHeader from "@/components/shared/MasteryHeader";
import FeedbackExplanation from "@/components/shared/FeedbackExplanation";
import { GEM_HEX } from "@/lib/design/gemColors";
import FeedbackFooter from "@/components/shared/FeedbackFooter";
import EduBackground from "@/components/EduBackground";
import RubyBalance from "@/components/RubyBalance";
import {
  parseAnswerKey,
  scoreMathsLiteracy,
  formatExpectedAnswer,
} from "@/lib/maths-literacy-scoring";
import type {
  MathsLiteracyDiagnosticResult,
  MathsLiteracyGenerateResponse,
  MathsLiteracyStudentProfile,
  MathsLiteracySubmitResponse,
} from "@/types/maths-literacy";

interface Props {
  onBack?: () => void;
  onExitReplay?: () => void;
}

type Phase = "loading" | "question" | "feedback" | "error";

const REPLAY_KEY = "ruby_maths_literacy_replay_skill";

export default function MathsLiteracyEngine({ onBack, onExitReplay }: Props) {
  const [profile, setProfile] = useState<MathsLiteracyStudentProfile | null>(null);
  const [currentSkillId, setCurrentSkillId] = useState<string>("L1.T1.A1");
  const [replayMode, setReplayMode] = useState(false);
  const [question, setQuestion] = useState<MathsLiteracyGenerateResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [studentFields, setStudentFields] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<MathsLiteracyDiagnosticResult | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  // Feedback is scored client-side and shown instantly, so there is no
  // "Checking…" wait; kept false for the QuestionView button's disabled state.
  const [submitting] = useState(false);

  // Track served items per skill so we don't repeat within a session.
  const usedRefsRef = useRef<Record<string, string[]>>({});
  // Holds the in-flight background submit so "continue" can await it before advancing.
  const submitInFlightRef = useRef<Promise<void> | null>(null);

  // Rubies effort floor: pay out once on exit if the learner answered anything.
  const answeredRef = useRef(false);
  const lessonIdRef = useRef<string>("");
  if (!lessonIdRef.current) lessonIdRef.current = crypto.randomUUID();
  useEffect(() => {
    return () => {
      if (answeredRef.current) rewardEffortFloor("maths-literacy", lessonIdRef.current);
    };
  }, []);

  // ── Hydrate profile + decide starting skill ───────────────────────────────
  useEffect(() => {
    const p = getMathsLiteracyProfile();
    setProfile(p);
    // Seed session used-refs from the cumulative distinct set so we keep
    // serving unseen questions across sittings (coverage is cumulative).
    if (p.used_questions) {
      usedRefsRef.current = { ...p.used_questions };
    }
    let replay: string | null = null;
    if (typeof window !== "undefined") {
      replay = window.sessionStorage.getItem(REPLAY_KEY);
    }
    if (replay) {
      setCurrentSkillId(replay);
      setReplayMode(true);
    } else {
      setCurrentSkillId(p.current_skill_id || seedForGrade(p.grade).entrySkillId);
    }
  }, []);

  // ── Fetch a question for the active skill ─────────────────────────────────
  const fetchQuestion = useCallback(
    async (skillId: string) => {
      setPhase("loading");
      setQuestion(null);
      setFeedback(null);
      setStudentAnswer("");
      setStudentFields({});
      setError(null);
      try {
        const res = await fetch("/api/maths-literacy/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skill_id: skillId,
            used_refs: usedRefsRef.current[skillId] ?? [],
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const data = (await res.json()) as MathsLiteracyGenerateResponse;
        usedRefsRef.current[skillId] = [
          ...(usedRefsRef.current[skillId] ?? []),
          data.question_id,
        ];
        setQuestion(data);
        setPhase("question");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load question";
        setError(msg);
        setPhase("error");
      }
    },
    []
  );

  useEffect(() => {
    if (!currentSkillId) return;
    fetchQuestion(currentSkillId);
  }, [currentSkillId, fetchQuestion]);

  // ── Submit ───────────────────────────────────────────────────────────────
  // Score client-side for instant feedback (the answer key ships with the
  // question, and the same scoring lib runs on the server), then reconcile
  // mastery/rubies/usage with the server in the background.
  const onSubmit = async () => {
    if (!question || submitInFlightRef.current) return;
    const key = parseAnswerKey(question.expected_answer_key);
    if (!key) return;

    const fieldsPayload = question.fields
      ? question.fields.map((f) => ({ label: f.label, value: studentFields[f.label] ?? "" }))
      : undefined;
    const singleAnswer = question.answerMode === "multiField" ? "" : studentAnswer.trim();
    const { isCorrect, partialCredit } = scoreMathsLiteracy(key, singleAnswer, fieldsPayload);

    // Instant feedback from the client score.
    setSubmittedAnswer(
      question.answerMode === "multiField"
        ? (fieldsPayload ?? []).map((f) => `${f.label}: ${f.value}`).join("; ")
        : singleAnswer,
    );
    setFeedback({
      is_correct: isCorrect,
      partial_credit: partialCredit,
      error_signals: isCorrect ? [] : question.error_signals,
      feedback: isCorrect ? "Correct." : `Not quite — the answer was ${formatExpectedAnswer(key)}.`,
      working_steps: question.working_steps,
      mastery_update: {
        skill_id: currentSkillId,
        new_status: "in_progress",
        correct_count: isCorrect ? 1 : 0,
        attempt_count: 1,
      },
      next_action: "continue_skill",
    });
    setPhase("feedback");
    answeredRef.current = true;

    // Background: authoritative submit for mastery, rubies and usage metering.
    const work = (async () => {
      try {
        const res = await apiFetch("/api/maths-literacy/submit-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skill_id: currentSkillId,
            question_id: question.question_id,
            question: question.question,
            student_answer: singleAnswer,
            student_fields: fieldsPayload,
            expected_answer_key: question.expected_answer_key,
            working_steps: question.working_steps,
            error_signals: question.error_signals,
          }),
        });
        if (res.status === 429 || !res.ok) return;
        const data = (await res.json()) as MathsLiteracySubmitResponse;
        if (profile) {
          const { profile: updated, mastered } = updateMathsLiteracySkillMastery(
            profile,
            data.attempt,
            question.pool_size,
          );
          const withCurrent = { ...updated, current_skill_id: currentSkillId };
          setProfile(withCurrent);
          saveMathsLiteracyProfile(withCurrent);
          if (mastered) {
            setFeedback((f) =>
              f ? { ...f, mastery_update: { ...f.mastery_update, new_status: "mastered" } } : f,
            );
            rewardSkillMastered("maths-literacy", currentSkillId);
          }
        }
      } catch {
        // Non-blocking: the student already has correct feedback; mastery will
        // reconcile on the next attempt if this write failed.
      }
    })();
    submitInFlightRef.current = work;
    await work;
    submitInFlightRef.current = null;
  };

  // ── Continue (next question or advance skill) ────────────────────────────
  const onContinue = async () => {
    if (!question) return;
    // Wait for the background mastery write so advancement uses settled state.
    if (submitInFlightRef.current) await submitInFlightRef.current;
    const mastered =
      profile?.skill_mastery[currentSkillId]?.status === "mastered" &&
      feedback?.is_correct;
    if (mastered && !replayMode) {
      const next = getNextMathsLiteracySkillId(currentSkillId);
      if (next) {
        setCurrentSkillId(next);
        return;
      }
    }
    fetchQuestion(currentSkillId);
  };

  // ── Retry (re-attempt the same question) ─────────────────────────────────
  // Reopens the current question with the input cleared. The next submit runs
  // normally, so the re-attempt counts as a fresh attempt (and draws from the
  // daily usage pool) just like a first try.
  const onRetry = async () => {
    if (!question) return;
    // Let the prior background submit settle so its mastery write doesn't race
    // the next attempt.
    if (submitInFlightRef.current) await submitInFlightRef.current;
    setFeedback(null);
    setSubmittedAnswer("");
    setStudentAnswer("");
    setStudentFields({});
    setPhase("question");
  };

  const onExitReplayClick = () => {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(REPLAY_KEY);
    onExitReplay?.();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const skill = useMemo(() => getMathsLiteracySkillById(currentSkillId), [currentSkillId]);
  const mastery = profile?.skill_mastery[currentSkillId];

  // Coverage progress for the badge: distinct questions answered so far vs. the
  // required count (80% of the pool, capped at 20). Pool size comes from the
  // active question; required count derives from it (lib/content-mastery.ts).
  const poolSize = question?.pool_size ?? 0;
  const requiredCount = requiredCoverageCount(poolSize);
  const distinctAnswered = new Set(
    profile?.used_questions?.[currentSkillId] ?? [],
  ).size;

  const showProgress = (phase === "question" || phase === "feedback") && !!question;

  return (
    <div className="relative flex flex-col h-full bg-[#F4F4F5]">
      <EduBackground />
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-4 pb-12 w-full space-y-5">
          {/* Top row: back to subjects + rubies (+ replay exit) */}
          <div className="flex items-center justify-between gap-3">
            {onBack ? (
              <button
                onClick={onBack}
                className="text-sm text-[#1a2744] font-semibold underline decoration-2 underline-offset-4"
                aria-label="Back to subjects"
              >
                ← Subjects
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              {replayMode && (
                <button
                  onClick={onExitReplayClick}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Exit replay
                </button>
              )}
              <span className="hidden md:inline-flex flex-shrink-0">
                <RubyBalance theme="light" size="lg" />
              </span>
            </div>
          </div>

          {/* Coverage / mastery progress card — shared across all subjects. */}
          {showProgress && (
            <MasteryHeader
              title={skill?.title ?? "Maths Literacy"}
              distinctAnswered={distinctAnswered}
              requiredCount={requiredCount}
              correctCount={mastery?.correct_count ?? 0}
              attemptCount={mastery?.attempt_count ?? 0}
              mastered={mastery?.status === "mastered"}
            />
          )}

          {phase === "loading" && (
            <div className="bg-white rounded-3xl shadow-md p-8 text-center text-gray-500">
              Loading question…
            </div>
          )}

          {phase === "error" && (
            <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-4">
              <p className="text-sm text-rose-700 bg-rose-50 rounded-xl px-3 py-2">
                {error ?? "Something went wrong."}
              </p>
              <Button variant="primary" size="lg" fullWidth onClick={() => fetchQuestion(currentSkillId)}>
                Try again
              </Button>
            </div>
          )}

          {phase === "question" && question && (
            <QuestionView
              question={question}
              studentAnswer={studentAnswer}
              setStudentAnswer={setStudentAnswer}
              studentFields={studentFields}
              setStudentFields={setStudentFields}
              onSubmit={onSubmit}
              submitting={submitting}
            />
          )}

          {phase === "feedback" && feedback && question && (
            <FeedbackExplanation
              gemColor={GEM_HEX.teal}
              isCorrect={feedback.is_correct}
              studentAnswer={submittedAnswer}
              correctAnswer={(() => {
                const k = parseAnswerKey(question.expected_answer_key);
                return k ? formatExpectedAnswer(k) : undefined;
              })()}
              errorSignals={question.error_signals}
              whyOverride={question.error_explanation}
              workingSteps={question.working_steps}
              partialCredit={feedback.partial_credit}
              footer={
                <FeedbackFooter
                  isCorrect={feedback.is_correct}
                  onNext={onContinue}
                  onRetry={onRetry}
                  nextLabel={
                    profile?.skill_mastery[currentSkillId]?.status === "mastered" &&
                    feedback.is_correct &&
                    !replayMode
                      ? "Next skill →"
                      : "Next question →"
                  }
                />
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Question render ─────────────────────────────────────────────────────────
function QuestionView({
  question,
  studentAnswer,
  setStudentAnswer,
  studentFields,
  setStudentFields,
  onSubmit,
  submitting,
}: {
  question: MathsLiteracyGenerateResponse;
  studentAnswer: string;
  setStudentAnswer: (v: string) => void;
  studentFields: Record<string, string>;
  setStudentFields: (v: Record<string, string>) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const canSubmit =
    question.answerMode === "multiField"
      ? (question.fields ?? []).every((f) => (studentFields[f.label] ?? "").trim() !== "")
      : studentAnswer.trim() !== "";

  const wide = (question.options ?? []).some((o) => o.length > 40);

  return (
    <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-5">
      {question.stimulus && (
        <MathsLiteracyMarkdown className="text-sm text-gray-700 leading-relaxed">
          {question.stimulus}
        </MathsLiteracyMarkdown>
      )}
      <MathsLiteracyMarkdown className="text-lg sm:text-xl text-[#1a2744] font-medium leading-snug">
        {question.question}
      </MathsLiteracyMarkdown>

      {question.answerMode === "numeric" && (
        <div className="flex items-stretch gap-2">
          <SignToggle
            value={studentAnswer}
            onChange={setStudentAnswer}
            disabled={submitting}
            className="rounded-2xl px-5 text-xl"
          />
          <input
            type="text"
            inputMode="decimal"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && canSubmit && !submitting) onSubmit(); }}
            placeholder={question.unit ? `Answer in ${question.unit}` : "Your answer"}
            className="w-full px-5 py-4 text-lg font-semibold border-2 border-teal-200 focus:border-teal-400 focus:outline-none rounded-2xl bg-teal-50/40 text-[#1a2744]"
            autoFocus
          />
        </div>
      )}

      {question.answerMode === "multiChoice" && question.options && (
        <div className={`grid ${wide ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} gap-3`}>
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setStudentAnswer(opt)}
              className={`rounded-2xl px-5 py-5 text-left text-base sm:text-lg font-semibold text-[#1a2744] active:scale-95 transition-all whitespace-pre-line border-2 ${
                studentAnswer === opt
                  ? "bg-teal-100 border-teal-400 ring-2 ring-teal-300"
                  : "bg-teal-50 hover:bg-teal-100 border-teal-200 hover:border-teal-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.answerMode === "multiField" && question.fields && (
        <div className="space-y-3">
          {question.fields.map((f) => (
            <label key={f.label} className="block">
              <span className="text-sm font-medium text-gray-700">{f.label}</span>
              <input
                type="text"
                value={studentFields[f.label] ?? ""}
                onChange={(e) =>
                  setStudentFields({ ...studentFields, [f.label]: e.target.value })
                }
                onKeyDown={(e) => { if (e.key === "Enter" && canSubmit && !submitting) onSubmit(); }}
                className="mt-1 w-full px-5 py-3 text-base border-2 border-teal-200 focus:border-teal-400 focus:outline-none rounded-2xl bg-teal-50/40 text-[#1a2744]"
              />
            </label>
          ))}
        </div>
      )}

      <Button variant="primary" size="lg" fullWidth onClick={onSubmit} disabled={!canSubmit || submitting}>
        {submitting ? "Checking…" : "Submit"}
      </Button>
    </div>
  );
}

