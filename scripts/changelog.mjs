import { execSync } from "node:child_process";

const diff = execSync("git diff --name-only", { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);

console.log("# Release checklist changelog seed");
console.log("");
console.log(`Generated: ${new Date().toISOString()}`);
console.log("");
console.log("Changed files:");
for (const file of diff) {
  console.log(`- ${file}`);
}
