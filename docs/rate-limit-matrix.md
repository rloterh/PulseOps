# Sprint 11 Rate Limit Matrix

| Area | Bucket | Limit | Window | Notes |
| --- | --- | --- | --- | --- |
| Sign in | `auth:sign-in` | 8 | 15 minutes | Limits password attempts per email plus request fingerprint. |
| Sign up | `auth:sign-up` | 5 | 30 minutes | Limits account creation attempts per email plus request fingerprint. |
| Analytics overview API | `analytics:overview` | 60 | 15 minutes | Protects JSON overview reads. |
| Analytics branch API | `analytics:branches` | 60 | 15 minutes | Protects branch comparison reads. |
| Analytics SLA API | `analytics:sla` | 60 | 15 minutes | Protects SLA metrics reads. |
| Analytics CSV export | `analytics:export` | 10 | 1 hour | Protects export abuse and repeated heavy queries. |
| AI analytics overview | `ai:analytics-overview` | 20 | 15 minutes | Covers executive summaries and late-job signals. |
| AI branch comparison | `ai:analytics-branches` | 20 | 15 minutes | Covers branch synthesis requests. |
| AI feedback submit | `ai:feedback` | 30 | 15 minutes | Prevents feedback spam without blocking normal use. |
| Billing checkout / plan change | `billing:checkout` | 10 | 15 minutes | Protects Stripe checkout and plan-change control paths. |
| Billing portal launch | `billing:portal` | 20 | 15 minutes | Prevents repeated portal session creation. |
| Subscription renewal controls | `billing:subscription-renewal` | 12 | 15 minutes | Protects cancel/resume transitions. |
| Incident create | `incident:create` | 30 | 10 minutes | Prevents incident intake spam from a single actor/fingerprint. |
| Incident edit | `incident:edit` | 60 | 10 minutes | Allows normal editing while limiting burst mutations. |
| Incident assignment | `incident:assignment` | 60 | 10 minutes | Protects assignment churn. |
| Incident status update | `incident:status` | 60 | 10 minutes | Protects rapid status churn and notification fan-out. |
| Incident escalation | `incident:escalation` | 30 | 10 minutes | Protects high-signal escalation notifications. |
| Incident escalation acknowledge | `incident:escalation-ack` | 60 | 10 minutes | Protects acknowledgement churn. |
| Bulk incident status | `incident:bulk-status` | 20 | 10 minutes | Limits high-impact list actions. |
| Job assignment | `job:assignment` | 60 | 10 minutes | Protects assignment churn and watcher fan-out. |
| Job status update | `job:status` | 60 | 10 minutes | Protects timeline and notification churn. |
| Bulk job status | `job:bulk-status` | 20 | 10 minutes | Limits high-impact list actions. |
| Task assignment | `task:assignment` | 60 | 10 minutes | Protects assignment churn and watcher fan-out. |
| Task status update | `task:status` | 60 | 10 minutes | Protects timeline and notification churn. |
| Collaboration comments | `collaboration:comment` | 60 | 10 minutes | Protects comment, note, mention, watcher, and notification fan-out. |
| Record watcher updates | `collaboration:watch` | 80 | 10 minutes | Protects watch/unwatch/mute churn. |
| Comment delete | `collaboration:delete-comment` | 30 | 10 minutes | Protects destructive comment operations. |
| Saved view create | `list-view:create` | 40 | 15 minutes | Protects saved-view persistence and entitlement checks. |
| Saved view delete | `list-view:delete` | 40 | 15 minutes | Protects saved-view mutation churn. |
| Notification mutations | `notification:mutation` | 120 | 10 minutes | Protects read/archive/open notification bursts. |

These values are the Sprint 11 starting posture. Re-tune them after real traffic and staging QA.
