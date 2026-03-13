"use client";

import { useState } from "react";
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
};

const LANGUAGES = [
  "English",
  "Afrikaans", "isiNdebele", "isiXhosa", "isiZulu",
  "Sepedi", "Sesotho", "Setswana", "siSwati",
  "Tshivenda", "Xitsonga",
];

const GRADES = [
  { grade: "3", emoji: "😊" }, { grade: "4", emoji: "😊" },
  { grade: "5", emoji: "😊" }, { grade: "6", emoji: "😊" },
  { grade: "7", emoji: "😎" }, { grade: "8", emoji: "😎" },
  { grade: "9", emoji: "😎" }, { grade: "10", emoji: "🎓" },
  { grade: "11", emoji: "🎓" }, { grade: "12", emoji: "🎓" },
];

const SCORES: { label: string; bars: number[] }[] = [
  { label: "30 – 40", bars: [4, 5, 4] },
  { label: "40 – 50", bars: [5, 7, 6] },
  { label: "50 – 60", bars: [7, 9, 8] },
  { label: "60 – 70", bars: [9, 11, 10] },
  { label: "70 – 80", bars: [11, 13, 12] },
  { label: "80+",     bars: [13, 16, 14] },
];

function ScoreChart({ bars, active }: { bars: number[]; active: boolean }) {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" className="flex-shrink-0">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 7}
          y={16 - h}
          width="5"
          height={h}
          rx="1"
          fill={active ? "#3b82f6" : "#9ca3af"}
        />
      ))}
    </svg>
  );
}

const CURRICULA: { label: string; flag: string }[] = [
  { label: "CAPS",                  flag: "🇿🇦" },
  { label: "IEB",                   flag: "🇿🇦" },
  { label: "CAPS-SID",              flag: "🇿🇦" },
  { label: "LSEN",                  flag: "🇿🇦" },
  { label: "American Curriculum",   flag: "🇺🇸" },
  { label: "Cambridge International", flag: "🇬🇧" },
  { label: "British Curriculum",    flag: "🇬🇧" },
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

// Steps: 1=language, 2=grade, 3=score, 4=curriculum, 5=create_account
const TOTAL_STEPS = 5;

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mb-4 text-blue-900 self-start flex-shrink-0">
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
      className="w-full py-4 rounded-full bg-blue-600 text-white font-semibold text-base disabled:opacity-40 hover:bg-blue-700 transition-colors flex-shrink-0 flex items-center justify-center gap-2"
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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loginMode, setLoginMode] = useState(false);

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
      if (authData.user) {
        await supabase.from("users").upsert({
          id: authData.user.id,
          email,
          full_name: name,
          grade: data.grade || null,
          curriculum: data.curriculum || null,
          language: data.language || "English",
        });
      }
      const final: OnboardingData = {
        language: data.language || "English",
        grade: data.grade || "",
        averageScore: data.averageScore || "",
        curriculum: data.curriculum || "",
        name,
        email,
        plan: "free",
      };
      localStorage.setItem("onboardingComplete", "true");
      localStorage.setItem("onboardingData", JSON.stringify(final));
      onComplete(final);
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const final: OnboardingData = {
        language: data.language || "English",
        grade: data.grade || "",
        averageScore: data.averageScore || "",
        curriculum: data.curriculum || "",
        name,
        email,
        plan: "existing",
      };
      localStorage.setItem("onboardingComplete", "true");
      localStorage.setItem("onboardingData", JSON.stringify(final));
      onComplete(final);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Check your email and password.";
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const handleGoogleAuth = async () => {
    // Persist partial onboarding data so we can resume after the redirect
    localStorage.setItem("pendingOnboarding", JSON.stringify({
      language: data.language || "English",
      grade: data.grade || "",
      averageScore: data.averageScore || "",
      curriculum: data.curriculum || "",
    }));
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  };

  // ── Save plan + complete ───────────────────────────────────────────────────
  const handleSelectPlan = async (planId: string) => {
    const final: OnboardingData = {
      language: data.language || "English",
      grade: data.grade || "",
      averageScore: data.averageScore || "",
      curriculum: data.curriculum || "",
      name,
      email,
      plan: planId,
    };
    // Record plan in Supabase if authenticated
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("users").update({
          plan: planId === "grade12" ? "pro" : "free",
        }).eq("id", user.id);
      }
    } catch { /* silent — plan saved locally either way */ }

    localStorage.setItem("onboardingComplete", "true");
    localStorage.setItem("onboardingData", JSON.stringify(final));
    onComplete(final);
  };

  // Wider container only on the plan step so both cards fit on desktop
  const outerMaxW = step === 6 ? "max-w-md md:max-w-2xl" : "max-w-md";

  return (
    // Fills the full locked viewport (html+body are h-full overflow-hidden)
    <div className="h-full bg-gradient-to-b from-blue-900 to-blue-950 flex flex-col py-8 px-4">
      <div className={`w-full ${outerMaxW} mx-auto flex-1 flex flex-col min-h-0`}>
        <div className="bg-white rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden min-h-0">

          {/* Progress bar — hidden on create account step */}
          {step !== 5 && (
            <div className="h-1.5 bg-blue-100 flex-shrink-0">
              <div
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* ── Step 1: Language ── */}
          {step === 1 && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0">
              <h1 className="text-2xl font-bold text-[#1a2744] mb-6 leading-snug flex-shrink-0">{t.step1Title}</h1>
              <div className="flex-1 overflow-y-auto min-h-0 pb-1">
                <div className="grid grid-cols-3 gap-3">
                  {LANGUAGES.map((language) => (
                    <button
                      key={language}
                      onClick={() => select("language", language)}
                      className={`py-4 px-2 rounded-2xl text-sm font-medium border-2 transition-all ${
                        data.language === language
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex-shrink-0">
                <ContinueBtn label={t.continueBtn} onClick={next} disabled={!data.language} />
              </div>
            </div>
          )}

          {/* ── Step 2: Grade ── */}
          {step === 2 && (
            <div className="flex-1 flex flex-col p-6">
              <BackButton onClick={back} />
              <h1 className="text-2xl font-bold text-[#1a2744] mb-4 leading-snug">{t.step3Title}</h1>
              <div className="flex-1 grid grid-cols-2 gap-2.5 content-start">
                {GRADES.map(({ grade, emoji }) => (
                  <button
                    key={grade}
                    onClick={() => select("grade", grade)}
                    className={`flex items-center justify-center gap-3 py-2.5 px-5 rounded-full border-2 text-base font-medium transition-all ${
                      data.grade === grade
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span>{grade}</span>
                  </button>
                ))}
              </div>
              <div className="pt-4">
                <ContinueBtn label={t.continueBtn} onClick={next} disabled={!data.grade} />
              </div>
            </div>
          )}

          {/* ── Step 3: Average Score ── */}
          {step === 3 && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0">
              <BackButton onClick={back} />
              <h1 className="text-2xl font-bold text-[#1a2744] mb-2 leading-snug flex-shrink-0">{t.step4Title}</h1>
              <p className="text-gray-400 text-sm mb-6 flex-shrink-0">{t.step4Sub}</p>
              <div className="flex-1 overflow-y-auto min-h-0 pb-1">
                <div className="grid grid-cols-2 gap-3">
                  {SCORES.map(({ label, bars }) => (
                    <button
                      key={label}
                      onClick={() => select("averageScore", label)}
                      className={`py-3.5 px-5 rounded-full border-2 text-base font-medium transition-all flex items-center justify-center gap-2 ${
                        data.averageScore === label
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <ScoreChart bars={bars} active={data.averageScore === label} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex-shrink-0">
                <ContinueBtn label={t.continueBtn} onClick={next} disabled={!data.averageScore} />
              </div>
            </div>
          )}

          {/* ── Step 4: Curriculum ── */}
          {step === 4 && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0">
              <BackButton onClick={back} />
              <h1 className="text-2xl font-bold text-[#1a2744] mb-2 leading-snug flex-shrink-0">Which curriculum do you follow?</h1>
              <p className="text-gray-400 text-sm mb-6 flex-shrink-0">Select your school's curriculum</p>
              <div className="flex-1 overflow-y-auto min-h-0 pb-1">
                <div className="flex flex-col gap-3">
                  {CURRICULA.map(({ label, flag }) => (
                    <button
                      key={label}
                      onClick={() => select("curriculum", label)}
                      className={`py-3.5 px-5 rounded-full border-2 text-base font-medium transition-all flex items-center justify-center gap-2 ${
                        data.curriculum === label
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl leading-none">{flag}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex-shrink-0">
                <ContinueBtn label={t.continueBtn} onClick={next} disabled={!data.curriculum} />
              </div>
            </div>
          )}

          {/* ── Step 5: Create Account / Login ── */}
          {step === 5 && (
            <div className="flex-1 flex flex-col p-5 justify-between">
              <h1 className="text-xl font-bold text-[#1a2744] text-center mb-4">
                {loginMode ? "Welcome back" : t.step7Title}
              </h1>

              {/* Google button */}
              <button
                onClick={handleGoogleAuth}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-full border-2 border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors mb-3 disabled:opacity-40"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loginMode ? "Log in with Google" : t.googleBtn}
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium tracking-widest">{t.orEmail}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="flex flex-col gap-3 mb-3">
                {/* Name — hidden in login mode */}
                {!loginMode && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">{t.nameLabel}</label>
                    <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-blue-400 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 outline-none text-gray-700 text-sm bg-transparent" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">{t.emailLabel}</label>
                  <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-blue-400 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 outline-none text-gray-700 text-sm bg-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">{t.passwordLabel}</label>
                  <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-blue-400 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 outline-none text-gray-700 text-sm bg-transparent" />
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

              {/* Error message */}
              {authError && (
                <p className="text-red-500 text-xs text-center mb-3 px-2">{authError}</p>
              )}

              {!loginMode && (
                <p className="text-xs text-gray-500 mb-3 text-center">
                  {t.termsText}{" "}
                  <span className="text-blue-500 cursor-pointer">{t.termsLink}</span> and{" "}
                  <span className="text-blue-500 cursor-pointer">{t.privacyLink}</span>.
                </p>
              )}

              <button
                onClick={loginMode ? handleLogin : handleSignUp}
                disabled={loginMode ? (!email || !password || authLoading) : (!name || !email || !password || authLoading)}
                className="w-full py-3.5 rounded-full bg-blue-600 text-white font-semibold text-base disabled:opacity-40 hover:bg-blue-700 transition-colors mb-3 flex items-center justify-center gap-2"
              >
                {authLoading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {loginMode ? "Log in" : t.startBtn}
              </button>

              <p className="text-center text-sm text-gray-500">
                {loginMode ? "Don't have an account? " : t.loginPrompt + " "}
                <button
                  onClick={() => { setLoginMode(!loginMode); setAuthError(""); }}
                  className="text-blue-500 font-medium"
                >
                  {loginMode ? "Sign up" : t.loginLink}
                </button>
              </p>
            </div>
          )}

          {/* ── Step 6: Choose Plan ── */}
          {step === 6 && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0">
              <BackButton onClick={back} />
              <h1 className="text-2xl font-bold text-[#1a2744] mb-1 flex-shrink-0">{t.step8Title}</h1>
              <p className="text-gray-400 text-sm mb-6 flex-shrink-0">{t.step8Sub}</p>

              {/* Mobile: one card at a time, snap scroll horizontally — no vertical scroll inside */}
              <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory flex-1 min-h-0 gap-4 -mx-6 px-6 pb-2 scrollbar-hide">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`flex-shrink-0 w-full snap-center border-2 ${plan.borderClass} rounded-2xl p-4 flex flex-col`}
                  >
                    <p className="font-bold text-[#1a2744] text-base mb-0.5">{plan.name}</p>
                    <p className={`text-2xl font-bold ${plan.priceClass} mb-3`}>
                      <span className="text-base font-semibold">R</span> {plan.price}
                      <span className="text-xs font-normal text-gray-400"> {t.perMonth}</span>
                    </p>
                    <ul className="flex flex-col gap-1.5 mb-4 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full py-3 rounded-full text-white font-semibold text-sm transition-colors flex-shrink-0 ${plan.btnClass}`}
                    >
                      {t.selectPlan}
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop: both plans side by side */}
              <div className="hidden md:grid grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border-2 ${plan.borderClass} rounded-2xl p-5 flex flex-col`}
                  >
                    <p className="font-bold text-[#1a2744] text-base mb-1">{plan.name}</p>
                    <p className={`text-3xl font-bold ${plan.priceClass} mb-4`}>
                      <span className="text-lg font-semibold">R</span> {plan.price}
                      <span className="text-sm font-normal text-gray-400"> {t.perMonth}</span>
                    </p>
                    <ul className="flex flex-col gap-2 mb-5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: plan.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full py-3.5 rounded-full text-white font-semibold text-base transition-colors ${plan.btnClass}`}
                    >
                      {t.selectPlan}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
