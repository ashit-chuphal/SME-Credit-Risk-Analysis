function normalizeCounterpartyName(name) {
    if (!name) return 'Unknown';

    // Convert to lowercase and trim whitespace
    return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // Remove punctuation
    .replace(/\b(llc|ltd|fz|fze|fzco|co|company|inc|limited|dubai|uae)\b/g, "") // Remove common noisy business/legal words
    .replace(/\b(payment|ref|reference|invoice|inv|txn|transaction)\b/g, "") // Remove payment reference patterns
    .replace(/\b\d+\b/g, "") // Remove standalone numbers
    .replace(/\s+/g, " ")  // Normalize spaces
    .trim();
}

module.exports = {
    normalizeCounterpartyName,
};