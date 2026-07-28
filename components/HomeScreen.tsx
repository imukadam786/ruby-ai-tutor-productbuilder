"use client";

import { useEffect, useRef, useState } from "react";
import { ActiveView } from "@/types";
import { useT } from "@/lib/i18n";
import EduBackground from "@/components/EduBackground";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import { TUTORS } from "@/lib/tutors";
import Gem from "@/components/ui/Gem";
import { RUBY } from "@/lib/design/gemColors";
import { CONCEPT_C } from "@/lib/flags";

interface HomeScreenProps {
  onNavigate: (view: ActiveView) => void;
  userPlan: string | null;
  onOpenLangPicker?: () => void;
  /** Opens the chat personalised to the named tutor (header, avatar, prompts). */
  onOpenChatWithTutor?: (tutorName: string) => void;
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

export default function HomeScreen({ onNavigate, userPlan, onOpenChatWithTutor }: HomeScreenProps) {
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

  useEffect(() => {
    const load = async () => {
      const auth = await fetchAuthorisedGrade();
      if (auth?.name) setFirstName(auth.name.split(" ")[0]);
      setIsGrade12(auth?.grade === 12);
    };
    load();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-center sm:justify-start gap-4 mb-8">
            <RubyAvatar size="w-14 h-14" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
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
              <p className="text-gray-500 text-base mt-0.5">Ready to keep learning?</p>
            </div>
          </div>

          {/* ── Meet your Tutors (the AI tutors are the headline value, so they
                greet the learner first — tap a card to start a chat). ─────── */}
          <section className="mb-8">
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
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
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

          {/* ── Today's goal (Concept C) — gold card below the tutors ────── */}
          {CONCEPT_C && (
            <section className="mb-8">
              <div
                className="rounded-2xl px-5 py-4 shadow-lip"
                style={{ background: "linear-gradient(135deg,#FFB323,#ff9e3d)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gem color={RUBY} state="polished" className="w-8 h-10" />
                    <div>
                      <p className="font-extrabold text-lg leading-tight" style={{ color: "#5a3600" }}>
                        Today&apos;s goal
                      </p>
                      <p className="text-sm font-semibold" style={{ color: "#7a4a10" }}>
                        Collect gems as you learn
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl" aria-hidden>🔥</span>
                </div>
              </div>
            </section>
          )}

          {/* Matric Prep is Grade 12-only — hidden for every other learner. */}
          {isGrade12 && (
            <section className="mb-8">
              <button
                onClick={handleMatricPrepClick}
                className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
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
