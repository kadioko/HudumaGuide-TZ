# HudumaGuide TZ Launch Checklist

## MVP Quality Gate

- Run `npm run verify`
- Run `npm run audit:high`
- Smoke test onboarding, Home search, service detail, full checklist, Biashara wizard, roadmap, reminders, and profile
- Smoke test document record creation, folder filtering, expiry status, and linked reminder creation
- Smoke test Msaidizi with a known query and an unknown query
- Smoke test Biashara compliance reminder generation and cost-planning buckets
- Smoke test Biashara profile assumption edits, roadmap rebuild, and linked document folder view
- Smoke test offline guide cache, saved checklist access in airplane mode, low-data toggle, and pending sync retry
- Smoke test notification permission education, quiet hours, repeat reminders, and 7-day/1-day pre-deadline alerts
- Smoke test analytics events for search, no-result search, saved guides, reminders, wizard completion/drop-off, outdated reports, and Msaidizi questions
- Confirm analytics payloads do not include document contents, private notes, or raw Msaidizi questions
- Smoke test remote aggregated analytics loading, local fallback, and Msaidizi audit review actions
- Smoke test Msaidizi citations, fallback phrase, related-guide actions, and admin exclusion controls
- Run `docs/live-beta-validation.md` with two normal users and one admin user
- Smoke test Supabase Storage document upload, preview/download, replace, delete-file-only, and camera capture with safe test PDF/image files
- Smoke test optional app lock enable, unlock, and unavailable-biometric fallback
- Smoke test Beta readiness checklist states from Profile
- Smoke test accessibility labels/states for buttons, pills, fields, and progress bars
- Smoke test Support & Safety requests for support, privacy, bug, and safety categories
- Confirm privacy policy and terms are reachable from Profile
- Confirm every guide displays the independent guide disclaimer
- Confirm every guide has a real HTTPS official URL before release

## Supabase Setup

- Create Supabase project
- Run `supabase/migrations/001_initial_schema.sql`
- Add `EXPO_PUBLIC_SUPABASE_URL`
- Add `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Confirm RLS is enabled on all app tables
- Create a private Storage bucket for user document files before enabling uploads
- Push `supabase/migrations/007_vault_admin_assistant_hardening.sql`
- Push `supabase/migrations/008_analytics_retention_and_quality_review.sql`
- Push `supabase/migrations/009_support_feedback_sync.sql`
- Confirm deleted document paths are queued for service-role Storage cleanup
- Confirm Admin Storage cleanup queue is visible only to admin users after migration `007`
- Run `npm run cleanup:storage` from a trusted environment with the service-role key, never from the mobile client

## Content Review

- Verify official URLs, official-source references, and reviewer notes before release
- Run `npm run verify`, `npx expo-doctor`, `npm run smoke:web`, `npm run audit:high`, and `node scripts/validate-build-config.mjs`.
- Run `npm run seed:lint` and `npm run types:supabase:check`.
- Against a disposable local Supabase stack, run `npm run supabase:seed:local` and `npm run rls:verify`.
- For Android preview, run the EAS preview workflow and Maestro smoke flow before sharing a beta build.
- Verify service steps with official sources or qualified local reviewers
- Keep fee language as notes, not final amounts
- Review Swahili wording with Tanzanian users

## App Store Readiness

- Add production app icons and splash screen
- Add privacy policy
- Add terms and disclaimer page copy
- Add final public support contact and escalation process
- Test on low-end Android devices
- Test offline behavior with saved checklists
- Test local notifications, repeat reminders, and quiet hours on physical Android
- Run a screen-reader pass on the core flows
