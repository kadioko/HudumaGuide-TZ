import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const projectId = process.env.SUPABASE_PROJECT_ID;
const args = ["supabase", "gen", "types", "typescript"];

if (projectId) {
  args.push("--project-id", projectId);
} else {
  args.push("--local");
}

try {
  const output = execFileSync("npx", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  });

  writeFileSync(join(process.cwd(), "src", "types", "supabase.ts"), output);
  console.log(`Generated src/types/supabase.ts from ${projectId ? `project ${projectId}` : "local Supabase"}.`);
} catch {
  console.error("Unable to generate Supabase types. Start local Supabase or set SUPABASE_PROJECT_ID and authenticate the Supabase CLI.");
  process.exit(1);
}
