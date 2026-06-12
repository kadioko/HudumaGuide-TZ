import { readFileSync } from "node:fs";

const app = JSON.parse(readFileSync("app.json", "utf8")).expo;
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

const issues = [];
if (app.version !== pkg.version) {
  issues.push(`app.json version ${app.version} does not match package.json ${pkg.version}`);
}
if (app.android?.package !== "com.hudumaguide.tz") {
  issues.push("Android package must be com.hudumaguide.tz");
}
if (app.ios?.bundleIdentifier !== "com.hudumaguide.tz") {
  issues.push("iOS bundle identifier must be com.hudumaguide.tz");
}
if (!app.icon || !app.android?.adaptiveIcon?.foregroundImage) {
  issues.push("App icon and Android adaptive icon must be configured");
}
if (app.runtimeVersion?.policy !== "appVersion") {
  issues.push("runtimeVersion policy must be appVersion for OTA compatibility");
}
if (!app.updates?.enabled || app.updates?.checkAutomatically !== "ON_LOAD") {
  issues.push("expo-updates must be enabled and check on load");
}
if (!app.plugins?.includes("expo-updates")) {
  issues.push("expo-updates plugin must be configured");
}
const splashPlugin = app.plugins?.find((plugin) => Array.isArray(plugin) && plugin[0] === "expo-splash-screen");
if (!splashPlugin) {
  issues.push("expo-splash-screen plugin must be configured with splash artwork");
} else if (!splashPlugin[1]?.image || !splashPlugin[1]?.backgroundColor) {
  issues.push("expo-splash-screen plugin must include image and backgroundColor");
}

if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log("Build config looks ready.");
