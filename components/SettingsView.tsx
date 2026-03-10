"use client";

import { useState, useEffect } from "react";
import { useT } from "@/lib/i18n";
import SpinningGlobe from "@/components/SpinningGlobe";

interface SettingsViewProps {
  onBack: () => void;
}

// ── Small reusable pieces ─────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3 px-1">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{subtitle}</p>
    </div>
  );
}

function RowChevron() {
  return (
    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function Row({
  icon,
  label,
  value,
  onClick,
  danger = false,
  rightEl,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  rightEl?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100 ${
        danger ? "text-red-500" : "text-gray-800"
      }`}
    >
      <span className={`flex-shrink-0 ${danger ? "text-red-400" : "text-gray-400"}`}>{icon}</span>
      <span className={`flex-1 text-sm font-medium ${danger ? "text-red-500" : "text-gray-800"}`}>{label}</span>
      {value && <span className="text-xs text-gray-400 mr-1 truncate max-w-[120px]">{value}</span>}
      {rightEl ?? <RowChevron />}
    </button>
  );
}


function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
      {children}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const icons = {
  user: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  email: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  phone: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  globe: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  lock: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  trash: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  book: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  moon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  download: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  star: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  creditCard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  receipt: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  question: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  chat: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  flag: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>,
  lightbulb: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  xCircle: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-blue-500" : "bg-gray-200"
      }`}
    >
      <span
        className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-0.5"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

// ── Input field ───────────────────────────────────────────────────────────────

function EditField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-300 bg-gray-50"
      />
    </div>
  );
}

// ── Plan badge ────────────────────────────────────────────────────────────────

const PLAN_INFO: Record<string, { label: string; color: string; features: string[]; price: string }> = {
  free: {
    label: "Free",
    color: "bg-gray-100 text-gray-600",
    price: "R0 / month",
    features: ["General Homework Chat", "Basic Skill Tree", "Limited questions/day"],
  },
  starter: {
    label: "Starter",
    color: "bg-blue-100 text-blue-700",
    price: "R149 / month",
    features: ["All Free features", "Maths Engine", "Reading Engine", "Progress Reports"],
  },
  pro: {
    label: "Pro",
    color: "bg-purple-100 text-purple-700",
    price: "R299 / month",
    features: ["All Starter features", "Unlimited questions", "PDF Reports", "Priority support"],
  },
  ultimate: {
    label: "Ultimate",
    color: "bg-amber-100 text-amber-700",
    price: "R499 / month",
    features: ["All Pro features", "Multiple learner profiles", "Parent dashboard", "Live tutor sessions"],
  },
};

const CONTINENTS: {
  key: string;
  label: string;
  color: string;
  textColor: string;
  languages: string[];
}[] = [
  {
    key: "africa",
    label: "Africa",
    color: "#C9A62B",
    textColor: "#fff",
    languages: ["Afrikaans","Arabic","English","French","Portuguese","Somali","Swahili","Xhosa","Yoruba","Zulu"],
  },
  {
    key: "asia",
    label: "Asia",
    color: "#7B68EE",
    textColor: "#fff",
    languages: ["Arabic","Armenian","Azerbaijani","Bengali","Chinese (Mandarin)","Georgian","Hebrew","Hindi","Indonesian","Japanese","Javanese","Kazakh","Korean","Kurdish","Lao","Malay","Malayalam","Marathi","Mongolian","Nepali","Pashto","Persian (Farsi)","Punjabi","Sinhala","Tamil","Thai","Turkish","Urdu","Uzbek","Vietnamese"],
  },
  {
    key: "europe",
    label: "Europe",
    color: "#8B8B4A",
    textColor: "#fff",
    languages: ["Catalan","Croatian","Dutch","English","French","German","Greek","Italian","Norwegian","Polish","Portuguese","Romanian","Russian","Serbian","Slovak","Slovenian","Spanish","Swedish","Ukrainian"],
  },
  {
    key: "north-america",
    label: "North America",
    color: "#C0392B",
    textColor: "#fff",
    languages: ["English","French","Spanish"],
  },
  {
    key: "south-america",
    label: "South America",
    color: "#27AE60",
    textColor: "#fff",
    languages: ["English","French","Portuguese","Spanish"],
  },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function SettingsView({ onBack }: SettingsViewProps) {
  const { t, setLanguage, isTranslating } = useT();

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountLang, setAccountLang] = useState("English");
  const [learnLang, setLearnLang] = useState("English");
  const [plan, setPlan] = useState("free");
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState(false);

  // Active modal
  const [modal, setModal] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("onboardingData");
      if (raw) {
        const d = JSON.parse(raw);
        setName(d.name || "");
        setEmail(d.email || "");
        setPhone(d.phone || "");
        setAccountLang(d.language || "English");
        setLearnLang(d.language || "English");
        setPlan(d.plan || "free");
      }
      setDarkMode(localStorage.getItem("darkMode") === "true");
    } catch { /* ignore */ }
  }, []);

  const applyDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem("darkMode", String(enabled));
    document.documentElement.classList.toggle("dark", enabled);
  };

  const saveProfile = () => {
    try {
      const raw = localStorage.getItem("onboardingData");
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem("onboardingData", JSON.stringify({
        ...existing,
        name,
        email,
        phone,
        language: accountLang,
      }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
  };

  const planInfo = PLAN_INFO[plan] || PLAN_INFO.free;

  const close = () => setModal(null);

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="hidden md:flex bg-white border-b border-gray-100 px-5 py-4 items-center gap-3 flex-shrink-0">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-gray-900 font-semibold text-lg">{t("settings.title")}</h1>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-7">

            {/* ── Profile ──────────────────────────────────────────────── */}
            <section>
              <SectionHeader
                title={t("settings.profile")}
                subtitle={t("settings.profile_desc")}
              />
              <Card>
                <Row icon={icons.user}    label={t("settings.full_name")}        value={name || "Not set"}    onClick={() => setModal("name")} />
                <Row icon={icons.email}   label={t("settings.email")}            value={email || "Not set"}   onClick={() => setModal("email")} />
                <Row icon={icons.phone}   label={t("settings.phone")}            value={phone || "Not set"}   onClick={() => setModal("phone")} />
                <Row icon={icons.lock}    label={t("settings.change_password")}                               onClick={() => setModal("password")} />
                <Row icon={icons.trash}   label={t("settings.delete_account")}   danger                       onClick={() => setModal("deleteAccount")} />
              </Card>
            </section>

            {/* ── Learning Settings ─────────────────────────────────────── */}
            <section>
              <SectionHeader
                title={t("settings.learning")}
                subtitle={t("settings.learning_desc")}
              />
              <Card>
                <Row
                  icon={icons.book}
                  label={t("settings.preferred_lang")}
                  value={learnLang}
                  onClick={() => { setSelectedContinent(null); setModal("learnLang"); }}
                />
                <Row
                  icon={icons.moon}
                  label={t("settings.dark_mode")}
                  rightEl={
                    <Toggle
                      checked={darkMode}
                      onChange={applyDarkMode}
                    />
                  }
                />
                <Row icon={icons.download} label={t("settings.download_report")} onClick={() => setModal("downloadPDF")} />
              </Card>
            </section>

            {/* ── Subscription ──────────────────────────────────────────── */}
            <section>
              <SectionHeader
                title={t("settings.subscription")}
                subtitle={t("settings.subscription_desc")}
              />
              <Card>
                <Row
                  icon={icons.star}
                  label={t("settings.current_plan")}
                  value={planInfo.label}
                  rightEl={
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planInfo.color}`}>
                      {planInfo.label}
                    </span>
                  }
                />
                <Row icon={icons.star}       label={t("settings.plan_features")}      onClick={() => setModal("planFeatures")} />
                <Row icon={icons.receipt}    label={t("settings.billing_cycle")}       value="Monthly"       onClick={() => setModal("billing")} />
                <Row icon={icons.creditCard} label={t("settings.payment_method")}      value="•••• 4242"    onClick={() => setModal("payment")} />
                <Row icon={icons.creditCard} label={t("settings.update_payment")}                            onClick={() => setModal("payment")} />
                <Row icon={icons.receipt}    label={t("settings.billing_history")}                           onClick={() => setModal("invoices")} />
                <Row icon={icons.xCircle}    label={t("settings.cancel_sub")}          danger                onClick={() => setModal("cancelSub")} />
              </Card>
            </section>

            {/* ── Support ───────────────────────────────────────────────── */}
            <section>
              <SectionHeader
                title={t("settings.support")}
                subtitle={t("settings.support_desc")}
              />
              <Card>
                <Row icon={icons.question}  label={t("settings.faq")}         onClick={() => setModal("faq")} />
                <Row icon={icons.chat}      label={t("settings.contact")}      onClick={() => setModal("contact")} />
                <Row icon={icons.chat}      label={t("settings.feedback")}     onClick={() => setModal("feedback")} />
                <Row icon={icons.flag}      label={t("settings.report_bug")}   onClick={() => setModal("bug")} />
                <Row icon={icons.lightbulb} label={t("settings.suggest")}      onClick={() => setModal("feature")} />
              </Card>
            </section>

            <p className="text-center text-xs text-gray-300 pb-6">Ruby AI Tutor · Powered by Groq</p>
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {modal === "name" && (
        <Modal title="Full name" onClose={close}>
          <div className="space-y-4">
            <EditField label="Full name" value={name} onChange={setName} placeholder="Your name" />
            <button onClick={() => { saveProfile(); close(); }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              {t("settings.save")}
            </button>
          </div>
        </Modal>
      )}

      {modal === "email" && (
        <Modal title="Email address" onClose={close}>
          <div className="space-y-4">
            <EditField label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            <button onClick={() => { saveProfile(); close(); }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              {t("settings.save")}
            </button>
          </div>
        </Modal>
      )}

      {modal === "phone" && (
        <Modal title="Phone number" onClose={close}>
          <div className="space-y-4">
            <EditField label="Phone" value={phone} onChange={setPhone} type="tel" placeholder="+27 000 000 0000" />
            <button onClick={() => { saveProfile(); close(); }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              {t("settings.save")}
            </button>
          </div>
        </Modal>
      )}

      {modal === "accountLang" && (
        <Modal title="Account language" onClose={close}>
          <div className="space-y-1.5">
            {Array.from(new Set(CONTINENTS.flatMap(c => c.languages))).sort().map((l) => (
              <button key={l} onClick={() => { setAccountLang(l); saveProfile(); close(); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  accountLang === l ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}>
                {l}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modal === "learnLang" && (
        <Modal
          title={selectedContinent ? CONTINENTS.find(c => c.key === selectedContinent)!.label : "Preferred System Language"}
          onClose={() => { setSelectedContinent(null); close(); }}
        >
          {!selectedContinent ? (
            /* Step 1: pick continent */
            <div className="grid grid-cols-2 gap-3">
              {CONTINENTS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedContinent(c.key)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{ backgroundColor: c.color }}
                >
                  <span className="text-3xl">
                    {c.key === "africa" ? "🌍" : c.key === "asia" ? "🌏" : c.key === "europe" ? "🌍" : "🌎"}
                  </span>
                  <span className="text-xs font-bold text-white text-center leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Step 2: pick language */
            <div className="flex flex-col">
              <button
                onClick={() => setSelectedContinent(null)}
                className="flex items-center gap-1.5 text-xs text-blue-500 mb-3 font-medium flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to continents
              </button>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {CONTINENTS.find(c => c.key === selectedContinent)!.languages.map((l) => (
                  <button key={l} onClick={async () => { setLearnLang(l); setSelectedContinent(null); await setLanguage(l); close(); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      learnLang === l ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}

      {modal === "password" && (
        <Modal title="Change password" onClose={close}>
          <div className="space-y-4">
            <EditField label="Current password" value="" onChange={() => {}} type="password" placeholder="••••••••" />
            <EditField label="New password" value="" onChange={() => {}} type="password" placeholder="••••••••" />
            <EditField label="Confirm new password" value="" onChange={() => {}} type="password" placeholder="••••••••" />
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              Update password
            </button>
          </div>
        </Modal>
      )}

      {modal === "deleteAccount" && (
        <Modal title="Delete account" onClose={close}>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-red-700 text-sm font-medium mb-1">This action is permanent</p>
              <p className="text-red-600 text-sm">All your progress, skills, and data will be permanently deleted. This cannot be undone.</p>
            </div>
            <button onClick={close} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Keep my account
            </button>
            <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              Yes, delete everything
            </button>
          </div>
        </Modal>
      )}

      {modal === "planFeatures" && (
        <Modal title={`${planInfo.label} plan features`} onClose={close}>
          <div className="space-y-2">
            {planInfo.features.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <span className="text-green-500 text-base">✓</span>
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
            <div className="pt-3">
              <p className="text-xs text-gray-400">Current price: <span className="font-semibold text-gray-700">{planInfo.price}</span></p>
            </div>
          </div>
        </Modal>
      )}

      {modal === "billing" && (
        <Modal title="Billing cycle" onClose={close}>
          <div className="space-y-3">
            {["Monthly", "Annually (save 20%)"].map((cycle) => (
              <button key={cycle}
                className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 font-medium transition-colors">
                {cycle}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modal === "payment" && (
        <Modal title="Payment method" onClose={close}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Visa ending in 4242</p>
                <p className="text-xs text-gray-400">Expires 08/27</p>
              </div>
            </div>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              Update payment details
            </button>
          </div>
        </Modal>
      )}

      {modal === "invoices" && (
        <Modal title="Billing history" onClose={close}>
          <div className="space-y-2">
            {[
              { date: "1 Mar 2026", amount: planInfo.price, status: "Paid" },
              { date: "1 Feb 2026", amount: planInfo.price, status: "Paid" },
              { date: "1 Jan 2026", amount: planInfo.price, status: "Paid" },
            ].map((inv) => (
              <div key={inv.date} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800">{inv.date}</p>
                  <p className="text-xs text-gray-400">{inv.amount}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-0.5 rounded-full">{inv.status}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modal === "cancelSub" && (
        <Modal title="Cancel subscription" onClose={close}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">You&apos;ll lose access to all premium features at the end of your billing cycle. Your progress data will be kept.</p>
            <button onClick={close} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Keep subscription
            </button>
            <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              Cancel subscription
            </button>
          </div>
        </Modal>
      )}

      {modal === "downloadPDF" && (
        <Modal title="Download progress report" onClose={close}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Your personalised progress report includes skill mastery, streaks, and session history.</p>
            <button onClick={close} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {icons.download} Download PDF
            </button>
          </div>
        </Modal>
      )}

      {modal === "faq" && (
        <Modal title="Frequently asked questions" onClose={close}>
          <div className="space-y-3">
            {[
              { q: "How does Ruby teach maths?", a: "Ruby uses an adaptive skill tree with 72 atomic skills to diagnose and target gaps." },
              { q: "Can I change the learning language?", a: "Yes — go to Learning Settings and choose your preferred language." },
              { q: "Is my data safe?", a: "All progress is stored locally on your device and never shared without consent." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-gray-800 mb-1">{q}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {(modal === "contact" || modal === "feedback" || modal === "bug" || modal === "feature") && (
        <Modal
          title={
            modal === "contact" ? "Contact support" :
            modal === "feedback" ? "Provide feedback" :
            modal === "bug" ? "Report a bug" : "Suggest a feature"
          }
          onClose={close}
        >
          <div className="space-y-4">
            <textarea
              rows={4}
              placeholder={
                modal === "contact" ? "Describe your issue..." :
                modal === "feedback" ? "What do you think of Ruby?" :
                modal === "bug" ? "Describe what went wrong and how to reproduce it..." :
                "What feature would make Ruby better?"
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 placeholder-gray-300"
            />
            <button onClick={close} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              Send
            </button>
          </div>
        </Modal>
      )}

      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg z-50">
          ✓ Saved
        </div>
      )}

      {isTranslating && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col items-center justify-center gap-4">
          <SpinningGlobe />
          <p className="text-white text-sm font-medium">Translating platform...</p>
        </div>
      )}
    </>
  );
}
