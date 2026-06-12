create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  preferred_language text not null default 'sw' check (preferred_language in ('sw', 'en')),
  region text,
  city text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_sw text not null,
  description_en text,
  description_sw text,
  icon text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_guides (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete restrict,
  title_en text not null,
  title_sw text not null,
  slug text not null unique,
  summary_en text not null,
  summary_sw text not null,
  who_needs_it_en text,
  who_needs_it_sw text,
  required_documents jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  estimated_time text,
  estimated_cost_note text not null default 'Fees may change. Please confirm through the official portal or office.',
  official_url text not null,
  physical_location_note text,
  common_mistakes jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  search_keywords text[] not null default '{}',
  last_verified_at date,
  published boolean not null default false,
  disclaimer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_steps (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.service_guides(id) on delete cascade,
  position integer not null,
  title_en text not null,
  title_sw text not null,
  description_en text not null,
  description_sw text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guide_id, position)
);

create table public.service_required_documents (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.service_guides(id) on delete cascade,
  position integer not null,
  title_en text not null,
  title_sw text not null,
  note_en text,
  note_sw text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guide_id, position)
);

create table public.service_faqs (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.service_guides(id) on delete cascade,
  position integer not null,
  question_en text not null,
  question_sw text not null,
  answer_en text not null,
  answer_sw text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guide_id, position)
);

create table public.official_links (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid references public.service_guides(id) on delete cascade,
  label_en text not null,
  label_sw text not null,
  url text not null,
  is_official boolean not null default true,
  status text not null default 'needs_verification' check (status in ('needs_verification', 'verified', 'broken', 'retired')),
  verified_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_disclaimers (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  body_en text not null,
  body_sw text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_saved_guides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  guide_id uuid not null references public.service_guides(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, guide_id)
);

create table public.user_checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  guide_id uuid not null references public.service_guides(id) on delete cascade,
  item_type text not null check (item_type in ('document', 'step', 'custom')),
  item_key text not null,
  title text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, guide_id, item_type, item_key)
);

create table public.user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  document_type text not null,
  folder text not null default 'Other',
  expires_on date,
  reminder_on date,
  storage_path text,
  notes text,
  linked_guide_id uuid references public.service_guides(id) on delete set null,
  linked_business_profile_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null check (category in ('document', 'licence', 'tax', 'service', 'passport', 'driving', 'business', 'custom')),
  remind_at timestamptz not null,
  repeat_option text not null default 'none' check (repeat_option in ('none', 'weekly', 'monthly', 'yearly')),
  notes text,
  notification_enabled boolean not null default true,
  linked_guide_id uuid references public.service_guides(id) on delete set null,
  linked_document_id uuid references public.user_documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  owner_name text,
  business_type text,
  industry text,
  region text,
  city text,
  registration_status text not null default 'planning',
  tin_status text not null default 'unknown',
  licence_status text not null default 'unknown',
  renewal_dates jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_documents
  add constraint user_documents_linked_business_profile_id_fkey
  foreign key (linked_business_profile_id)
  references public.business_profiles(id)
  on delete set null;

create table public.business_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_profile_id uuid not null references public.business_profiles(id) on delete cascade,
  recommended_structure text,
  generated_from_answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_roadmap_steps (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.business_roadmaps(id) on delete cascade,
  position integer not null,
  title_en text not null,
  title_sw text not null,
  description_en text not null,
  description_sw text not null,
  linked_guide_id uuid references public.service_guides(id) on delete set null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (roadmap_id, position)
);

create table public.business_scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_sw text not null,
  recommended_structure text not null,
  summary_en text not null,
  summary_sw text not null,
  roadmap_steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guide_id uuid references public.service_guides(id) on delete set null,
  report_type text not null default 'outdated_info',
  message text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_guides_category_id_idx on public.service_guides(category_id);
create index service_guides_search_keywords_idx on public.service_guides using gin(search_keywords);
create index user_reminders_user_time_idx on public.user_reminders(user_id, remind_at);
create index business_profiles_user_idx on public.business_profiles(user_id);
create index feedback_reports_status_idx on public.feedback_reports(status);

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger service_categories_set_updated_at before update on public.service_categories for each row execute function public.set_updated_at();
create trigger service_guides_set_updated_at before update on public.service_guides for each row execute function public.set_updated_at();
create trigger service_steps_set_updated_at before update on public.service_steps for each row execute function public.set_updated_at();
create trigger service_required_documents_set_updated_at before update on public.service_required_documents for each row execute function public.set_updated_at();
create trigger service_faqs_set_updated_at before update on public.service_faqs for each row execute function public.set_updated_at();
create trigger official_links_set_updated_at before update on public.official_links for each row execute function public.set_updated_at();
create trigger app_disclaimers_set_updated_at before update on public.app_disclaimers for each row execute function public.set_updated_at();
create trigger user_checklist_items_set_updated_at before update on public.user_checklist_items for each row execute function public.set_updated_at();
create trigger user_documents_set_updated_at before update on public.user_documents for each row execute function public.set_updated_at();
create trigger user_reminders_set_updated_at before update on public.user_reminders for each row execute function public.set_updated_at();
create trigger business_profiles_set_updated_at before update on public.business_profiles for each row execute function public.set_updated_at();
create trigger business_roadmaps_set_updated_at before update on public.business_roadmaps for each row execute function public.set_updated_at();
create trigger business_roadmap_steps_set_updated_at before update on public.business_roadmap_steps for each row execute function public.set_updated_at();
create trigger business_scenarios_set_updated_at before update on public.business_scenarios for each row execute function public.set_updated_at();
create trigger feedback_reports_set_updated_at before update on public.feedback_reports for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.service_guides enable row level security;
alter table public.service_steps enable row level security;
alter table public.service_required_documents enable row level security;
alter table public.service_faqs enable row level security;
alter table public.official_links enable row level security;
alter table public.app_disclaimers enable row level security;
alter table public.user_saved_guides enable row level security;
alter table public.user_checklist_items enable row level security;
alter table public.user_documents enable row level security;
alter table public.user_reminders enable row level security;
alter table public.business_profiles enable row level security;
alter table public.business_roadmaps enable row level security;
alter table public.business_roadmap_steps enable row level security;
alter table public.business_scenarios enable row level security;
alter table public.feedback_reports enable row level security;

create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());

create policy "Public can read categories" on public.service_categories for select using (published = true);
create policy "Admins manage categories" on public.service_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published guides" on public.service_guides for select using (published = true or public.is_admin());
create policy "Admins manage guides" on public.service_guides for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published guide steps" on public.service_steps for select using (
  exists (select 1 from public.service_guides where service_guides.id = service_steps.guide_id and service_guides.published = true)
  or public.is_admin()
);
create policy "Admins manage guide steps" on public.service_steps for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published guide documents" on public.service_required_documents for select using (
  exists (select 1 from public.service_guides where service_guides.id = service_required_documents.guide_id and service_guides.published = true)
  or public.is_admin()
);
create policy "Admins manage guide documents" on public.service_required_documents for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read published guide faqs" on public.service_faqs for select using (
  exists (select 1 from public.service_guides where service_guides.id = service_faqs.guide_id and service_guides.published = true)
  or public.is_admin()
);
create policy "Admins manage guide faqs" on public.service_faqs for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read official links for published guides" on public.official_links for select using (
  guide_id is null
  or exists (select 1 from public.service_guides where service_guides.id = official_links.guide_id and service_guides.published = true)
  or public.is_admin()
);
create policy "Admins manage official links" on public.official_links for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read active disclaimers" on public.app_disclaimers for select using (active = true or public.is_admin());
create policy "Admins manage disclaimers" on public.app_disclaimers for all using (public.is_admin()) with check (public.is_admin());

create policy "Users manage saved guides" on public.user_saved_guides for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage checklist items" on public.user_checklist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage documents" on public.user_documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage reminders" on public.user_reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage business profiles" on public.business_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage business roadmaps" on public.business_roadmaps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read roadmap steps" on public.business_roadmap_steps for select using (
  exists (
    select 1 from public.business_roadmaps
    where business_roadmaps.id = business_roadmap_steps.roadmap_id
    and business_roadmaps.user_id = auth.uid()
  )
);
create policy "Users insert roadmap steps" on public.business_roadmap_steps for insert with check (
  exists (
    select 1 from public.business_roadmaps
    where business_roadmaps.id = business_roadmap_steps.roadmap_id
    and business_roadmaps.user_id = auth.uid()
  )
);
create policy "Users update roadmap steps" on public.business_roadmap_steps for update using (
  exists (
    select 1 from public.business_roadmaps
    where business_roadmaps.id = business_roadmap_steps.roadmap_id
    and business_roadmaps.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.business_roadmaps
    where business_roadmaps.id = business_roadmap_steps.roadmap_id
    and business_roadmaps.user_id = auth.uid()
  )
);
create policy "Users delete roadmap steps" on public.business_roadmap_steps for delete using (
  exists (
    select 1 from public.business_roadmaps
    where business_roadmaps.id = business_roadmap_steps.roadmap_id
    and business_roadmaps.user_id = auth.uid()
  )
);

create policy "Public can read business scenarios" on public.business_scenarios for select using (true);
create policy "Admins manage business scenarios" on public.business_scenarios for all using (public.is_admin()) with check (public.is_admin());

create policy "Users insert feedback" on public.feedback_reports for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users read own feedback" on public.feedback_reports for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins manage feedback" on public.feedback_reports for all using (public.is_admin()) with check (public.is_admin());

insert into public.service_categories (id, slug, title_en, title_sw, icon, sort_order) values
  ('00000000-0000-4000-8000-000000000001', 'identity', 'Identity & Civil Registration', 'Utambulisho na Usajili wa Raia', 'id-card-outline', 1),
  ('00000000-0000-4000-8000-000000000002', 'tax', 'Tax & TRA', 'Kodi na TRA', 'receipt-outline', 2),
  ('00000000-0000-4000-8000-000000000003', 'business', 'Business & Licensing', 'Biashara na Leseni', 'briefcase-outline', 3),
  ('00000000-0000-4000-8000-000000000004', 'travel', 'Travel & Immigration', 'Usafiri wa Nje na Uhamiaji', 'airplane-outline', 4),
  ('00000000-0000-4000-8000-000000000005', 'transport', 'Transport & Driving', 'Usafiri na Udereva', 'car-outline', 5),
  ('00000000-0000-4000-8000-000000000006', 'civil', 'Civil Registration', 'Usajili wa Raia', 'people-outline', 6)
on conflict (id) do nothing;

insert into public.app_disclaimers (key, body_en, body_sw) values
  (
    'main_trust_notice',
    'This is an independent guide. It is not an official government platform. Always confirm final requirements, fees, and procedures through official government channels.',
    'Huu ni mwongozo huru. Si jukwaa rasmi la serikali. Hakikisha mahitaji, ada na taratibu za mwisho kupitia njia rasmi za serikali.'
  ),
  (
    'legal_tax_notice',
    'This is general guidance, not legal/tax advice.',
    'Huu ni mwongozo wa jumla, si ushauri wa kisheria au kodi.'
  )
on conflict (key) do nothing;

insert into public.service_guides (
  id, category_id, title_en, title_sw, slug, summary_en, summary_sw, who_needs_it_en, who_needs_it_sw,
  required_documents, steps, estimated_time, official_url, physical_location_note, common_mistakes, faqs,
  search_keywords, last_verified_at, published, disclaimer
) values
  (
    '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001',
    'NIDA/NIN Application', 'Maombi ya NIDA/NIN', 'nida-nin-application',
    'A preparation guide for applying for a NIN and national ID.', 'Mwongozo wa kujiandaa kwa maombi ya NIN na kitambulisho cha taifa.',
    'Citizens or residents who need identity number support for public services, banks, mobile lines, or work.',
    'Raia au mkazi anayehitaji namba ya utambulisho kwa huduma za serikali, benki, simu au ajira.',
    '["Birth certificate or birth proof", "Parent/guardian details where required", "Residence details"]',
    '["Prepare your details", "Visit the relevant center", "Complete verification"]',
    'Varies by verification and office workload', 'https://services.nida.go.tz/', 'Visit the relevant NIDA office or authorized registration point where applicable.',
    '["Names not matching across documents", "Missing residence proof", "Submitting details without checking them"]',
    '[]',
    array['nida','nin','kitambulisho','national id','utambulisho'], current_date, true,
    'This is general guidance from HudumaGuide TZ. It is not legal/tax advice and not an official government instruction. Confirm final requirements, fees, and procedures through official government channels.'
  ),
  (
    '10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001',
    'NIDA Replacement', 'Kubadilisha/Kupata NIDA Iliyopotea', 'nida-replacement',
    'A guide for replacing a lost or damaged NIDA card.', 'Mwongozo wa hatua za kufuatilia kitambulisho cha NIDA kilichopotea au kuharibika.',
    'Anyone whose national ID card is lost or damaged.', 'Mtu aliyepoteza au kuharibu kitambulisho cha taifa.',
    '["Loss report if requested", "NIN or identity details"]',
    '["Confirm requirements", "Submit replacement request", "Follow up"]',
    'Varies by verification and replacement queue', 'https://services.nida.go.tz/', 'Check the relevant NIDA office or official guidance before visiting.',
    '["Missing NIN", "Losing receipts or references", "Relying on unofficial information"]',
    '[]',
    array['nida replacement','nida lost','kitambulisho kimepotea'], current_date, true,
    'This is general guidance from HudumaGuide TZ. Confirm final requirements, fees, and procedures through official government channels.'
  ),
  (
    '10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002',
    'TIN Registration', 'Usajili wa TIN', 'tin-registration',
    'A preparation guide for getting a Taxpayer Identification Number.', 'Mwongozo wa kujiandaa kupata Taxpayer Identification Number.',
    'Individuals, entrepreneurs, freelancers, or companies handling tax or business activities.',
    'Mtu binafsi, mfanyabiashara, freelancer au kampuni inayohitaji kushughulika na kodi au biashara.',
    '["NIDA/NIN", "Phone number and address", "Business documents if applicable"]',
    '["Identify taxpayer type", "Prepare documents", "Use official channel"]',
    'Varies by taxpayer type and verification', 'https://taxpayerportal.tra.go.tz/', 'Use the relevant TRA office or official digital channel where available.',
    '["Confusing personal and business TIN use", "Using incorrect address details", "Not updating changed details"]',
    '[]',
    array['tin','tra','kodi','tax','taxpayer'], current_date, true,
    'This is general guidance, not legal/tax advice. Confirm final requirements, fees, and procedures through official government channels.'
  ),
  (
    '10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004',
    'Passport Application', 'Maombi ya Pasipoti', 'passport-application',
    'A preparation guide for applying for a Tanzanian passport.', 'Mwongozo wa kujiandaa kwa maombi ya pasipoti ya Tanzania.',
    'Tanzanians planning international travel or needing a new passport.', 'Mtanzania anayepanga kusafiri nje ya nchi au anayehitaji pasipoti mpya.',
    '["Birth certificate", "NIDA/NIN", "Passport photos if requested"]',
    '["Confirm passport type", "Prepare documents", "Open official portal"]',
    'Varies by application type and verification', 'https://eservices.immigration.go.tz/online/web/passport', 'Confirm appointment and office requirements through official immigration channels.',
    '["Names not matching", "Not confirming appointment details", "Assuming fees without confirmation"]',
    '[]',
    array['passport','pasipoti','immigration','uhamiaji'], current_date, true,
    'This is general guidance from HudumaGuide TZ. Confirm final requirements, fees, and procedures through official government channels.'
  ),
  (
    '10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005',
    'Driving Licence Renewal', 'Renewal ya Leseni ya Udereva', 'driving-licence-renewal',
    'A guide for preparing to renew a driving licence.', 'Mwongozo wa kujiandaa kuhuisha leseni ya udereva.',
    'Drivers whose licence is expiring or expired.', 'Dereva mwenye leseni inayokaribia kuisha au iliyoisha muda wake.',
    '["Existing licence", "NIDA/NIN", "TIN if requested"]',
    '["Check expiry date", "Confirm requirements", "Complete renewal"]',
    'Varies by channel and verification', 'https://taxpayerportal.tra.go.tz/', 'Confirm whether you need TRA, police, or licensing office steps through official guidance.',
    '["Forgetting expiry date", "Not checking licence classes", "Assuming payment details without confirmation"]',
    '[]',
    array['driving licence','leseni','renewal','udereva'], current_date, true,
    'This is general guidance from HudumaGuide TZ. Confirm final requirements, fees, and procedures through official government channels.'
  ),
  (
    '10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000006',
    'Birth Certificate Application', 'Maombi ya Cheti cha Kuzaliwa', 'birth-certificate-application',
    'A guide for preparing birth certificate application information.', 'Mwongozo wa kuandaa taarifa za kupata cheti cha kuzaliwa.',
    'A child, parent/guardian, or adult needing a certificate for school, passport, NIDA, or other services.',
    'Mtoto, mzazi/mlezi au mtu mzima anayehitaji cheti kwa shule, pasipoti, NIDA au huduma nyingine.',
    '["Birth notification or proof if available", "Parent/guardian details", "Applicant ID if requested"]',
    '["Collect details", "Verify record", "Collect certificate"]',
    'Varies by record availability and office workload', 'https://erita.rita.go.tz/', 'Confirm the relevant civil registration office or official channel.',
    '["Parent names not matching", "Incorrect dates", "Delaying record follow-up"]',
    '[]',
    array['birth certificate','cheti cha kuzaliwa','rita','kuzaliwa'], current_date, true,
    'This is general guidance from HudumaGuide TZ. Confirm final requirements, fees, and procedures through official government channels.'
  ),
  (
    '10000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000003',
    'Business Name Registration', 'Usajili wa Jina la Biashara', 'business-name-registration',
    'A guide for preparing to register a business name.', 'Mwongozo wa kujiandaa kusajili jina la biashara.',
    'Entrepreneurs who want to trade using a registered business name.', 'Mjasiriamali au mfanyabiashara anayetaka kutumia jina rasmi la biashara.',
    '["Owner NIDA/NIN", "Alternative business names", "Business address"]',
    '["Choose a name", "Do name search", "Register the name"]',
    'Varies by name availability and verification', 'https://ors.brela.go.tz/', 'Use the official BRELA channel or authorized office guidance.',
    '["Choosing a name too similar to another", "No business address", "Assuming a business name is a company"]',
    '[{"question_en":"Is a business name a company?","answer_en":"Not necessarily. It is often a trading name, not a limited company."}]',
    array['brela','business name','jina la biashara','kusajili biashara'], current_date, true,
    'This is general guidance from HudumaGuide TZ. Confirm final requirements, fees, and procedures through official government channels.'
  ),
  (
    '10000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000003',
    'Limited Company Registration', 'Usajili wa Limited Company', 'limited-company-registration',
    'A guide for preparing to register a company with shareholders/directors.', 'Mwongozo wa kujiandaa kusajili kampuni yenye wanahisa/wakurugenzi.',
    'Businesses needing a formal structure, partners, contracts, tenders, or growth readiness.',
    'Biashara inayohitaji muundo rasmi zaidi, washirika, mikataba, zabuni au ukuaji.',
    '["Director details", "Shareholder details", "Company address"]',
    '["Choose structure", "Name search/reservation", "Submit documents", "Plan compliance"]',
    'Varies by document readiness and verification', 'https://ors.brela.go.tz/', 'Use the official BRELA channel or professional guidance where needed.',
    '["Not agreeing on shares early", "Poor company records", "Forgetting post-registration obligations"]',
    '[]',
    array['company','limited company','kampuni','brela','wanahisa'], current_date, true,
    'This is general guidance, not legal/tax advice. Confirm final requirements, fees, and procedures through official government channels.'
  ),
  (
    '10000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000003',
    'Business Licence Application', 'Maombi ya Leseni ya Biashara', 'business-licence-application',
    'A guide for preparing to apply for a business licence based on location and activity.',
    'Mwongozo wa kujiandaa kuomba leseni ya biashara kulingana na eneo na aina ya shughuli.',
    'Business owners who need permission to operate in a location or sector.',
    'Mfanyabiashara anayehitaji ruhusa ya kuendesha biashara katika eneo au sekta fulani.',
    '["Business registration certificate/reference", "TIN", "Business premises details"]',
    '["Identify activity", "Identify authority", "Submit application"]',
    'Varies by local authority, sector, and inspection requirements', 'https://business.go.tz/register-a-business', 'Confirm local government or sector regulator requirements before payment.',
    '["Applying for the wrong licence type", "Forgetting renewal", "Not checking location-specific requirements"]',
    '[]',
    array['business licence','leseni ya biashara','permit','halmashauri'], current_date, true,
    'This is general guidance from HudumaGuide TZ. Confirm final requirements, fees, and procedures through official government channels.'
  ),
  (
    '10000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000002',
    'Tax Deadline Reminder Guide', 'Kuweka Reminders za Kodi', 'tax-deadline-reminders',
    'A guide for setting reminders for tax and compliance dates.', 'Mwongozo wa kuweka kumbukumbu za tarehe muhimu za kodi na compliance.',
    'Business owners, freelancers, or companies who want to avoid missed deadlines.',
    'Mfanyabiashara, freelancer au kampuni inayotaka kuepuka kusahau deadlines.',
    '["TIN", "Business registration details", "Business calendar"]',
    '["List obligations", "Confirm official dates", "Set reminders"]',
    '15-30 minutes to organize reminders', 'https://taxpayerportal.tra.go.tz/', 'Consult TRA or a qualified professional for tax-specific obligations.',
    '["Waiting until the last day", "Not knowing your obligations", "Mixing personal and business tax matters"]',
    '[]',
    array['tax reminders','kodi','deadline','tra','returns','efd','vfd'], current_date, true,
    'This is general guidance, not legal/tax advice. Confirm final requirements, fees, and procedures through official government channels.'
  )
on conflict (id) do nothing;

insert into public.service_required_documents (guide_id, position, title_en, title_sw) values
  ('10000000-0000-4000-8000-000000000001', 1, 'Birth certificate or birth proof', 'Cheti cha kuzaliwa au uthibitisho wa kuzaliwa'),
  ('10000000-0000-4000-8000-000000000001', 2, 'Parent/guardian details where required', 'Taarifa za mzazi/mlezi pale zinapohitajika'),
  ('10000000-0000-4000-8000-000000000001', 3, 'Residence details', 'Taarifa za makazi'),
  ('10000000-0000-4000-8000-000000000002', 1, 'Loss report if requested', 'Taarifa ya kupoteza kama itaombwa'),
  ('10000000-0000-4000-8000-000000000002', 2, 'NIN or identity details', 'NIN au taarifa zako za utambulisho'),
  ('10000000-0000-4000-8000-000000000003', 1, 'NIDA/NIN', 'NIDA/NIN'),
  ('10000000-0000-4000-8000-000000000003', 2, 'Phone number and address', 'Namba ya simu na anuani'),
  ('10000000-0000-4000-8000-000000000003', 3, 'Business documents if applicable', 'Nyaraka za biashara kama una biashara'),
  ('10000000-0000-4000-8000-000000000004', 1, 'Birth certificate', 'Cheti cha kuzaliwa'),
  ('10000000-0000-4000-8000-000000000004', 2, 'NIDA/NIN', 'NIDA/NIN'),
  ('10000000-0000-4000-8000-000000000004', 3, 'Passport photos if requested', 'Picha za pasipoti kama zitaombwa'),
  ('10000000-0000-4000-8000-000000000005', 1, 'Existing licence', 'Leseni ya zamani'),
  ('10000000-0000-4000-8000-000000000005', 2, 'NIDA/NIN', 'NIDA/NIN'),
  ('10000000-0000-4000-8000-000000000005', 3, 'TIN if requested', 'TIN kama itaombwa'),
  ('10000000-0000-4000-8000-000000000006', 1, 'Birth notification or proof if available', 'Taarifa/uthibitisho wa kuzaliwa kama upo'),
  ('10000000-0000-4000-8000-000000000006', 2, 'Parent/guardian details', 'Taarifa za wazazi/walezi'),
  ('10000000-0000-4000-8000-000000000006', 3, 'Applicant ID if requested', 'Kitambulisho cha mwombaji kama kitaombwa'),
  ('10000000-0000-4000-8000-000000000007', 1, 'Owner NIDA/NIN', 'NIDA/NIN ya mmiliki'),
  ('10000000-0000-4000-8000-000000000007', 2, 'Alternative business names', 'Majina mbadala ya biashara'),
  ('10000000-0000-4000-8000-000000000007', 3, 'Business address', 'Anuani ya biashara'),
  ('10000000-0000-4000-8000-000000000008', 1, 'Director details', 'Taarifa za wakurugenzi'),
  ('10000000-0000-4000-8000-000000000008', 2, 'Shareholder details', 'Taarifa za wanahisa'),
  ('10000000-0000-4000-8000-000000000008', 3, 'Company address', 'Anuani ya kampuni'),
  ('10000000-0000-4000-8000-000000000009', 1, 'Business registration certificate/reference', 'Cheti/reference ya usajili wa biashara'),
  ('10000000-0000-4000-8000-000000000009', 2, 'TIN', 'TIN'),
  ('10000000-0000-4000-8000-000000000009', 3, 'Business premises details', 'Taarifa za eneo la biashara'),
  ('10000000-0000-4000-8000-000000000010', 1, 'TIN', 'TIN'),
  ('10000000-0000-4000-8000-000000000010', 2, 'Business registration details', 'Taarifa za usajili wa biashara'),
  ('10000000-0000-4000-8000-000000000010', 3, 'Business calendar', 'Kalenda ya biashara')
on conflict (guide_id, position) do nothing;

insert into public.service_steps (guide_id, position, title_en, title_sw, description_en, description_sw) values
  ('10000000-0000-4000-8000-000000000001', 1, 'Prepare your details', 'Andaa taarifa zako', 'Check your names, date of birth, and residence details before visiting the office.', 'Kagua majina, tarehe ya kuzaliwa na taarifa za makazi kabla ya kwenda ofisini.'),
  ('10000000-0000-4000-8000-000000000001', 2, 'Visit the relevant center', 'Tembelea kituo husika', 'Follow official office or portal instructions for location and service hours.', 'Fuata maelekezo ya ofisi au tovuti rasmi kuhusu eneo na muda wa kuhudumiwa.'),
  ('10000000-0000-4000-8000-000000000001', 3, 'Complete verification', 'Fanya uhakiki', 'Provide accurate information and keep any tracking number if issued.', 'Toa taarifa kwa usahihi na hifadhi namba ya ufuatiliaji kama utapewa.'),
  ('10000000-0000-4000-8000-000000000002', 1, 'Confirm requirements', 'Hakiki mahitaji', 'Check official guidance to know whether a loss report or payment is required.', 'Angalia chanzo rasmi kujua kama unahitaji taarifa ya kupoteza au malipo.'),
  ('10000000-0000-4000-8000-000000000002', 2, 'Submit replacement request', 'Wasilisha taarifa', 'Use the office or official channel provided.', 'Nenda kwenye ofisi au njia rasmi iliyoelekezwa.'),
  ('10000000-0000-4000-8000-000000000002', 3, 'Follow up', 'Fuatilia maombi', 'Keep any receipt or tracking reference if issued.', 'Hifadhi risiti au namba ya ufuatiliaji kama utapewa.'),
  ('10000000-0000-4000-8000-000000000003', 1, 'Identify taxpayer type', 'Tambua aina ya mlipa kodi', 'Choose whether you are an individual, business, company, or another type.', 'Chagua kama ni mtu binafsi, biashara, kampuni au aina nyingine.'),
  ('10000000-0000-4000-8000-000000000003', 2, 'Prepare documents', 'Andaa nyaraka', 'Ensure your NIDA/NIN, contact, and business details are accurate.', 'Hakikisha NIDA/NIN, mawasiliano na taarifa za biashara zipo sawa.'),
  ('10000000-0000-4000-8000-000000000003', 3, 'Use official channel', 'Fuata njia rasmi', 'Submit through TRA office or official TRA digital channel where available.', 'Wasilisha kupitia ofisi au mfumo rasmi wa TRA kama unapatikana.'),
  ('10000000-0000-4000-8000-000000000004', 1, 'Confirm passport type', 'Tambua aina ya pasipoti', 'Confirm the application type and requirements through official sources.', 'Hakiki aina ya maombi na mahitaji yake kupitia chanzo rasmi.'),
  ('10000000-0000-4000-8000-000000000004', 2, 'Prepare documents', 'Andaa nyaraka', 'Check names and dates across your birth certificate, NIDA, and other documents.', 'Kagua majina na tarehe kwenye cheti, NIDA na nyaraka nyingine.'),
  ('10000000-0000-4000-8000-000000000004', 3, 'Open official portal', 'Fungua tovuti rasmi', 'Use the official system or relevant office for final steps.', 'Tumia mfumo rasmi au ofisi husika kwa hatua za mwisho.'),
  ('10000000-0000-4000-8000-000000000005', 1, 'Check expiry date', 'Kagua tarehe ya mwisho', 'Check whether renewal is due now or if you should set a reminder.', 'Angalia kama renewal inahitajika sasa au unaweza kuweka reminder.'),
  ('10000000-0000-4000-8000-000000000005', 2, 'Confirm requirements', 'Hakiki mahitaji', 'Use official guidance to confirm fees, documents, and payment method.', 'Tumia chanzo rasmi kuthibitisha ada, nyaraka na njia ya malipo.'),
  ('10000000-0000-4000-8000-000000000005', 3, 'Complete renewal', 'Fanya renewal', 'Follow the official system or office for final steps.', 'Fuata mfumo au ofisi rasmi kwa hatua za mwisho.'),
  ('10000000-0000-4000-8000-000000000006', 1, 'Collect details', 'Kusanya taarifa', 'Prepare full names, date, and place of birth.', 'Andaa majina kamili, tarehe na mahali pa kuzaliwa.'),
  ('10000000-0000-4000-8000-000000000006', 2, 'Verify record', 'Hakiki rekodi', 'Use official steps to verify or create the record.', 'Fuata njia rasmi ya kuthibitisha au kuanzisha rekodi.'),
  ('10000000-0000-4000-8000-000000000006', 3, 'Collect certificate', 'Pokea cheti', 'Keep the certificate safely and set reminders if needed for deadlines.', 'Hifadhi cheti mahali salama na weka reminder kama kina matumizi ya muda maalum.'),
  ('10000000-0000-4000-8000-000000000007', 1, 'Choose a name', 'Chagua jina', 'Prepare 2-3 names in case one is rejected.', 'Andaa majina 2-3 ili kuepuka kuchelewa jina likikataliwa.'),
  ('10000000-0000-4000-8000-000000000007', 2, 'Do name search', 'Fanya name search', 'Use official channels to confirm name availability.', 'Tumia njia rasmi kuthibitisha upatikanaji wa jina.'),
  ('10000000-0000-4000-8000-000000000007', 3, 'Register the name', 'Sajili jina', 'Complete registration and keep the certificate/reference.', 'Kamilisha usajili na hifadhi cheti/reference.'),
  ('10000000-0000-4000-8000-000000000008', 1, 'Choose structure', 'Chagua muundo', 'Agree on directors, shareholders, and responsibilities.', 'Elewana kuhusu wakurugenzi, wanahisa na majukumu.'),
  ('10000000-0000-4000-8000-000000000008', 2, 'Name search/reservation', 'Name search/reservation', 'Confirm the name through official channels.', 'Hakiki jina kupitia chanzo rasmi.'),
  ('10000000-0000-4000-8000-000000000008', 3, 'Submit documents', 'Wasilisha nyaraka', 'Complete forms and documents according to official guidance.', 'Kamilisha fomu na nyaraka kulingana na maelekezo rasmi.'),
  ('10000000-0000-4000-8000-000000000008', 4, 'Plan compliance', 'Panga compliance', 'Set reminders for tax, returns, licences, and records.', 'Weka reminders za kodi, returns, leseni na rekodi.'),
  ('10000000-0000-4000-8000-000000000009', 1, 'Identify activity', 'Tambua aina ya biashara', 'Food, retail, service, or transport businesses can have different requirements.', 'Biashara ya chakula, duka, huduma au usafirishaji inaweza kuwa na mahitaji tofauti.'),
  ('10000000-0000-4000-8000-000000000009', 2, 'Identify authority', 'Tambua mamlaka husika', 'Check whether it is local government, a ministry, or sector regulator.', 'Angalia kama ni halmashauri, wizara, au regulator wa sekta.'),
  ('10000000-0000-4000-8000-000000000009', 3, 'Submit application', 'Wasilisha maombi', 'Follow forms, inspections, and payments through official channels.', 'Fuata fomu, ukaguzi na malipo kupitia njia rasmi.'),
  ('10000000-0000-4000-8000-000000000010', 1, 'List obligations', 'Orodhesha obligations', 'List taxes, returns, licences, and renewals that apply to you.', 'Andika kodi, returns, leseni na renewal zinazokuhusu.'),
  ('10000000-0000-4000-8000-000000000010', 2, 'Confirm official dates', 'Hakiki tarehe rasmi', 'Use official sources or a professional to confirm dates.', 'Tumia chanzo rasmi au mtaalamu kuthibitisha tarehe.'),
  ('10000000-0000-4000-8000-000000000010', 3, 'Set reminders', 'Weka reminders', 'Set reminders before the deadline and on the deadline date.', 'Weka reminder kabla ya deadline na siku ya deadline.')
on conflict (guide_id, position) do nothing;

insert into public.service_faqs (guide_id, position, question_en, question_sw, answer_en, answer_sw) values
  ('10000000-0000-4000-8000-000000000001', 1, 'Can HudumaGuide submit my application?', 'Je, HudumaGuide inaweza kutuma maombi yangu?', 'No. We only guide you and point you to official sources.', 'Hapana. Tunatoa mwongozo tu na kukupeleka kwenye chanzo rasmi.'),
  ('10000000-0000-4000-8000-000000000007', 1, 'Is a business name a company?', 'Jina la biashara ni kampuni?', 'Not necessarily. It is often a trading name, not a limited company.', 'Si lazima. Mara nyingi ni jina la biashara, si limited company.'),
  ('10000000-0000-4000-8000-000000000010', 1, 'Does this app give tax advice?', 'Je, app hii inatoa ushauri wa kodi?', 'No. It helps you organize reminders. Confirm obligations with TRA or a qualified professional.', 'Hapana. Inakusaidia kupanga reminders. Hakiki obligations kupitia TRA au mtaalamu.')
on conflict (guide_id, position) do nothing;

insert into public.official_links (guide_id, label_en, label_sw, url, status) values
  ('10000000-0000-4000-8000-000000000001', 'Official portal', 'Tovuti rasmi', 'https://services.nida.go.tz/', 'verified'),
  ('10000000-0000-4000-8000-000000000002', 'Official portal', 'Tovuti rasmi', 'https://services.nida.go.tz/', 'verified'),
  ('10000000-0000-4000-8000-000000000003', 'Official portal', 'Tovuti rasmi', 'https://taxpayerportal.tra.go.tz/', 'verified'),
  ('10000000-0000-4000-8000-000000000004', 'Official portal', 'Tovuti rasmi', 'https://eservices.immigration.go.tz/online/web/passport', 'verified'),
  ('10000000-0000-4000-8000-000000000005', 'Official portal', 'Tovuti rasmi', 'https://taxpayerportal.tra.go.tz/', 'verified'),
  ('10000000-0000-4000-8000-000000000006', 'Official portal', 'Tovuti rasmi', 'https://erita.rita.go.tz/', 'verified'),
  ('10000000-0000-4000-8000-000000000007', 'Official portal', 'Tovuti rasmi', 'https://ors.brela.go.tz/', 'verified'),
  ('10000000-0000-4000-8000-000000000008', 'Official portal', 'Tovuti rasmi', 'https://ors.brela.go.tz/', 'verified'),
  ('10000000-0000-4000-8000-000000000009', 'Official portal', 'Tovuti rasmi', 'https://business.go.tz/register-a-business', 'verified'),
  ('10000000-0000-4000-8000-000000000010', 'Official portal', 'Tovuti rasmi', 'https://taxpayerportal.tra.go.tz/', 'verified');

insert into public.business_scenarios (slug, title_en, title_sw, recommended_structure, summary_en, summary_sw, roadmap_steps) values
  (
    'freelancer-consultant',
    'Freelancer/consultant', 'Freelancer/Mshauri',
    'freelancer',
    'Good for a solo service provider who needs records, TIN readiness, and client contracts.',
    'Inafaa kwa mtoa huduma mmoja anayehitaji rekodi, maandalizi ya TIN na mikataba ya wateja.',
    '["Prepare NIDA/NIN", "Confirm TIN needs", "Keep contracts and receipts", "Set tax reminders"]'
  ),
  (
    'small-retail-shop',
    'Small retail shop', 'Duka dogo',
    'business_name',
    'Good for a small shop that may need a business name, TIN, local licence, and renewal reminders.',
    'Inafaa kwa duka dogo linaloweza kuhitaji jina la biashara, TIN, leseni ya eneo na reminders.',
    '["Choose business name", "Register name", "Confirm TIN", "Apply for licence", "Track renewals"]'
  ),
  (
    'food-business',
    'Food business', 'Biashara ya chakula',
    'business_name',
    'Food businesses often need extra health, premises, and local authority checks.',
    'Biashara za chakula mara nyingi huhitaji ukaguzi wa afya, eneo na mamlaka ya eneo.',
    '["Prepare owner documents", "Confirm premises requirements", "Register business", "Apply for licence", "Set inspection and renewal reminders"]'
  ),
  (
    'online-business',
    'Online business', 'Biashara ya mtandaoni',
    'sole_trader',
    'Good for digital sellers or service providers who need records, payments, and tax reminders.',
    'Inafaa kwa wauzaji au watoa huduma wa mtandaoni wanaohitaji rekodi, malipo na reminders za kodi.',
    '["Clarify business model", "Confirm registration path", "Set payment records", "Track tax obligations"]'
  ),
  (
    'small-company-partners',
    'Small company with partners', 'Kampuni ndogo yenye washirika',
    'limited_company',
    'Good for partners who need shares, directors, formal registration, and ongoing compliance.',
    'Inafaa kwa washirika wanaohitaji hisa, wakurugenzi, usajili rasmi na compliance.',
    '["Agree shares and roles", "Reserve company name", "Register company", "Get TIN", "Set compliance calendar"]'
  )
on conflict (slug) do nothing;
