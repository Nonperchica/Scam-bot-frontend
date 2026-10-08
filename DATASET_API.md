# Dataset API handoff

The Dataset page defaults to the real API. Example
approvals stay in React memory and reset on reload. Disable the example
checkbox to use the API (enable it only to preview example data). Missing endpoints show an error; there is no
automatic fallback to example data. No backend changes are included.

All endpoints use the existing dashboard Bearer token. The backend must
authorize writes, validate labels/messages, prevent duplicate approvals,
and own embedding creation. Never return embedding API keys to the browser.

## GET /api/dataset/candidates

Return all pending candidates as an array:

```json
[{"id":"candidate-id","message":"text","label":null,
  "reason":"low similarity and risk","similarity":48,
  "analysis":"analysis result","source":"LINE","category":"category",
  "occurrences":3}]
```

Similarity is 0-100 or null. Label is null, spam or ham. Combine repeated
messages before returning the queue. Candidates may come from low
similarity plus detected risk, uncertain analysis, or manual review.
The frontend displays these reasons; it does not run candidate selection.

## GET /api/dataset

Return all saved entries (counts currently derive from this complete list):

```json
[{"id":"entry-id","message":"approved text","label":"spam",
  "category":"category","source":"LINE","confirmed":true}]
```

## POST /api/dataset/candidates/{id}/approve

Request: `{"message":"edited text","label":"spam"}`.
Use the edited text to create an embedding compatible with the existing
scam_dataset vectors, then persist the dataset entry and mark the candidate
approved. Only return success after the database confirms the write:

```json
{"status":"saved","entry":{"id":"entry-id","message":"edited text",
 "label":"spam","category":"category","source":"LINE","confirmed":true}}
```

The UI processes selected items individually and keeps failed items in the
queue. A timeout can occur after a successful server write; make approval
idempotent by candidate ID and return the already saved entry on retry.
The current UI expects synchronous completion within 60 seconds. If jobs
are asynchronous, agree on job/status endpoints before connecting them.

## POST /api/dataset/candidates/{id}/skip

Request has the same shape; label may be null. Persist the review decision
without inserting a dataset vector, then return `{"status":"skipped"}`.

Review and redact personal information before approval. CSV export exports
the currently filtered saved entries, with spreadsheet formula prefixes
escaped. There is no CSV import workflow in this change.
