// ─── lib/tutor-context.ts ───────────────────────────────────────────────────
// Server-side: works out who the chat is for and what it's about, so the chat
// route can personalise its instructions. Resolved fresh on every message:
//
//   • tutor   — from the tutor name the client sends (null = plain Ruby chat)
//   • grade   — from users.grade, never trusted from the client
//   • subject — in priority order:
//       1. the subject of the quick-action chip the learner tapped
//       2. the tutor's only subject at this grade, when there is just one
//       3. a keyword match on the learner's messages, newest first
//     null when none of these settle it (the tutor then asks).

import { supabaseAdmin } from "@/lib/supabase-admin";
import { matchSubjectLabel } from "@/lib/homeworkRouting";
import { GradeBand, Tutor, TutorSubject, getTutor, gradeBand, subjectsForGrade } from "@/lib/tutors";
import { Message } from "@/types";

export interface TutorContext {
  tutor: Tutor | null;
  grade: number | null;
  band: GradeBand | null;
  subject: TutorSubject | null;
  /** The app's subject id for this subject at this grade band, e.g. "ems-sp". */
  subjectId: string | null;
}

/** The learner's grade (1–12) from their profile, or null. */
export async function getUserGrade(userId: string): Promise<number | null> {
  const { data } = await supabaseAdmin
    .from("users")
    .select("grade")
    .eq("id", userId)
    .maybeSingle();
  const parsed = parseInt(String(data?.grade ?? ""), 10);
  return !isNaN(parsed) && parsed >= 1 && parsed <= 12 ? parsed : null;
}

export function resolveTutorContext(opts: {
  tutorName?: string | null;
  grade: number | null;
  subjectHint?: string | null;
  messages: Message[];
}): TutorContext {
  const tutor = getTutor(opts.tutorName);
  const band = gradeBand(opts.grade);
  const none = { tutor, grade: opts.grade, band, subject: null, subjectId: null };
  if (!tutor) return none;

  const candidates = subjectsForGrade(tutor, opts.grade);
  const pick = (s: TutorSubject | undefined): TutorContext => {
    if (!s) return none;
    const subjectId = band ? s.ids[band] ?? null : null;
    return { tutor, grade: opts.grade, band, subject: s, subjectId };
  };

  if (opts.subjectHint) {
    const hinted = candidates.find((s) => s.label === opts.subjectHint);
    if (hinted) return pick(hinted);
  }
  if (candidates.length === 1) return pick(candidates[0]);

  const labels = candidates.map((s) => s.label);
  const userTexts = opts.messages.filter((m) => m.role === "user").map((m) => m.content).reverse();
  for (const text of userTexts) {
    const label = matchSubjectLabel(text, labels);
    if (label) return pick(candidates.find((s) => s.label === label));
  }
  return none;
}
