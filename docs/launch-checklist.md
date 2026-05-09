# HudumaGuide TZ Launch Checklist

## MVP Quality Gate

- Run `npm run verify`
- Run `npm run audit:high`
- Smoke test onboarding, Home search, service detail, full checklist, Biashara wizard, roadmap, reminders, and profile
- Smoke test document record creation, folder filtering, expiry status, and linked reminder creation
- Smoke test Msaidizi with a known query and an unknown query
- Smoke test Biashara compliance reminder generation and cost-planning buckets
- Confirm every guide displays the independent guide disclaimer
- Confirm every official URL placeholder is clearly handled as `TO_BE_VERIFIED`

## Supabase Setup

- Create Supabase project
- Run `supabase/migrations/001_initial_schema.sql`
- Add `EXPO_PUBLIC_SUPABASE_URL`
- Add `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Confirm RLS is enabled on all app tables
- Create a private Storage bucket for user document files before enabling uploads

## Content Review

- Verify official URLs before replacing `TO_BE_VERIFIED`
- Verify service steps with official sources or qualified local reviewers
- Keep fee language as notes, not final amounts
- Review Swahili wording with Tanzanian users

## App Store Readiness

- Add production app icons and splash screen
- Add privacy policy
- Add terms and disclaimer page copy
- Add support contact
- Test on low-end Android devices
- Test offline behavior with saved checklists
