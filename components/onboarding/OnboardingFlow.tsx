"use client";

import { useState, useEffect } from "react";
import { getTranslations } from "@/lib/onboarding-translations";
import { supabase } from "@/lib/supabase";

export type OnboardingData = {
  language: string;
  grade: string;
  averageScore: string;
  curriculum: string;
  name: string;
  email: string;
  plan: string;
  userId?: string;
};

const LANGUAGES: { value: string; label: string }[] = [
  { value: "English",    label: "English" },
  { value: "Afrikaans",  label: "Afrikaans" },
  { value: "isiNdebele", label: "isiNdebele" },
  { value: "isiXhosa",   label: "isiXhosa" },
  { value: "isiZulu",    label: "isiZulu" },
  { value: "Sepedi",     label: "Sepedi" },
  { value: "Sesotho",    label: "Sesotho" },
  { value: "Setswana",   label: "Setswana" },
  { value: "siSwati",    label: "siSwati" },
  { value: "Tshivenda",  label: "Tshivenda" },
  { value: "Xitsonga",   label: "Xitsonga" },
];

const GRADES = [
  { grade: "1", emoji: "⭐" }, { grade: "2", emoji: "⭐" },
  { grade: "3", emoji: "😊" }, { grade: "4", emoji: "😊" },
  { grade: "5", emoji: "😊" }, { grade: "6", emoji: "😊" },
  { grade: "7", emoji: "😎" }, { grade: "8", emoji: "😎" },
  { grade: "9", emoji: "😎" }, { grade: "10", emoji: "🎓" },
  { grade: "11", emoji: "🎓" }, { grade: "12", emoji: "🎓" },
];

const CURRICULA: { label: string; flag: string }[] = [
  { label: "CAPS",                    flag: "🇿🇦" },
  { label: "IEB",                     flag: "🇿🇦" },
  { label: "CAPS-SID",                flag: "🇿🇦" },
  { label: "LSEN",                    flag: "🇿🇦" },
  { label: "American Curriculum",     flag: "🇺🇸" },
  { label: "Cambridge International", flag: "🇬🇧" },
  { label: "British Curriculum",      flag: "🇬🇧" },
];

const PLANS = [
  {
    id: "standard",
    name: "Ruby / Gr4 – Gr11",
    price: "149",
    accentColor: "#22c55e",
    borderClass: "border-green-400",
    priceClass: "text-green-500",
    btnClass: "bg-green-500 hover:bg-green-600",
    features: [
      "Instant homework help",
      "Any Subject",
      "Study in 11 Languages",
      "Image, Text & Voice",
      "Unlimited Requests",
      "Available 24/7",
      "Access to Video Learning",
    ],
  },
  {
    id: "grade12",
    name: "Ruby / Grade 12",
    price: "199",
    accentColor: "#3b82f6",
    borderClass: "border-blue-400",
    priceClass: "text-blue-500",
    btnClass: "bg-blue-500 hover:bg-blue-600",
    features: [
      "Instant AI Tutoring",
      "Instant homework help",
      "Any Subject",
      "Study in 11 Languages",
      "Image, Text & Voice",
      "Unlimited Requests",
      "Available 24/7",
      "Access to Video Learning",
      "250+ Matric Exam Papers",
    ],
  },
];

// Steps: 1=create_account, 2=language, 3=grade, 4=curriculum
const TOTAL_STEPS = 4;

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mb-4 text-rose-900 self-start flex-shrink-0">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

function ContinueBtn({ label, onClick, disabled, loading }: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-4 rounded-full bg-rose-600 text-white font-semibold text-lg disabled:opacity-40 hover:bg-rose-700 transition-colors flex-shrink-0 flex items-center justify-center gap-2"
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {label}
    </button>
  );
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  initialStep?: number;
  initialData?: Partial<OnboardingData>;
}

export default function OnboardingFlow({ onComplete, initialStep = 1, initialData }: OnboardingFlowProps) {
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<Partial<OnboardingData>>(initialData || { language: "English" });
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [parentEmail, setParentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loginMode, setLoginMode] = useState(false);
  const [forgotMode, setForgotMode] = useState<false | "form" | "sent">(false);
  const [signedUpUserId, setSignedUpUserId] = useState<string | undefined>(undefined);

  // After a password reset, the reset-password page sets this flag so we land
  // the user on the login form (not signup) when they return here.
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("ruby_post_reset") === "1") {
      sessionStorage.removeItem("ruby_post_reset");
      setLoginMode(true);
    }
  }, []);

  const lang = data.language || "English";
  const t = getTranslations(lang);

  const progress = Math.min((step / TOTAL_STEPS) * 100, 100);

  const select = (key: keyof OnboardingData, value: string) =>
    setData((d) => ({ ...d, [key]: value }));

  const next = () => setStep((s) => s + 1);
  const back = () => { setStep((s) => s - 1); setAuthError(""); };

  // ── Email sign-up ──────────────────────────────────────────────────────────
  const handleSignUp = async () => {
    if (!name || !email || !password) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      // Supabase returns identities:[] when the email already exists (security feature)
      if (!authData.session && authData.user?.identities?.length === 0) {
        setAuthError("An account with this email already exists. Please use Log In instead.");
        return;
      }
      if (authData.user) {
        setSignedUpUserId(authData.user.id);
        const trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("users").upsert({
          id: authData.user.id,
          email,
          full_name: name,
          parent_email: parentEmail || null,
          grade: data.grade || null,
          curriculum: data.curriculum || null,
          language: data.language || "English",
          trial_expires_at: trialExpiresAt,
        });
      }
      // Account created — continue through onboarding questions
      next();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Email login ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Fetch the user's saved profile from the users table
      const userId = authData.user?.id;
      const { data: userData } = userId
        ? await supabase.from("users").select("full_name, grade, language, curriculum").eq("id", userId).single()
        : { data: null };
      const fullName =
        (userData?.full_name as string | undefined) ||
        (authData.user?.user_metadata?.full_name as string | undefined) ||
        "";
      // Build final data from saved profile and go straight to the app — no re-onboarding
      const final: OnboardingData = {
        language: (userData?.language as string | undefined) || "English",
        grade: (userData?.grade as string | undefined) || "",
        averageScore: "",
        curriculum: (userData?.curriculum as string | undefined) || "",
        name: fullName,
        email,
        plan: "existing",
        userId,
      };
      onComplete(final);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      const msg = raw.toLowerCase().includes("invalid login credentials") || raw.toLowerCase().includes("invalid")
        ? "Incorrect email or password. Please check and try again."
        : raw || "Login failed. Please try again.";
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  // Always advances to the "sent" view, even on error, to prevent email enumeration.
  const handleForgotPassword = async () => {
    if (!email) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {
      // Swallow — generic confirmation is shown regardless
    } finally {
      setAuthLoading(false);
      setForgotMode("sent");
    }
  };

  // ── Complete onboarding (no plan step) ────────────────────────────────────
  const handleComplete = async () => {
    const final: OnboardingData = {
      language: data.language || "English",
      grade: data.grade || "",
      averageScore: data.averageScore || "",
      curriculum: data.curriculum || "",
      name,
      email,
      plan: data.plan || "standard",
      userId: signedUpUserId,
    };
    // Update Supabase with grade, curriculum and language now that user has selected them
    if (signedUpUserId) {
      await supabase.from("users").upsert({
        id: signedUpUserId,
        email,
        full_name: name,
        grade: final.grade || null,
        curriculum: final.curriculum || null,
        language: final.language,
      });
    }
    onComplete(final);
  };

  const outerMaxW = "max-w-md";
  // Progress bar counts steps 2–6 (step 1 is account creation, no bar)

  return (
    // Fills the full locked viewport (html+body are h-full overflow-hidden)
    <div className="h-dvh bg-gradient-to-br from-[#6B1020] via-[#C41930] to-[#FF6080] flex flex-col py-3 sm:py-8 px-4">
      <div className={`w-full ${outerMaxW} mx-auto flex-1 flex flex-col min-h-0`}>
        <div className="bg-white rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden min-h-0">

          {/* Progress bar — hidden on create account step (step 1) */}
          {step !== 1 && (
            <div className="h-1.5 bg-rose-100 flex-shrink-0">
              <div
                className="h-full bg-rose-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* ── Step 1: Create Account / Login ── */}
          {step === 1 && !forgotMode && (
            <div className="flex-1 flex flex-col p-5 overflow-y-auto min-h-0">
              <h1 className="text-2xl font-bold text-[#1a2744] text-center mb-1">
                {loginMode ? "Welcome back" : t.step7Title}
              </h1>

              {/* Ruby superheroes — only on sign-up */}
              {!loginMode && (
                <div className="flex justify-center mb-1">
                  <img
                    src="/ruby-heroes.png"
                    alt="Ruby superheroes"
                    className="h-24 sm:h-36 w-auto object-contain"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2.5 mb-2.5">
                {!loginMode && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      {t.nameLabel}<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-rose-400 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 outline-none text-gray-700 text-base bg-transparent" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    {loginMode ? t.emailLabel : <>Student Email<span className="text-red-500 ml-0.5">*</span></>}
                  </label>
                  <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-rose-400 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 outline-none text-gray-700 text-base bg-transparent" />
                  </div>
                </div>
                {!loginMode && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Parent Email <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-rose-400 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <input type="email" placeholder="parent@example.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="flex-1 outline-none text-gray-700 text-base bg-transparent" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">{t.passwordLabel}</label>
                  <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-rose-400 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 outline-none text-gray-700 text-base bg-transparent" />
                    <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                {authError && (
                  <p className="text-red-500 text-sm text-center mb-2 px-2">{authError}</p>
                )}
                <button
                  onClick={loginMode ? handleLogin : handleSignUp}
                  disabled={loginMode ? (!email || !password || authLoading) : (!name || !email || !password || authLoading)}
                  className="w-full py-3.5 rounded-full bg-rose-600 text-white font-semibold text-base disabled:opacity-40 hover:bg-rose-700 transition-colors mb-2.5 flex items-center justify-center gap-2"
                >
                  {authLoading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {loginMode ? "Log in" : "Go! 🚀"}
                </button>
                {loginMode ? (
                  <>
                    <button onClick={() => { setLoginMode(false); setAuthError(""); }} className="w-full py-3 rounded-full border-2 border-[#1a2744] text-[#1a2744] font-bold text-base hover:bg-gray-50 transition-colors">
                      Create Account
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      <button
                        onClick={() => { setForgotMode("form"); setAuthError(""); }}
                        className="text-[#1a2744] font-bold underline hover:text-rose-600 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </p>
                  </>
                ) : (
                  <p className="text-center text-sm text-gray-500 mt-1">
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthError("");
                        setLoginMode(true);
                      }}
                      className="text-[#1a2744] font-bold underline hover:text-rose-600 transition-colors"
                    >
                      Log In
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 1: Forgot Password ── */}
          {step === 1 && forgotMode && (
            <div className="flex-1 flex flex-col p-5 overflow-y-auto min-h-0">
              {forgotMode === "form" ? (
                <>
                  <h1 className="text-2xl font-bold text-[#1a2744] text-center mb-2">Reset your password</h1>
                  <p className="text-gray-400 text-sm text-center mb-5">
                    Enter your email and we&apos;ll send you a link to set a new password.
                  </p>

                  <div className="flex flex-col gap-2.5 mb-2.5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
                      <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-rose-400 transition-colors">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 outline-none text-gray-700 text-base bg-transparent" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    {authError && (
                      <p className="text-red-500 text-sm text-center mb-2 px-2">{authError}</p>
                    )}
                    <button
                      onClick={handleForgotPassword}
                      disabled={!email || authLoading}
                      className="w-full py-3.5 rounded-full bg-rose-600 text-white font-semibold text-base disabled:opacity-40 hover:bg-rose-700 transition-colors mb-2.5 flex items-center justify-center gap-2"
                    >
                      {authLoading && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      )}
                      Send reset link
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-1">
                      <button
                        onClick={() => { setForgotMode(false); setAuthError(""); }}
                        className="text-[#1a2744] font-bold underline hover:text-rose-600 transition-colors"
                      >
                        Back to login
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                    <div className="text-5xl">📬</div>
                    <h1 className="text-2xl font-bold text-[#1a2744]">Check your inbox</h1>
                    <p className="text-gray-500 text-base px-2">
                      If an account exists for <span className="font-semibold text-gray-700">{email}</span>, we&apos;ve sent a password reset link. Click the link in the email to set a new password.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => { setForgotMode(false); setAuthError(""); }}
                      className="w-full py-3.5 rounded-full bg-rose-600 text-white font-semibold text-base hover:bg-rose-700 transition-colors"
                    >
                      Back to login
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Step 2: Language ── */}
          {step === 2 && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0">
              <h1 className="text-3xl font-bold text-[#1a2744] mb-6 leading-snug flex-shrink-0">{t.step1Title}</h1>
              <div className="flex-1 overflow-y-auto min-h-0 pb-1">
                <div className="grid grid-cols-3 gap-3">
                  {LANGUAGES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => select("language", value)}
                      className={`py-4 px-2 rounded-2xl text-sm font-medium border-2 transition-all ${
                        data.language === value
                          ? "border-rose-500 bg-rose-50 text-rose-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex-shrink-0">
                <ContinueBtn label={t.continueBtn} onClick={next} disabled={!data.language} />
              </div>
            </div>
          )}

          {/* ── Step 3: Grade ── */}
          {step === 3 && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0">
              <BackButton onClick={back} />
              <h1 className="text-3xl font-bold text-[#1a2744] mb-4 leading-snug flex-shrink-0">{t.step3Title}</h1>
              <div className="flex-1 overflow-y-auto min-h-0 pb-1">
                <div className="grid grid-cols-2 gap-2.5">
                  {GRADES.map(({ grade, emoji }) => (
                    <button
                      key={grade}
                      onClick={() => select("grade", grade)}
                      className={`flex items-center justify-center gap-3 py-2.5 px-5 rounded-full border-2 text-base font-medium transition-all ${
                        data.grade === grade
                          ? "border-rose-500 bg-rose-50 text-rose-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span>{grade}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex-shrink-0">
                <ContinueBtn label={t.continueBtn} onClick={next} disabled={!data.grade} />
              </div>
            </div>
          )}

          {/* ── Step 4: Curriculum ── */}
          {step === 4 && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0">
              <BackButton onClick={back} />
              <h1 className="text-3xl font-bold text-[#1a2744] mb-2 leading-snug flex-shrink-0">Which curriculum do you follow?</h1>
              <p className="text-gray-400 text-base mb-6 flex-shrink-0">Select your school's curriculum</p>
              <div className="flex-1 overflow-y-auto min-h-0 pb-1">
                <div className="flex flex-col gap-3">
                  {CURRICULA.map(({ label, flag }) => (
                    <button
                      key={label}
                      onClick={() => select("curriculum", label)}
                      className={`py-3.5 px-5 rounded-full border-2 text-base font-medium transition-all flex items-center justify-center gap-2 ${
                        data.curriculum === label
                          ? "border-rose-500 bg-rose-50 text-rose-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="flex-shrink-0 text-xl leading-none">{flag}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex-shrink-0">
                <ContinueBtn label={t.continueBtn} onClick={handleComplete} disabled={!data.curriculum} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
