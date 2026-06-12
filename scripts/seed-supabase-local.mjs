import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["supabase", "db", "reset"], {
  shell: true,
  stdio: "inherit"
});

if (result.error) {
  console.error("Unable to run Supabase local seed. Install the Supabase CLI and start Docker, then retry.");
  process.exit(1);
}

process.exit(result.status ?? 1);
