# SME Credit Risk Analysis

A Node.js + Express API that analyzes SME bank statement CSV files and generates a counterparty concentration risk report.

The service processes inflow and outflow transactions, normalizes noisy counterparty names, detects concentration risks, and provides a simple risk recommendation.

---

# Features

- Upload SME bank statement CSV files
- Analyze top inflow and outflow counterparties
- Normalize and deduplicate noisy counterparty names
- Detect concentration risk flags
- Monthly inflow concentration trend analysis
- Risk scoring system (`0 = diversified`, `100 = high concentration risk`)
- Recommendation engine
- Swagger API documentation
- Unit test coverage

---

# Tech Stack

- Node.js
- Express.js
- Multer
- CSV Parser
- Jest
- Swagger UI

---

# API Endpoint

## POST `/analyse`

Upload a CSV bank statement file and receive a concentration risk analysis report.

---

# Example Output

```json
{
  "concentration_score": 50,
  "recommendation": {
    "decision": "investigate_concentration"
  }
}
```

---

# Running Locally

## Prerequisites

Make sure Node.js is installed on your machine.

Check installation:

```bash
node -v
npm -v
```

---

# Install Dependencies

```bash
npm ci
```

---

# Run in Development Mode

```bash
npm run dev
```

---

# Run in Production Mode

```bash
npm run main
```

---

# Run Test Cases

```bash
npm run test
```

---

# Swagger API Documentation

After starting the server, open:

```text
http://localhost:3000/api-docs
```

You can directly upload a CSV file and test the API from Swagger UI.

---

# Project Structure

```text
src/
 ├── index.js
 ├── services/
 ├── utils/
tests/
```

- `index.js` → API routes and Swagger setup
- `services/` → core business logic
- `utils/` → normalization, fuzzy matching, scoring
- `tests/` → unit tests

---

# Design Decisions & Tradeoffs

- Used rule-based scoring instead of ML to keep the system explainable and easier to review.
- Used normalization + fuzzy matching instead of hardcoded aliases for better scalability across datasets.
- Focused specifically on concentration risk instead of building a full credit underwriting engine.

---

# AI Usage

AI was used as a pair-programming assistant for:
- project structuring
- Swagger setup
- debugging Express/multer issues
- improving normalization logic
- creating test cases
- validating output against requirements

AI initially suggested a reversed scoring model where `100 = good`, but the requirement expected `100 = high concentration risk`. This was corrected after validating the assessment requirements manually.

AI also missed some counterparty deduplication edge cases initially, which were identified by reviewing the generated JSON output and refining normalization/fuzzy matching logic.

---

# Future Improvements

- Better entity resolution and fuzzy matching
- Docker support
- Improved audit trail for merged counterparties
- More edge-case and performance tests
- Better CSV validation and error handling

---

# Author

Ashit Chuphal