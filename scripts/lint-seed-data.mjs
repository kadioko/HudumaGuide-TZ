import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["vitest", "run", "src/utils/serviceGuideSchema.test.ts"], {
  shell: true,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
