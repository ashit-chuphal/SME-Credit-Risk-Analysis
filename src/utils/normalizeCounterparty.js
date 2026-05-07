function normalizeCounterpartyName(name) {
    if (!name) return 'Unknown';

    // Convert to lowercase and trim whitespace
    return String(name)
    .toLowerCase()
    
    // Convert dotted legal suffixes into normal words
    .replace(/\b([a-z])\.\s*([a-z])\.\s*([a-z])\.?\b/g, "$1$2$3")
    .replace(/\b([a-z])\.\s*([a-z])\.?\b/g, "$1$2")
    
    // Remove punctuation
    .replace(/[^a-z0-9\s]/g, " ")
    
    // Remove noisy reference words and numbers
    .replace(/\b(llc|ltd|fz|fze|fzco|co|company|inc|limited|dubai|uae)\b/g, "")
    .replace(/\b\d+\b/g, "")
    
    // Remove legal/entity/location suffixes
    .replace(/\b(payment|ref|reference|invoice|inv|txn|transaction)\b/g, "")
    
    // Normalize spaces
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
    normalizeCounterpartyName,
};