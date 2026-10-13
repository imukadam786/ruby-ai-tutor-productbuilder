import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";

// One row per question attempt, for every subject. Same skill_attempts table
// Maths and Reading already write to (see student-model.ts / reading-student-model.ts) —
// this is the shared version other subjects call so accuracy-over-time and
// question-volume trends work everywhere, not just those two.
export function logAttempt(opts: {
  studentId: string;
  subject: string;
  skillId: string;
  isCorrect: boolean;
  template?: string;
  errorType?: string;
  scaffolded?: boolean;
}): void {
  void retrySupabase(() => supabase.from("skill_attempts").insert({
    student_id: opts.studentId,
    subject: opts.subject,
    skill_id: opts.skillId,
    is_correct: opts.isCorrect,
    error_type: opts.errorType ?? null,
    template: opts.template ?? null,
    scaffolded: opts.scaffolded ?? false,
  }));
}
