import { readFileSync, writeFileSync } from "node:fs";

const nextVersion = process.argv[2];
if (!nextVersion || !/^\d+\.\d+\.\d+$/.test(nextVersion)) {
  console.error("Usage: npm run version:bump -- 1.2.3");
  process.exit(1);
}

for (const file of ["package.json", "app.json"]) {
  const json = JSON.parse(readFileSync(file, "utf8"));
  if (file === "package.json") {
    json.version = nextVersion;
  } else {
    json.expo.version = nextVersion;
  }
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
}

console.log(`Version bumped to ${nextVersion}`);
