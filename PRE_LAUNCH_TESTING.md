# Pre-launch testing checklist

What to verify before this work goes live. Covers everything shipped for the
tester-feedback round across commits `0dd98da`, `ca0de45`, `dfac6ce` on `dev`.

Already green in CI-style checks: TypeScript typecheck, `npm test` (27 tests),
and a full `npm run build` (30/30 pages). The items below are **manual /
on-device** checks those can't catch.

How to use: tick each box once verified on a real device (phone + desktop).
Test as a **free-plan** learner and a **paid** learner where it matters.

---

## A. Life Skills pictures (#27)
- [ ] Open Life Skills → a topic with picture questions: image-match questions show **real picture tiles** (e.g. body parts, animals, foods, places, planets).
- [ ] Behaviour/scene questions (e.g. "a child laughing at someone") still show as **clean text buttons** — never a mix of pictures + text in the same question.
- [ ] Approximation icons read acceptably to a child: pap → rice bowl, pap & stew → pot, balanced plate → curry plate, springbok/antelope → deer.
- [ ] No broken-image placeholders anywhere.

## B. Onboarding Discovery → lands in skill tree (#3)
- [ ] Brand-new account → onboarding → choose **Reading** Discovery → finish → after plan choice you **land in the Reading skill tree** (not Home).
- [ ] Same for **Maths** Discovery → lands in the Maths skill tree.
- [ ] Go to Home afterwards: the Discovery card reads **"View"**, not "Start".
- [ ] The skill tree shows your placement and the "Continue" button (see C).

## C. "Continue where you left off" (#4)
- [ ] Maths skill tree shows a **🚀 "Continue where you left off"** button → resumes your current skill.
- [ ] Reading skill tree shows the same button → resumes.
- [ ] Tapping the **active (▶) skill tile** also resumes (no dead taps).
- [ ] Afrikaans "Continue" still works (unchanged).
- [ ] The Continue button looks the **same** across Maths, Reading, Afrikaans.

## D. Matric paywall not a dead-end (#3, mobile)
- [ ] As a **free** user **on a phone**, tap **Matric** → upgrade screen appears with a clear **"✕ Back"** control that's always visible → tapping it returns you (not trapped).
- [ ] "Maybe later" at the bottom and tap-outside-to-close also dismiss it.

## E. Re-take Discovery (anytime)
- [ ] **Settings → Learning → "Re-take Discovery"** opens the Discover hub.
- [ ] In the Discover hub, **Maths "Retake"** starts Discovery **fresh** (new questions) — it does NOT drop you straight into learning.
- [ ] **Reading "Retake"** also starts fresh.
- [ ] Abandoning a retake midway leaves your **previous placement intact** (only overwritten once you finish the new Discovery).
- [ ] Free user: only the Discovery they completed offers Retake; the other stays locked with the upgrade prompt.

## F. Progress page (#40)
- [ ] Life Skills accordion/tab lists **all 36 topics** grouped by **Grade 1 / 2 / 3** (was only 12).
- [ ] Mastered topics show the green pill; in-progress show amber.

## G. Grade 4+ subject hiding (#3/#16)
- [ ] As a **Grade 4+** learner: **Subjects** page does NOT show **Life Skills** or **Afrikaans** (grid reflows to remaining subjects).
- [ ] As Grade 4+: **Progress** page does NOT show the Life Skills / Afrikaans tabs (tab bar reflows).
- [ ] As a **Grade 1–3** learner: both subjects still appear in Subjects and Progress.

## H. Pricing tiles
- [ ] Onboarding plan screen order is **Matric → Scholar → Free → Master**.
- [ ] The **Free** tile has a dark border + **"No Card Needed"** badge and reads as an active choice (not switched-off).
- [ ] Upgrade modal and Matric-only views still render sensibly (no broken layout).

## I. Submit / no double-tap
- [ ] **Life Skills**: tapping an answer immediately **dims the answer area + shows a "Checking…" spinner**; further taps do nothing until it resolves.
- [ ] Maths/Reading submit buttons grey out + show "Checking…" (unchanged — confirm still working).

## J. Mastery clarity (Life Skills, #34–37)
- [ ] Session header shows **"Master this topic"** + a progress bar + **"Q n of N · ⭐ correct"** + **"Answer all N to master it"**.
- [ ] Finishing all N with **≥ 60%** → **"You did it!"** (mastered).
- [ ] Finishing with **< 60%** → **"All done! Try again to master it"**.
- [ ] The mastered/▢ status then shows correctly on the topic grid and Progress page.

## K. Audio consistency (#22/#23)
- [ ] **No autoplay** in any subject (Life Skills, Afrikaans, Reading) — nothing speaks until you tap.
- [ ] Each question has **one compact 🔊 icon** next to it; tap = read aloud, tap again = stop. Same control across subjects.
- [ ] Afrikaans still has its **"Luister in Afrikaans"** button (the actual Afrikaans audio to listen to).
- [ ] Per-option 🔊 icons read that option aloud and do **not** submit the answer.
- [ ] Audio still plays quickly on first tap (it's pre-fetched).

## L. Language switching (#11, #78)
Test for **each** of the 11 SA languages (and the others in the picker):
- [ ] Switch system language → core screen **titles change**: Subjects, Discover, Progress, skill-tree headers, Home greeting + "Learning Modes", and the session end-screens (Skill/Topic Complete, Level Up, Amazing/Incredible).
- [ ] **Correct** answer → praise appears **in the chosen language**, instantly (Maths + Reading).
- [ ] **Wrong** answer → feedback appears in the chosen language.
- [ ] A learner who already used a language **before this release** still sees the new titles translated (cache was version-bumped — confirm no stale English titles).
- [ ] ⚠️ **Human-readable check:** someone who reads each language confirms the praise strings (`data/praise-i18n.json`) and the auto-translated UI strings are correct/natural — especially Tshivenda, Xitsonga, siSwati, isiNdebele, Sepedi.

---

## Known limitations / out of scope (not bugs)
- Broader i18n is **not** done: Matric Past Papers, Prep Papers, Study Guides, dashboards, and long descriptive captions still show in English when a non-English language is selected. Deferred to a future i18n pass.
- ~35 of 55 Life Skills image-match questions intentionally stay as text (their options are behaviours/scenes a single icon can't show).
- AI-generated translations (praise + UI strings) were produced once and need the human-readable check above before they're trusted in production.

## Sign-off
- [ ] Mobile (phone) pass complete
- [ ] Desktop pass complete
- [ ] Translation review complete
- [ ] Approved to merge `dev` → production
