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

The document vault is intentionally prepared as a next module after the first working version.

## Tech Stack

- Expo React Native
- TypeScript
- Expo Router
- Zustand
- React Hook Form + Zod
- Supabase-ready auth/database/storage layer
- AsyncStorage persistence for offline-friendly saved guides, checklists, reminders, and business plans

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
