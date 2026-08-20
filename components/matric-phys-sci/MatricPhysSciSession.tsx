"use client";

import QuizShell from "@/components/shared/QuizShell";
import { useCallback, useEffect, useRef, useState } from "react";
import RubyLoader from "@/components/RubyLoader";
import { apiFetch } from "@/lib/fetch";
import EduBackground from "@/components/EduBackground";
import MatricPhysSciSkillTreeView from "./MatricPhysSciSkillTreeView";
import SequenceQuestion from "./SequenceQuestion";
import FeedbackExplanation from "@/components/shared/FeedbackExplanation";
import { GEM_HEX } from "@/lib/design/gemColors";
import FeedbackFooter from "@/components/shared/FeedbackFooter";
import { scorePhysSci } from "@/lib/matric-phys-sci-scoring";
import Button from "@/components/ui/Button";
import SignToggle from "@/components/ui/SignToggle";
import { physSciConfig, type PhysSciGrade } from "@/lib/phys-sci-grade";
import { supabase } from "@/lib/supabase";
import {
  getMatricPhysSciMasteryMap,
  getMatricPhysSciUsedRefs,
  getOrCreateMatricPhysSciProfile,
  hydrateMatricPhysSciProfileFromSupabase,
  linkMatricPhysSciProfileToAuth,
  loadMatricPhysSciProfile,
  recordMatricPhysSciAnswer,
  saveMatricPhysSciProfile,
  setMatricPhysSciMastery,
} from "@/lib/matric-phys-sci-student-model";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  trackQuestionAnswered,
  trackSessionStarted,
  trackSessionEnded,
  trackSkillMastered,
} from "@/lib/analytics";
import type {
  MatricPhysSciGeneratedQuestion,
  MatricPhysSciGenerateQuestionResponse,
  MatricPhysSciSubmitAnswerRequest,
  MatricPhysSciSubmitAnswerResponse,
} from "@/types/matric-phys-sci";

type SkillStatus = "available" | "in_progress" | "mastered";
type Phase = "tree" | "loading" | "question" | "feedback" | "session_done";

function targetItemCount(skillId: string, grade: PhysSciGrade): number {
  return physSciConfig(grade).bank.skills[skillId]?.items.length ?? 20;
}

function passThreshold(skillId: string, grade: PhysSciGrade): number {
  return physSciConfig(grade).bank.skills[skillId]?.items[0]?.passThreshold ?? 0.7;
}

function findSkillMeta(skillId: string, grade: PhysSciGrade) {
  for (const level of physSciConfig(grade).tree.levels) {
    for (const tier of level.tiers) {
      const found = tier.atomic_skills.find((s) => s.id === skillId);
      if (found) return { skill: found, level, tier };
    }
  }
  return null;
}

interface Props {
  onBack?: () => void;
  /** Which Physical Sciences grade to run. Defaults to 12 (matric). */
  grade?: PhysSciGrade;
  /** Deep-link: open straight into this skill (e.g. routed from a paper report). */
  initialSkillId?: string;
  /** Context line shown while practising a deep-linked skill (e.g. the paper it came from). */
  contextLabel?: string;
  /** When set, the end-of-session screen offers a route back to where the learner came from. */
  onReturnToPaper?: () => void;
}

export default function MatricPhysSciSession({
  onBack,
  grade = 12,
  initialSkillId,
  contextLabel,
  onReturnToPaper,
}: Props) {
  const config = physSciConfig(grade);
  const subject = config.subject;
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<MatricPhysSciGeneratedQuestion | null>(null);
  const [result, setResult] = useState<MatricPhysSciSubmitAnswerResponse | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [multiFieldAnswers, setMultiFieldAnswers] = useState<string[]>([]);
  // Feedback is scored client-side and shown instantly — no "Checking…" wait.
  const [submitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [mastery, setMastery] = useState<Record<string, SkillStatus>>({});

  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchAuthorisedGrade();
      const name = data?.name ?? "Learner";
      if (!loadMatricPhysSciProfile(grade)) {
        const restored = await hydrateMatricPhysSciProfileFromSupabase(grade);
        if (restored) saveMatricPhysSciProfile(restored);
      }
      const profile = getOrCreateMatricPhysSciProfile(name, grade);
      void linkMatricPhysSciProfileToAuth(profile.id);
      if (!cancelled) setMastery(getMatricPhysSciMasteryMap(grade));
    })();
    return () => {
      cancelled = true;
    };
  }, [grade]);

  const persistReport = useCallback(
    async (sid: string, correct: number, attempts: number, didMaster: boolean) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;
        const meta = findSkillMeta(sid, grade);
        const accuracy = attempts > 0 ? correct / attempts : 0;
        const inputData = {
          subject,
          skill_id: sid,
          skill_title: meta?.skill.title ?? sid,
          paper: meta?.level.paper ?? null,
          level_id: meta?.level.id ?? null,
          correct_count: correct,
          attempt_count: attempts,
          accuracy,
          target_item_count: targetItemCount(sid, grade),
          pass_threshold: passThreshold(sid, grade),
          mastered: didMaster,
          duration_ms: Date.now() - sessionStartRef.current,
        };
        const contentData = {
          summary: didMaster
            ? `Mastered "${meta?.skill.title ?? sid}" with ${correct}/${attempts} correct.`
            : `Practised "${meta?.skill.title ?? sid}" with ${correct}/${attempts} correct.`,
          skill_id: sid,
        };
        await supabase.from("student_reports").insert({
          user_id: user.id,
          subject,
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("[MatricPhysSciSession] persistReport failed:", err);
      }
    },
    [grade, subject],
  );

  const loadNextQuestion = useCallback(async (sid: string) => {
    setPhase("loading");
    setError(null);
    setAnswer("");
    setMultiFieldAnswers([]);
    const used = getMatricPhysSciUsedRefs(sid, grade);
    try {
      const res = await apiFetch("/api/matric-phys-sci/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: sid, used_refs: used, grade }),
      });
      if (!res.ok) {
        setError("Could not load a question. Please try again.");
        setPhase("feedback");
        return;
      }
      const data = (await res.json()) as MatricPhysSciGenerateQuestionResponse;
      if (!data.question) {
        setError("No more questions for this skill right now.");
        setPhase("feedback");
        return;
      }
      setQuestion(data.question);
      if (data.question.answerMode === "multiField" && data.question.fields) {
        setMultiFieldAnswers(new Array(data.question.fields.length).fill(""));
      }
      setResult(null);
      setPhase("question");
    } catch (err) {
      console.error("[MatricPhysSciSession] generate-question failed:", err);
      setError("Could not load a question. Please try again.");
      setPhase("feedback");
    }
  }, [grade]);

  const handlePickSkill = useCallback(
    (sid: string) => {
      const meta = findSkillMeta(sid, grade);
      setSkillId(sid);
      setCorrectCount(0);
      setAttemptCount(0);
      sessionStartRef.current = Date.now();
      trackSessionStarted({
        subject,
        current_skill_id: sid,
        current_level: meta?.level.id ?? 0,
      });
      void loadNextQuestion(sid);
    },
    [loadNextQuestion, grade, subject],
  );

  // Deep-link: when opened with an initialSkillId (e.g. from a paper report's
  // "Practise this"), jump straight into that skill instead of the tree. Consume
  // it once so returning to the tree afterwards doesn't re-trigger.
  const deepLinkConsumed = useRef(false);
  useEffect(() => {
    if (initialSkillId && !deepLinkConsumed.current) {
      deepLinkConsumed.current = true;
      handlePickSkill(initialSkillId);
    }
  }, [initialSkillId, handlePickSkill]);

  // Apply a graded result: record the attempt, update mastery, and move to
  // feedback (or the session-done screen).
  const finalizeAttempt = useCallback(
    (data: MatricPhysSciSubmitAnswerResponse, q: MatricPhysSciGeneratedQuestion, sId: string) => {
      setResult(data);
      recordMatricPhysSciAnswer(sId, q.question_ref, data.is_correct, grade);

      const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
      const nextAttempts = attemptCount + 1;
      setCorrectCount(nextCorrect);
      setAttemptCount(nextAttempts);

      trackQuestionAnswered({
        subject,
        skill_id: sId,
        template: q.answerMode,
        is_correct: data.is_correct,
        used_hint: false,
        attempt_number: nextAttempts,
        decision: data.is_correct ? "practice" : "reteach",
      });

      if (mastery[sId] !== "mastered" && mastery[sId] !== "in_progress") {
        const next = { ...mastery, [sId]: "in_progress" as SkillStatus };
        setMastery(next);
        setMatricPhysSciMastery(sId, "in_progress", grade);
      }

      const allAnswered = nextAttempts >= targetItemCount(sId, grade);
      if (allAnswered) {
        const accuracy = nextAttempts > 0 ? nextCorrect / nextAttempts : 0;
        const didMaster = accuracy >= passThreshold(sId, grade);
        const nextStatus: SkillStatus = didMaster ? "mastered" : "in_progress";
        const next = { ...mastery, [sId]: nextStatus };
        setMastery(next);
        setMatricPhysSciMastery(sId, nextStatus, grade);
        if (didMaster) {
          trackSkillMastered({
            subject,
            skill_id: sId,
            level: findSkillMeta(sId, grade)?.level.id ?? 0,
            session_attempt_count: nextAttempts,
            session_correct: nextCorrect,
          });
        }
        trackSessionEnded({ subject, questions_answered: nextAttempts, correct: nextCorrect, accuracy });
        void persistReport(sId, nextCorrect, nextAttempts, didMaster);
        setPhase("session_done");
      } else {
        setPhase("feedback");
      }
    },
    [attemptCount, correctCount, mastery, persistReport, grade, subject],
  );

  const handleSubmit = useCallback(
    async (serialisedAnswer: string) => {
      if (!question || !skillId || !serialisedAnswer) return;

      // Every Physical Sciences mode is deterministic and ships its answer with
      // the question, so score client-side for instant feedback. The server call
      // runs in the background only for usage metering.
      const isCorrect = scorePhysSci({
        answerMode: question.answerMode,
        studentAnswer: serialisedAnswer,
        expectedAnswer: question.expected_answer,
        tolerance: question.tolerance,
        fields: question.fields,
        expectedOrder: question.expected_order,
      });
      finalizeAttempt(
        {
          is_correct: isCorrect,
          error_signals: [],
          feedback: isCorrect ? "Correct." : "Not quite.",
          explanation: question.explanation,
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
      void apiFetch("/api/matric-phys-sci/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill_id: skillId,
          question_ref: question.question_ref,
          answerMode: question.answerMode,
          student_answer: serialisedAnswer,
          expected_answer: question.expected_answer,
          tolerance: question.tolerance,
          grade,
        } as MatricPhysSciSubmitAnswerRequest),
      }).catch(() => { /* non-blocking; feedback already shown */ });
    },
    [finalizeAttempt, question, skillId, grade],
  );

  // ─── Render: tree (default) ─────────────────────────────────────────────────
  if (phase === "tree") {
    return (
      <MatricPhysSciSkillTreeView
        onPickSkill={handlePickSkill}
        masteryStatus={mastery}
        onBack={onBack}
        grade={grade}
      />
    );
  }

  // ─── Render: end-of-session ─────────────────────────────────────────────────
  if (phase === "session_done" && skillId) {
    const meta = findSkillMeta(skillId, grade);
    const accuracy = attemptCount > 0 ? correctCount / attemptCount : 0;
    const didMaster = accuracy >= passThreshold(skillId, grade);
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5] p-6">
        <EduBackground />
        <div className="relative bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#1a2744]">
            {didMaster ? "Skill mastered" : "Skill practised"}
          </h2>
          <p className="text-gray-600 text-base">
            {didMaster ? (
              <>You mastered <span className="font-semibold">{meta?.skill.title ?? "this skill"}</span>.</>
            ) : (
              <>You finished <span className="font-semibold">{meta?.skill.title ?? "this skill"}</span>. Try again to master it.</>
            )}
          </p>
          <p className="text-sm text-gray-500">
            {correctCount} of {attemptCount} correct ({Math.round(accuracy * 100)}%).
            {" "}Pass threshold {Math.round(passThreshold(skillId, grade) * 100)}%.
          </p>
          {onReturnToPaper && (
            <div className="rounded-2xl bg-[#eef2ff] border border-[#c7d2fe] px-4 py-3 text-sm text-[#3730a3]">
              {didMaster
                ? "Nice — you've brushed this up. Head back and retry it on your paper."
                : "Good progress. Head back to your paper when you're ready to retry it."}
            </div>
          )}
          {onReturnToPaper && (
            <Button variant="primary" size="lg" fullWidth onClick={onReturnToPaper}>
              ← Back to your paper
            </Button>
          )}
          <Button
            variant={onReturnToPaper ? "outline" : "primary"}
            size="lg"
            fullWidth
            onClick={() => {
              setSkillId(null);
              setQuestion(null);
              setResult(null);
              setPhase("tree");
            }}
          >
            Pick another skill
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

  if (!question || !skillId) return null;

  const target = targetItemCount(skillId, grade);

  return (
    <QuizShell
      accent="rose"
      topicTitle={findSkillMeta(skillId, grade)?.skill.title ?? skillId}
      onExit={() => {
        setSkillId(null);
        setQuestion(null);
        setResult(null);
        setPhase("tree");
      }}
      questionNumber={Math.min(attemptCount + 1, target)}
      totalQuestions={target}
      noCard={phase === "feedback"}
      onSkip={phase === "question" && !submitting ? () => skillId && loadNextQuestion(skillId) : undefined}
    >
      {contextLabel && (
        <div className="flex items-center gap-2 rounded-2xl bg-[#eef2ff] border border-[#c7d2fe] px-4 py-2.5 text-sm text-[#3730a3]">
          <span aria-hidden>📄</span>
          <span>{contextLabel}</span>
        </div>
      )}

      <p className="text-base sm:text-lg text-[#1a2744] font-medium leading-relaxed whitespace-pre-wrap">
        {question.question}
      </p>

      {phase === "question" && (
        <div className="relative">
          <div className={submitting ? "opacity-40 pointer-events-none transition-opacity" : "transition-opacity"}>
            <MatricAnswerInput
              question={question}
              value={answer}
              onChange={setAnswer}
              multiFieldAnswers={multiFieldAnswers}
              onMultiFieldChange={setMultiFieldAnswers}
              onSubmit={handleSubmit}
              submitting={submitting}
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
        (() => {
          // "What you put / answer" only reads clearly for single-value
          // modes; multiField/sequence answers are serialised, so skip them.
          const singleValue =
            question.answerMode === "choice" ||
            question.answerMode === "numeric" ||
            question.answerMode === "text";
          const modelAnswer =
            question.expected_answer !== undefined
              ? `${String(question.expected_answer)}${question.unit ? ` ${question.unit}` : ""}`
              : undefined;
          return (
            <FeedbackExplanation
              gemColor={GEM_HEX.rose}
              isCorrect={result.is_correct}
              studentAnswer={singleValue ? answer : undefined}
              correctAnswer={singleValue ? modelAnswer : undefined}
              note={result.is_correct ? result.explanation : undefined}
              whyOverride={result.is_correct ? undefined : result.explanation}
              footer={
                <FeedbackFooter
                  isCorrect={result.is_correct}
                  onNext={() => skillId && loadNextQuestion(skillId)}
                  onRetry={() => { setAnswer(""); setResult(null); setError(null); setPhase("question"); }}
                />
              }
            />
          );
        })()
      )}

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
      )}
    </QuizShell>
  );
}

// ─── Answer input (answerMode-specific) ──────────────────────────────────────

interface AnswerInputProps {
  question: MatricPhysSciGeneratedQuestion;
  value: string;
  onChange: (next: string) => void;
  multiFieldAnswers: string[];
  onMultiFieldChange: (next: string[]) => void;
  onSubmit: (serialised: string) => void;
  submitting: boolean;
}

function MatricAnswerInput({
  question,
  value,
  onChange,
  multiFieldAnswers,
  onMultiFieldChange,
  onSubmit,
  submitting,
}: AnswerInputProps) {
  const { answerMode, options, fields, items, unit } = question;

  if (answerMode === "sequence" && items) {
    return (
      <SequenceQuestion
        key={question.question_ref}
        items={items}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  if (answerMode === "choice" && options) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            disabled={submitting}
            onClick={() => onSubmit(opt)}
            className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-300 rounded-2xl px-5 py-4 text-left text-base font-semibold text-[#1a2744] active:scale-[0.99] transition-all whitespace-pre-wrap"
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (answerMode === "multiField" && fields) {
    return (
      <div className="space-y-3">
        {fields.map((f, idx) => (
          <div key={f.label} className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">{f.label}</label>
            <input
              type="text"
              value={multiFieldAnswers[idx] ?? ""}
              onChange={(e) => {
                const next = [...multiFieldAnswers];
                next[idx] = e.target.value;
                onMultiFieldChange(next);
              }}
              placeholder="Type your answer"
              className="w-full px-4 py-3 text-base border-2 border-amber-200 focus:border-amber-400 focus:outline-none rounded-xl bg-amber-50 text-[#1a2744]"
            />
          </div>
        ))}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={submitting || multiFieldAnswers.some((a) => !a.trim())}
          onClick={() => onSubmit(multiFieldAnswers.map((a) => a.trim()).join("|"))}
        >
          Check answer
        </Button>
      </div>
    );
  }

  if (answerMode === "numeric") {
    return (
      <div className="space-y-3">
        <div className="flex items-stretch gap-2">
          <SignToggle
            value={value}
            onChange={onChange}
            disabled={submitting}
            className="rounded-2xl px-5 text-xl"
          />
          <div className="relative w-full">
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
              }}
              placeholder="Numeric answer"
              className="w-full px-5 py-4 pr-20 text-lg font-semibold border-2 border-amber-200 focus:border-amber-400 focus:outline-none rounded-2xl bg-amber-50 text-[#1a2744]"
            />
            {unit && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                {unit}
              </span>
            )}
          </div>
        </div>
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

  // text / fallback
  return (
    <div className="space-y-3">
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer"
        rows={4}
        className="w-full px-5 py-4 text-base border-2 border-amber-200 focus:border-amber-400 focus:outline-none rounded-2xl bg-amber-50 text-[#1a2744] resize-y"
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
