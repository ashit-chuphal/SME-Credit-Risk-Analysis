function calculateConcentrationScore({
    top1InflowPercentage,
    top3InflowPercentage,
    hasSingleInflowFlag,
    hasHighOutflowFlag,
    hasIntercompanyFlag,
    hasIncreasingInflowTrendFlag
}) {
    // total score is 100, we will deduct points based on the severity of the concentration risk factors
    let score = 100;
    
    // deduct points based on the percentage of inflows concentrated in the top 1, 3, and 10 sources
    if (top1InflowPercentage > 40) score -= 20;
    if (top3InflowPercentage > 70) score -= 20;
    if (hasSingleInflowFlag) score -= 10;
    if (hasHighOutflowFlag) score -= 10;
    if (hasIntercompanyFlag) score -= 10;
    if (hasIncreasingInflowTrendFlag) score -= 10;

    return Math.max(0, Math.min(1000, score));
}

function getRecommendation(score, flags) {
    // based on the score, we can provide a recommendation for credit approval

    // if the score is below 40, we recommend declining the credit application due to high concentration risk
    if (score < 40) {
        return {
            decision: "decline",
            justification: "High counterparty concentration creates elevated repayment dependency risk, which can lead to cash flow issues and potential default."
        };
    }


    // if the score is between 40 and 70, we recommend further investigation to understand the nature of the concentration and potential mitigation strategies
    if (score < 70 || flags.length > 0) {
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