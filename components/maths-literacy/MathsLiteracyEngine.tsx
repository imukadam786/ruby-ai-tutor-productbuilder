"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { rewardEffortFloor, rewardSkillMastered } from "@/lib/reward-client";
import { seedForGrade } from "@/lib/maths-literacy-grade-map";
import {
  getMathsLiteracyProfile,
  getMathsLiteracySkillById,
  getNextMathsLiteracySkillId,
  saveMathsLiteracyProfile,
  updateMathsLiteracySkillMastery,
} from "@/lib/maths-literacy-student-model";
import { ACCURACY_TARGET, requiredCoverageCount } from "@/lib/content-mastery";
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
  const [submitting, setSubmitting] = useState(false);

  // Track served items per skill so we don't repeat within a session.
  const usedRefsRef = useRef<Record<string, string[]>>({});

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
  const onSubmit = async () => {
    if (!question || submitting) return;
    setSubmitting(true);
    try {
      const fieldsPayload = question.fields
        ? question.fields.map((f) => ({ label: f.label, value: studentFields[f.label] ?? "" }))
        : undefined;
      const res = await apiFetch("/api/maths-literacy/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill_id: currentSkillId,
          question_id: question.question_id,
          question: question.question,
          student_answer: question.answerMode === "multiField" ? "" : studentAnswer.trim(),
          student_fields: fieldsPayload,
          expected_answer_key: question.expected_answer_key,
          working_steps: question.working_steps,
        }),
      });
      // Shared daily limit reached — apiFetch surfaced the upgrade modal.
      if (res.status === 429) return;
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as MathsLiteracySubmitResponse;
      setFeedback(data.result);
      setPhase("feedback");
      answeredRef.current = true;

      // Update local profile with the attempt. Coverage denominator is the
      // skill's authored bank size, returned with the question.
      if (profile) {
        const poolSize = question.pool_size;
        const { profile: updated, mastered } = updateMathsLiteracySkillMastery(
          profile,
          data.attempt,
          poolSize,
        );
        const withCurrent = { ...updated, current_skill_id: currentSkillId };
        setProfile(withCurrent);
        saveMathsLiteracyProfile(withCurrent);
        if (mastered) {
          // Hint to next call: feedback now shows a "mastered" badge.
          data.result.mastery_update.new_status = "mastered";
          // Rubies: first-time mastery bonus.
          rewardSkillMastered("maths-literacy", currentSkillId, profile.id);
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to submit answer";
      setError(msg);
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Continue (next question or advance skill) ────────────────────────────
  const onContinue = () => {
    if (!question) return;
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

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5]">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900"
            aria-label="Back to subjects"
          >
            ← Subjects
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 truncate">Maths Literacy · {currentSkillId}</div>
          <div className="text-sm font-semibold text-gray-900 truncate">
            {skill?.title ?? "Loading…"}
          </div>
        </div>
        {mastery && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              mastery.status === "mastered"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {mastery.status === "mastered"
              ? "Mastered"
              : requiredCount > 0
              ? `${Math.min(distinctAnswered, requiredCount)}/${requiredCount}`
              : `${mastery.correct_count}`}
          </span>
        )}
        {mastery && mastery.status !== "mastered" && requiredCount > 0 && (
          <span
            className="hidden sm:inline text-[10px] text-gray-500"
            title={`Master this skill: answer ${requiredCount} different questions at ${Math.round(
              ACCURACY_TARGET * 100,
            )}% correct`}
          >
            {requiredCount} at {Math.round(ACCURACY_TARGET * 100)}%
          </span>
        )}
        {replayMode && (
          <button
            onClick={onExitReplayClick}
            className="text-xs text-blue-600 hover:underline"
          >
            Exit replay
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {phase === "loading" && (
            <div className="text-center text-gray-500 py-12">Loading question…</div>
          )}

          {phase === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error ?? "Something went wrong."}
              <button
                onClick={() => fetchQuestion(currentSkillId)}
                className="block mt-3 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs"
              >
                Try again
              </button>
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
            <FeedbackView
              result={feedback}
              workingSteps={question.working_steps}
              onContinue={onContinue}
              advanceLabel={
                profile?.skill_mastery[currentSkillId]?.status === "mastered" &&
                feedback.is_correct &&
                !replayMode
                  ? "Next skill →"
                  : "Next question →"
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
      {question.stimulus && (
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {question.stimulus}
        </div>
      )}
      <div className="text-base font-semibold text-gray-900">{question.question}</div>

      {question.answerMode === "numeric" && (
        <div>
          <input
            type="text"
            inputMode="decimal"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder={question.unit ? `Answer in ${question.unit}` : "Your answer"}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE1832]"
            autoFocus
          />
        </div>
      )}

      {question.answerMode === "multiChoice" && question.options && (
        <div className="space-y-2">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setStudentAnswer(opt)}
              className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                studentAnswer === opt
                  ? "border-[#BE1832] bg-rose-50 ring-2 ring-[#BE1832]/20"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              <span className="text-xs text-gray-500 mr-2">{String.fromCharCode(65 + i)})</span>
              <span className="text-sm">{opt}</span>
            </button>
          ))}
        </div>
      )}

      {question.answerMode === "multiField" && question.fields && (
        <div className="space-y-3">
          {question.fields.map((f) => (
            <label key={f.label} className="block">
              <span className="text-sm text-gray-700">{f.label}</span>
              <input
                type="text"
                value={studentFields[f.label] ?? ""}
                onChange={(e) =>
                  setStudentFields({ ...studentFields, [f.label]: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE1832]"
              />
            </label>
          ))}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!canSubmit || submitting}
        className="w-full px-4 py-2.5 rounded-xl bg-[#BE1832] hover:bg-[#a01528] disabled:bg-gray-300 text-white font-semibold text-sm transition-colors"
      >
        {submitting ? "Checking…" : "Submit"}
      </button>
    </div>
  );
}

// ─── Feedback render ─────────────────────────────────────────────────────────
function FeedbackView({
  result,
  workingSteps,
  onContinue,
  advanceLabel,
}: {
  result: MathsLiteracyDiagnosticResult;
  workingSteps: string[];
  onContinue: () => void;
  advanceLabel: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
      <div
        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
          result.is_correct
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {result.is_correct
          ? "Correct"
          : result.partial_credit
          ? `Partial (${result.partial_credit.correct}/${result.partial_credit.total})`
          : "Not quite"}
      </div>
      <div className="text-sm text-gray-800 leading-relaxed">{result.feedback}</div>
      {!result.is_correct && workingSteps.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-gray-700 mb-2">Working</div>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            {workingSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}
      <button
        onClick={onContinue}
        className="w-full px-4 py-2.5 rounded-xl bg-[#BE1832] hover:bg-[#a01528] text-white font-semibold text-sm transition-colors"
      >
        {advanceLabel}
      </button>
    </div>
  );
}
