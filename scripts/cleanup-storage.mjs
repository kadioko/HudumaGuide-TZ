import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_DOCUMENT_BUCKET ?? "user-documents";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const { data: items, error } = await supabase
  .from("account_deletion_file_cleanup")
  .select("id, storage_path")
  .eq("status", "pending")
  .order("created_at", { ascending: true })
  .limit(100);

if (error) {
  console.error(error.message);
  process.exit(1);
}

if (!items?.length) {
  console.log("No pending Storage cleanup items.");
  process.exit(0);
}

for (const item of items) {
  const { error: removeError } = await supabase.storage.from(bucket).remove([item.storage_path]);
  const status = removeError ? "failed" : "deleted";
  const { error: updateError } = await supabase
    .from("account_deletion_file_cleanup")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("id", item.id);

  if (removeError || updateError) {
    console.error(`${item.storage_path}: ${removeError?.message ?? updateError?.message}`);
  } else {
    console.log(`${item.storage_path}: deleted`);
  }
}
