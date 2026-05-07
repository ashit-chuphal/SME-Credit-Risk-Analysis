const {
  normalizeCounterpartyName
} = require("../src/utils/normalizeCounterparty");

describe("normalizeCounterpartyName", () => {

  test("removes punctuation", () => {
    expect(
      normalizeCounterpartyName("ABC Trading L.L.C.")
    ).toBe("abc trading");
  });

  test("removes legal entity suffixes", () => {
    expect(
      normalizeCounterpartyName("Aramex Emirates LLC")
    ).toBe("aramex emirates");
  });

  test("removes payment references", () => {
    expect(
      normalizeCounterpartyName("Aramex EM Payment Ref 4421")
    ).toBe("aramex em");
  });

  test("removes invoice numbers", () => {
    expect(
      normalizeCounterpartyName("Transguard Inv 99881")
    ).toBe("transguard");
  });

  test("removes standalone numbers", () => {
    expect(
      normalizeCounterpartyName("ABC Logistics 12345")
    ).toBe("abc logistics");
  });

  test("normalizes extra spaces", () => {
    expect(
      normalizeCounterpartyName("  ABC     Trading   LLC ")
    ).toBe("abc trading");
  });

  test("returns unknown for empty values", () => {
    expect(
      normalizeCounterpartyName("")
    ).toBe("Unknown");
  });
});