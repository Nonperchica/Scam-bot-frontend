# Dataset setup

The dashboard API reads the existing scam_dataset table. In this local
checkout, 3,971 records were read successfully. It never returns vectors.

One database setup step is required for approvals: run dataset_review.sql
in the same Supabase project's SQL Editor. This adds dataset_reviews and
the atomic review_dataset_candidate function. It does not modify old
vectors. The service_role key is required for write endpoints; the existing
dashboard token authenticates the caller. Only service_role can execute
the new RPC or access the review ledger.

Restart the dashboard API after changes (stop its terminal with Ctrl+C,
then run npm run backend from the frontend root). Keep the LINE bot on
8001; this dashboard API uses 8000. Vite forwards /api to 8000.

The review queue currently uses existing detection_logs with risk_found
or uncertain outcomes. Reviewed log IDs are excluded. Similarity is shown
only when actually recorded. The bot currently does not persist it, so
the proposed 60-percent novelty rule is not enabled. Each log is a distinct
candidate; identical texts are deduplicated at approval. No bot code is
changed for this integration.

Approval uses the edited message, the chosen spam/ham label and a Gemini
embedding (gemini-embedding-001, retrieval_document, 768 dimensions).
Configure GEMINI_API_KEY in backend/.env when deploying. For this local
two-repository layout only, the API can read that one key from the sibling
bot's .env when the dashboard key is absent. Secrets stay server-side.

The database function inserts the vector and records the review in one
transaction. Repeating an approval returns the saved entry. A conflicting
label for an existing identical text is rejected. Skipping only records
the review. Mocked tests cover authorization, validation and retry paths;
real database writes and real embeddings have not been exercised.
