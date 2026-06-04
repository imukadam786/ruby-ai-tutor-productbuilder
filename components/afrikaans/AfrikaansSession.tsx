import { rewardEffortFloor, rewardSkillMastered } from "@/lib/reward-client";
"use client";

// Cloned from components/life-skills/LifeSkillsSession.tsx — the learner taps /
// chooses / listens, and answers are graded deterministically by the
// /api/afrikaans/* routes (no LLM rubric judge). Adaptations for Afrikaans FAL:
//   • Audio: plays the bank's Afrikaans `audio` string via speakAfrikaans()
//     (the swap seam in lib/afrikaans-audio.ts).
//   • Image-match: renders pictures from public/afrikaans/<key>.<ext> using
//     `image_refs`, falling back to the English-text options when a file is
//     absent.
//   • Mastery + prerequisite unlocking are tracked through the per-skill student
//     model (lib/afrikaans-student-model.ts) so completing a skill unlocks its
//     dependants.

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";
import { prefetchTTS } from "@/lib/tts";
import { prefetchAfrikaans, useAfrikaansTTS } from "@/lib/afrikaans-audio";
import afrikaansTreeData from "@/data/afrikaans-skill-tree.json";
import { AFRIKAANS_SKILL_STATS } from "@/lib/afrikaans-skill-stats";
import EduBackground from "@/components/EduBackground";
import SpeakButton from "@/components/SpeakButton";
import AfrikaansSkillTreeView from "./AfrikaansSkillTreeView";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  createAfrikaansProfile,
  getAfrikaansSkillStatus,
  getAfrikaansUsedRefs,
  hydrateAfrikaansProfileFromSupabase,
  linkAfrikaansProfileToAuth,
  loadAfrikaansProfile,
  markAfrikaansQuestionUsed,
  markAfrikaansSkillInProgress,
  recordAfrikaansSkillResult,
  saveAfrikaansProfile,
} from "@/lib/afrikaans-student-model";
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
  AfrikaansGeneratedQuestion,
  AfrikaansGenerateQuestionResponse,
  AfrikaansSkillTree,
  AfrikaansStudentProfile,
  AfrikaansSubmitAnswerRequest,
  AfrikaansSubmitAnswerResponse,
} from "@/types/afrikaans";

const tree = afrikaansTreeData as unknown as AfrikaansSkillTree;

// Total distinct questions authored for a skill — the coverage denominator.
// Afrikaans has no question-bank import, so the pool size comes from the
// per-skill stats table.
function poolSize(skillId: string): number {
  return AFRIKAANS_SKILL_STATS[skillId]?.itemCount ?? 8;
}

// Distinct questions the student must answer to master this skill
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

// ─── Component ───────────────────────────────────────────────────────────────

type Phase = "tree" | "loading" | "question" | "feedback" | "mastered";

export default function AfrikaansSession({ onBack }: { onBack?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<AfrikaansGeneratedQuestion | null>(null);
  const [result, setResult] = useState<AfrikaansSubmitAnswerResponse | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-skill session state — resets when the user picks a skill
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [didMasterTopic, setDidMasterTopic] = useState(false);
  const [profile, setProfile] = useState<AfrikaansStudentProfile | null>(null);

  const { speak, speakAfrikaans, stop, playing } = useAfrikaansTTS();
  const sessionStartRef = useRef<number>(Date.now());

  // Resolve the learner's profile: prefer localStorage; if empty, restore from
  // Supabase (returning learner on a new device); otherwise create a fresh one.
  // Then link it to the authenticated user so future restores work.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchAuthorisedGrade();
      const grade = data?.grade ?? 1;
      const name = data?.name ?? "Learner";
      let p = loadAfrikaansProfile();
      if (!p) {
        p = await hydrateAfrikaansProfileFromSupabase();
        if (p) saveAfrikaansProfile(p); // restore to localStorage
      }
      if (!p) p = createAfrikaansProfile(name, grade);
      void linkAfrikaansProfileToAuth(p.id);
      if (!cancelled) setProfile(p);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Audio: prefetch when a new question arrives (no autoplay — the learner
  //     taps the 🔊 icon to hear it, consistent across subjects). ──────────────
  useEffect(() => {
    if (!question) return;
    // Warm both channels so playback is instant on tap.
    prefetchTTS(question.ruby_prompt || question.question);
    if (question.audio) prefetchAfrikaans(question.audio, question.question_ref);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  const persistReport = useCallback(
    async (sid: string, correct: number, attempts: number, didMaster: boolean) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;
        const found = findSkill(sid);
        const accuracy = attempts > 0 ? correct / attempts : 0;
        const inputData = {
          subject: "afrikaans-fal",
          skill_id: sid,
          skill_title: found?.skill.title ?? sid,
          strand: found?.tier.title ?? null,
          grade: found?.level.grade ?? null,
          correct_count: correct,
          attempt_count: attempts,
          accuracy,
          target_item_count: requiredCount(sid),
          pass_threshold: ACCURACY_TARGET,
          mastered: didMaster,
          duration_ms: Date.now() - sessionStartRef.current,
        };
        const contentData = {
          summary: didMaster
            ? `Mastered "${found?.skill.title ?? sid}" with ${correct}/${attempts} correct.`
            : `Completed "${found?.skill.title ?? sid}" with ${correct}/${attempts} correct.`,
          skill_id: sid,
        };
        const { error: reportError } = await supabase.from("student_reports").insert({
          user_id: user.id,
          subject: "afrikaans-fal",
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
        if (reportError) console.error("[AfrikaansSession] student_reports insert failed:", reportError);
      } catch (err) {
        console.error("[AfrikaansSession] persistReport failed:", err);
      }
    },
    [],
  );

  // ─── Load next question for the current skill ──────────────────────────────
  const loadNextQuestion = useCallback(
    async (sid: string, sessionCorrect = 0, sessionAttempts = 0) => {
    setPhase("loading");
    setError(null);
    setAnswer("");
    setSequenceOrder([]);
    // Read used refs from the source of truth (localStorage) to avoid stale state.
    const current = loadAfrikaansProfile();
    const used = current?.used_questions?.[sid] ?? [];
    // Difficulty matching: derive ability from running accuracy (prior
    // recorded totals + this sitting's answers so far).
    const prior = current?.skill_mastery[sid];
    const abilityLevel = contentAbilityLevel(
      (prior?.correct_count ?? 0) + sessionCorrect,
      (prior?.attempt_count ?? 0) + sessionAttempts,
    );
    try {
      const res = await apiFetch("/api/afrikaans/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: sid, used_refs: used, ability_level: abilityLevel }),
      });
      if (!res.ok) {
        setError("Could not load a question. Please try again.");
        setPhase("feedback");
        return;
      }
      const data = (await res.json()) as AfrikaansGenerateQuestionResponse;
      if (!data.question) {
        setError("No more questions on this skill right now.");
        setPhase("feedback");
        return;
      }
      setQuestion(data.question);
      if (data.question.input_type === "sequence" && data.question.options) {
        setSequenceOrder([...data.question.options].sort(() => Math.random() - 0.5));
      }
      setResult(null);
      setPhase("question");
    } catch (err) {
      console.error("[AfrikaansSession] generate-question failed:", err);
      setError("Could not load a question. Please try again.");
      setPhase("feedback");
    }
    },
    [],
  );

  // ─── Skill picked from the tree ────────────────────────────────────────────
  const handlePickSkill = useCallback(
    (sid: string) => {
      const found = findSkill(sid);
      setSkillId(sid);
      setCorrectCount(0);
      setAttemptCount(0);
      setConsecutiveWrong(0);
      setDidMasterTopic(false);
      sessionStartRef.current = Date.now();
      // Mark in_progress immediately so the tree reflects it on return.
      const base = loadAfrikaansProfile() ?? profile;
      if (base) setProfile(markAfrikaansSkillInProgress(base, sid));
      trackSessionStarted({
        subject: "afrikaans-fal",
        current_skill_id: sid,
        current_level: found?.level.id ?? 1,
      });
      void loadNextQuestion(sid);
    },
    [loadNextQuestion, profile],
  );

  // Deep-link from the Progress page: if a target skill was stashed, jump
  // straight into it once the profile is ready (and only if it isn't locked).
  useEffect(() => {
    if (!profile || phase !== "tree") return;
    let target: string | null = null;
    try {
      target = sessionStorage.getItem("ruby_afrikaans_target_skill");
    } catch { /* ignore */ }
    if (!target) return;
    try { sessionStorage.removeItem("ruby_afrikaans_target_skill"); } catch { /* ignore */ }
    if (getAfrikaansSkillStatus(target, profile) !== "locked") {
      handlePickSkill(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // ─── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (rawAnswer: string) => {
      if (!question || !skillId || !rawAnswer) return;
      setSubmitting(true);
      try {
        const payload: AfrikaansSubmitAnswerRequest = {
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
        const res = await apiFetch("/api/afrikaans/submit-answer", {
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
        const data = (await res.json()) as AfrikaansSubmitAnswerResponse;
        setResult(data);

        // Mark this question used (localStorage source of truth).
        const afterUsed = markAfrikaansQuestionUsed(
          loadAfrikaansProfile() ?? profile!,
          skillId,
          question.question_ref,
        );

        const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
        const nextAttempts = attemptCount + 1;
        const nextConsecutiveWrong = data.is_correct ? 0 : consecutiveWrong + 1;
        setCorrectCount(nextCorrect);
        setAttemptCount(nextAttempts);
        setConsecutiveWrong(nextConsecutiveWrong);

        trackQuestionAnswered({
          subject: "afrikaans-fal",
          skill_id: skillId,
          template: question.input_type,
          is_correct: data.is_correct,
          used_hint: false,
          attempt_number: nextAttempts,
          decision: data.is_correct ? "practice" : "reteach",
        });

        // ── Cumulative mastery check ────────────────────────────────────────
        // Coverage + accuracy are measured across all sittings, not just this
        // run. Prior totals live in skill_mastery; this run's deltas are the
        // session counters. Distinct coverage is deduped from used_questions.
        const prior = profile?.skill_mastery[skillId];
        const cumulativeCorrect = (prior?.correct_count ?? 0) + nextCorrect;
        const cumulativeAttempts = (prior?.attempt_count ?? 0) + nextAttempts;
        const distinctAnswered = new Set(getAfrikaansUsedRefs(afterUsed, skillId)).size;
        const size = poolSize(skillId);
        const required = requiredCount(skillId);

        const didMaster = isContentMastered(
          distinctAnswered,
          size,
          cumulativeCorrect,
          cumulativeAttempts,
        );

        // End the run when the skill is mastered, when this sitting has covered
        // a full batch, or when the pool is exhausted — otherwise keep going.
        const runOver =
          didMaster || nextAttempts >= required || distinctAnswered >= size;

        if (runOver) {
          // Roll up the result into the profile — mastery unlocks dependants.
          setProfile(
            recordAfrikaansSkillResult(afterUsed, skillId, {
              correct: nextCorrect,
              attempts: nextAttempts,
              mastered: didMaster,
            }),
          );
          setDidMasterTopic(didMaster);
          if (didMaster) {
            trackSkillMastered({
              subject: "afrikaans-fal",
              skill_id: skillId,
              level: findSkill(skillId)?.level.id ?? 1,
              session_attempt_count: nextAttempts,
              session_correct: nextCorrect,
            });
          }
          trackSessionEnded({
            subject: "afrikaans-fal",
            questions_answered: nextAttempts,
            correct: nextCorrect,
            accuracy: nextAttempts > 0 ? nextCorrect / nextAttempts : 0,
          });
          // Rubies: effort floor for finishing the topic run + first-time mastery bonus.
          rewardEffortFloor("afrikaans-fal", skillId);
          if (didMaster) rewardSkillMastered("afrikaans-fal", skillId, profile?.id);
          void persistReport(skillId, nextCorrect, nextAttempts, didMaster);
          setPhase("mastered");
        } else {
          setProfile(afterUsed);
          setPhase("feedback");
        }
      } catch (err) {
        console.error("[AfrikaansSession] submit-answer failed:", err);
        setError("Could not check your answer. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [attemptCount, consecutiveWrong, correctCount, persistReport, profile, question, skillId],
  );

  const backToTree = () => {
    setSkillId(null);
    setQuestion(null);
    setResult(null);
    setPhase("tree");
  };

  // ─── Render: tree (default) ────────────────────────────────────────────────
  if (phase === "tree") {
    return <AfrikaansSkillTreeView onPickSkill={handlePickSkill} profile={profile} onBack={onBack} />;
  }

  // ─── Render: end-of-skill ─────────────────────────────────────────────────
  if (phase === "mastered" && skillId) {
    const skill = findSkill(skillId)?.skill;
    const m = profile?.skill_mastery[skillId];
    const cumAccuracy = m && m.attempt_count > 0 ? m.correct_count / m.attempt_count : 0;
    const size = poolSize(skillId);
    const required = requiredCount(skillId);
    const distinct = profile
      ? Math.min(new Set(getAfrikaansUsedRefs(profile, skillId)).size, size)
      : 0;
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5] p-6">
        <EduBackground />
        <div className="relative bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-6xl">{didMasterTopic ? "🎉" : "💪"}</div>
          <h2 className="text-2xl font-bold text-[#1a2744]">
            {didMasterTopic ? "Mooi gedaan!" : "Keep going"}
          </h2>
          <p className="text-gray-600 text-base">
            {didMasterTopic ? (
              <>You mastered <span className="font-semibold">{skill?.title ?? "this skill"}</span> — {Math.round(cumAccuracy * 100)}% correct overall.</>
            ) : (
              <>You&apos;ve answered <span className="font-semibold">{distinct} of {required}</span> questions on {skill?.title ?? "this skill"}. Master it by reaching {required} at {Math.round(ACCURACY_TARGET * 100)}% correct.</>
            )}
          </p>
          <p className="text-sm text-gray-500">{correctCount} of {attemptCount} correct this round.</p>
          <button
            onClick={backToTree}
            className="w-full py-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-base"
          >
            Pick another skill
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
            onClick={backToTree}
            className="text-sm text-[#1a2744] font-semibold underline decoration-2 underline-offset-4"
          >
            ← Skills
          </button>
        </div>

        {skillId && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-orange-800">
                Master this skill
              </span>
              <span className="text-sm font-semibold text-orange-700">
                Q {Math.min(attemptCount + 1, requiredCount(skillId))} / {requiredCount(skillId)} · ⭐ {correctCount}
              </span>
            </div>
            <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{
                  width: `${Math.round(
                    (Math.min(attemptCount, requiredCount(skillId)) /
                      Math.max(requiredCount(skillId), 1)) *
                      100,
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-orange-700 mt-1.5">
              Master: {requiredCount(skillId)} questions at {Math.round(ACCURACY_TARGET * 100)}%
            </p>
          </div>
        )}

        {/* Question card */}
        {question && (
          <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-5">
            {/* English instruction + compact tap-to-hear icon (no autoplay;
                scaffolding stays English) */}
            <div className="flex items-start gap-2">
              <p className="flex-1 text-lg sm:text-xl text-[#1a2744] font-medium leading-snug">
                {question.ruby_prompt || question.question}
              </p>
              <SpeakButton
                playing={playing}
                onClick={() => (playing ? stop() : speak(question.ruby_prompt || question.question))}
                label="Read instruction aloud"
              />
            </div>

            {/* Afrikaans audio — the target content to listen to */}
            {question.audio && (
              <button
                onClick={() => speakAfrikaans(question.audio!, question.question_ref)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-900 font-bold text-base active:scale-[0.99]"
              >
                <span className="text-xl">🔊</span> Luister in Afrikaans
              </button>
            )}

            {/* Context — a short English hint (Gr1–6) OR a full Afrikaans
                passage/poem (FET). Poem line breaks are authored as " / ", so
                we split on that and render each line on its own row; prose with
                no " / " renders as a single readable paragraph that wraps. The
                surrounding card already scrolls (overflow-y-auto above), so long
                passages just grow the card. */}
            {question.context && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-base text-orange-900 leading-relaxed whitespace-pre-wrap">
                {question.context.split(" / ").map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
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
                speakAfrikaans={(t) => speakAfrikaans(t)}
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
                  <p className="text-sm text-orange-700 mt-3 bg-orange-100 rounded-xl px-3 py-2">
                    💡 {recoveryHint}
                  </p>
                )}
              </div>
            )}

            {phase === "feedback" && (
              <button
                onClick={() => skillId && loadNextQuestion(skillId, correctCount, attemptCount)}
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
  question: AfrikaansGeneratedQuestion;
  value: string;
  sequenceOrder: string[];
  onSequenceChange: (next: string[]) => void;
  onChange: (next: string) => void;
  onSubmit: (answer: string) => void;
  submitting: boolean;
  speakAfrikaans: (text: string) => void;
}

// "Play option aloud" icon button. stopPropagation so it never triggers the
// surrounding option button's submit.
function PlayIcon({ text, speak }: { text: string; speak: (t: string) => void }) {
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
      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors bg-white border border-orange-300 hover:bg-orange-100 text-[#BE1832]"
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
  speakAfrikaans,
}: AnswerInputProps) {
  const { input_type, options, image_refs } = question;

  // Image-match — picture tiles (English-text fallback when a file is absent).
  if (input_type === "image-match" && options) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map((opt, i) => (
          <ImageOption
            key={opt}
            imageKey={image_refs?.[i]}
            label={opt}
            disabled={submitting}
            onPick={() => onSubmit(opt)}
          />
        ))}
      </div>
    );
  }

  // Choice / cloze / true-false — large tappable option buttons that submit the
  // option TEXT (Afrikaans true-false items use full-text options, so the answer
  // is the option string, never a literal "true"/"false").
  if ((input_type === "choice" || input_type === "cloze" || input_type === "true-false") && options) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            disabled={submitting}
            onClick={() => onSubmit(opt)}
            className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-300 rounded-2xl px-5 py-5 flex items-center gap-3 text-left text-base sm:text-lg font-semibold text-[#1a2744] active:scale-95 transition-all"
          >
            <span className="flex-1">{opt}</span>
            <PlayIcon text={opt} speak={speakAfrikaans} />
          </button>
        ))}
      </div>
    );
  }

  // Sequence — tap an item, tap another to swap.
  if (input_type === "sequence" && options) {
    return (
      <SequenceInput
        order={sequenceOrder}
        onChange={onSequenceChange}
        onSubmit={() => onSubmit(sequenceOrder.join(","))}
        submitting={submitting}
        speak={speakAfrikaans}
      />
    );
  }

  // Text / fallback — single input.
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
        className="w-full px-5 py-4 text-lg font-semibold border-2 border-orange-200 focus:border-orange-400 focus:outline-none rounded-2xl bg-orange-50 text-[#1a2744]"
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

// ─── Image option (picture with English-text fallback) ───────────────────────

interface ImageOptionProps {
  imageKey?: string;
  label: string;
  disabled: boolean;
  onPick: () => void;
}

// Images live at public/afrikaans/<key>.<ext> (png/svg/jpg per the manifest).
// We try each extension in turn; once all fail we fall back to the English text.
const IMAGE_EXTS = ["webp", "png", "svg", "jpg"];

function ImageOption({ imageKey, label, disabled, onPick }: ImageOptionProps) {
  const [extIdx, setExtIdx] = useState(0);
  const showImage = Boolean(imageKey) && extIdx < IMAGE_EXTS.length;
  return (
    <button
      disabled={disabled}
      onClick={onPick}
      className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-300 rounded-2xl p-3 flex flex-col items-center gap-2 active:scale-95 transition-all"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/afrikaans/${imageKey}.${IMAGE_EXTS[extIdx]}`}
          alt={label}
          onError={() => setExtIdx((i) => i + 1)}
          className="w-full aspect-square object-contain rounded-xl bg-white"
        />
      ) : (
        <span className="w-full aspect-square rounded-xl bg-white flex items-center justify-center text-4xl" aria-hidden>
          🖼️
        </span>
      )}
      <span className="text-sm sm:text-base font-semibold text-[#1a2744] text-center leading-tight">
        {label}
      </span>
    </button>
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
                    : "bg-orange-50 border-2 border-orange-200 text-[#1a2744] hover:bg-orange-100"
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
                <PlayIcon text={item} speak={speak} />
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
