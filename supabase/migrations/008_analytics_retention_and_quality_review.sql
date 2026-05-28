create table if not exists public.msaidizi_audit_reviews (
  id uuid primary key default gen_random_uuid(),
  audit_log_id uuid not null references public.msaidizi_audit_logs(id) on delete cascade,
  status text not null check (status in ('good', 'needs_fix', 'unsafe')),
  reviewer_notes text,
  reviewed_by uuid references auth.users(id) on delete set null default auth.uid(),
  reviewed_at timestamptz not null default now(),
  unique (audit_log_id)
);

alter table public.msaidizi_audit_reviews enable row level security;

create policy "Admins manage msaidizi audit reviews" on public.msaidizi_audit_reviews
  for all using (public.is_admin()) with check (public.is_admin());

create index if not exists msaidizi_audit_reviews_status_idx
  on public.msaidizi_audit_reviews(status, reviewed_at);

create or replace function public.purge_old_privacy_logs(
  analytics_days integer default 180,
  msaidizi_days integer default 180
)
returns table (
  deleted_analytics integer,
  deleted_msaidizi_audits integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  analytics_count integer;
  audit_count integer;
begin
  if not public.is_admin() then
    raise exception 'Admin role required';
  end if;

  delete from public.analytics_events
  where occurred_at < now() - make_interval(days => analytics_days);
  get diagnostics analytics_count = row_count;

  delete from public.msaidizi_audit_logs
  where created_at < now() - make_interval(days => msaidizi_days);
  get diagnostics audit_count = row_count;

  return query select analytics_count, audit_count;
end;
$$;
