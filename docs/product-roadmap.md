# HudumaGuide TZ Product Roadmap

## Product Direction

HudumaGuide TZ should become a trusted independent assistant for Tanzanians who need to understand public-service processes and business formalization steps before visiting an office or official portal.

The product position must stay clear:

> This is an independent guide. It is not an official government platform. Always confirm final requirements, fees, and procedures through official government channels.

Near-term strategy: launch a useful beta that helps users search, understand, prepare, save, sync, and remember. Do not claim official submission, official authority, final fees, or approval guarantees.

## Current Build Status

Status: beta foundation implemented, live Supabase project connected, partially live-validated, still needs migrations `007` through `009`, device testing, and content review.

Implemented:

- Expo React Native app with Expo Router and TypeScript.
- Swahili-first UX with English support foundation.
- Government service directory with seeded guides.
- Scored bilingual search with Swahili/English aliases and no-result tracking.
- Step-by-step service guide details with readiness score.
- Saved guides, checklist progress, shareable readiness checklists, and offline guide cache.
- Supabase Auth wiring for sign up, sign in, sign out, and session restore.
- Supabase migrations `001` through `006` pushed to the live project; migrations `007` through `009` are ready locally for vault, admin, assistant, analytics, and support hardening.
- User-owned sync plumbing for saved guides, checklist items, reminders, document metadata, and business plans.
- Sync indicators, low-data mode, pending sync retry queue, and local/remote merge handling.
- Document Vault metadata plus private Supabase Storage upload support.
- Private `user-documents` Storage bucket and user-owned Storage policies.
- Document preview/download, replace-file, delete-file-only, camera capture, MIME type persistence, and cleanup-queue strategy.
- Service-role Storage cleanup script for queued deleted document paths.
- Optional biometric app-lock gate with device authentication fallback handling.
- Reminder dashboard with overdue, today, and upcoming filters.
- Local notifications with pre-deadline alerts, repeat-aware scheduling, permission education, and quiet hours.
- BiasharaStart wizard, multiple saved business plans, editable business profiles, roadmap notes, completion dates, compliance reminders, cost estimates, and export/share flows.
- Editable wizard assumptions after plan creation with roadmap regeneration.
- Business profile document folder view for linked document records.
- Business document linking and referral marketplace placeholder with no-endorsement safety copy.
- Admin content console foundations for categories, guides, reports, analytics, and Msaidizi controls.
- Remote admin list loading for categories, guides, and feedback reports with fallback/error states.
- Admin structured guide editing for required documents, steps, and FAQs.
- Content version viewer and Msaidizi audit quality review panel.
- Admin Storage cleanup queue screen for deleted document file paths.
- Content verification metadata: status, reviewer notes, official-source references, review expiry, and change-log schema.
- Privacy-safe analytics events and internal dashboard.
- Remote aggregated analytics loading with local fallback.
- Msaidizi v1 safety layer with published-content retrieval, citations, related-guide actions, fallback behavior, admin exclusions, and hashed audit logs.
- Msaidizi audit review workflow and retention cleanup migration.
- Beta readiness checklist screen for Supabase, sync, cache, Storage, notifications, content review, and app lock.
- Accessibility improvements for buttons, pills, text fields, and progress bars.
- Support & Safety flow with categorized support, privacy, bug, and safety requests.
- Feedback/support sync migration and category-aware admin review queue.
- Privacy Policy, Terms of Use, disclaimer, RLS verification guide, launch checklist, and live beta validation plan.

## Product Principles

- Trust before growth: clear disclaimers, verified content, and transparent source language.
- Low-data by default: cached guides, saved checklist access, and compact screens.
- Swahili-first: write primary UX and service content for Tanzanian users first.
- Guidance, not impersonation: organize, remind, and redirect without pretending to submit official applications.
- Safe assistance: Msaidizi answers only from approved guide content and falls back when unsure.
- Privacy by design: do not track document contents, private notes, or raw assistant questions.

## Phase Status

### Phase 1: Account-Backed Core MVP

Status: implemented, partially live-validated.

Done:

- Supabase Auth session wiring.
- Profile fields for language, optional region, and optional city.
- User-owned sync plumbing for reminders, saved guides, checklist items, documents, and business plans.
- Data export and account deletion flow.
- Sync, local mode, and error-state messaging.
- Test fixtures and RLS validation docs.

Needs validation:

- Two-user RLS isolation with real Supabase Auth users: passed for sampled reminders and document metadata.
- Account deletion behavior against live data.
- Sync retry behavior under poor connectivity.

### Phase 2: Document Vault v1

Status: implemented locally, needs migration `007` push, device validation, and cleanup worker/process validation.

Done:

- Document metadata records.
- Folder organization.
- Expiry/reminder fields.
- Business profile linking.
- Private Supabase Storage bucket migration.
- File picker and upload flow for signed-in users.
- Privacy copy that file contents are not used for analytics.
- File preview/download UX.
- Update/delete file flow.
- Storage cleanup strategy after account deletion.
- Service-role cleanup script for queued Storage paths.
- Camera capture flow.
- Optional biometric app-lock gate.

Remaining:

- Push migration `007` to the live Supabase project.
- Validate file preview/download, replace, delete, and camera capture on physical Android.
- Schedule or manually run the trusted service-role cleanup script after account deletion tests.

### Phase 3: Verified Content Operations

Status: foundations implemented, partially RLS-validated, needs content review.

Done:

- Category management screen.
- Guide management screen.
- Review queue screen.
- Verification status, reviewer notes, official-source references, review expiry, and published workflow fields.
- Official URL guard: keep `TO_BE_VERIFIED` unless a guide is verified.
- Content review checklist for fees, documents, steps, offices, and legal/tax wording.
- Remote admin list loading with error fallback.
- Validate `role=admin` RLS with real admin and normal users.
- Improve admin editing forms for full guide steps/documents/FAQ editing.
- Add richer content version viewer.
- Admin Storage cleanup queue screen.

Remaining:

- Push migration `007` for cleanup queue and MIME metadata.
- Continue production RLS checks after migration `007`.
- Replace placeholder official links only after official-source review.
- Review all seeded content with Tanzanian reviewers.

### Phase 4: BiasharaStart v1

Status: implemented, needs beta feedback.

Done:

- Save and edit multiple business plans.
- Editable business profile basics.
- Registration, TIN, and licence status tracking.
- Roadmap step notes and completion dates.
- Compliance calendar reminders.
- User-editable cost estimates with "not official fee" warnings.
- Export/share business roadmap and business profile.
- Guided comparison for all business structures.
- Accountant/lawyer referral placeholder with safety copy.
- Edit wizard answers after plan creation and rebuild matching roadmap steps.
- Business profile document folder view.

Remaining:

- More localized compliance templates by sector/region.
- Consultant/accountant workflow for managing client businesses.

### Phase 5: Offline and Sync

Status: implemented, needs poor-connectivity testing.

Done:

- Published guide cache.
- Saved-guide and checklist offline messaging.
- Sync status indicators.
- Pending sync retry queue.
- Conflict-aware local/remote merge for key user-owned objects.
- Low-data mode.
- Document metadata available offline while files depend on Storage sync.
- Per-record sync badges for reminders, documents, and business plans.

Remaining:

- Airplane-mode test pass.
- Extend per-record sync badges to saved guides and checklist rows if beta users need finer detail.
- Manual conflict resolution UI for rare collisions.

### Phase 6: Notifications and Engagement

Status: implemented, needs physical Android validation.

Done:

- Local notification permission education.
- Pre-deadline alerts: 7 days, 1 day, both, or none.
- Repeat-aware scheduling for weekly, monthly, and yearly reminders.
- Quiet-hours preferences.
- Reminder dashboard by status.

Remaining:

- Validate delivery on physical Android.
- Confirm no duplicate schedules after edit/resync.
- Push notifications later for verified content updates and major app notices.

### Phase 7: Analytics and Feedback

Status: implemented, needs live validation.

Done:

- Track searched services.
- Track no-result searches.
- Track saved guides.
- Track business wizard start/completion/drop-off.
- Track reminder categories.
- Track outdated-info reports.
- Track language preference.
- Track voluntary region/city only when provided.
- Internal analytics dashboard.
- Remote aggregated dashboard queries with local fallback.
- Retention cleanup migration for analytics and assistant audit logs.

Privacy guardrails:

- Do not track uploaded document contents.
- Do not track private notes.
- Do not store raw Msaidizi questions.
- Use allowlisted analytics payload fields.

Remaining:

- Validate remote analytics inserts, admin-only reads, and retention cleanup on the live project.
- Add cohort/date filters after beta traffic is real enough to need them.

### Phase 8: Msaidizi v1

Status: implemented, partially live-validated.

Done:

- Uses approved guide content.
- Attempts published Supabase guide retrieval when configured.
- Falls back to bundled approved content/local fallback.
- Adds citations/source cards.
- Adds open related guide actions.
- Adds admin controls to exclude uncertain content.
- Adds audit logs without storing raw user questions.
- Adds admin quality review actions for audit logs.
- Uses required fallback:

> Sina uhakika. Tafadhali hakiki kupitia tovuti rasmi au ofisi husika.

Remaining:

- Improve answer ranking and citation precision.
- Validate audit review RLS after migration `008`.

### Phase 9: Launch Readiness

Status: started, needs device/content/store validation.

Done:

- Beta readiness checklist in Profile.
- Accessibility states for common controls.
- Support & Safety page.
- Category-aware support review queue.
- Expo SDK patch dependency alignment.

Priority work:

- Production app icon and splash screen.
- Final Privacy Policy and Terms review.
- Final public support contact details and response process.
- Low-end Android performance test.
- Accessibility test on device: touch targets, contrast, readable type, labels, and screen-reader flow.
- Swahili copy review with Tanzanian users.
- Official link and fee review before replacing placeholders.
- RLS and Storage policy security review.
- App Store / Play Store metadata.

## Current Critical Blockers

- Migrations `007`, `008`, and `009` have not been pushed because the current Supabase access token returned `401 Unauthorized`.
- Official links still use `TO_BE_VERIFIED` until verified.
- Service guide content needs official-source review before public launch.
- Physical Android notification validation is still pending.
- Broader Storage upload UX needs device validation; sampled cross-user denial passed.
- Account deletion needs live cascade/storage cleanup validation.
- Admin role behavior passed sampled admin update and normal-user no-effect denial checks, but should be repeated after migration `007`.

## High-Priority Next Sprint

Sprint goal: prove the connected Supabase beta is safe enough for a small user test.

Scope:

1. Provide a fresh Supabase access token or DB password and push migrations `007`, `008`, and `009`.
2. Re-run `docs/live-beta-validation.md` end to end.
3. Validate remaining user data isolation for guides, checklists, reminders, documents, and business plans.
4. Validate document preview/download, replace, delete, and camera capture on Android.
5. Validate account deletion cascade and Storage cleanup queue.
6. Validate notifications on a physical Android device.
7. Review seeded content with Tanzanian reviewers before replacing official-link placeholders.

Out of scope:

- Monetization.
- Official application submission.
- Marketplace/referral provider onboarding.
- Replacing official links before content review.

## Medium-Priority Backlog

- PIN fallback UI beyond device passcode/biometrics.
- Manual conflict resolution UI.
- Regional/local-government filtering where procedures differ.
- More service guide content and richer FAQ coverage.
- Onboarding personas: citizen, business owner, student, parent, diaspora, consultant.
- Push notifications for verified content updates.
- Accessibility and low-end Android performance pass.

## Later Opportunities

- PIN or biometric app lock.
- Premium document vault storage.
- Accountant/lawyer/consultant marketplace.
- SME compliance plan.
- Sponsored verified providers with strong disclosure.
- Municipal or institutional dashboard.
- Real official API integrations only after formal partnerships or reliable public APIs.

## Success Metrics

Early beta:

- Search success rate.
- No-result search rate.
- Saved checklist rate.
- Reminder creation rate.
- Business wizard completion rate.
- Return usage for saved guides/reminders/business plans.
- Outdated-info report volume and resolution time.
- Msaidizi fallback rate and cited-guide click-through.
- Content trust feedback from Tanzanian users.
