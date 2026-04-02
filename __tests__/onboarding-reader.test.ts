import { describe, test, expect } from "vitest";
import { parseOnboardingJson } from "@/lib/onboarding-reader";

describe("parseOnboardingJson", () => {
  test("returns null when raw is null (no localStorage entry)", () => {
    expect(parseOnboardingJson(null)).toBeNull();
  });

  test("returns null when raw is empty string", () => {
    expect(parseOnboardingJson("")).toBeNull();
  });

  test("returns null on invalid JSON", () => {
    expect(parseOnboardingJson("{not json}")).toBeNull();
  });

  test("returns null when grade is missing", () => {
    expect(parseOnboardingJson(JSON.stringify({ name: "Alice" }))).toBeNull();
  });

  test("returns null when grade is 0 (below range)", () => {
    expect(parseOnboardingJson(JSON.stringify({ name: "Alice", grade: 0 }))).toBeNull();
  });

  test("returns null when grade is 13 (above range)", () => {
    expect(parseOnboardingJson(JSON.stringify({ name: "Alice", grade: 13 }))).toBeNull();
  });

  test("returns null when grade is a non-numeric string", () => {
    expect(parseOnboardingJson(JSON.stringify({ name: "Alice", grade: "abc" }))).toBeNull();
  });

  test("parses valid Grade 2 entry correctly", () => {
    const raw = JSON.stringify({ name: "Alice Smith", grade: "2" });
    expect(parseOnboardingJson(raw)).toEqual({ name: "Alice", grade: 2 });
  });

  test("parses numeric grade field (not just string)", () => {
    const raw = JSON.stringify({ name: "Bob", grade: 5 });
    expect(parseOnboardingJson(raw)).toEqual({ name: "Bob", grade: 5 });
  });

  test("uses first name only when full name provided", () => {
    const raw = JSON.stringify({ name: "Alice Mthembu", grade: "3" });
    expect(parseOnboardingJson(raw)).toEqual({ name: "Alice", grade: 3 });
  });

  test("falls back to 'Student' when name is absent", () => {
    const raw = JSON.stringify({ grade: "4" });
    expect(parseOnboardingJson(raw)).toEqual({ name: "Student", grade: 4 });
  });

  test("accepts Grade 1 (boundary)", () => {
    const raw = JSON.stringify({ name: "Sipho", grade: "1" });
    expect(parseOnboardingJson(raw)).toEqual({ name: "Sipho", grade: 1 });
  });

  test("accepts Grade 12 (boundary)", () => {
    const raw = JSON.stringify({ name: "Lerato", grade: "12" });
    expect(parseOnboardingJson(raw)).toEqual({ name: "Lerato", grade: 12 });
  });

  // ── REGRESSION: Bug #1 — Grade 2 student served Grade 7 content ──────────
  // Root cause: an old version of readOnboarding() returned { grade: 7 } when
  // onboardingData was absent. This test ensures the parser never invents a grade.
  test("REGRESSION: never invents a grade when data is absent", () => {
    expect(parseOnboardingJson(null)).toBeNull();
    expect(parseOnboardingJson("null")).toBeNull();
    expect(parseOnboardingJson("{}")).toBeNull();
  });
});
