alter table public.feedback_reports
  add column if not exists client_id text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'feedback_reports_user_client_id_key') then
    alter table public.feedback_reports add constraint feedback_reports_user_client_id_key unique (user_id, client_id);
  end if;
end $$;
