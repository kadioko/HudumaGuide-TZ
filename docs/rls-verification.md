# Supabase RLS Verification

Use this checklist after creating a Supabase project, running all migrations, and adding the Expo public environment variables.

## Required Setup

1. Run `supabase/migrations/001_initial_schema.sql`.
2. Run `supabase/migrations/002_beta_account_sync.sql`.
3. Create two normal test users through Supabase Auth:
   - `beta-user-a@example.com`
   - `beta-user-b@example.com`
4. Do not assign either user the `admin` role.
5. Sign in as each user from the app at least once so a profile row is created.

## Manual App Verification

For User A:

- Save one service checklist.
- Mark at least one document item and one step complete.
- Create one reminder.
- Add one document metadata record.
- Create one BiasharaStart business plan.
- Open Profile and tap `Sync now`.

For User B:

- Sign in on the same app build.
- Confirm User A data is not visible.
- Create a different reminder, document record, and business plan.
- Open Profile and tap `Sync now`.

Expected result:

- User A only sees User A data.
- User B only sees User B data.
- Signing out and signing back in restores the correct user's data.
- Local fallback data remains available if network sync fails.

## SQL Checks

Run these checks in the Supabase SQL editor as a privileged project owner to inspect row ownership. Replace the email values if your test users differ.

```sql
select id, email from auth.users
where email in ('beta-user-a@example.com', 'beta-user-b@example.com');

select user_id, count(*) from public.user_reminders group by user_id;
select user_id, count(*) from public.user_documents group by user_id;
select user_id, count(*) from public.business_profiles group by user_id;
select user_id, count(*) from public.user_saved_guides group by user_id;
select user_id, count(*) from public.user_checklist_items group by user_id;
```

## Client-Side Isolation Check

Use the app, not the privileged SQL editor, for the most important privacy test:

1. Sign in as User A and create data.
2. Sign out.
3. Sign in as User B.
4. Confirm User A data does not appear.
5. Sign out.
6. Sign in again as User A.
7. Confirm User A data reappears.

## Account Deletion Check

For a disposable test user:

1. Create reminders, documents, saved guides, and a business plan.
2. Open Profile.
3. Use `Export my data` and confirm a JSON payload is produced.
4. Use `Delete account`.
5. Confirm the app returns to the auth screen.
6. Confirm the deleted user can no longer sign in.
7. Confirm user-owned rows are removed through cascading deletes.

## Pass Criteria

- RLS blocks cross-user reads and writes.
- User-owned app tables contain only the signed-in user's data in the app.
- Account deletion removes user-owned app data.
- Export works before deletion.
- Sync errors are visible and do not destroy local fallback data.
