function normalizeCounterpartyName(name) {
    if (!name) return 'Unknown';

    // Convert to lowercase and trim whitespace
    return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(llc|ltd|fz|fze|fzco|co|company|inc|limited|dubai|uae|llc)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default {
    normalizeCounterpartyName,
};