const { normalizeCounterpartyName } = require('../utils/normalizeCounterparty');
const { deduplicateCounterparty } = require('../utils/fuzzyDedup');

const { calculateConcentrationScore, getRecommendation } = require('../utils/scoring')

function analyzeBankStatement(rows) {
    // Step 1: Clean and normalize rows
    const cleanedRows = cleanRows(rows);

    if (!cleanedRows.length) {
        throw new Error("No valid transactions found in CSV.");
    }

    // Step 2: Separate inflows and outflows
    const inflows = cleanedRows.filter((row) => row.amount_aed > 0);

    const outflows = cleanedRows.filter((row) => row.amount_aed < 0);

    // Step 3: Generate counterparty reports
    const topInflowCounterparties = buildCounterpartyReport(inflows).slice(0, 10);

    const topOutflowCounterparties = buildCounterpartyReport(outflows).slice(0, 10);

    // Step 4: Calculate concentration metrics
    const top1InflowPercentage = topInflowCounterparties[0]?.percentage_of_total || 0;

    const top3InflowPercentage = topInflowCounterparties
    .slice(0, 3)
    .reduce(
      (sum, counterparty) =>
        sum + counterparty.percentage_of_total,
      0
    );

    const topOutflow = topOutflowCounterparties[0];

    const top1OutflowPercentage = topOutflow?.percentage_of_total || 0;

    // Step 5: Build concentration flags
    const hasSingleInflowFlag = top1InflowPercentage > 40;

    const hasHighOutflowFlag = topOutflow && top1OutflowPercentage > 30 && !isSalaryOrRent(topOutflow.normalized_name);

    const hasIntercompanyFlag = hasIntercompanyFlow(topInflowCounterparties, topOutflowCounterparties);

    // Step 6: Analyze inflow concentration trend over time
    const inflowConcentrationTrend = calculateInflowConcentrationTrend(inflows);

    const hasIncreasingInflowTrend = inflowConcentrationTrend.trend === "increasing";

    // Step 7: Create concentration flags array
    const concentrationFlags = buildConcentrationFlags({
        top1InflowPercentage,
        top3InflowPercentage,
        topOutflow,
        hasSingleInflowFlag,
        hasHighOutflowFlag,
        hasIntercompanyFlag,
        inflowConcentrationTrend
    });

    // Step 8: Calculate concentration score
    const concentrationScore = calculateConcentrationScore({
        top1InflowPercentage,
        top3InflowPercentage,
        hasHighOutflowFlag,
        hasIntercompanyFlag,
        hasIncreasingInflowTrend,
    });

    // Step 9: Generate recommendation
    const recommendation = getRecommendation(concentrationScore, concentrationFlags);

    // Step 10: Final response object
    return {
        top_inflow_counterparties: topInflowCounterparties,
        top_outflow_counterparties: topOutflowCounterparties,
        concentration_flags: concentrationFlags,
        inflow_concentration_trend: inflowConcentrationTrend,
        concentration_score: concentrationScore,
        recommendation: recommendation
  };
}

function cleanRows(rows) {
    const normalizedNames = [];

    return rows.map((row) => {
        // Normalize the counterparty name and handle missing values
        const rawName = row.counterparty_raw || "";
        const normalizedName = normalizeCounterpartyName(rawName);

        // Deduplicate the normalized name against previously seen names
        const dedupedName = deduplicateCounterparty(normalizedName, normalizedNames);

        if (!normalizedNames.includes(dedupedName)) {
            normalizedNames.push(dedupedName);
        }

        // Convert amount to number and handle missing or invalid values
        const amount = Number(row.amount);
        const currency = String(row.currency || "AED").toUpperCase();

        // Convert amount to AED if its USD and valid, otherwise keep original amount
        const amountAed = currency === "USD" && amount > 0 ? amount * 3.67: amount;

        // Return a cleaned and normalized transaction object
        return {
            date: new Date(row.date),
            description: String(row.description || "").toLocaleLowerCase(),
            amount,
            amount_aed: amountAed,
            currency,
            balance_after: Number(row.balance_after),
            counterpart_raw: rawName,
            normalized_counterparty: dedupedName,
            type: String(row.type || "").toLocaleLowerCase()
        };
    }).filter( // Keep only rows with valid date, amount, and normalized counterparty
        (row) =>
            !isNaN(row.date.getTime()) &&
            !isNaN(row.amount_aed) &&
            row.normalized_counterparty
    ).sort((a, b) => a.date - b.date); // Sort transactions by date ascending
}

// Build a counterparty concentration report from the cleaned transaction data
function buildCounterpartyReport(rows) {

    // Calculate total transaction volume for concentration scoring
    const totalVolume = rows.reduce((sum, row) => sum + Math.abs(row.amount_aed),0);

    // Group transactions by normalized counterparty name
    const grouped = {};

    // Iterate through each transaction and aggregate data by counterparty
    rows.forEach((row) => {

        // Use the normalized counterparty name as the key for grouping
        const name = row.normalized_counterparty;

        // If this is the first time we see this counterparty, initialize its group data
        if (!grouped[name]) {
            grouped[name] = {
                normalized_name: name,
                total_volume_aed: 0,
                count: 0,
                first_date: row.date,
                last_date: row.date
            };
        }
        
        // Update the total transaction volume, count, and date range for this counterparty
        grouped[name].total_volume_aed += Math.abs(row.amount_aed);
        grouped[name].count += 1;

        if (row.date < grouped[name].first_date) {
            grouped[name].first_date = row.date;
        }

        if (row.date > grouped[name].last_date) {
            grouped[name].last_date = row.date;
        }
    });

    // Convert grouped counterparties object into array format,
    // calculate percentage contribution of each counterparty,
    // format first/last transaction dates,
    // and sort counterparties by highest transaction volume.
    return Object.values(grouped)
    .map((counterparty) => ({
        normalized_name: counterparty.normalized_name,
        total_volume_aed: round(counterparty.total_volume_aed),
        percentage_of_total: round(totalVolume === 0 ? 0 : (counterparty.total_volume_aed / totalVolume) * 100),
        count: counterparty.count,
        first_date: counterparty.first_date.toISOString().slice(0, 10),
        last_date: counterparty.last_date.toISOString().slice(0, 10)
    })).sort((a, b) => b.total_volume_aed - a.total_volume_aed);
}


function calculateInflowConcentrationTrend(inflows) {

    // Return default response if no inflow data is present
    if (!inflows.length) {
        return {
            trend: "no_inflows",
            first_period_top1_percentage: 0,
            last_period_top1_percentage: 0,
            change_percentage_concentration: [],
            monthly_top1_concentration: []
        };
    }

    // Group inflows month-wise
    const monthlyGroups = {}

    inflows.forEach((row) => {
        const month = row.date.toISOString().slice(0, 7);

        if (!monthlyGroups[month]) {
            monthlyGroups[month] = [];
        }

        monthlyGroups[month].push(row);
    });

    // Calculate top counterparty concentration for each month
    const monthlyTop1Concentration = Object.entries(monthlyGroups)
        .map(([month, rows]) => {
            const report = buildCounterpartyReport(rows);
            const top1Percentage = report[0]?.percentage_of_total || 0;

            return {
                month,
                top1_counterparty: report[0]?.normalized_name || "unknown",
                top1_percentage_of_inflows: round(top1Percentage)
            };
        }).sort((a, b) => a.month.localeCompare(b.month));
    
    // Get first and last month data for trend comparison
    const firstPeriod = monthlyTop1Concentration[0];
    const lastPeriod = monthlyTop1Concentration[monthlyTop1Concentration.length - 1];
    
    const firstPercentage = firstPeriod?.top1_percentage_of_inflows || 0;
    const lastPercentage = lastPeriod?.top1_percentage_of_inflows || 0;

    // Difference in concentration percentage
    const change = round(lastPercentage - firstPercentage)

    let trend = "stable";

    // Decide trend based on percentage change
    if (change > 10) {
        trend = "increasing";
    } else if (change < -10) {
        trend = "decreasing";
    }

    return {
        trend,
        first_period_top1_percentage: round(firstPercentage),
        last_period_top1_percentage: round(lastPercentage),
        change_percentage_points: change,
        monthly_top1_concentration: monthlyTop1Concentration
    };
}

function buildConcentrationFlags({
    top1InflowPercentage,
    top3InflowPercentage,
    topOutflow,
    topOutflowPercentage,
    hasSingleInflowFlag,
    hasSingleOutflowFlag,
    hasIntercompanyFlag,
    hasHighOutflowFlag,
    inflowConcentrationTrend,
}) {

    const flags = [];

    // Flag if one inflow counterparty contributes too much
    if (hasSingleInflowFlag) {
        flags.push("Single inflow counterparty exceeds 40% of total inflows")
    }

    // Flag if top 3 inflow counterparties are highly concentrated
    if (top3InflowPercentage > 70) {
        flags.push("Top 3 inflow counterparties exceed 70% of total inflows.")
    }

    // Flag if one outflow counterparty is too high, excluding salary/rent
    if (hasHighOutflowFlag) {
        flags.push(
            `Single outflow counterparty '${topOutflow.normalized_name}' exceeds 30% excluding salary/rent.`
        )
    }

    // Flag if inflow concentration is increasing over time
    if (inflowConcentrationTrend.trend == "increasing") {
        flags.push(
            `Inflow concentration increased by ${inflowConcentrationTrend.change_percentage_points} percentage points over period.`
        )
    }

    // Flag suspected circular/intercompany flow
    if(hasIntercompanyFlag) {
        flags.push("Suspected intercompany or cicular flow detected");
    }

    return flags;
}

function hasIntercompanyFlow(topInflowCounterparties, topOutflowCounterparties) {
    // Store all top inflow counterparty names
    const inflowNames = new Set(
        topInflowCounterparties.map((counterparty) => counterparty.normalized_name)
    );

    // Store all top outflow counterparty names
    const outflowNames = new Set(
        topOutflowCounterparties.map((counterparty) => counterparty.normalized_name)
    );

    // Check if same counterparty exists in both inflows and outflows
    for (const name of inflowNames) {
        if (outflowNames.has(name)) {
            return true;
        }
    }

    return false;
}

// Checks whether counterparty name is related to salary or rent
function isSalaryOrRent(name) {
    const keywords = ["salary", "payroll", "rent", "lease"];
    return keywords.some((keyword) => name.includes(keyword))
}

// Rounding the Number to fixed 2 decimed places
function round(value) {
  return Number((value || 0).toFixed(2));
}

module.exports = {
    analyzeBankStatement,
    calculateInflowConcentrationTrend,
};