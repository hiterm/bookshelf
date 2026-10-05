import { describe, expect, test } from "vitest";
import { bookAuthorInput, reconcileAuthors } from "./bookAuthorInput";
const a = { id: "__pending__:a", name: "A" };
const b = { id: "__pending__:b", name: "B" };
const existing = [
  { id: "a", name: "A" },
  { id: "b", name: "B" },
];
describe("atomic author input", () => {
  test("splits and deduplicates existing IDs and exact new names", () => {
    expect(bookAuthorInput([a, a, existing[0], existing[0], b])).toEqual({
      authorIds: ["a"],
      newAuthorNames: ["A", "B"],
    });
  });
  test("reconciles all exact matches and removes duplicate selected IDs", () => {
    expect(reconcileAuthors([a, existing[0], b], [a, b], existing)).toEqual({
      authors: existing,
      names: ["A", "B"],
    });
  });
  test("preserves changed, removed and newly added inputs during refresh", () => {
    const edited = { ...a, name: "Edited" };
    const added = { id: "__pending__:c", name: "C" };
    expect(
      reconcileAuthors(
        [edited, added],
        [a, b],
        [...existing, { id: "c", name: "C" }],
      ),
    ).toEqual({ authors: [edited, added], names: [] });
  });
  test("does not match normalized or similar names", () => {
    expect(reconcileAuthors([a], [a], [{ id: "a", name: "a" }])).toEqual({
      authors: [a],
      names: [],
    });
  });
});
