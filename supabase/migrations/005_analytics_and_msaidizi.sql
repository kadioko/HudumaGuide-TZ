create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  event_count integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists analytics_events_name_time_idx on public.analytics_events(event_name, occurred_at);

alter table public.analytics_events enable row level security;

create policy "Users insert privacy safe analytics" on public.analytics_events
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Admins read aggregated analytics" on public.analytics_events
  for select using (public.is_admin());

alter table public.service_guides
  add column if not exists msaidizi_enabled boolean not null default true,
  add column if not exists msaidizi_excluded_reason text;

create table if not exists public.msaidizi_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  question_hash text not null,
  question_length integer not null,
  confidence text not null check (confidence in ('grounded', 'fallback')),
  matched_guide_slugs text[] not null default '{}',
  fallback_used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists msaidizi_audit_logs_confidence_idx on public.msaidizi_audit_logs(confidence, created_at);

alter table public.msaidizi_audit_logs enable row level security;

create policy "Users insert msaidizi audit logs" on public.msaidizi_audit_logs
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Admins read msaidizi audit logs" on public.msaidizi_audit_logs
  for select using (public.is_admin());
