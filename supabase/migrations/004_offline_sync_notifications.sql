alter table public.user_reminders
  add column if not exists pre_reminder_days jsonb not null default '[]'::jsonb,
  add column if not exists scheduled_notification_ids jsonb not null default '[]'::jsonb,
  add column if not exists last_scheduled_at timestamptz,
  add column if not exists client_updated_at timestamptz;

alter table public.profiles
  add column if not exists low_data_mode boolean not null default false,
  add column if not exists notification_preferences jsonb not null default '{
    "quietHoursEnabled": true,
    "quietHoursStart": "21:00",
    "quietHoursEnd": "07:00",
    "defaultPreReminderDays": [7, 1],
    "permissionEducationSeen": false
  }'::jsonb;
