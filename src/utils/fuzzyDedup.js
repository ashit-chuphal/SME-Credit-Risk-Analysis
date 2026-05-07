// Fuzzy deduplication utility for counterparty names
function similarity(a, b) {
    // Handle null or undefined values
    a = a || "";
    b = b || "";

    // if statement to check if both strings are empty
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    // If the longer string is empty, both are empty, so they are identical
    if (longer.length === 0) return 1.0;

    // Calculate the Levenshtein distance and return the similarity score
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Deduplicate a counterparty name against a list of existing names
function deduplicateCounterparty(name, existingNames, threshold = 0.8) {
  for (const existing of existingNames) {
    const nameWords = name.split(" ");
    const existingWords = existing.split(" ");

    const firstWordMatches = nameWords[0] === existingWords[0];

    const abbreviationMatch =
      firstWordMatches &&
      nameWords[1] &&
      existingWords[1] &&
      existingWords[1].startsWith(nameWords[1]);

    if (
      similarity(name, existing) >= threshold ||
      abbreviationMatch
    ) {
      return existing;
    }
  }

  return name;
}

module.exports = {
    deduplicateCounterparty 
};