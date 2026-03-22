import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Types matching our database tables ────────────────────────────────────────

export interface DbUser {
  id: string;              // matches Supabase auth user id
  email: string;
  full_name: string | null;
  grade: string | null;
  curriculum: string | null;
  language: string | null;
  plan: "free" | "pro" | "school";
  created_at: string;
}

export interface DbFeedback {
  id?: number;
  user_id: string | null;  // null = anonymous beta user
  category: string;
  text: string;
  url: string;
  created_at?: string;
}

export interface DbSessionSurvey {
  id?: number;
  user_id: string | null;
  session_type: "maths" | "reading" | "chat";
  rating: number;
  comment: string | null;
  created_at?: string;
}

export interface DbStudentProfile {
  id: string;
  subject: "maths" | "reading";
  name: string;
  grade: number;
  profile_data: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface DbSkillAttempt {
  student_id: string;
  subject: "maths" | "reading";
  skill_id: string;
  is_correct: boolean;
  error_type?: string | null;
  template?: string | null;
  scaffolded?: boolean;
  p_learned?: number | null;
}

export interface DbDiagnosticResult {
  student_id: string;
  subject: "maths" | "reading";
  entry_skill_id: string;
  entry_level?: number | null;
  auto_completed_skill_ids?: string[];
  dominant_errors?: string[];
  hard_gate_passed?: boolean;
  completed_at: string;
}

export interface DbProgress {
  id?: number;
  user_id: string;
  total_messages: number;
  lessons_completed: number;
  topics_studied: string[];
  session_count: number;
  last_session: string;
  updated_at?: string;
}
