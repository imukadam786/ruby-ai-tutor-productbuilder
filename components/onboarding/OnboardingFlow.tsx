"use client";

import { useState } from "react";

export type OnboardingData = {
  language: string;
  subject: string;
  grade: string;
  averageScore: string;
  goal: string;
  name: string;
  email: string;
  plan: string;
};

const LANGUAGES = [
  "English", "isiZulu", "isiXhosa",
  "Afrikaans", "Sepedi", "Setswana",
  "Sesotho", "Xitsonga", "siSwati",
  "Tshivenda", "isiNdebele",
];

const SUBJECTS = [
  "Afrikaans", "English", "Economics",
  "Geography", "History", "Maths",
  "Maths Lit", "Natural Science", "Physical Science",
  "Tourism", "isiXhosa", "isiZulu",
];

const GRADES = [
  { grade: "3", emoji: "😊" }, { grade: "4", emoji: "😊" },
  { grade: "5", emoji: "😊" }, { grade: "6", emoji: "😊" },
  { grade: "7", emoji: "😎" }, { grade: "8", emoji: "😎" },
  { grade: "9", emoji: "😎" }, { grade: "10", emoji: "🎓" },
  { grade: "11", emoji: "🎓" }, { grade: "12", emoji: "🎓" },
];

const SCORES = ["30 – 40", "40 – 50", "50 – 60", "60 – 70", "70 – 80", "80+"];

const GOALS = [
  { emoji: "📚", text: "I want to learn the basics" },
  { emoji: "📈", text: "I want to improve my current mark" },
  { emoji: "🏆", text: "I want to achieve the best mark possible" },
  { emoji: "🤔", text: "I don't know yet" },
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

// Steps: 1=language, 2=subject, 3=grade, 4=score, 5=goal, 6=plan_ready, 7=create_account, 8=choose_plan
const TOTAL_STEPS = 8;

export default function OnboardingFlow({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const progress = Math.min((step / TOTAL_STEPS) * 100, 100);
  const showProgressBar = step !== 7;

  const select = (key: keyof OnboardingData, value: string) =>
    setData((d) => ({ ...d, [key]: value }));

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSelectPlan = (planId: string) => {
    const final: OnboardingData = {
      language: data.language || "English",
      subject: data.subject || "",
      grade: data.grade || "",
      averageScore: data.averageScore || "",
      goal: data.goal || "",
      name,
      email,
      plan: planId,
    };
    localStorage.setItem("onboardingComplete", "true");
    localStorage.setItem("onboardingData", JSON.stringify(final));
    onComplete(final);
  };

  return (
    <div className="min-h-screen bg-[#eef1f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Steps 1–6: single card with progress bar */}
        {step <= 6 && (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-200">
            <div
              className="h-full bg-red-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-6">
            {/* ── Step 1: Language ── */}
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-bold text-[#1a2744] mb-6 leading-snug">
                  Which language do you prefer?
                </h1>
                <div className="grid grid-cols-3 gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { select("language", lang); next(); }}
                      className={`py-4 px-2 rounded-2xl text-sm font-medium border-2 transition-all ${
                        data.language === lang
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Subject ── */}
            {step === 2 && (
              <div>
                <button onClick={back} className="mb-4 text-[#1a2744]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-[#1a2744] mb-6 leading-snug">
                  Which subject would you like to learn?
                </h1>
                <div className="grid grid-cols-3 gap-3">
                  {SUBJECTS.map((subj) => (
                    <button
                      key={subj}
                      onClick={() => { select("subject", subj); next(); }}
                      className={`py-4 px-2 rounded-2xl text-sm font-medium border-2 transition-all ${
                        data.subject === subj
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Grade ── */}
            {step === 3 && (
              <div>
                <button onClick={back} className="mb-4 text-[#1a2744]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-[#1a2744] mb-6 leading-snug">
                  What grade are you in?
                </h1>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {GRADES.map(({ grade, emoji }) => (
                    <button
                      key={grade}
                      onClick={() => select("grade", grade)}
                      className={`flex items-center gap-3 py-3.5 px-5 rounded-full border-2 text-base font-medium transition-all ${
                        data.grade === grade
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span>{grade}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={next}
                  disabled={!data.grade}
                  className="w-full py-4 rounded-full bg-red-600 text-white font-semibold text-base disabled:opacity-40 hover:bg-red-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* ── Step 4: Average Score ── */}
            {step === 4 && (
              <div>
                <button onClick={back} className="mb-4 text-[#1a2744]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-[#1a2744] mb-2 leading-snug">
                  What did you score on average for your last report?
                </h1>
                <p className="text-gray-400 text-sm mb-6">
                  We'll personalise a learning path based on your answer.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {SCORES.map((score) => (
                    <button
                      key={score}
                      onClick={() => select("averageScore", score)}
                      className={`py-3.5 px-5 rounded-full border-2 text-base font-medium transition-all ${
                        data.averageScore === score
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <button
                  onClick={next}
                  disabled={!data.averageScore}
                  className="w-full py-4 rounded-full bg-red-600 text-white font-semibold text-base disabled:opacity-40 hover:bg-red-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* ── Step 5: Goal ── */}
            {step === 5 && (
              <div>
                <button onClick={back} className="mb-4 text-[#1a2744]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-[#1a2744] mb-6 leading-snug">
                  What are you looking to achieve?
                </h1>
                <div className="flex flex-col gap-3 mb-6">
                  {GOALS.map(({ emoji, text }) => (
                    <button
                      key={text}
                      onClick={() => select("goal", text)}
                      className={`flex items-center gap-4 py-4 px-5 rounded-full border-2 text-left text-base font-medium transition-all ${
                        data.goal === text
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span>{text}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={next}
                  disabled={!data.goal}
                  className="w-full py-4 rounded-full bg-red-600 text-white font-semibold text-base disabled:opacity-40 hover:bg-red-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* ── Step 6: Plan Ready ── */}
            {step === 6 && (
              <div>
                <button onClick={back} className="mb-4 text-[#1a2744]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-[#1a2744] mb-3 leading-snug">
                  Your personalised plan is ready!
                </h1>
                <p className="text-gray-400 text-sm mb-6">
                  Based on your responses, we have prepared a personalised experience for you:
                </p>
                <div className="bg-gray-50 rounded-2xl divide-y divide-gray-200 mb-6">
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      ✦
                    </div>
                    <div>
                      <p className="text-red-500 text-xl font-bold">10,000+</p>
                      <p className="text-gray-500 text-sm">Questions and Answers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-11 h-11 rounded-full bg-purple-400 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      ✦
                    </div>
                    <div>
                      <p className="text-red-500 text-xl font-bold">80</p>
                      <p className="text-gray-500 text-sm">Videos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-11 h-11 rounded-full bg-green-400 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      ✦
                    </div>
                    <div>
                      <p className="text-red-500 text-xl font-bold">6</p>
                      <p className="text-gray-500 text-sm">Characters</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={next}
                  className="w-full py-4 rounded-full bg-red-600 text-white font-semibold text-base hover:bg-red-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
        )}

        {/* ── Step 7: Create Account (outside card style) ── */}
        {step === 7 && (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-[#1a2744] text-center mb-6">
              Create an account
            </h1>

            {/* Google button */}
            <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full border-2 border-gray-200 text-gray-700 font-medium text-base hover:bg-gray-50 transition-colors mb-5">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium tracking-widest">OR USE EMAIL</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex flex-col gap-4 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Full Name</label>
                <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email Address</label>
                <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Password</label>
                <div className="flex items-center gap-3 border-2 border-gray-200 rounded-full px-4 py-3 focus-within:border-gray-400 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-5 text-center">
              By signing up, you agree to our{" "}
              <span className="text-red-500 cursor-pointer">Terms</span> and{" "}
              <span className="text-red-500 cursor-pointer">Privacy Policy</span>.
            </p>

            <button
              onClick={next}
              disabled={!name || !email || !password}
              className="w-full py-4 rounded-full bg-red-600 text-white font-semibold text-base disabled:opacity-40 hover:bg-red-700 transition-colors mb-4"
            >
              Start Free Trial
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <span className="text-red-500 font-medium cursor-pointer">Log In</span>
            </p>
          </div>
        )}

        {/* ── Step 8: Choose Plan ── */}
        {step === 8 && (
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="h-1.5 bg-red-600" />
            <div className="p-6">
              <button onClick={back} className="mb-4 text-[#1a2744]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-[#1a2744] mb-1">Choose your plan</h1>
              <p className="text-gray-400 text-sm mb-6">All plans include a 7 day free trial</p>

              <div className="flex flex-col gap-4">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border-2 ${plan.borderClass} rounded-2xl p-5`}
                  >
                    <p className="font-bold text-[#1a2744] text-base mb-1">{plan.name}</p>
                    <p className={`text-3xl font-bold ${plan.priceClass} mb-4`}>
                      <span className="text-lg font-semibold">R</span> {plan.price}
                      <span className="text-sm font-normal text-gray-400"> / Month</span>
                    </p>
                    <ul className="flex flex-col gap-2 mb-5">
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
                      Select Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
