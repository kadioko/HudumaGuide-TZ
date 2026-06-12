import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const testUserId = process.env.RLS_TEST_USER_ID ?? "00000000-0000-0000-0000-000000000001";
const testGuideId = process.env.RLS_TEST_GUIDE_ID ?? "00000000-0000-0000-0000-000000000010";

if (!anonKey) {
  console.error("Missing SUPABASE_ANON_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY. For local Supabase, copy the anon key from `supabase status`.");
  process.exit(1);
}

const supabase = createClient(url, anonKey);
console.log(`Checking anonymous RLS denial against ${url}`);

const checks = [
  { table: "user_reminders", insert: { user_id: testUserId, client_id: "rls-test-reminder", title: "RLS test", category: "custom", remind_at: "2026-12-31", repeat_option: "none", notification_enabled: false, created_at: new Date().toISOString() } },
  { table: "user_documents", insert: { user_id: testUserId, client_id: "rls-test-document", title: "RLS test", document_type: "Test", folder: "Other", created_at: new Date().toISOString(), updated_at: new Date().toISOString() } },
  { table: "user_saved_guides", insert: { user_id: testUserId, guide_id: testGuideId } },
  { table: "user_checklist_items", insert: { user_id: testUserId, guide_id: testGuideId, item_type: "document", item_key: "rls-test", title: "RLS test", completed: true } },
  { table: "business_profiles", insert: { user_id: testUserId, client_id: "rls-test-business", business_name: "RLS test", owner_name: "RLS", business_type: "sole_trader", industry: "test", city: "test" } },
  { table: "business_roadmaps", insert: { user_id: testUserId, client_id: "rls-test-roadmap", recommended_structure: "sole_trader", generated_from_answers: {} } }
];

for (const check of checks) {
  const { error } = await supabase.from(check.table).insert(check.insert);
  if (!error) {
    console.error(`${check.table}: anonymous insert unexpectedly succeeded. Check RLS policies.`);
    process.exitCode = 1;
  } else {
    console.log(`${check.table}: anonymous insert denied as expected`);
  }
}
