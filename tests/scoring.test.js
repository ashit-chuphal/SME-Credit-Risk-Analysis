import { calculateConcentrationScore } from "../src/utils/scoring";

test("score decreases for high top1 inflow concentration", () => {
  const score = calculateConcentrationScore({
    top1InflowPct: 50,
    top3InflowPct: 60,
    hasSingleInflowFlag: true,
    hasHighOutflowFlag: false,
    hasIntercompanyFlag: false,
    hasIncreasingInflowTrend: false
  });

  expect(score).toBeLessThan(100);
});

test("score stays high for diversified counterparties", () => {
  const score = calculateConcentrationScore({
    top1InflowPct: 20,
    top3InflowPct: 45,
    hasSingleInflowFlag: false,
    hasHighOutflowFlag: false,
    hasIntercompanyFlag: false,
    hasIncreasingInflowTrend: false
  });

  expect(score).toBe(100);
});

test("score decreases when inflow concentration trend is increasing", () => {
  const score = calculateConcentrationScore({
    top1InflowPct: 20,
    top3InflowPct: 45,
    hasSingleInflowFlag: false,
    hasHighOutflowFlag: false,
    hasIntercompanyFlag: false,
    hasIncreasingInflowTrend: true
  });

  expect(score).toBe(90);
});