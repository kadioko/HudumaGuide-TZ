# Database Schema

The Supabase schema is designed so public guide content can be managed by admins while user-owned data remains private through row-level security.

## Public Content

- `service_categories`
- `service_guides`
- `service_steps`
- `service_required_documents`
- `service_faqs`
- `official_links`
- `app_disclaimers`
- `business_scenarios`

Published guide content is publicly readable. Admin management is prepared through a role field on `profiles`.

## User-Owned Data

- `profiles`
- `user_saved_guides`
- `user_checklist_items`
- `user_documents`
- `user_reminders`
- `business_profiles`
- `business_roadmaps`
- `business_roadmap_steps`
- `feedback_reports`

User-owned tables include `user_id` and RLS policies that restrict access to `auth.uid()`.

## Guide Content Model

`service_guides` stores the main bilingual content and safe summary fields. Steps, required documents, and FAQs are normalized into their own tables for easier admin editing and ordering.

Fee fields are intentionally phrased as notes, not final amounts.

Official URLs should be real HTTPS links before a guide is published or imported into admin review.

## Migration

Run:

```sql
supabase/migrations/001_initial_schema.sql
```

The migration includes:

- UUID primary keys
- `created_at` and `updated_at`
- Update timestamp triggers
- RLS enabled on all app tables
- Public read policies for published guide content
- User-only policies for private records
- Seed data for 10 service guides and 5 business scenarios
