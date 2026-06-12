insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@hudumaguide.test',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin Reviewer"}'::jsonb,
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'beta.user@hudumaguide.test',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Beta User"}'::jsonb,
    now(),
    now()
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'other.user@hudumaguide.test',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Other User"}'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  created_at,
  updated_at
) values
  (
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'admin@hudumaguide.test',
    '{"sub":"11111111-1111-4111-8111-111111111111","email":"admin@hudumaguide.test"}'::jsonb,
    'email',
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    'beta.user@hudumaguide.test',
    '{"sub":"22222222-2222-4222-8222-222222222222","email":"beta.user@hudumaguide.test"}'::jsonb,
    'email',
    now(),
    now()
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    'other.user@hudumaguide.test',
    '{"sub":"33333333-3333-4333-8333-333333333333","email":"other.user@hudumaguide.test"}'::jsonb,
    'email',
    now(),
    now()
  )
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, full_name, preferred_language, region, city, role) values
  ('11111111-1111-4111-8111-111111111111', 'Admin Reviewer', 'en', 'Dar es Salaam', 'Kinondoni', 'admin'),
  ('22222222-2222-4222-8222-222222222222', 'Beta User', 'sw', 'Dar es Salaam', 'Ilala', 'user'),
  ('33333333-3333-4333-8333-333333333333', 'Other User', 'en', 'Arusha', 'Arusha City', 'user')
on conflict (id) do update set
  full_name = excluded.full_name,
  preferred_language = excluded.preferred_language,
  region = excluded.region,
  city = excluded.city,
  role = excluded.role;

insert into public.user_reminders (user_id, client_id, title, category, remind_at, repeat_option, notes, notification_enabled, created_at, client_updated_at) values
  ('22222222-2222-4222-8222-222222222222', 'seed-reminder-1', 'Renew passport', 'passport', '2026-07-01', 'none', 'Seed fixture for sync tests', true, now(), now()),
  ('33333333-3333-4333-8333-333333333333', 'seed-reminder-other', 'Other user reminder', 'service', '2026-07-15', 'none', 'Should not be visible to beta user', false, now(), now())
on conflict (user_id, client_id) do nothing;

insert into public.user_documents (user_id, client_id, title, document_type, folder, expires_on, storage_path, mime_type, created_at, updated_at) values
  ('22222222-2222-4222-8222-222222222222', 'seed-document-1', 'Seed Passport', 'Passport', 'Personal Documents', '2026-08-01', 'users/22222222-2222-4222-8222-222222222222/documents/seed-passport.pdf', 'application/pdf', now(), now())
on conflict (user_id, client_id) do nothing;

insert into public.user_saved_guides (user_id, guide_id)
select '22222222-2222-4222-8222-222222222222', id
from public.service_guides
where slug = 'passport-application'
on conflict do nothing;

insert into public.user_checklist_items (user_id, guide_id, item_type, item_key, title, completed, completed_at)
select '22222222-2222-4222-8222-222222222222', id, 'step', 'step-open-portal', 'Open official portal', true, now()
from public.service_guides
where slug = 'passport-application'
on conflict do nothing;

insert into public.business_profiles (user_id, client_id, business_name, owner_name, business_type, industry, city, registration_status, tin_status, licence_status)
values ('22222222-2222-4222-8222-222222222222', 'seed-business-1', 'Seed Shop', 'Beta User', 'business_name', 'Retail', 'Ilala', 'planning', 'needed', 'needed')
on conflict (user_id, client_id) do nothing;

insert into public.business_roadmaps (user_id, client_id, business_profile_id, recommended_structure, generated_from_answers)
select
  user_id,
  'seed-business-1',
  id,
  'business_name',
  '{"fixture":true}'::jsonb
from public.business_profiles
where client_id = 'seed-business-1'
on conflict (user_id, client_id) do nothing;

insert into public.content_change_logs (entity_type, entity_id, action, before_data, after_data, changed_by)
select
  'service_guide',
  id,
  'verification_status_updated',
  '{"slug":"passport-application","verification_status":"needs_review","official_source_refs":[]}'::jsonb,
  '{"slug":"passport-application","verification_status":"verified","official_source_refs":["https://eservices.immigration.go.tz/online/web/passport"]}'::jsonb,
  '11111111-1111-4111-8111-111111111111'
from public.service_guides
where slug = 'passport-application'
on conflict do nothing;
