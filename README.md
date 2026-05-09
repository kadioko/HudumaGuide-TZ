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

The current upgrade includes a local-first document metadata vault for folders, expiry dates, reminder dates, and notes. Private file upload remains a Supabase Storage follow-up.

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

The Supabase schema, row-level security policies, and seed data are in:

```text
supabase/migrations/001_initial_schema.sql
```

It includes public read access for published service content and private user-owned access for reminders, documents, saved guides, checklists, and business profiles.

## Product Docs

- `docs/product-strategy.md`
- `docs/user-flows.md`
- `docs/database-schema.md`
- `docs/future-roadmap.md`
- `docs/launch-checklist.md`
