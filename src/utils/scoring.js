function calculateConcentrationScore({
    top1InflowPercentage,
    top3InflowPercentage,
    hasSingleInflowFlag,
    hasHighOutflowFlag,
    hasIntercompanyFlag,
    hasIncreasingInflowTrendFlag
}) {
    // total score is 0, we will add points based on the severity of the concentration risk factors
    let score = 0;
    
    // Assessment rule:
    // 0 = well diversified, 100 = decline / highly concentrated

    // Heavy dependency on one inflow counterparty
    if (top1InflowPercentage > 70) score += 40;
    if (top1InflowPercentage > 40) score += 30;
    
    // Top 3 inflow concentration
    if (top3InflowPercentage > 80) score += 25;
    else if (top3InflowPercentage > 70)score += 20;

    // Outflow concentration excluding salary/rent
    if (hasHighOutflowFlag) score += 15;
    
    // Suspected intercompany/circular flows
    if (hasIntercompanyFlag) score += 15;
    
    // Concentration getting worse over time
    if (hasIncreasingInflowTrendFlag) score += 10;

     return Math.max(0, Math.min(100, Math.round(score)));
}

function getRecommendation(score, flags) {
    // based on the score, we can provide a recommendation for credit approval

    // if the score is below 40, we recommend declining the credit application due to high concentration risk
    if (score >= 75) {
        return {
            decision: "decline",
            justification: "Counterparty concentration is very high, creating elevated repayment dependency risk."
        };
    }


    // if the score is between 40 and 70, we recommend further investigation to understand the nature of the concentration and potential mitigation strategies
    if (score >= 30 || flags.length > 0) {
        return {
            decision: "investigate_concentration",
            justification: "Counterparty concentration requires further review before credit approval."
        };
    }

    return {
        decision: "approve_for_committee",
        justification: "Counterparty inflows appear sufficiently diversified for committee review."
    };
}

module.exports = {
    calculateConcentrationScore,
    getRecommendation
};