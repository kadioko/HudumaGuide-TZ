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

The current upgrade includes a local-first document metadata vault, private Supabase Storage upload wiring, preview/download actions, file replacement/deletion flows, camera capture, and a biometric-lock preference foundation.

The latest upgrade adds scored bilingual service search with common Swahili/English aliases, shareable readiness checklists from service guides, and reminder triage for overdue, today, and upcoming deadlines.

## Tech Stack

- Expo React Native
- TypeScript
- Expo Router
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

## Setup

```bash
npm install
npm run start
```

Run the local quality gate:

```bash
npm run verify
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
```

It includes public read access for published service content and private user-owned access for reminders, documents, saved guides, checklists, and business profiles.

## Product Docs

- `docs/product-strategy.md`
- `docs/user-flows.md`
- `docs/database-schema.md`
- `docs/product-roadmap.md`
- `docs/future-roadmap.md`
- `docs/launch-checklist.md`
- `docs/rls-verification.md`
- `docs/live-beta-validation.md`
