import { normalizeCounterpartyName } from "../src/utils/normalizeCounterparty";

test("normalizes legal suffixes and casing", () => {
  expect(normalizeCounterpartyName("Gulf Logistics FZ-LLC Dubai")).toBe(
    "gulf logistics"
  );
});

test("removes punctuation", () => {
  expect(normalizeCounterpartyName("ABC Trading L.L.C.")).toBe("abc trading");
});