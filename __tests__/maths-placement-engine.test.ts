import { describe, test, expect } from "vitest";
import {
  SEARCH_GATES,
  getSearchWindow,
  getDomainsForGrade,
  getGradeFloor,
  GATE_PASSED_ENTRY,
  GATE_PARTIAL_ENTRY,
  isDomainPassed,
  isGatePassed,
  resolveEntryLevel,
} from "@/lib/maths-placement-engine";

// ── Test helpers ─────────────────────────────────────────────────────────────

// Build per-domain correct/total tallies from a map of domain → [correct, total].
function tallies(spec: Record<string, [number, number]>) {
  const domainCorrect: Record<string, number> = {};
  const domainTotal: Record<string, number> = {};
  for (const [d, [c, t]] of Object.entries(spec)) {
    domainCorrect[d] = c;
    domainTotal[d] = t;
  }
  return { domainCorrect, domainTotal };
}

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

// ── GATE_PARTIAL_ENTRY ───────────────────────────────────────────────────────

describe("GATE_PARTIAL_ENTRY", () => {
  test("every partial landing sits strictly between its band and the next band", () => {
    // A half-pass must land ABOVE the full-pass level of the band the student
    // cleared and BELOW the full-pass level of the band they only half-passed.
    for (const [key, level] of Object.entries(GATE_PARTIAL_ENTRY)) {
      const idx = Number(key);
      expect(level).toBeGreaterThan(GATE_PASSED_ENTRY[idx]);
      expect(level).toBeLessThan(GATE_PASSED_ENTRY[idx + 1]);
    }
  });

  test("only defined where there is an in-between level to land on", () => {
    // Boundaries whose two gates sit on neighbouring levels must NOT appear.
    for (let idx = 0; idx <= 10; idx++) {
      const hasRoom = GATE_PASSED_ENTRY[idx + 1] - GATE_PASSED_ENTRY[idx] >= 2;
      expect(GATE_PARTIAL_ENTRY[idx] !== undefined).toBe(hasRoom);
    }
  });

  test("matches the agreed mapping", () => {
    expect(GATE_PARTIAL_ENTRY).toEqual({ 1: 4, 2: 6, 4: 10, 7: 14, 8: 16, 9: 20 });
  });
});

// ── isDomainPassed ───────────────────────────────────────────────────────────

describe("isDomainPassed", () => {
  test("untested domain (0 questions) never passes", () => {
    expect(isDomainPassed(0, 0)).toBe(false);
  });
  test("2-question domain needs BOTH correct", () => {
    expect(isDomainPassed(2, 2)).toBe(true);
    expect(isDomainPassed(1, 2)).toBe(false);
  });
  test("3-question domain passes on a majority (one slip forgiven)", () => {
    expect(isDomainPassed(2, 3)).toBe(true);
    expect(isDomainPassed(1, 3)).toBe(false);
  });
  test("6-question domain passes on a majority", () => {
    expect(isDomainPassed(4, 6)).toBe(true);
    expect(isDomainPassed(3, 6)).toBe(true);
    expect(isDomainPassed(2, 6)).toBe(false);
  });
});

// ── isGatePassed ─────────────────────────────────────────────────────────────

describe("isGatePassed", () => {
  test("requires BOTH domains of the gate to pass", () => {
    const both = tallies({ M004: [2, 2], M005: [2, 2] });
    expect(isGatePassed(2, both.domainCorrect, both.domainTotal)).toBe(true);

    const one = tallies({ M004: [2, 2], M005: [1, 2] });
    expect(isGatePassed(2, one.domainCorrect, one.domainTotal)).toBe(false);
  });
});

// ── resolveEntryLevel ────────────────────────────────────────────────────────

describe("resolveEntryLevel — Grade 3", () => {
  // Grade 3 window = G1, G2, G3 (domains M001 M002 / M003 M020 / M004 M005)
  const allCorrect = {
    M001: [2, 2], M002: [2, 2], M003: [2, 2], M020: [2, 2], M004: [2, 2], M005: [2, 2],
  } as Record<string, [number, number]>;

  test("perfect score → Level 5 (Multiplication, the expected Grade 3 start)", () => {
    const { domainCorrect, domainTotal } = tallies(allCorrect);
    expect(resolveEntryLevel(domainCorrect, domainTotal, 3)).toBe(5);
  });

  test("11/12 with the one miss on a Grade 3 topic → Level 4, not Level 3 (Weekly regression)", () => {
    const { domainCorrect, domainTotal } = tallies({ ...allCorrect, M005: [1, 2] });
    expect(resolveEntryLevel(domainCorrect, domainTotal, 3)).toBe(4);
  });

  test("both Grade 3 topics failed (Grade 2 still passed) → Level 3", () => {
    const { domainCorrect, domainTotal } = tallies({
      ...allCorrect, M004: [0, 2], M005: [0, 2],
    });
    expect(resolveEntryLevel(domainCorrect, domainTotal, 3)).toBe(3);
  });

  test("11/12 with the one miss on a Grade 1 topic → Level 5 (slip, not a gap, under the >=75% override)", () => {
    const { domainCorrect, domainTotal } = tallies({ ...allCorrect, M001: [1, 2] });
    expect(resolveEntryLevel(domainCorrect, domainTotal, 3)).toBe(5);
  });

  test("everything failed → grade floor (Level 1)", () => {
    const { domainCorrect, domainTotal } = tallies({
      M001: [0, 2], M002: [0, 2], M003: [0, 2], M020: [0, 2], M004: [0, 2], M005: [0, 2],
    });
    expect(resolveEntryLevel(domainCorrect, domainTotal, 3)).toBe(getGradeFloor(3));
  });
});

describe("resolveEntryLevel — partial passes at higher boundaries", () => {
  // Grade 9 window = G7, G8, G9 (M009 M010 / M032 M033 / M011 M034)
  test("Grade 9: passed Grades 7–8, half of Grade 9 → Level 14 (Solving equations)", () => {
    const { domainCorrect, domainTotal } = tallies({
      M009: [2, 2], M010: [2, 2], M032: [2, 2], M033: [2, 2], M011: [2, 2], M034: [1, 2],
    });
    expect(resolveEntryLevel(domainCorrect, domainTotal, 9)).toBe(14);
  });

  // Grade 10 window = G8, G9, G10 (M032 M033 / M011 M034 / M_GEO M013)
  test("Grade 10: passed Grades 8–9, half of Grade 10 → Level 16 (Working with data)", () => {
    const { domainCorrect, domainTotal } = tallies({
      M032: [2, 2], M033: [2, 2], M011: [2, 2], M034: [2, 2], M_GEO: [2, 2], M013: [1, 2],
    });
    expect(resolveEntryLevel(domainCorrect, domainTotal, 10)).toBe(16);
  });

  test("a full pass of the top band is unaffected by the partial rule", () => {
    // Grade 9, all three bands fully passed → full-pass entry (Level 15)
    const { domainCorrect, domainTotal } = tallies({
      M009: [2, 2], M010: [2, 2], M032: [2, 2], M033: [2, 2], M011: [2, 2], M034: [2, 2],
    });
    expect(resolveEntryLevel(domainCorrect, domainTotal, 9)).toBe(15);
  });
});
