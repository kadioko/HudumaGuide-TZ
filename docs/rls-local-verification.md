# Local RLS Verification

Use this path when validating user-owned row access before a release.

1. Start the local Supabase stack:

```bash
supabase start
```

2. Reset and seed the local database from migrations:

```bash
npm run supabase:seed:local
```

3. Copy the local anon key from:

```bash
supabase status
```

4. Run the verifier against the local stack:

```bash
SUPABASE_ANON_KEY="<local anon key>" npm run rls:verify
```

The script defaults to `http://127.0.0.1:54321` and asserts anonymous writes are denied for reminders, documents, saved guides, checklist items, business profiles, and business roadmaps. Set `SUPABASE_URL`, `RLS_TEST_USER_ID`, and `RLS_TEST_GUIDE_ID` only when testing a non-default stack.
