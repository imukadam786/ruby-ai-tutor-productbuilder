"use client";

import { useT } from "@/lib/i18n";
import SpinningGlobe from "@/components/SpinningGlobe";

const LANGUAGES: { value: string; label: string }[] = [
  { value: "English",    label: "English" },
  { value: "Afrikaans",  label: "Afrikaans" },
  { value: "Arabic",     label: "Arabic" },
  { value: "French",     label: "French" },
  { value: "German",     label: "German" },
  { value: "isiNdebele", label: "isiNdebele (Ndebele)" },
  { value: "isiXhosa",   label: "isiXhosa (Xhosa)" },
  { value: "isiZulu",    label: "isiZulu (Zulu)" },
  { value: "Sepedi",     label: "Sepedi (Northern Sotho)" },
  { value: "Sesotho",    label: "Sesotho (Southern Sotho)" },
  { value: "Setswana",   label: "Setswana (Tswana)" },
  { value: "siSwati",    label: "siSwati (Swati)" },
  { value: "Spanish",    label: "Spanish" },
  { value: "Tshivenda",  label: "Tshivenda (Venda)" },
  { value: "Xitsonga",   label: "Xitsonga (Tsonga)" },
];

function LanguageIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
    </svg>
  );
}

interface Props {
  onClose: () => void;
}

export default function LanguagePickerModal({ onClose }: Props) {
  const { language: currentLang, setLanguage, isTranslating } = useT();

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

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="bg-white sm:rounded-2xl sm:max-w-md sm:w-full rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[75vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 text-gray-900">
              <LanguageIcon className="w-5 h-5 text-[#B7182E]" />
              <h3 className="font-semibold text-base">System Language</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Language list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {LANGUAGES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                  currentLang === value
                    ? "bg-[#B7182E] text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
                {currentLang === value && (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
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
