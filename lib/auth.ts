/**
 * Client-side auth — replaces supabase.auth.*
 * Calls the C# API (NEXT_PUBLIC_API_URL) and stores tokens in localStorage.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const ACCESS_KEY  = "ruby_access_token";
const REFRESH_KEY = "ruby_refresh_token";
const USER_KEY    = "ruby_user";

export type AuthUser = {
  id: string;
  email: string;
  user_metadata: { full_name?: string };
  identities?: { id: string }[];
};

export type Session = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
};

type AuthEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "INITIAL_SESSION";
type AuthStateListener = (event: AuthEvent, session: Session | null) => void;

const _listeners = new Set<AuthStateListener>();

function _notify(event: AuthEvent, session: Session | null) {
  _listeners.forEach(fn => fn(event, session));
}

type StoredUser = { userId: string; email: string; fullName?: string };

function _buildUser(stored: StoredUser): AuthUser {
  return {
    id: stored.userId,
    email: stored.email,
    user_metadata: { full_name: stored.fullName },
    identities: [{ id: stored.userId }],
  };
}

function _getStored(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const token   = localStorage.getItem(ACCESS_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);
    const raw     = localStorage.getItem(USER_KEY);
    if (!token || !raw) return null;
    const stored = JSON.parse(raw) as StoredUser;
    return {
      access_token:  token,
      refresh_token: refresh ?? "",
      expires_in:    3600,
      user:          _buildUser(stored),
    };
  } catch {
    return null;
  }
}

function _store(body: { accessToken: string; refreshToken: string; expiresIn: number; userId: string; email: string; fullName?: string }) {
  localStorage.setItem(ACCESS_KEY, body.accessToken);
  localStorage.setItem(REFRESH_KEY, body.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify({ userId: body.userId, email: body.email, fullName: body.fullName }));
}

function _clear() {
  [ACCESS_KEY, REFRESH_KEY, USER_KEY].forEach(k => localStorage.removeItem(k));
}

export const rubyAuth = {
  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    return { data: { session: _getStored() }, error: null };
  },

  async getUser(): Promise<{ data: { user: AuthUser | null }; error: null }> {
    return { data: { user: _getStored()?.user ?? null }, error: null };
  },

  async signUp(params: {
    email: string;
    password: string;
    options?: { data?: Record<string, unknown> };
  }): Promise<{ data: { user: AuthUser | null; session: Session | null }; error: Error | null }> {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:       params.email,
          password:    params.password,
          fullName:    params.options?.data?.full_name,
          grade:       params.options?.data?.grade,
          curriculum:  params.options?.data?.curriculum,
          language:    params.options?.data?.language ?? "English",
          parentEmail: params.options?.data?.parent_email,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        return { data: { user: null, session: null }, error: new Error(err.error ?? "Registration failed") };
      }

      const body = await res.json() as { accessToken: string; refreshToken: string; expiresIn: number; userId: string; email: string; fullName?: string };
      _store(body);
      const session = _getStored()!;
      _notify("SIGNED_IN", session);
      return { data: { user: session.user, session }, error: null };
    } catch (e) {
      return { data: { user: null, session: null }, error: e as Error };
    }
  },

  async signInWithPassword(params: {
    email: string;
    password: string;
  }): Promise<{ data: { user: AuthUser | null; session: Session | null }; error: Error | null }> {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: params.email, password: params.password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        return { data: { user: null, session: null }, error: new Error(err.error ?? "Invalid email or password") };
      }

      const body = await res.json() as { accessToken: string; refreshToken: string; expiresIn: number; userId: string; email: string; fullName?: string };
      _store(body);
      const session = _getStored()!;
      _notify("SIGNED_IN", session);
      return { data: { user: session.user, session }, error: null };
    } catch (e) {
      return { data: { user: null, session: null }, error: e as Error };
    }
  },

  async signOut(): Promise<{ error: null }> {
    if (typeof window !== "undefined") {
      const token        = localStorage.getItem(ACCESS_KEY);
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (token && refreshToken) {
        fetch(`${API_URL}/auth/logout`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
      }
      _clear();
    }
    _notify("SIGNED_OUT", null);
    return { error: null };
  },

  onAuthStateChange(callback: AuthStateListener): { data: { subscription: { unsubscribe: () => void } } } {
    _listeners.add(callback);
    const session = _getStored();
    Promise.resolve().then(() => callback("INITIAL_SESSION", session));
    return {
      data: {
        subscription: { unsubscribe: () => _listeners.delete(callback) },
      },
    };
  },
};
