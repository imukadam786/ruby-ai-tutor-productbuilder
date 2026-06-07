"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import SubjectChecklist from "@/components/onboarding/SubjectChecklist";
import {
  ALWAYS_ON_FET_KEYS,
  writeCachedSubjects,
  SUBJECTS_UPDATED_EVENT,
  type FetSubjectKey,
} from "@/lib/fet-subjects";

// The "My subjects" editor — lets a Grade 10–12 learner change which subjects
// show in their hub after onboarding. Saves to users.subjects, updates the local
// cache, and fires SUBJECTS_UPDATED_EVENT so a mounted hub refreshes live.
export default function EditSubjectsModal({
  initial,
  onClose,
}: {
  initial: FetSubjectKey[] | null;
  onClose: () => void;
}) {
  // Start with only the always-on subject (English) ticked so the learner has to
  // actively choose the rest — nothing is pre-selected for them.
  const [subjects, setSubjects] = useState<FetSubjectKey[]>(
    initial && initial.length ? initial : [...ALWAYS_ON_FET_KEYS],
  );
  const [saving, setSaving] = useState(false);
  // Require at least one chosen subject beyond the always-on English, so the
  // learner can't save without actively selecting anything.
  const hasRealChoice = subjects.some((k) => !ALWAYS_ON_FET_KEYS.includes(k));

  const toggle = (key: FetSubjectKey) => {
    if (ALWAYS_ON_FET_KEYS.includes(key)) return; // locked on
    setSubjects((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("users")
          .update({ subjects: subjects.length ? subjects : null })
          .eq("id", user.id);
        writeCachedSubjects(subjects);
        window.dispatchEvent(new CustomEvent(SUBJECTS_UPDATED_EVENT, { detail: subjects }));
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-[#1a2744] leading-snug">My subjects</h2>
          <p className="text-gray-400 text-sm mt-1">Tick the subjects you take. They&apos;re what shows on your home screen.</p>
        </div>
        <div className="px-6 flex-1 overflow-y-auto min-h-0 pb-2">
          <SubjectChecklist selected={subjects} onToggle={toggle} />
        </div>
        <div className="p-6 flex-shrink-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3.5 rounded-full border-2 border-gray-200 text-gray-700 font-semibold text-base hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !hasRealChoice}
            className="flex-1 py-3.5 rounded-full bg-rose-600 text-white font-semibold text-base disabled:opacity-40 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
