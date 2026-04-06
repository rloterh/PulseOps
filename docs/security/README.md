# Security Notes

Sprint 0 security coverage includes:

- explicit client and server environment entry points
- server-only boundaries for privileged Supabase clients
- baseline response security headers
- proxy-based session refresh scaffolding

Upcoming security work:

- request-context authorization helpers
- role and permission matrix
- row-level security migrations and tests
- storage and upload hardening
- audit log coverage
