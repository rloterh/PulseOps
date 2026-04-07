# Sprint 11 Rate Limit Matrix

| Area | Bucket | Limit | Window | Notes |
| --- | --- | --- | --- | --- |
| Analytics CSV export | `analytics:export` | 10 | 1 hour | Protects export abuse and repeated heavy queries. |
| AI analytics overview | `ai:analytics-overview` | 20 | 15 minutes | Covers executive summaries and late-job signals. |
| AI branch comparison | `ai:analytics-branches` | 20 | 15 minutes | Covers branch synthesis requests. |
| AI feedback submit | `ai:feedback` | 30 | 15 minutes | Prevents feedback spam without blocking normal use. |

These values are the Sprint 11 starting posture. Re-tune them after real traffic and staging QA.
