import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";

// One row per practice session, across every subject. Callers pass a
// duration already clamped to the last real answer (see the lastActivityRef
// pattern in each session screen) rather than raw wall-clock time, so a
// forgotten open tab can't inflate the minutes a teacher sees.
export function logSessionEnd(opts: {
  studentId: string;
  subject: string;
  skillId?: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  questionsAnswered: number;
  correct: number;
}): void {
  void retrySupabase(() => supabase.from("learning_sessions").insert({
    student_id: opts.studentId,
    subject: opts.subject,
    skill_id: opts.skillId ?? null,
    started_at: opts.startedAt,
    ended_at: opts.endedAt,
    duration_ms: opts.durationMs,
    questions_answered: opts.questionsAnswered,
    correct: opts.correct,
  }));
}
