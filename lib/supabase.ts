import { createClient } from "@supabase/supabase-js";
import { rubyAuth } from "./auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

// Auth is now handled by the C# API via rubyAuth (lib/auth.ts).
// The Supabase client is kept for data queries only (Phase 4 will remove it).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _client = createClient(supabaseUrl, supabaseAnonKey);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(_client as any).auth = rubyAuth;
export const supabase = _client as Omit<typeof _client, "auth"> & { auth: typeof rubyAuth };

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
