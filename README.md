# HudumaGuide TZ

HudumaGuide TZ is a mobile-first Tanzanian civic-tech MVP built with Expo React Native and TypeScript.

Tagline: **Huduma za Serikali na Biashara kwa urahisi.**

Important trust notice:

> This is an independent guide. It is not an official government platform. Always confirm final requirements, fees, and procedures through official government channels.

## MVP Scope

This first version focuses on five high-value features:

1. Government service search
2. Step-by-step service guides
3. Saved checklists
4. BiasharaStart business setup wizard
5. Reminders

The current upgrade branch moves the app to Expo SDK 56 readiness and adds stronger trust, privacy, sync, release, and testing foundations. It includes a local-first document metadata vault, private Supabase Storage upload wiring, preview/download actions, file replacement/deletion flows, camera capture, biometric-lock preference foundation, OTA readiness, seed-data linting, RLS verification scripts, Maestro smoke flows, and CI gates.

## Tech Stack

- Expo React Native
- TypeScript
- Expo Router
- Expo Updates
- Zustand
- React Hook Form + Zod
- Supabase-ready auth/database/storage layer
- AsyncStorage persistence for offline-friendly saved guides, checklists, reminders, and business plans
- Local-first document metadata vault
- Safe local Msaidizi assistant using approved guide content only
- BiasharaStart compliance reminders and safe cost-planning buckets
- Scored bilingual search with low-friction suggestion chips
- Shareable service readiness checklists
- Reminder status dashboard for overdue, today, and upcoming tasks
- Admin content-ops foundations for categories, guides, verification status, review notes, and outdated-info reports
- BiasharaStart v1 profile editing, roadmap notes, cost estimates, exports, structure comparison, and referral placeholder safety copy
- Offline guide cache, low-data mode, pending sync retry queue, and conflict-aware local/remote merge behavior
- Hardened local notifications with pre-deadline alerts, repeat-aware scheduling, quiet hours, and notification education settings
- Privacy-safe analytics for searches, no-result searches, saved guides, wizard drop-off, reminders, outdated reports, language, and voluntary region/city
- Msaidizi v1 retrieval from published guide content with source citations, open-guide actions, safe fallback, admin exclusion controls, and audit logs without raw questions
- Beta readiness checklist and accessibility-state improvements for common controls
- Support & Safety flow with categorized support, privacy, bug, and safety requests
- SDK 56 release readiness with EAS preview builds, app icon/splash assets, generated Supabase type scripts, RLS verification, seed-data lint, web export smoke tests, and Maestro E2E documentation
- Document Vault security controls for upload limits, MIME validation, filename sanitization, metadata/file deletion, and renewal guidance
- Admin trust workflows for guide freshness, source confidence, source refs, reviewer metadata, content version history, audit filters, and Msaidizi quality review
- Beta diagnostics export with app/runtime/update metadata, sync status, storage counts, analytics summary, and runtime issue logs

## Setup

```bash
npm install
npm run start
```

Run the local quality gate:

```bash
npm run verify
```

Additional release and safety checks:

```bash
npm run seed:lint
npm run types:supabase:check
npm run smoke:web
npm run audit:high
npm run release:check
```

Optional Supabase environment variables:

```bash
cp .env.example .env
```

Then add:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database

The Supabase schema, row-level security policies, and seed/admin upgrade migrations are in:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_beta_account_sync.sql
supabase/migrations/003_content_ops_and_biashara_v1.sql
supabase/migrations/004_offline_sync_notifications.sql
supabase/migrations/005_analytics_and_msaidizi.sql
supabase/migrations/006_document_storage.sql
supabase/migrations/007_vault_admin_assistant_hardening.sql
supabase/migrations/008_analytics_retention_and_quality_review.sql
supabase/migrations/009_support_feedback_sync.sql
supabase/migrations/010_source_reviewer_metadata.sql
supabase/seed.sql
```

It includes public read access for published service content and private user-owned access for reminders, documents, saved guides, checklists, and business profiles.

Local Supabase helpers:

```bash
npm run supabase:seed:local
npm run rls:verify
npm run types:supabase
```

`npm run supabase:seed:local` resets the local Supabase database, so only run it against a disposable local stack.

## Product Docs

- `docs/product-strategy.md`
- `docs/user-flows.md`
- `docs/database-schema.md`
- `docs/product-roadmap.md`
- `docs/future-roadmap.md`
- `docs/launch-checklist.md`
- `docs/rls-verification.md`
- `docs/rls-local-verification.md`
- `docs/live-beta-validation.md`
- `docs/release-artifacts.md`
- `docs/local-persistence-mmkv.md`

## Current Status

Completed and locally verified on this branch:

- Expo SDK 56 dependency alignment and `expo-splash-screen`/`expo-updates` config
- Route-level error boundaries and static web smoke coverage
- Unit tests for sync merge, persisted-store migration, analytics redaction, Msaidizi safety, seed guide validation, document upload validation, and UI contracts
- Official-source URL expansion in seed data plus stricter guide validation
- Admin trust dashboards, content version history, Msaidizi audit review filters, and source confidence scoring
- Privacy-safe analytics sync retry handling and beta diagnostics export
- Document Vault upload validation, path sanitization, MIME sniffing, retention controls, security panel, and renewal checklist guidance
- EAS preview build config, release scripts, GitHub quality workflow, dependency/secret review, and Maestro Android CI workflow

Not completed yet from the requested second-layer product polish list:

- Step/document-specific issue reporting
- Persona/region personalized search ranking in the visible Services UI
- Msaidizi helpful/not-helpful answer feedback
- Admin missing-source queue grouped by institution
- In-app release notes after OTA/app update
- Notification permission recovery deep-link flow
- Full document renewal mode that creates checklist plus reminder from expiring documents
