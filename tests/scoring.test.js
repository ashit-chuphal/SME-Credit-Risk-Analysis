// tests/scoring.test.js

const {
  calculateConcentrationScore,
  getRecommendation
} = require("../src/utils/scoring");

describe("calculateConcentrationScore", () => {

  test("returns low risk score for diversified inflows", () => {

    const score = calculateConcentrationScore({
      top1InflowPercentage: 20,
      top3InflowPercentage: 45,
      hasHighOutflowFlag: false,
      hasIntercompanyFlag: false,
      hasIncreasingInflowTrend: false
    });

    expect(score).toBe(0);
  });

  test("adds risk for high single inflow concentration", () => {

    const score = calculateConcentrationScore({
      top1InflowPercentage: 69,
      top3InflowPercentage: 80,
      hasHighOutflowFlag: false,
      hasIntercompanyFlag: false,
      hasIncreasingInflowTrend: false
    });

    expect(score).toBe(50);
  });

  test("caps score at 100", () => {

    const score = calculateConcentrationScore({
      top1InflowPercentage: 95,
      top3InflowPercentage: 99,
      hasHighOutflowFlag: true,
      hasIntercompanyFlag: true,
      hasIncreasingInflowTrend: true
    });

    expect(score).toBe(100);
  });

});

describe("getRecommendation", () => {

  test("returns approve_for_committee for low score", () => {

    const result = getRecommendation(10, []);

    expect(result.decision)
      .toBe("approve_for_committee");
  });

  test("returns investigate_concentration for medium risk", () => {

    const result = getRecommendation(50, [
      "Single inflow concentration"
    ]);

    expect(result.decision)
      .toBe("investigate_concentration");
  });

  test("returns decline for very high score", () => {

    const result = getRecommendation(90, [
      "Very high concentration"
    ]);

    expect(result.decision)
      .toBe("decline");
  });

});