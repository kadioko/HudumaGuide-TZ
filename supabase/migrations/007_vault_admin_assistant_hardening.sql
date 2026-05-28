alter table public.user_documents
  add column if not exists mime_type text;

create table if not exists public.account_deletion_file_cleanup (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  storage_path text not null,
  status text not null default 'pending' check (status in ('pending', 'deleted', 'failed')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.account_deletion_file_cleanup enable row level security;

create policy "Admins manage storage cleanup queue" on public.account_deletion_file_cleanup
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.queue_document_file_cleanup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.storage_path is not null then
    insert into public.account_deletion_file_cleanup (user_id, storage_path)
    values (old.user_id, old.storage_path);
  end if;
  return old;
end;
$$;

drop trigger if exists user_documents_queue_file_cleanup on public.user_documents;
create trigger user_documents_queue_file_cleanup
  before delete on public.user_documents
  for each row execute function public.queue_document_file_cleanup();
