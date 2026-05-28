alter table public.user_reminders
  add column if not exists client_id text;

alter table public.user_documents
  add column if not exists client_id text;

alter table public.business_profiles
  add column if not exists client_id text;

alter table public.business_roadmaps
  add column if not exists client_id text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'user_reminders_user_client_id_key') then
    alter table public.user_reminders add constraint user_reminders_user_client_id_key unique (user_id, client_id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'user_documents_user_client_id_key') then
    alter table public.user_documents add constraint user_documents_user_client_id_key unique (user_id, client_id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'business_profiles_user_client_id_key') then
    alter table public.business_profiles add constraint business_profiles_user_client_id_key unique (user_id, client_id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'business_roadmaps_user_client_id_key') then
    alter table public.business_roadmaps add constraint business_roadmaps_user_client_id_key unique (user_id, client_id);
  end if;
end $$;

create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_current_user() from public;
grant execute on function public.delete_current_user() to authenticated;
