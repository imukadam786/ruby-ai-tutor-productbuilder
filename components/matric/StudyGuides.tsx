"use client";

import { useState } from "react";
import EduBackground from "@/components/EduBackground";
import PdfViewerModal from "@/components/matric/PdfViewerModal";
import { CONCEPT_C } from "@/lib/flags";
import { supabase } from "@/lib/supabase";

function getGuideUrl(filename: string) {
  const { data } = supabase.storage.from("study-guides").getPublicUrl(filename);
  return data.publicUrl;
}

type Language = "en" | "af";

interface Guide {
  label: string;
  description: string;
  filename: string;
  language?: Language;
}

interface Subject {
  label: string;
  thumbnail: string;
  guides: Guide[];
}

const CONTAIN_THUMBNAILS = new Set([
  "/thumbnails/afrikaans-fal.webp",
  "/thumbnails/business-studies.webp",
  "/thumbnails/economics.webp",
  "/thumbnails/tourism.webp",
]);

const SUBJECTS: Subject[] = [
  {
    label: "Accounting",
    thumbnail: "/thumbnails/accounting.webp",
    guides: [
      {
        label: "Paper 1 — Accounting Concepts",
        description: "Financial statements, ledgers and accounting concepts",
        filename: "acc-p1-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — Financial Reporting",
        description: "Partnerships, companies and cash flow statements",
        filename: "acc-p2-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Vraestel 1 — Rekeningkundige Konsepte",
        description: "Finansiële state, grootboeke en rekeningkundige konsepte",
        filename: "acc-p1-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Vraestel 2 — Finansiële Verslagdoening",
        description: "Vennootskappe, maatskappye en kontantvloeistate",
        filename: "acc-p2-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Paper 1 — Accounting Concepts (Nov 2026)",
        description: "Financial statements, ledgers and accounting concepts",
        filename: "accounting-p1-nov-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — Financial Reporting (Nov 2026)",
        description: "Partnerships, companies and cash flow statements",
        filename: "accounting-p2-nov-2026-studyguide_compressed.pdf",
      },
    ],
  },
  {
    label: "Afrikaans FAL",
    thumbnail: "/thumbnails/afrikaans-fal.webp",
    guides: [
      {
        label: "Paper 1 — Comprehension & Language",
        description: "Begripstoets, opsomming en taalstrukture",
        filename: "afri-fal-p1-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — Literature",
        description: "Poësie, drama en prosa",
        filename: "afri-fal-p2-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 3 — Writing",
        description: "Opstel en transaksionele skryfwerk",
        filename: "afr-fal-p3-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — Literature (Nov 2026)",
        description: "Poësie, drama en prosa",
        filename: "afrikaans-fal-p2-nov-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 1 — Comprehension & Language (Nov 2026)",
        description: "Begripstoets, opsomming en taalstrukture",
        filename: "afrikaans-fal-p1-nov-2026-studyguide_compressed.pdf",
      },
    ],
  },
  {
    label: "Afrikaans HL",
    thumbnail: "/thumbnails/afrikaans.webp",
    guides: [
      {
        label: "Paper 1 — Begrip & Taal",
        description: "Begripstoets, opsomming en taalstrukture",
        filename: "afr-hl-p1-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — Letterkunde",
        description: "Poësie, drama en prosa",
        filename: "afri-hl-p2-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 3 — Skryfwerk",
        description: "Opstel en transaksionele skryfwerk",
        filename: "afr-hl-p3-may-jun-2026-studyguide_compressed.pdf",
      },
    ],
  },
  {
    label: "Agricultural Science",
    thumbnail: "/thumbnails/agricultural-science.webp",
    guides: [
      {
        label: "Paper 1 — Agricultural Science",
        description: "Plant production, animal production and agricultural management",
        filename: "agrisci-p1-may-jun-2026-studyguide1.pdf",
      },
      {
        label: "Paper 2 — Agricultural Science",
        description: "Animal production, animal health and agricultural management",
        filename: "agrisci-p2-may-jun-2026-studyguide.pdf",
      },
      {
        label: "Vraestel 1 — Landbouwetenskap",
        description: "Plantproduksie, diereproduksie en landboubestuur",
        filename: "agrisci-p1-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Vraestel 2 — Landbouwetenskap",
        description: "Diereproduksie, dieregesondheid en landboubestuur",
        filename: "agrisci-p2-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
    ],
  },
  {
    label: "Business Studies",
    thumbnail: "/thumbnails/business-studies.webp",
    guides: [
      {
        label: "Paper 1 — Business Environments (Nov 2026)",
        description: "Business environments, entrepreneurship and business roles",
        filename: "business-studies-p1-nov-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — Management & Operations (Nov 2026)",
        description: "Business functions, financial management and human resources",
        filename: "BusinessStudies_Paper2_StudyGuide_Nov2026_compressed.pdf",
      },
      {
        label: "Paper 1 — Business Environments",
        description: "Business environments, entrepreneurship and business roles",
        filename: "busistd-p1-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — Management & Operations",
        description: "Business functions, financial management and human resources",
        filename: "busistd-p2-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Vraestel 1 — Besigheidsomgewings",
        description: "Besigheidsomgewings, entrepreneurskap en besigheidsrolle",
        filename: "busistd-p1-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Vraestel 2 — Bestuur & Bedrywighede",
        description: "Besigheidsfunksies, finansiële bestuur en menslike hulpbronne",
        filename: "busistd-p2-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
    ],
  },
  {
    label: "Computer Applications Technology",
    thumbnail: "/thumbnails/cat.webp",
    guides: [
      {
        label: "Paper 2 — Computer Applications Technology (Nov 2026)",
        description: "Systems technologies, network technologies and information management",
        filename: "cat-p2-nov-2026-studyguide_compressed.pdf",
      },
    ],
  },
  {
    label: "Consumer Studies",
    thumbnail: "/thumbnails/consumer-studies.webp",
    guides: [
      {
        label: "Paper 1 — Consumer Studies (Nov 2026)",
        description: "Consumer rights, food and nutrition, and textiles",
        filename: "consumer-studies-p1-nov-2026-studyguide_compressed.pdf",
      },
    ],
  },
  {
    label: "Economics",
    thumbnail: "/thumbnails/economics.webp",
    guides: [
      {
        label: "Paper 1 — Macroeconomics & Microeconomics (Nov 2026)",
        description: "Economic systems, markets, growth and development",
        filename: "eco-p1-nov-2026-study-guide_compressed.pdf",
      },
      {
        label: "Paper 2 — Economic Pursuits (Nov 2026)",
        description: "Labour markets, public sector, foreign exchange and economic history",
        filename: "eco-p2-nov-2026-study-guide_compressed.pdf",
      },
      {
        label: "Paper 1 — Macroeconomics & Microeconomics",
        description: "Economic systems, markets, growth and development",
        filename: "eco-p1-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — Economic Pursuits",
        description: "Labour markets, public sector, foreign exchange and economic history",
        filename: "eco-p2-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Vraestel 1 — Makro-ekonomie & Mikro-ekonomie",
        description: "Ekonomiese stelsels, markte, groei en ontwikkeling",
        filename: "eco-p1-may-jun-2026-studuguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Vraestel 2 — Ekonomiese Strewes",
        description: "Arbeidsmarkte, openbare sektor, buitelandse valuta en ekonomiese geskiedenis",
        filename: "eco-p2-may-jun-2026-studuguide-afrikaans.pdf",
        language: "af",
      },
    ],
  },
  {
    label: "English FAL",
    thumbnail: "/thumbnails/english-fal.webp",
    guides: [
      {
        label: "Paper 1 — Comprehension & Language",
        description: "Reading comprehension, summary and language in context",
        filename: "eng-fal-p1-may-jun-2026-studyguide1_compressed.pdf",
      },
      {
        label: "Paper 2 — Literature",
        description: "Poetry, drama, novel and short stories",
        filename: "eng-fal-p2-may-jun-2026-studyguide2_compressed.pdf",
      },
      {
        label: "Paper 3 — Writing",
        description: "Essays, transactional writing and creative tasks",
        filename: "eng-fal-p3-may-jun-2026-studyguide3_compressed.pdf",
      },
    ],
  },
  {
    label: "English HL",
    thumbnail: "/thumbnails/english.webp",
    guides: [
      {
        label: "Paper 1 — Comprehension & Language (Nov 2026)",
        description: "Reading comprehension, summary and language in context",
        filename: "English_HL_Paper1_Study_Guide_compressed.pdf",
      },
      {
        label: "Paper 2 — Literature (Nov 2026)",
        description: "Poetry, drama, novel and short stories",
        filename: "english-hl-p2-nov-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 1 — Comprehension & Language",
        description: "Reading comprehension, summary and language in context",
        filename: "eng-p1-may-jun-2026-studyguide1_compressed.pdf",
      },
      {
        label: "Paper 2 — Literature",
        description: "Poetry, drama, novel and short stories",
        filename: "eng-hl-p2-may-jun-2026-studyguide2_compressed.pdf",
      },
      {
        label: "Paper 3 — Writing",
        description: "Essays, transactional writing and creative tasks",
        filename: "eng-hl-p3-may-jun-2026-studyguide3_compressed.pdf",
      },
    ],
  },
  {
    label: "Geography",
    thumbnail: "/thumbnails/geography.webp",
    guides: [
      {
        label: "Paper 1 — Physical Geography (Nov 2026)",
        description: "Climate, geomorphology, rivers and global atmospheric systems",
        filename: "geo-p1-nov-2026-study-guide_compressed.pdf",
      },
      {
        label: "Paper 2 — Human Geography (Nov 2026)",
        description: "Settlement, population, economic geography and development",
        filename: "geo-p2-nov-2026-study-guide.pdf",
      },
      {
        label: "Paper 1 — Physical Geography",
        description: "Climate, geomorphology, rivers and global atmospheric systems",
        filename: "geo-p1-may-jun-2026-studyguide1.pdf",
      },
      {
        label: "Paper 2 — Human Geography",
        description: "Settlement, population, economic geography and development",
        filename: "geo-p2-may-jun-2026-studyguide1.pdf",
      },
      {
        label: "Vraestel 1 — Fisiese Geografie",
        description: "Klimaat, geomorfologie, riviere en globale atmosferiese stelsels",
        filename: "geo-p1-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Vraestel 2 — Menslike Geografie",
        description: "Nedersetting, bevolking, ekonomiese geografie en ontwikkeling",
        filename: "geo-p2-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
    ],
  },
  {
    label: "Hospitality Studies",
    thumbnail: "/thumbnails/hospitality.webp",
    guides: [
      {
        label: "Paper 1 — Hospitality Studies (Nov 2026)",
        description: "Hospitality operations, food and beverage, and tourism sectors",
        filename: "hospitality-p1-nov-2026-studyguide_compressed.pdf",
      },
    ],
  },
  {
    label: "History",
    thumbnail: "/thumbnails/history.webp",
    guides: [
      {
        label: "Paper 1 — South African History (Nov 2026)",
        description: "20th century South African and world history",
        filename: "his-p1-nov-2026-study-guide_compressed.pdf",
      },
      {
        label: "Paper 2 — World History (Nov 2026)",
        description: "Cold War, decolonisation and global change",
        filename: "his-p2-nov-2026-study-guide_compressed.pdf",
      },
      {
        label: "Paper 1 — South African History",
        description: "20th century South African and world history",
        filename: "his-pp1-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — World History",
        description: "Cold War, decolonisation and global change",
        filename: "his-pp2-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Vraestel 2 — Wêreldgeskiedenis",
        description: "Koue Oorlog, dekolonisasie en globale verandering",
        filename: "hist-p2-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
    ],
  },
  {
    label: "Life Sciences",
    thumbnail: "/thumbnails/life-sciences.webp",
    guides: [
      {
        label: "Paper 1 — Life at the Molecular Level",
        description: "DNA, genetics, meiosis and evolution",
        filename: "lifesci-p1-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 2 — Life at the Systems Level",
        description: "Human biology, ecology and environmental studies",
        filename: "lifesci-p2-may-jun-2026-studyguide_compressed.pdf",
      },
      {
        label: "Vraestel 1 — Lewe op Molekulêre Vlak",
        description: "DNS, genetika, meiose en evolusie",
        filename: "life-sci-p1-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Vraestel 2 — Lewe op Sisteemvlak",
        description: "Menslike biologie, ekologie en omgewingstudies",
        filename: "life-sci-p2-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Paper 1 — Life at the Molecular Level (Nov 2026)",
        description: "DNA, genetics, meiosis and evolution",
        filename: "life_sci_P1_study_guide_nov_2026_compressed.pdf",
      },
      {
        label: "Paper 2 — Life at the Systems Level (Nov 2026)",
        description: "Human biology, ecology and environmental studies",
        filename: "life_sci_P2_study_guide_nov_2026_compressed.pdf",
      },
    ],
  },
  {
    label: "Mathematics",
    thumbnail: "/thumbnails/mathematics.webp",
    guides: [
      {
        label: "Paper 1 — Algebra, Calculus & Functions (Nov 2026)",
        description: "Sequences, functions, calculus, finance and probability",
        filename: "maths-p1-nov-2026-study-guide_compressed.pdf",
      },
      {
        label: "Paper 2 — Geometry, Trigonometry & Stats (Nov 2026)",
        description: "Euclidean geometry, trigonometry, analytical geometry and statistics",
        filename: "math_P2_study_guide_nov_2026 (1)_compressed.pdf",
      },
      {
        label: "Paper 1 — Algebra, Calculus & Functions",
        description: "Sequences, functions, calculus, finance and probability",
        filename: "maths-p1-may-jun-2026-studyguide.pdf",
      },
      {
        label: "Paper 2 — Geometry, Trigonometry & Stats",
        description: "Euclidean geometry, trigonometry, analytical geometry and statistics",
        filename: "maths-p2-may-jun-2026-studyguide.pdf",
      },
      {
        label: "Vraestel 1 — Algebra, Calculus & Funksies",
        description: "Rye, funksies, calculus, finansies en waarskynlikheid",
        filename: "maths-p1-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Vraestel 2 — Meetkunde, Trigonometrie & Statistiek",
        description: "Euklidiese meetkunde, trigonometrie, analitiese meetkunde en statistiek",
        filename: "maths-p2-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
    ],
  },
  {
    label: "Maths Literacy",
    thumbnail: "/thumbnails/maths-literacy.webp",
    guides: [
      {
        label: "Paper 1 — Basic Skills & Applications (Nov 2026)",
        description: "Number, finance, measurement and maps",
        filename: "math-lit-p1-nov-2026-study-guide_compressed.pdf",
      },
      {
        label: "Paper 2 — Applications in Context (Nov 2026)",
        description: "Data handling, probability and integrated contexts",
        filename: "mathslit-p2-nov-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 1 — Basic Skills & Applications",
        description: "Number, finance, measurement and maps",
        filename: "mathslit-p1-may-jun-2026-studyguide1_compressed.pdf",
      },
      {
        label: "Paper 2 — Applications in Context",
        description: "Data handling, probability and integrated contexts",
        filename: "mathslit-p2-may-jun-2026-studyguide2_compressed.pdf",
      },
      {
        label: "Vraestel 1 — Basiese Vaardighede & Toepassings",
        description: "Getalle, finansies, meting en kaarte",
        filename: "mathslit-p1-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Vraestel 2 — Toepassings in Konteks",
        description: "Datahantering, waarskynlikheid en geïntegreerde kontekste",
        filename: "mathslit-p2-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
    ],
  },
  {
    label: "Physical Sciences",
    thumbnail: "/thumbnails/physical-science.webp",
    guides: [
      {
        label: "Paper 1 — Physics (Nov 2026)",
        description: "Mechanics, waves, electricity and magnetism",
        filename: "phy-sci-p1-nov-2026-study-guide_compressed.pdf",
      },
      {
        label: "Paper 2 — Chemistry (Nov 2026)",
        description: "Matter & materials, chemical change and solutions",
        filename: "physical-sciences-p2-nov-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 1 — Physics",
        description: "Mechanics, waves, electricity and magnetism",
        filename: "physics-pp1-may-jun-studyguide-2026 (1)_compressed.pdf",
      },
      {
        label: "Paper 2 — Chemistry",
        description: "Matter & materials, chemical change and solutions",
        filename: "physics-pp2-may-jun-studyguide-2026_compressed.pdf",
      },
      {
        label: "Vraestel 1 — Fisika",
        description: "Meganika, golwe, elektrisiteit en magnetisme",
        filename: "phys-sci-p1-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
      {
        label: "Vraestel 2 — Chemie",
        description: "Materie & materiale, chemiese verandering en oplossings",
        filename: "phys-sci-p2-may-jun-2026-studyguide-afrikaans.pdf",
        language: "af",
      },
    ],
  },
  {
    label: "Tourism",
    thumbnail: "/thumbnails/tourism.webp",
    guides: [
      {
        label: "Paper 1 — Tourism Study Guide (Nov 2026)",
        description: "Tourism sectors, responsible tourism, sustainable development and travel services",
        filename: "tourism-p1-nov-2026-studyguide_compressed.pdf",
      },
      {
        label: "Paper 1 — Tourism Study Guide",
        description: "Tourism sectors, responsible tourism, sustainable development and travel services",
        filename: "tourism-p1-may-jun-2026-studyguide.pdf",
      },
    ],
  },
];

interface StudyGuidesProps {
  onBack: () => void;
}

export default function StudyGuides({ onBack }: StudyGuidesProps) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [openGuide, setOpenGuide] = useState<{ url: string; title: string } | null>(null);

  function handleGuideClick(guide: Guide, subjectLabel: string) {
    setOpenGuide({
      url: getGuideUrl(guide.filename),
      title: `${subjectLabel} — ${guide.label}`,
    });
  }

  if (openGuide) {
    return (
      <PdfViewerModal
        url={openGuide.url}
        title={openGuide.title}
        onClose={() => setOpenGuide(null)}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative max-w-3xl mx-auto px-5 py-10 space-y-8">

        {/* Back button */}
        <button
          onClick={selectedSubject ? () => setSelectedSubject(null) : onBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {selectedSubject ? selectedSubject.label : "Study Guides"}
          </h1>
          <p className="text-gray-500 text-sm">
            {selectedSubject
              ? "Select a paper to open the study guide"
              : "In-depth subject guides and summaries for matric learners."}
          </p>
        </div>

        {/* Subject grid */}
        {!selectedSubject && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Choose a subject</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUBJECTS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSelectedSubject(s)}
                  className={`relative rounded-2xl transition-all group overflow-hidden bg-white border-2 border-gray-200 cursor-pointer ${
                    CONCEPT_C
                      ? "shadow-lip active:translate-y-[3px] active:shadow-none"
                      : "shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full aspect-square overflow-hidden">
                    <img
                      src={s.thumbnail}
                      alt={s.label}
                      className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${CONTAIN_THUMBNAILS.has(s.thumbnail) ? "object-contain p-3" : "object-cover"}`}
                    />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center pt-2">
              More subjects being added — check back soon.
            </p>
          </div>
        )}

        {/* Guides list */}
        {selectedSubject && (() => {
          const englishGuides = selectedSubject.guides.filter((g) => (g.language ?? "en") === "en");
          const afrikaansGuides = selectedSubject.guides.filter((g) => g.language === "af");
          const showLanguageHeadings = englishGuides.length > 0 && afrikaansGuides.length > 0;

          const renderGuide = (guide: Guide) => (
            <button
              key={guide.filename}
              onClick={() => handleGuideClick(guide, selectedSubject.label)}
              className={`w-full text-left bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 transition-all ${
                CONCEPT_C
                  ? "shadow-lip active:translate-y-[3px] active:shadow-none"
                  : "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
              }`}
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                  <path d="M8.5 14.5h1.5v1.5H8.5zM8.5 11.5h7v1.5h-7zM8.5 17.5h7v1.5h-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{guide.label}</p>
                <p className="text-gray-500 text-xs mt-0.5 truncate">{guide.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );

          if (!showLanguageHeadings) {
            return (
              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Choose a paper</h2>
                <div className="flex flex-col gap-3">
                  {selectedSubject.guides.map(renderGuide)}
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-base font-bold text-gray-900">English</h2>
                <div className="flex flex-col gap-3">
                  {englishGuides.map(renderGuide)}
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-base font-bold text-gray-900">Afrikaans</h2>
                <div className="flex flex-col gap-3">
                  {afrikaansGuides.map(renderGuide)}
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
