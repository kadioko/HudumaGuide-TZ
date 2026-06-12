# Release Artifacts

Use this checklist for preview/internal releases.

1. Run `npm run release:check`.
2. Run `npm run types:supabase` against local Supabase or `SUPABASE_PROJECT_ID`.
3. Run `npm run rls:verify` against local Supabase anon credentials.
4. Build preview artifacts with `eas build --profile preview --platform android`.
5. For OTA-only changes, run `eas update --branch preview --message "<summary>"` and confirm the `runtimeVersion` still follows the app version.
6. Attach the APK/AAB link, web export result, OTA update group if used, changelog seed, and verification output to the release notes.

Do not ship a guide update unless official-source references and review status are current.
