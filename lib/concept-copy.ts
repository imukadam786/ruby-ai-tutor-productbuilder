// ─── Concept C copy constants ────────────────────────────────────────────────
// Keeps the "Collecting" language and key labels consistent and swappable, so a
// copy change lands in one place. Includes the agreed rename of the old
// "Skill Tree" wording → "Skills".

export const COPY = {
  /** Was "Skill Tree" — now just "Skills". */
  skillsLabel: "Skills",
  skillsSubtitle: "gems to collect",

  startCollecting: "Start Collecting",
  keepCollecting: "Keep Collecting →",

  correctReward: "Nice — gem cut!",
  tryAgain: "Try again →",
} as const;
