# Release Artifacts

Use this checklist for preview/internal releases.

1. Run `npm run release:check`.
2. Run `npm run types:supabase` against local Supabase or `SUPABASE_PROJECT_ID`.
3. Run `npm run rls:verify` against local Supabase anon credentials.
4. Build preview artifacts with `eas build --profile preview --platform android`.
5. For OTA-only changes, run `eas update --branch preview --message "<summary>"` and confirm the `runtimeVersion` still follows the app version.
6. Attach the APK/AAB link, web export result, OTA update group if used, changelog seed, and verification output to the release notes.

Do not ship a guide update unless official-source references and review status are current.

## Supabase Availability

Supabase Free projects can pause after inactivity. For production reliability, move the project to Supabase Pro. Supabase documents that Pro projects cannot currently be paused, while Free projects are subject to inactivity pausing.

For Free-plan beta testing, this repo includes `.github/workflows/supabase-keepalive.yml`, which pings the public `service_guides` REST endpoint every Monday and Thursday. Add these GitHub repository secrets before enabling the workflow:

```text
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-valid-anon-key
```

Do not store the Postgres connection string or service role key in the repo. Rotate the database password if it was shared in chat, screenshots, logs, or deployment output.
