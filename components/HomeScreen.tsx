"use client";

import { useEffect, useRef, useState } from "react";
import { ActiveView } from "@/types";
import { StudentProfile } from "@/types/ruby";
import { ReadingStudentProfile } from "@/types/reading";
import { useT } from "@/lib/i18n";
import EduBackground from "@/components/EduBackground";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import { TUTORS } from "@/lib/tutors";
import { getStreakData, StreakData } from "@/lib/storage";

interface HomeScreenProps {
  onNavigate: (view: ActiveView) => void;
  userPlan: string | null;
  onOpenLangPicker?: () => void;
  /** Opens the chat personalised to the named tutor (header, avatar, prompts). */
  onOpenChatWithTutor?: (tutorName: string) => void;
  mathsProfile: StudentProfile | null;
  readingProfile: ReadingStudentProfile | null;
  onContinueMaths: () => void;
  onContinueReading: () => void;
}

const MATRIC_PLANS = ["master", "matric-pack"];

// Tutor characters, shown 3 per page in a swipable carousel.
const TUTORS_PER_PAGE = 3;
const TUTOR_PAGES = Math.ceil(TUTORS.length / TUTORS_PER_PAGE);

function RubyAvatar({ size = "w-12 h-12" }: { size?: string }) {
  return (
    <div className={`${size} flex-shrink-0 rounded-full overflow-hidden bg-white`}>
      <img
        src="/icons/icon-192.png"
        alt="Ruby"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = "flex";
        }}
      />
      <div
        className="w-full h-full bg-rose-600 items-center justify-center text-white font-bold text-xl"
        style={{ display: "none" }}
      >
        R
      </div>
    </div>
  );
}

export default function HomeScreen({
  onNavigate,
  userPlan,
  onOpenChatWithTutor,
  mathsProfile,
  readingProfile,
  onContinueMaths,
  onContinueReading,
}: HomeScreenProps) {
  const hasMatricAccess = userPlan !== null && MATRIC_PLANS.includes(userPlan);

  const handleMatricPrepClick = () => {
    if (hasMatricAccess) {
      onNavigate("matrics");
    } else {
      document.dispatchEvent(
        new CustomEvent("ruby-upgrade-needed", {
          detail: {
            reason: "Matric Past Papers, Study Guides and Prep Papers require the Matric Exam Pack or Master plan.",
            matricOnly: true,
          },
        })
      );
    }
  };

  const { t } = useT();

  const [firstName, setFirstName] = useState("there");
  // Matric Prep is Grade 12-only. Fail closed: unknown grade keeps it hidden.
  const [isGrade12, setIsGrade12] = useState(false);
  const [tutorPage, setTutorPage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    const load = async () => {
      const auth = await fetchAuthorisedGrade();
      if (auth?.name) setFirstName(auth.name.split(" ")[0]);
      setIsGrade12(auth?.grade === 12);
    };
    load();
  }, []);

  useEffect(() => {
    const load = () => { getStreakData().then(setStreak); };
    load();
    const onUpdate = () => load();
    document.addEventListener("ruby-streak-updated", onUpdate);
    return () => document.removeEventListener("ruby-streak-updated", onUpdate);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const streakLine =
    streak && streak.currentStreak > 0
      ? streak.lastActiveDate !== todayStr
        ? `You're 1 lesson away from your ${streak.currentStreak + 1}-day streak!`
        : streak.currentStreak >= 2
        ? `You're on a ${streak.currentStreak}-day streak — nice work!`
        : null
      : null;

  // "Continue Learning" resolves to whichever subject the learner has real
  // progress in (most recently active first); falls back to Subjects hub.
  const mathsActive = !!mathsProfile && mathsProfile.session_count > 0;
  const readingActive = !!readingProfile && readingProfile.session_count > 0;
  let continueTarget: "maths" | "reading" | null = null;
  if (mathsActive && readingActive) {
    continueTarget =
      new Date(mathsProfile!.last_active).getTime() >= new Date(readingProfile!.last_active).getTime()
        ? "maths"
        : "reading";
  } else if (mathsActive) {
    continueTarget = "maths";
  } else if (readingActive) {
    continueTarget = "reading";
  }

  const continueCta =
    continueTarget === "maths"
      ? { icon: "🧮", label: "Maths", action: onContinueMaths }
      : continueTarget === "reading"
      ? { icon: "📖", label: "English", action: onContinueReading }
      : { icon: "🚀", label: "Get Started", action: () => onNavigate("subjects") };

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

          {/* ── Status row ───────────────────────────────────────────────── */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <RubyAvatar size="w-9 h-9" />
                <h1 className="text-lg font-bold text-gray-900">
                  {(() => {
                    const [before, after] = t("home.greeting").split("{name}");
                    return (
                      <>
                        {before}
                        <span style={{ color: "rgb(var(--brand))" }}>{firstName}</span>
                        {after}
                      </>
                    );
                  })()}
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {streak && streak.currentStreak > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                    🔥 {streak.currentStreak}
                  </span>
                )}
              </div>
            </div>
            {streakLine && (
              <p className="text-sm text-gray-500 mt-1 truncate">{streakLine}</p>
            )}
          </div>

          {/* ── Continue Learning — the one primary action on this screen ── */}
          <section className="mb-6">
            <button
              onClick={continueCta.action}
              className="w-full flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-5 py-5 shadow-lip active:translate-y-[3px] active:shadow-none transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <span className="text-3xl flex-shrink-0" aria-hidden>{continueCta.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {continueTarget ? t("home.continue_learning") : "Homework help & subjects"}
                </p>
                <p className="text-xl font-extrabold text-gray-900 truncate">
                  {continueTarget ? `Continue ${continueCta.label}` : continueCta.label}
                </p>
              </div>
              <span className="text-2xl text-gray-300 flex-shrink-0" aria-hidden>→</span>
            </button>
          </section>

          {/* ── Meet your Tutors (tap a card to start a chat). ─────────── */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Meet your Tutors</h2>

            <div
              className="overflow-hidden"
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                if (dx < -40) setTutorPage((p) => Math.min(p + 1, TUTOR_PAGES - 1));
                else if (dx > 40) setTutorPage((p) => Math.max(p - 1, 0));
                touchStartX.current = null;
              }}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${tutorPage * 100}%)` }}
              >
                {Array.from({ length: TUTOR_PAGES }).map((_, page) => (
                  <div key={page} className="w-full flex-shrink-0 grid grid-cols-3 gap-3 sm:gap-4">
                    {TUTORS.slice(page * TUTORS_PER_PAGE, page * TUTORS_PER_PAGE + TUTORS_PER_PAGE).map((tutor) => (
                      <button
                        key={tutor.name}
                        onClick={() => onOpenChatWithTutor?.(tutor.name)}
                        className="bg-white rounded-2xl border-2 border-gray-100 shadow-lip overflow-hidden active:translate-y-[3px] active:shadow-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                      >
                        <img
                          src={tutor.img}
                          alt={tutor.name}
                          className="w-full aspect-[2/3] object-cover object-top block"
                          draggable={false}
                        />
                        <div className="px-2 py-2 text-center">
                          <p className="font-semibold text-brand text-sm sm:text-base">{tutor.name}</p>
                          <p className="text-brand text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5">
                            {tutor.subjects.join(" · ")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Swipe indicator dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: TUTOR_PAGES }).map((_, page) => (
                <button
                  key={page}
                  onClick={() => setTutorPage(page)}
                  aria-label={`Go to tutor page ${page + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    tutorPage === page ? "w-6 bg-brand" : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Matric Prep is Grade 12-only — hidden for every other learner. */}
          {isGrade12 && (
            <section className="mb-6">
              <button
                onClick={handleMatricPrepClick}
                className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-lip active:translate-y-[3px] active:shadow-none transition-all text-left"
              >
                <div className="flex-1 flex items-start gap-3">
                  <span className="text-2xl">🎓</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white leading-tight">Matric Prep</p>
                    <p className="text-sm text-emerald-50 mt-0.5 leading-snug">
                      {hasMatricAccess
                        ? "Past papers, prep papers and study guides"
                        : "Unlock past papers, prep papers and study guides"}
                    </p>
                  </div>
                </div>
                <span className="text-white font-semibold text-sm self-end mt-auto">
                  {hasMatricAccess ? "View →" : "Upgrade →"}
                </span>
              </button>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
