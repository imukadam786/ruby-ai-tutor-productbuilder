"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import EduBackground from "@/components/EduBackground";
import MatricPhysSciSkillTreeView from "./MatricPhysSciSkillTreeView";
import SequenceQuestion from "./SequenceQuestion";
import treeData from "@/data/matric-physical-sciences-skill-tree.json";
import bankData from "@/data/matric-physical-sciences-question-bank.json";
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
  MatricPhysSciBank,
  MatricPhysSciGeneratedQuestion,
  MatricPhysSciGenerateQuestionResponse,
  MatricPhysSciSkillTree,
  MatricPhysSciSubmitAnswerRequest,
  MatricPhysSciSubmitAnswerResponse,
} from "@/types/matric-phys-sci";

const tree = treeData as unknown as MatricPhysSciSkillTree;
const bank = bankData as unknown as MatricPhysSciBank;

type SkillStatus = "available" | "in_progress" | "mastered";
type Phase = "tree" | "loading" | "question" | "feedback" | "session_done";

function targetItemCount(skillId: string): number {
  return bank.skills[skillId]?.items.length ?? 20;
}

function passThreshold(skillId: string): number {
  return bank.skills[skillId]?.items[0]?.passThreshold ?? 0.7;
}

function findSkillMeta(skillId: string) {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const found = tier.atomic_skills.find((s) => s.id === skillId);
      if (found) return { skill: found, level, tier };
    }
  }
  return null;
}

interface Props {
  onBack?: () => void;
}

export default function MatricPhysSciSession({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<MatricPhysSciGeneratedQuestion | null>(null);
  const [result, setResult] = useState<MatricPhysSciSubmitAnswerResponse | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [multiFieldAnswers, setMultiFieldAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
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
      if (!loadMatricPhysSciProfile()) {
        const restored = await hydrateMatricPhysSciProfileFromSupabase();
        if (restored) saveMatricPhysSciProfile(restored);
      }
      const profile = getOrCreateMatricPhysSciProfile(name);
      void linkMatricPhysSciProfileToAuth(profile.id);
      if (!cancelled) setMastery(getMatricPhysSciMasteryMap());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistReport = useCallback(
    async (sid: string, correct: number, attempts: number, didMaster: boolean) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;
        const meta = findSkillMeta(sid);
        const accuracy = attempts > 0 ? correct / attempts : 0;
        const inputData = {
          subject: "matric-physical-sciences",
          skill_id: sid,
          skill_title: meta?.skill.title ?? sid,
          paper: meta?.level.paper ?? null,
          level_id: meta?.level.id ?? null,
          correct_count: correct,
          attempt_count: attempts,
          accuracy,
          target_item_count: targetItemCount(sid),
          pass_threshold: passThreshold(sid),
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
          subject: "matric-physical-sciences",
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("[MatricPhysSciSession] persistReport failed:", err);
      }
    },
    [],
  );

  const loadNextQuestion = useCallback(async (sid: string) => {
    setPhase("loading");
    setError(null);
    setAnswer("");
    setMultiFieldAnswers([]);
    const used = getMatricPhysSciUsedRefs(sid);
    try {
      const res = await apiFetch("/api/matric-phys-sci/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: sid, used_refs: used }),
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
  }, []);

  const handlePickSkill = useCallback(
    (sid: string) => {
      const meta = findSkillMeta(sid);
      setSkillId(sid);
      setCorrectCount(0);
      setAttemptCount(0);
      sessionStartRef.current = Date.now();
      trackSessionStarted({
        subject: "matric-physical-sciences",
        current_skill_id: sid,
        current_level: meta?.level.id ?? 0,
      });
      void loadNextQuestion(sid);
    },
    [loadNextQuestion],
  );

  const handleSubmit = useCallback(
    async (serialisedAnswer: string) => {
      if (!question || !skillId || !serialisedAnswer) return;
      setSubmitting(true);
      try {
        const payload: MatricPhysSciSubmitAnswerRequest = {
          skill_id: skillId,
          question_ref: question.question_ref,
          answerMode: question.answerMode,
          student_answer: serialisedAnswer,
          expected_answer: question.expected_answer,
          tolerance: question.tolerance,
        };
        const res = await apiFetch("/api/matric-phys-sci/submit-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // 429 = shared daily limit reached; apiFetch already surfaced the
          // upgrade modal, so don't also flash an inline error.
          if (res.status !== 429) setError("Could not check your answer. Please try again.");
          setSubmitting(false);
          return;
        }
        const data = (await res.json()) as MatricPhysSciSubmitAnswerResponse;
        setResult(data);

        recordMatricPhysSciAnswer(skillId, question.question_ref, data.is_correct);

        const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
        const nextAttempts = attemptCount + 1;
        setCorrectCount(nextCorrect);
        setAttemptCount(nextAttempts);

        trackQuestionAnswered({
          subject: "matric-physical-sciences",
          skill_id: skillId,
          template: question.answerMode,
          is_correct: data.is_correct,
          used_hint: false,
          attempt_number: nextAttempts,
          decision: data.is_correct ? "practice" : "reteach",
        });

        if (mastery[skillId] !== "mastered" && mastery[skillId] !== "in_progress") {
          const next = { ...mastery, [skillId]: "in_progress" as SkillStatus };
          setMastery(next);
          setMatricPhysSciMastery(skillId, "in_progress");
        }

        const allAnswered = nextAttempts >= targetItemCount(skillId);
        if (allAnswered) {
          const accuracy = nextAttempts > 0 ? nextCorrect / nextAttempts : 0;
          const didMaster = accuracy >= passThreshold(skillId);
          const nextStatus: SkillStatus = didMaster ? "mastered" : "in_progress";
          const next = { ...mastery, [skillId]: nextStatus };
          setMastery(next);
          setMatricPhysSciMastery(skillId, nextStatus);
          if (didMaster) {
            trackSkillMastered({
              subject: "matric-physical-sciences",
              skill_id: skillId,
              level: findSkillMeta(skillId)?.level.id ?? 0,
              session_attempt_count: nextAttempts,
              session_correct: nextCorrect,
            });
          }
          trackSessionEnded({
            subject: "matric-physical-sciences",
            questions_answered: nextAttempts,
            correct: nextCorrect,
            accuracy,
          });
          void persistReport(skillId, nextCorrect, nextAttempts, didMaster);
          setPhase("session_done");
        } else {
          setPhase("feedback");
        }
      } catch (err) {
        console.error("[MatricPhysSciSession] submit-answer failed:", err);
        setError("Could not check your answer. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [attemptCount, correctCount, mastery, persistReport, question, skillId],
  );

  // ─── Render: tree (default) ─────────────────────────────────────────────────
  if (phase === "tree") {
    return (
      <MatricPhysSciSkillTreeView
        onPickSkill={handlePickSkill}
        masteryStatus={mastery}
        onBack={onBack}
      />
    );
  }

  // ─── Render: end-of-session ─────────────────────────────────────────────────
  if (phase === "session_done" && skillId) {
    const meta = findSkillMeta(skillId);
    const accuracy = attemptCount > 0 ? correctCount / attemptCount : 0;
    const didMaster = accuracy >= passThreshold(skillId);
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
            {" "}Pass threshold {Math.round(passThreshold(skillId) * 100)}%.
          </p>
          <button
            onClick={() => {
              setSkillId(null);
              setQuestion(null);
              setResult(null);
              setPhase("tree");
            }}
            className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] text-white font-bold text-base"
          >
            Pick another skill
          </button>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5]">
        <EduBackground />
        <p className="relative text-gray-500 text-lg">Loading…</p>
      </div>
    );
  }

  // ─── Render: question / feedback ───────────────────────────────────────────
  const target = skillId ? targetItemCount(skillId) : 20;
  const progressPct = skillId
    ? Math.round((Math.min(attemptCount, target) / target) * 100)
    : 0;

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
              ← Skills
            </button>
          </div>

          {skillId && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  {findSkillMeta(skillId)?.skill.title ?? skillId}
                </span>
                <span className="text-sm font-semibold text-amber-700">
                  Q {Math.min(attemptCount + 1, target)} of {target} · {correctCount} correct
                </span>
              </div>
              <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {question && (
            <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-5">
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
                  <p className={`text-base font-bold ${result.is_correct ? "text-green-700" : "text-rose-700"}`}>
                    {result.is_correct ? "✓ " : "✗ "}
                    {result.feedback}
                  </p>
                  {!result.is_correct && question.expected_answer !== undefined && (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">Model answer:</span> {String(question.expected_answer)}
                      {question.unit ? ` ${question.unit}` : ""}
                    </p>
                  )}
                  {result.explanation && (
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
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
        <button
          disabled={submitting || multiFieldAnswers.some((a) => !a.trim())}
          onClick={() => onSubmit(multiFieldAnswers.map((a) => a.trim()).join("|"))}
          className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] disabled:bg-gray-300 text-white font-bold text-lg"
        >
          Check answer
        </button>
      </div>
    );
  }

  if (answerMode === "numeric") {
    return (
      <div className="space-y-3">
        <div className="relative">
          <input
            type="number"
            step="any"
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
