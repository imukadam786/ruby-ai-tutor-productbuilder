"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import SpinningGlobe from "@/components/SpinningGlobe";
import { CONCEPT_C } from "@/lib/flags";

const CONTINENTS = [
  {
    key: "africa", label: "Africa", color: "#C9A62B",
    emoji: "🌍",
    languages: ["Afrikaans","Arabic","English","French","isiNdebele","Portuguese","Sepedi","Sesotho","Setswana","siSwati","Somali","Swahili","Tshivenda","Xhosa","Xitsonga","Yoruba","Zulu"],
  },
  {
    key: "asia", label: "Asia", color: "#7B68EE",
    emoji: "🌏",
    languages: ["Arabic","Armenian","Azerbaijani","Bengali","Chinese (Mandarin)","Georgian","Hebrew","Hindi","Indonesian","Japanese","Javanese","Kazakh","Korean","Kurdish","Lao","Malay","Malayalam","Marathi","Mongolian","Nepali","Pashto","Persian (Farsi)","Punjabi","Sinhala","Tamil","Thai","Turkish","Urdu","Uzbek","Vietnamese"],
  },
  {
    key: "europe", label: "Europe", color: "#8B8B4A",
    emoji: "🌍",
    languages: ["Catalan","Croatian","Dutch","English","French","German","Greek","Italian","Norwegian","Polish","Portuguese","Romanian","Russian","Serbian","Slovak","Slovenian","Spanish","Swedish","Ukrainian"],
  },
  {
    key: "north-america", label: "North America", color: "#C0392B",
    emoji: "🌎",
    languages: ["English","French","Spanish"],
  },
  {
    key: "south-america", label: "South America", color: "#27AE60",
    emoji: "🌎",
    languages: ["English","French","Portuguese","Spanish"],
  },
];

interface Props {
  onClose: () => void;
}

export default function LanguagePickerModal({ onClose }: Props) {
  const { language: currentLang, setLanguage, isTranslating } = useT();
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);

  const continent = CONTINENTS.find(c => c.key === selectedContinent);

  const handleSelect = async (lang: string) => {
    await setLanguage(lang);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet — slides up from bottom on mobile, centered on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="bg-white sm:rounded-2xl sm:max-w-md sm:w-full rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[75vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            {selectedContinent ? (
              <button
                onClick={() => setSelectedContinent(null)}
                className={`flex items-center gap-1.5 text-sm font-medium ${CONCEPT_C ? "text-ruby" : "text-blue-500"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {continent?.label}
              </button>
            ) : (
              <h3 className="font-semibold text-gray-900 text-base">🌐 System Language</h3>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto">
            {!selectedContinent ? (
              /* Step 1: Continent grid */
              <div className="p-4 grid grid-cols-2 gap-3">
                {CONTINENTS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setSelectedContinent(c.key)}
                    className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl transition-all hover:opacity-90 ${
                      CONCEPT_C
                        ? "shadow-lip active:translate-y-[3px] active:shadow-none"
                        : "active:scale-[0.97]"
                    }`}
                    style={{ backgroundColor: c.color }}
                  >
                    <span className="text-4xl">{c.emoji}</span>
                    <span className="text-xs font-bold text-white text-center leading-tight">{c.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* Step 2: Language list */
              <div className="p-4 space-y-1.5">
                {continent!.languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleSelect(lang)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                      currentLang === lang
                        ? CONCEPT_C ? "bg-ruby text-white" : "bg-blue-500 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {lang}
                    {currentLang === lang && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Translation loading overlay */}
      {isTranslating && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col items-center justify-center gap-4">
          <SpinningGlobe />
          <p className="text-white text-sm font-medium">Translating platform...</p>
        </div>
      )}
    </>
  );
}
