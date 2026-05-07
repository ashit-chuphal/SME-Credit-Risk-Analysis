// tests/inflowTrend.test.js

const {
  calculateInflowConcentrationTrend
} = require("../src/services/smeRiskAnalysisService");

describe("calculateInflowConcentrationTrend", () => {

  test("returns stable trend when concentration change is small", () => {

    const inflows = [
      {
        date: new Date("2025-01-01"),
        amount_aed: 1000,
        normalized_counterparty: "aramex emirates"
      },
      {
        date: new Date("2025-01-15"),
        amount_aed: 500,
        normalized_counterparty: "transguard"
      },
      {
        date: new Date("2025-02-01"),
        amount_aed: 1200,
        normalized_counterparty: "aramex emirates"
      },
      {
        date: new Date("2025-02-15"),
        amount_aed: 600,
        normalized_counterparty: "transguard"
      }
    ];

    const result =
      calculateInflowConcentrationTrend(inflows);

    expect(result.trend).toBe("stable");
  });

  test("returns increasing trend when concentration rises significantly", () => {

    const inflows = [
      {
        date: new Date("2025-01-01"),
        amount_aed: 1000,
        normalized_counterparty: "aramex emirates"
      },
      {
        date: new Date("2025-01-15"),
        amount_aed: 1000,
        normalized_counterparty: "transguard"
      },

      {
        date: new Date("2025-02-01"),
        amount_aed: 5000,
        normalized_counterparty: "aramex emirates"
      },
      {
        date: new Date("2025-02-15"),
        amount_aed: 200,
        normalized_counterparty: "transguard"
      }
    ];

    const result =
      calculateInflowConcentrationTrend(inflows);

    expect(result.trend).toBe("increasing");
  });

  test("returns decreasing trend when concentration reduces significantly", () => {

    const inflows = [
      {
        date: new Date("2025-01-01"),
        amount_aed: 5000,
        normalized_counterparty: "aramex emirates"
      },
      {
        date: new Date("2025-01-15"),
        amount_aed: 200,
        normalized_counterparty: "transguard"
      },

      {
        date: new Date("2025-02-01"),
        amount_aed: 1000,
        normalized_counterparty: "aramex emirates"
      },
      {
        date: new Date("2025-02-15"),
        amount_aed: 1000,
        normalized_counterparty: "transguard"
      }
    ];

    const result =
      calculateInflowConcentrationTrend(inflows);

    expect(result.trend).toBe("decreasing");
  });

  test("returns no_inflows when inflow list is empty", () => {

    const result =
      calculateInflowConcentrationTrend([]);

    expect(result.trend).toBe("no_inflows");
  });

});