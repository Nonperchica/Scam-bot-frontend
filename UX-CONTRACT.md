# Mini App behavior contract

Visual contract: DESIGN.md. Scope: src/mini, Thai, mobile LINE LIFF.

## Canonical UI Map
| Capability | Owner | Contract |
| --- | --- | --- |
| Navigation | MiniLayout, useMiniSession.miniHref | 4 tabs; preserve case context except home |
| Authentication | miniLiff, useMiniSession, MiniSessionNotice | LINE login; never bypass ownership |
| Result | MiniCaseDetail | Render original result, all advice, source and disclaimer |
| Search | MiniHistory | Local title search and status filters; no remote search |
| Learning | MiniLessons | topic URL selects article; no topic displays catalog |
| Profile | MiniSettings | Real LINE profile or honest fallback |
| CRUD | deleteFlow, useMiniSession.deleteHistory | Live only; inline confirmation, duplicate prevention, recoverable errors |
| Scrollbar | mini.css | Visible thin scrollbar; document scroll, fixed safe-area navigation |
| Feedback | MiniSessionNotice | Loading/error/login states and retry; no dummy results |

## Verification
Run npm run test:mini, npm run build, npm run lint.
Use demo routes for visual browser checks without accessing real user data.
Test history filters/no results, topic open/close, profile disclosures and mobile overflow.
Production login and destructive deletion require real LINE verification separately.
