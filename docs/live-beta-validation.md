# Live Beta Validation Plan and Findings

Use this after migrations are pushed to the real Supabase project.

## 2026-05-11 Validation Findings

Environment:

- Supabase project: connected local app environment.
- Local quality gate: `npm run verify` passed.
- Migration status: `001` through `006` were already present in the project. Migrations `007_vault_admin_assistant_hardening.sql`, `008_analytics_retention_and_quality_review.sql`, and `009_support_feedback_sync.sql` are ready locally but were not pushed because the available Supabase access token returned `401 Unauthorized`.

Test accounts created/found:

- `beta-user-a@example.com`
- `beta-user-b@example.com`
- `beta-admin@example.com`

Results completed from desktop validation:

- User-owned data isolation: User B saw `0` User A reminders and `0` User A document metadata rows.
- Private Storage isolation: User B was denied access to User A's uploaded file path.
- Admin RLS: the admin test user could update guide review metadata.
- Normal-user admin denial: the normal user's protected guide update did not change the guide row. The client request did not throw a hard HTTP error, so production QA should verify UI copy treats this as "not allowed / no change saved."
- Msaidizi admin exclusion: excluding a published guide from assistant use prevented it from being selected after sync.

Blocked or not completed here:

- Migrations `007`, `008`, and `009` live push need a fresh Supabase access token or database password.
- Physical Android notification delivery, repeat scheduling, and quiet-hours validation were not run from this desktop workspace.
- Account deletion cascade and Storage cleanup queue need a live run after migration `007` is pushed.
- Tanzanian official-source review of seeded guide content was not completed.

Fixes added in this pass:

- Document file preview/download actions.
- Document file replace and delete-file-only actions.
- Camera capture for document upload.
- Document MIME type persistence.
- Storage cleanup queue table and trigger strategy for deleted document paths.
- Optional biometric-lock preference foundation.
- Admin editor fields for structured required documents, steps, and FAQ JSON.
- Content version viewer.
- Msaidizi audit quality review panel.
- Remote aggregated analytics loading and Msaidizi review-status workflow.
- Support & Safety requests with feedback sync client IDs and category-aware admin queue.

## Test Accounts

Create three disposable Supabase Auth users:

- `beta-user-a@example.com`
- `beta-user-b@example.com`
- `beta-admin@example.com`

After `beta-admin@example.com` signs in once, set its profile role:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'beta-admin@example.com'
);
```

## User-Owned Data Sync

For User A:

- Save two service guides.
- Mark checklist items complete.
- Create reminders with 7-day and 1-day pre-alerts.
- Create one business plan and edit its profile.
- Add document metadata and upload one safe test PDF/image.
- Tap `Sync now` in Profile.

For User B:

- Sign in on the same device.
- Confirm User A guides, reminders, documents, and business plans are not visible.
- Create a different saved guide, reminder, document, and business plan.
- Tap `Sync now`.

Pass criteria:

- User A and User B data remain isolated.
- Signing out/in restores the correct user's data.
- Pending sync queue clears after successful sync.
- Airplane mode keeps saved guides, checklists, and document metadata available.

## Storage Upload Validation

- Confirm `user-documents` bucket exists and is private.
- Upload a file as User A.
- Confirm the file path starts with User A's auth UID.
- Sign in as User B and confirm User A's file cannot be read.
- Delete User A and confirm app rows cascade; manually review storage cleanup needs before launch.

## Admin Content Validation

As `beta-admin@example.com`:

- Open Admin Console.
- Load categories, guides, analytics, and review queue.
- Update one guide reviewer note.
- Mark one guide `needs_review`.
- Confirm `official_url` is a real HTTPS source even when status is still `needs_review`.
- Exclude one guide from Msaidizi and confirm assistant no longer uses it after sync.
- Mark at least one Msaidizi audit row as `good`, `needs_fix`, and `unsafe`.
- Confirm normal users cannot read or write audit reviews.

As a normal user:

- Confirm admin write attempts fail under RLS.

## Official Link Review

Before marking a guide verified:

- Confirm the link is an official government or regulator channel.
- Record official-source references.
- Set `last_verified_at`.
- Set `expires_review_at`.
- Confirm no exact fee is shown unless verified and dated.

## Physical Android Notification Validation

On a real Android device:

- Grant notification permission from Notification Settings.
- Create a reminder for tomorrow with 1-day alert.
- Create weekly, monthly, and yearly repeating reminders.
- Turn quiet hours on and schedule a reminder inside quiet hours.
- Confirm the scheduled trigger moves to the quiet-hours end time.
- Confirm notifications are useful and not duplicated.

## Account Deletion

- Export User A data.
- Delete User A account from Profile.
- Confirm User A cannot sign in.
- Confirm user-owned database rows are removed.
- Confirm deleted document storage paths are queued in `account_deletion_file_cleanup`.
- Run `npm run cleanup:storage` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set.
- Confirm queued files are removed from private Storage and marked `deleted`.

## Analytics and Retention

- Confirm admin users can load remote aggregated analytics.
- Confirm normal users cannot read analytics rows.
- Confirm audit review rows do not contain raw questions.
- Run `select * from public.purge_old_privacy_logs(180, 180);` as an admin in a safe test project.

## Support and Safety

- Submit one request for each category: support, privacy, bug, and safety.
- Confirm requests sync to `feedback_reports` with `client_id` and correct `report_type`.
- Confirm admin review queue shows categories.
- Confirm normal users can read only their own requests.
