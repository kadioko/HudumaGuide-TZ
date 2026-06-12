alter table public.service_guides
  add column if not exists source_last_checked_by text;

comment on column public.service_guides.source_last_checked_by is
  'Reviewer or team label that last checked official source references for this guide.';
