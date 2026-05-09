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
