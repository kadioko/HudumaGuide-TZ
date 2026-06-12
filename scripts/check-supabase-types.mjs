import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const currentTypesPath = "src/types/supabase.ts";
const projectId = process.env.SUPABASE_PROJECT_ID;
const required = process.env.SUPABASE_TYPES_GATE === "required" || Boolean(projectId);
const args = ["supabase", "gen", "types", "typescript"];

if (projectId) {
  args.push("--project-id", projectId);
} else {
  args.push("--local");
}

const result = spawnSync("npx", args, {
  shell: true,
  encoding: "utf8"
});

if (result.status !== 0) {
  const message = result.stderr || result.stdout || "Unable to generate Supabase types.";
  if (required) {
    console.error(message);
    process.exit(result.status ?? 1);
  }

  console.warn("Skipping Supabase type freshness gate because local/project Supabase is unavailable.");
  console.warn(message.trim());
  process.exit(0);
}

const current = normalize(readFileSync(currentTypesPath, "utf8"));
const generated = normalize(result.stdout);

if (current !== generated) {
  console.error(`${currentTypesPath} is stale. Run npm run types:supabase and commit the generated file.`);
  process.exit(1);
}

console.log("Supabase generated types are fresh.");

function normalize(value) {
  return value.replace(/\r\n/g, "\n").trim();
}
