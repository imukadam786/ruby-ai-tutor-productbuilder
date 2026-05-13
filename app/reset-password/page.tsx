"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "success">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Supabase auto-parses the recovery token from the URL hash on mount and
  // fires PASSWORD_RECOVERY. If no recovery session arrives we treat the link
  // as invalid / expired.
  useEffect(() => {
    let resolved = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        resolved = true;
        setStatus("ready");
      }
    });

    // Fallback: if a session already exists (token was processed before listener
    // attached), allow the form. Otherwise after a short grace period mark invalid.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !resolved) {
        resolved = true;
        setStatus("ready");
      }
    });

    const timeout = setTimeout(() => {
      if (!resolved) setStatus("invalid");
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      sessionStorage.setItem("ruby_post_reset", "1");
      setStatus("success");
      setTimeout(() => router.push("/"), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not update password. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-dvh bg-gradient-to-br from-[#6B1020] via-[#C41930] to-[#FF6080] flex flex-col py-3 sm:py-8 px-4">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col min-h-0">
        <div className="bg-white rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col p-5 overflow-y-auto min-h-0">

            {status === "checking" && (
              <div className="flex-1 flex items-center justify-center">
                <svg className="w-8 h-8 animate-spin text-rose-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            )}

            {status === "invalid" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                <div className="text-5xl">🔗</div>
                <h1 className="text-2xl font-bold text-[#1a2744]">Link expired or invalid</h1>
                <p className="text-gray-500 text-base">
                  This password reset link is no longer valid. Request a new one from the login screen.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="w-full py-3.5 rounded-full bg-rose-600 text-white font-semibold text-base hover:bg-rose-700 transition-colors mt-2"
                >
                  Back to login
                </button>
              </div>
            )}

            {status === "success" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                <div className="text-5xl">✅</div>
                <h1 className="text-2xl font-bold text-[#1a2744]">Password updated</h1>
                <p className="text-gray-500 text-base">
                  Redirecting you to the login screen…
                </p>
              </div>
            )}

            {status === "ready" && (
              <>
                <h1 className="text-2xl font-bold text-[#1a2744] text-center mb-2">Set a new password</h1>
                <p className="text-gray-400 text-sm text-center mb-5">
                  Choose a new password for your account.
                </p>

                <div className="flex flex-col gap-2.5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">New password</label>
                    <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-rose-400 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 outline-none text-gray-700 text-base bg-transparent"
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Confirm new password</label>
                    <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-rose-400 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="flex-1 outline-none text-gray-700 text-base bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  {error && (
                    <p className="text-red-500 text-sm text-center mb-2 px-2">{error}</p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!password || !confirm || submitting}
                    className="w-full py-3.5 rounded-full bg-rose-600 text-white font-semibold text-base disabled:opacity-40 hover:bg-rose-700 transition-colors mb-2.5 flex items-center justify-center gap-2"
                  >
                    {submitting && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    )}
                    Update password
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-1">
                    <button
                      onClick={() => router.push("/")}
                      className="text-[#1a2744] font-bold underline hover:text-rose-600 transition-colors"
                    >
                      Back to login
                    </button>
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
