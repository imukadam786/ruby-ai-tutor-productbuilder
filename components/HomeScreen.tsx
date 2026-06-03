"use client";

import { useEffect, useRef, useState } from "react";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { ReadingStudentProfile } from "@/types/reading";
import { useT } from "@/lib/i18n";
import EduBackground from "@/components/EduBackground";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import SavedReportView from "@/components/SavedReportView";
import { TUTORS } from "@/lib/tutors";

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

// Placeholder FAQs — copy to be subbed in later.
const FAQS = [
  { q: "How does Ruby teach maths?", a: "Ruby uses an adaptive skill tree to find your level and target the exact gaps you need to work on." },
  { q: "Can I change the app language?", a: "Yes — tap the Language tile above to switch the app into your preferred language." },
  { q: "How do I find my level?", a: "Start a Discovery for Maths or Reading and Ruby will place you at the right starting point." },
  { q: "Is my progress saved?", a: "Yes, your progress is saved to your account so you can pick up where you left off on any device." },
];

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

export default function HomeScreen({ onNavigate, userPlan, onOpenLangPicker, onOpenChatWithTutor }: HomeScreenProps) {
  const hasMatricAccess = userPlan !== null && MATRIC_PLANS.includes(userPlan);
  const isFreebie = userPlan === "freebie" || userPlan === null;

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

  const handleUpgradeClick = () => {
    document.dispatchEvent(
      new CustomEvent("ruby-upgrade-needed", {
        detail: { reason: undefined, matricOnly: false },
      })
    );
  };

  const { t } = useT();

  const [firstName, setFirstName] = useState("there");
  const [mathsDone, setMathsDone] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [viewReport, setViewReport] = useState<"maths" | "reading" | null>(null);
  const [faqOpen, setFaqOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tutorPage, setTutorPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const [auth, profile, readingProfile] = await Promise.all([
        fetchAuthorisedGrade(),
        hydrateStudentProfileFromSupabase(),
        hydrateReadingProfileFromSupabase(),
      ]);
      if (auth?.name) setFirstName(auth.name.split(" ")[0]);
      setMathsDone(profile?.placementCompleted ?? false);
      setReadingDone((readingProfile as ReadingStudentProfile | null)?.placementCompleted ?? false);
    };
    load();
  }, []);

  if (viewReport) {
    return (
      <div className="h-full overflow-hidden">
        <SavedReportView subject={viewReport} onBack={() => setViewReport(null)} />
      </div>
    );
  }

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
                      <span style={{ color: "#BE1832" }}>{firstName}</span>
                      {after}
                    </>
                  );
                })()}
              </h1>
              <p className="text-gray-500 text-base mt-0.5">Ready to keep learning?</p>
            </div>
          </div>

          {/* ── Quick actions (Language / Upgrade / FAQ) ─────────────────── */}
          <section className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onOpenLangPicker?.()}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl flex-shrink-0">🌍</span>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-base leading-tight">Language</p>
                  <p className="text-gray-500 text-xs mt-0.5">Change app language</p>
                </div>
              </button>

              <button
                onClick={handleUpgradeClick}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl flex-shrink-0">⭐</span>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-base leading-tight">
                    {isFreebie ? "Upgrade" : "Manage plan"}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {isFreebie ? "Unlock unlimited learning" : `Current: ${userPlan}`}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setFaqOpen((v) => !v)}
                aria-expanded={faqOpen}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">❓</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-base leading-tight">FAQ</p>
                  <p className="text-gray-500 text-xs mt-0.5">Frequently asked questions</p>
                </div>
                <span className={`text-gray-400 transition-transform flex-shrink-0 ${faqOpen ? "rotate-180" : ""}`}>⌄</span>
              </button>
            </div>

            {/* FAQ accordion — placeholder copy, subbed in later */}
            {faqOpen && (
              <div className="mt-3 bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                {FAQS.map((item, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={item.q}>
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        aria-expanded={open}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-800 text-sm flex-1">{item.q}</span>
                        <span className={`text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}>⌄</span>
                      </button>
                      {open && (
                        <p className="px-4 pb-4 -mt-1 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Discovery CTAs ────────────────────────────────────────────── */}
          <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            {mathsDone ? (
              <button
                onClick={() => setViewReport("maths")}
                className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex-1 flex items-start gap-3">
                  <span className="text-2xl">🧮</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white leading-tight">Maths Discovery</p>
                    <p className="text-sm text-blue-50 mt-0.5 leading-snug">View your placement results</p>
                  </div>
                </div>
                <span className="text-white font-semibold text-sm self-end mt-auto">View →</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("discover-maths")}
                className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex-1 flex items-start gap-3">
                  <span className="text-2xl">🧮</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white leading-tight">Start Maths Discovery</p>
                    <p className="text-sm text-blue-50 mt-0.5 leading-snug">Find your Maths level</p>
                  </div>
                </div>
                <span className="text-white font-semibold text-sm self-end mt-auto">Start →</span>
              </button>
            )}

            {readingDone ? (
              <button
                onClick={() => setViewReport("reading")}
                className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex-1 flex items-start gap-3">
                  <span className="text-2xl">📖</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white leading-tight">Reading Discovery</p>
                    <p className="text-sm text-purple-50 mt-0.5 leading-snug">View your placement results</p>
                  </div>
                </div>
                <span className="text-white font-semibold text-sm self-end mt-auto">View →</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("discover-reading")}
                className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex-1 flex items-start gap-3">
                  <span className="text-2xl">📖</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white leading-tight">Start Reading Discovery</p>
                    <p className="text-sm text-purple-50 mt-0.5 leading-snug">Find your Reading level</p>
                  </div>
                </div>
                <span className="text-white font-semibold text-sm self-end mt-auto">Start →</span>
              </button>
            )}
          </section>

          {/* ── Meet your Tutors ──────────────────────────────────────────── */}
          <section>
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
                        className="bg-white rounded-2xl border-2 border-[#BE1832] p-3 sm:p-4 flex flex-col items-center gap-2 text-center hover:shadow-md hover:bg-[#BE1832]/5 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BE1832]/50"
                      >
                        <p className="font-semibold text-[#BE1832] text-sm sm:text-base">{tutor.name}</p>
                        <div className="w-full aspect-square rounded-xl bg-white overflow-hidden flex items-center justify-center">
                          <img
                            src={tutor.img}
                            alt={tutor.name}
                            className="w-full h-full object-contain"
                            draggable={false}
                          />
                        </div>
                        <p className="text-[#BE1832] text-[10px] sm:text-[11px] font-medium leading-tight">
                          {tutor.subjects.join(" · ")}
                        </p>
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
                    tutorPage === page ? "w-6 bg-[#BE1832]" : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
