alter table public.service_categories
  add column if not exists verification_status text not null default 'needs_review'
    check (verification_status in ('draft', 'needs_review', 'verified', 'outdated')),
  add column if not exists reviewer_notes text,
  add column if not exists official_source_refs jsonb not null default '[]'::jsonb,
  add column if not exists last_verified_at date,
  add column if not exists expires_review_at date;

alter table public.service_guides
  add column if not exists verification_status text not null default 'needs_review'
    check (verification_status in ('draft', 'needs_review', 'verified', 'outdated')),
  add column if not exists reviewer_notes text,
  add column if not exists official_source_refs jsonb not null default '[]'::jsonb,
  add column if not exists expires_review_at date;

alter table public.official_links
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewer_notes text;

alter table public.feedback_reports
  add column if not exists resolution_notes text,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

alter table public.business_profiles
  add column if not exists cost_estimates jsonb not null default '[]'::jsonb,
  add column if not exists referral_interest text,
  add column if not exists notes text;

alter table public.business_roadmap_steps
  add column if not exists user_notes text,
  add column if not exists completed_by_user_at timestamptz;

create table if not exists public.content_change_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('service_category', 'service_guide', 'official_link', 'feedback_report')),
  entity_id uuid not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.content_change_logs enable row level security;

create policy "Admins read content change logs" on public.content_change_logs
  for select using (public.is_admin());

create policy "Admins insert content change logs" on public.content_change_logs
  for insert with check (public.is_admin());

create index if not exists service_guides_verification_idx on public.service_guides(verification_status, published, expires_review_at);
create index if not exists feedback_reports_review_idx on public.feedback_reports(status, created_at);
create index if not exists content_change_logs_entity_idx on public.content_change_logs(entity_type, entity_id, created_at);
