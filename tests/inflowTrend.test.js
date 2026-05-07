import { calculateInflowConcentrationTrend } from "../src/services/analysisService";

test("detects increasing inflow concentration trend", () => {
  const inflows = [
    {
      date: new Date("2025-01-01"),
      amount_aed: 100,
      normalized_counterparty: "a"
    },
    {
      date: new Date("2025-01-02"),
      amount_aed: 100,
      normalized_counterparty: "b"
    },
    {
      date: new Date("2025-02-01"),
      amount_aed: 180,
      normalized_counterparty: "a"
    },
    {
      date: new Date("2025-02-02"),
      amount_aed: 20,
      normalized_counterparty: "b"
    }
  ];

  const trend = calculateInflowConcentrationTrend(inflows);

  expect(trend.trend).toBe("increasing");
  expect(trend.change_pct_points).toBe(40);
});