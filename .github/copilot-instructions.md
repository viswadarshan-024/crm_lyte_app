This workspace contains a production-grade Java CRM system.

Workspace Rules:
- Respect existing layering: Action/Controller → Service → Repository.
- Controllers/Actions must never access repositories directly.
- Business data persistence and audit persistence must remain isolated.
- External API calls must not be performed inside database transactions.
- Prefer existing service patterns over introducing new abstractions.
- Changes must be minimal, localized, and consistent with current design.
- If a change could impact transactions or data consistency, call it out explicitly.

Do not suggest refactors or redesigns unless explicitly asked.
