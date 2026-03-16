"use client";

import { useState } from "react";
import { getTranslations } from "@/lib/onboarding-translations";
import { supabase } from "@/lib/supabase";
import Flag from "react-world-flags";

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

const BAR_COLOURS = ["#f59e0b", "#3b82f6", "#10b981"];

function ScoreChart({ bars }: { bars: number[] }) {
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
          fill={BAR_COLOURS[i]}
        />
      ))}
    </svg>
  );
}

const CURRICULA: { label: string; flag: string }[] = [
  { label: "CAPS",                    flag: "ZA" },
  { label: "IEB",                     flag: "ZA" },
  { label: "CAPS-SID",                flag: "ZA" },
  { label: "LSEN",                    flag: "ZA" },
  { label: "American Curriculum",     flag: "US" },
  { label: "Cambridge International", flag: "GB" },
  { label: "British Curriculum",      flag: "GB" },
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
  // Progress bar counts steps 2–6 (step 1 is account creation, no bar)

  return (
    // Fills the full locked viewport (html+body are h-full overflow-hidden)
    <div className="h-full bg-gradient-to-br from-[#6B1020] via-[#C41930] to-[#FF6080] flex flex-col py-8 px-4">
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
          {step === 1 && (
            <div className="flex-1 flex flex-col p-5">
              <h1 className="text-2xl font-bold text-[#1a2744] text-center mb-1">
                {loginMode ? "Welcome back" : t.step7Title}
              </h1>

              {/* Ruby superheroes — only on sign-up */}
              {!loginMode && (
                <div className="flex justify-center mb-1">
                  <img
                    src="/ruby-heroes.png"
                    alt="Ruby superheroes"
                    className="h-36 w-auto object-contain"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2.5 mb-2.5">
                {!loginMode && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">{t.nameLabel}</label>
                    <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-rose-400 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 outline-none text-gray-700 text-base bg-transparent" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">{t.emailLabel}</label>
                  <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-2.5 focus-within:border-rose-400 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 outline-none text-gray-700 text-base bg-transparent" />
                  </div>
                </div>
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

              <div className="md:mt-auto md:pt-4">
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
                  {loginMode ? "Log in" : "Start Free Beta"}
                </button>
                {loginMode ? (
                  <button onClick={() => { setLoginMode(false); setAuthError(""); }} className="w-full py-3 rounded-full border-2 border-[#1a2744] text-[#1a2744] font-bold text-base hover:bg-gray-50 transition-colors">
                    Create Account
                  </button>
                ) : (
                  <button onClick={() => { setLoginMode(true); setAuthError(""); }} className="w-full py-3 rounded-full border-2 border-[#1a2744] text-[#1a2744] font-bold text-base hover:bg-gray-50 transition-colors">
                    Log In
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Language ── */}
          {step === 2 && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0">
              <h1 className="text-3xl font-bold text-[#1a2744] mb-6 leading-snug flex-shrink-0">{t.step1Title}</h1>
              <div className="flex-1 overflow-y-auto min-h-0 pb-1">
                <div className="grid grid-cols-3 gap-3">
                  {LANGUAGES.map((language) => (
                    <button
                      key={language}
                      onClick={() => select("language", language)}
                      className={`py-4 px-2 rounded-2xl text-base font-medium border-2 transition-all ${
                        data.language === language
                          ? "border-rose-500 bg-rose-50 text-rose-600"
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

          {/* ── Step 3: Grade ── */}
          {step === 3 && (
            <div className="flex-1 flex flex-col p-6">
              <BackButton onClick={back} />
              <h1 className="text-3xl font-bold text-[#1a2744] mb-4 leading-snug">{t.step3Title}</h1>
              <div className="flex-1 grid grid-cols-2 gap-2.5 content-start">
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
              <div className="pt-4">
                <ContinueBtn label={t.continueBtn} onClick={next} disabled={!data.grade} />
              </div>
            </div>
          )}

          {/* ── Step 4: Average Score ── */}
          {step === 4 && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0">
              <BackButton onClick={back} />
              <h1 className="text-3xl font-bold text-[#1a2744] mb-2 leading-snug flex-shrink-0">{t.step4Title}</h1>
              <p className="text-gray-400 text-base mb-6 flex-shrink-0">{t.step4Sub}</p>
              <div className="flex-1 overflow-y-auto min-h-0 pb-1">
                <div className="grid grid-cols-2 gap-3">
                  {SCORES.map(({ label, bars }) => (
                    <button
                      key={label}
                      onClick={() => select("averageScore", label)}
                      className={`py-3.5 px-5 rounded-full border-2 text-base font-medium transition-all flex items-center justify-center gap-2 ${
                        data.averageScore === label
                          ? "border-rose-500 bg-rose-50 text-rose-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <ScoreChart bars={bars} />
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

          {/* ── Step 5: Curriculum ── */}
          {step === 5 && (
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
                      <span className="flex-shrink-0 rounded overflow-hidden shadow-sm" style={{ width: 28, height: 20, display: "inline-flex", alignItems: "center" }}>
                        <Flag code={flag} style={{ width: 28, height: 20, objectFit: "cover", borderRadius: 3 }} />
                      </span>
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

          {/* ── Step 6: Choose Plan ── */}
          {step === 6 && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 min-h-0">
              <BackButton onClick={back} />
              <h1 className="text-3xl font-bold text-[#1a2744] mb-1 flex-shrink-0">{t.step8Title}</h1>
              <p className="text-gray-400 text-base mb-6 flex-shrink-0">{t.step8Sub}</p>

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
                      <span className="text-sm font-normal text-gray-400"> {t.perMonth}</span>
                    </p>
                    <ul className="flex flex-col gap-1.5 mb-4 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
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
                        <li key={f} className="flex items-center gap-2 text-base text-gray-600">
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
