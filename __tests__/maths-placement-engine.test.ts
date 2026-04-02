import { describe, test, expect } from "vitest";
import {
  SEARCH_GATES,
  getSearchWindow,
  getDomainsForGrade,
  getGradeFloor,
  GATE_PASSED_ENTRY,
} from "@/lib/maths-placement-engine";

// ── Sanity checks on static data ────────────────────────────────────────────

describe("SEARCH_GATES", () => {
  test("has exactly 12 gates (G1–G12)", () => {
    expect(SEARCH_GATES).toHaveLength(12);
  });

  test("every gate has exactly 2 distinct domain IDs", () => {
    for (const gate of SEARCH_GATES) {
      expect(gate.domains).toHaveLength(2);
      expect(gate.domains[0]).not.toBe(gate.domains[1]);
    }
  });

  test("no domain ID is shared across gates", () => {
    const all = SEARCH_GATES.flatMap((g) => g.domains);
    const unique = new Set(all);
    expect(unique.size).toBe(all.length);
  });
});

describe("GATE_PASSED_ENTRY", () => {
  test("has an entry for each gate index 0–11", () => {
    for (let i = 0; i <= 11; i++) {
      expect(GATE_PASSED_ENTRY[i]).toBeDefined();
    }
  });

  test("entry levels are monotonically non-decreasing", () => {
    for (let i = 1; i <= 11; i++) {
      expect(GATE_PASSED_ENTRY[i]).toBeGreaterThanOrEqual(GATE_PASSED_ENTRY[i - 1]);
    }
  });
});

// ── getSearchWindow ──────────────────────────────────────────────────────────

describe("getSearchWindow", () => {
  // Grade 1: hi = min(0, 11) = 0, lo = max(0, -2) = 0 → [0, 0]
  test("Grade 1 → single gate window [0, 0]", () => {
    expect(getSearchWindow(1)).toEqual([0, 0]);
  });

  // Grade 2: hi = 1, lo = max(0, -1) = 0 → [0, 1]
  test("Grade 2 → two-gate window [0, 1]", () => {
    expect(getSearchWindow(2)).toEqual([0, 1]);
  });

  // Grade 3: hi = 2, lo = max(0, 0) = 0 → [0, 2]
  test("Grade 3 → full three-gate window [0, 2]", () => {
    expect(getSearchWindow(3)).toEqual([0, 2]);
  });

  // Grade 4: hi = 3, lo = 1 → [1, 3]
  test("Grade 4 → three-gate window [1, 3]", () => {
    expect(getSearchWindow(4)).toEqual([1, 3]);
  });

  // Grade 7: hi = 6, lo = 4 → [4, 6]
  test("Grade 7 → window [4, 6] (never shows Grade 1 content)", () => {
    expect(getSearchWindow(7)).toEqual([4, 6]);
  });

  // Grade 12: hi = min(11, 11) = 11, lo = 9 → [9, 11]
  test("Grade 12 → top three-gate window [9, 11]", () => {
    expect(getSearchWindow(12)).toEqual([9, 11]);
  });

  test("window size is always ≤ 3", () => {
    for (let g = 1; g <= 12; g++) {
      const [lo, hi] = getSearchWindow(g);
      expect(hi - lo).toBeLessThanOrEqual(2);
    }
  });
});

// ── getDomainsForGrade ───────────────────────────────────────────────────────

describe("getDomainsForGrade — Grade 2 regression (bug #1)", () => {
  test("Grade 2 gets exactly G1 + G2 domains", () => {
    expect(getDomainsForGrade(2)).toEqual(["M001", "M002", "M003", "M020"]);
  });

  test("Grade 2 diagnostic NEVER includes Grade 7 ratio domain M009", () => {
    expect(getDomainsForGrade(2)).not.toContain("M009");
  });

  test("Grade 2 diagnostic NEVER includes Grade 7 BODMAS domain M010", () => {
    expect(getDomainsForGrade(2)).not.toContain("M010");
  });

  test("Grade 2 diagnostic NEVER includes any domain beyond G2", () => {
    const grade2Domains = new Set(getDomainsForGrade(2));
    const g3PlusDomains = SEARCH_GATES.slice(2).flatMap((g) => g.domains);
    for (const d of g3PlusDomains) {
      expect(grade2Domains.has(d)).toBe(false);
    }
  });
});

describe("getDomainsForGrade — domain counts per grade", () => {
  test("Grade 1 has 2 domains (single gate)", () => {
    expect(getDomainsForGrade(1)).toHaveLength(2);
  });

  test("Grade 2 has 4 domains (two gates)", () => {
    expect(getDomainsForGrade(2)).toHaveLength(4);
  });

  test("Grades 3–12 each have 6 domains (three gates)", () => {
    for (let g = 3; g <= 12; g++) {
      expect(getDomainsForGrade(g)).toHaveLength(6);
    }
  });
});

// ── getGradeFloor ────────────────────────────────────────────────────────────

describe("getGradeFloor", () => {
  test("Grade 1 floor is level 1", () => expect(getGradeFloor(1)).toBe(1));
  test("Grade 2 floor is level 1", () => expect(getGradeFloor(2)).toBe(1));
  test("Grade 3 floor is level 1", () => expect(getGradeFloor(3)).toBe(1));
  test("Grade 4 floor is level 2", () => expect(getGradeFloor(4)).toBe(2));
  test("Grade 5 floor is level 3", () => expect(getGradeFloor(5)).toBe(3));
  test("Grade 9 floor is level 7", () => expect(getGradeFloor(9)).toBe(7));
  test("Grade 12 floor is level 13", () => expect(getGradeFloor(12)).toBe(13));

  test("floor never exceeds the GATE_PASSED_ENTRY for the same grade", () => {
    // A student who fails all gates should never be placed higher than
    // a student who passed a gate
    for (let g = 1; g <= 12; g++) {
      const floor = getGradeFloor(g);
      // The earliest gate entry for this grade's window is GATE_PASSED_ENTRY[lo]
      const [lo] = getSearchWindow(g);
      const minEntry = GATE_PASSED_ENTRY[lo];
      expect(floor).toBeLessThanOrEqual(minEntry);
    }
  });
});
