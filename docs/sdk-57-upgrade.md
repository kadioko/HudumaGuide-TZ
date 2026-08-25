# Expo SDK 57 Upgrade Scope

## Why

`npx expo-doctor` fails on SDK 56 with a Hermes V1 memory regression:

```text
Detected Hermes V1 250829098.0.10 from React Native.
Hermes V1 250829098.0.15 and earlier are affected by this regression;
250829098.0.16 is the first version that contains the fix.
```

There is no SDK 56 patch that clears this. `expo@56.0.20` is the newest SDK 56 release and still ships the affected Hermes. The fix arrives with React Native 0.86.2, which is the SDK 57 baseline — React Native 0.86.3 bundles `hermes-compiler 250829098.0.17`.

A JavaScript engine memory regression matters more here than it would for most apps. HudumaGuide targets budget Android hardware in Tanzania, where the practical failure mode is an out-of-memory kill rather than a slow screen. This is the highest-value technical work on the backlog.

Secondary benefit: restores a green `npm run release:check`, which was gated on both `audit:high` and `expo-doctor`.

## Scope is narrower than it looks

Expo's own `bundledNativeModules.json` for `expo@57.0.16` pins these targets. Most of the tree does not move:

| Package | Current | SDK 57 target | Change |
| --- | --- | --- | --- |
| `react` | 19.2.3 | 19.2.3 | none |
| `react-dom` | 19.2.3 | 19.2.3 | none |
| `react-native-safe-area-context` | ~5.7.0 | ~5.7.0 | none |
| `react-native-screens` | ~4.26.0 | ~4.26.0 | none |
| `react-native-web` | ^0.21.2 | ~0.21.0 | none |
| `react-native-gesture-handler` | ~2.31.1 | ~2.32.0 | patch |
| `react-native` | 0.85.3 | 0.86.2 | **minor** |
| `expo` | ~56.0.20 | ~57.0.16 | **major** |
| `expo-router` | ~56.2.19 | ~57.0.16 | **major** |
| `expo-updates` | ~56.0.25 | ~57.0.17 | **major** |
| `expo-notifications` | ~56.0.24 | ~57.0.14 | **major** |
| `expo-constants` | ~56.0.18 | ~57.0.14 | **major** |
| `expo-image-picker` | ~56.0.24 | ~57.0.13 | **major** |
| `expo-file-system` | ~56.0.8 | ~57.0.5 | **major** |
| `expo-linking` | ~56.0.17 | ~57.0.7 | **major** |
| `expo-splash-screen` | ~56.0.14 | ~57.0.8 | **major** |
| `expo-local-authentication` | ~56.0.5 | ~57.0.2 | **major** |
| `expo-secure-store` | ~56.0.4 | ~57.0.1 | **major** |
| `expo-document-picker` | ~56.0.4 | ~57.0.1 | **major** |
| `expo-font` | ~56.0.7 | ~57.0.1 | **major** |
| `expo-status-bar` | ~56.0.4 | ~57.0.1 | **major** |
| `eslint-config-expo` | ~56.0.4 | ~57.0.1 | **major** |

Two findings that de-risk this materially:

1. **React does not move.** React Native 0.86.3 declares `peerDependencies.react: ^19.2.3`, and the project is already on 19.2.3. No React 19 migration is bundled into this upgrade.
2. **No third-party native library majors.** `react-native-gesture-handler` publishes a 3.x line, but SDK 57 pins ~2.32.0. Screens, safe-area-context, and web all stay put.

So the real work is React Native 0.85.3 → 0.86.2 plus the `expo-*` major bumps, not a wholesale dependency migration.

## Known-safe areas

Checked against the current codebase:

- **`expo-file-system/legacy` survives.** [documentStorageService.ts](../src/services/documentStorageService.ts) imports the legacy API, and `expo-file-system@57.0.5` still declares the `./legacy` export. No rewrite of the document vault's file handling.
- **New Architecture is already on.** [app.json](../app.json) sets no `newArchEnabled` flag, so the project has been running SDK 56's default (New Architecture enabled). SDK 57 does not force a first-time migration.
- **Node is already current.** CI and local both run Node 22, above the SDK 57 floor.
- **Keystore workflow is unaffected.** `credentialsSource: local` in [eas.json](../eas.json) is orthogonal to the SDK version.

## Risk areas to verify

Ordered by likelihood of costing time:

1. **`expo-notifications` major.** The heaviest custom logic in the app — quiet hours, repeat-aware scheduling, and 7-day/1-day pre-deadline alerts in [reminderService.ts](../src/services/reminderService.ts). Scheduling APIs and Android channel behaviour are the usual sources of churn across Expo majors. Re-test scheduling on a physical device, not only an emulator.
2. **`expo-updates` major.** OTA is enabled with `runtimeVersion.policy: appVersion`. A runtime version mismatch silently strands existing installs on their current bundle. Confirm the policy still resolves as expected and publish a test update to the preview branch before production.
3. **`expo-router` major.** Typed routes are on (`experiments.typedRoutes`). The flat `Stack.Screen` registrations in [app/\_layout.tsx](../app/_layout.tsx) — `admin/index`, `services/[slug]/index`, and the rest — are the pattern most exposed to router changes. The `ErrorBoundary` exports added alongside this scope should be re-confirmed to still catch.
4. **`expo-splash-screen` major.** Cosmetic but user-visible; verify the 220px splash image still renders at the intended size.
5. **`eslint-config-expo` major.** Expect new lint findings unrelated to the upgrade. Land them as a separate commit so the upgrade diff stays reviewable.
6. **Metro/build tooling.** [babel.config.js](../babel.config.js) uses `require.resolve("babel-preset-expo")`, a workaround for a resolution issue. Re-test whether it is still needed.

## Sequence

1. Branch from an up-to-date `main` with `npm run verify` already green.
2. `npx expo install expo@^57 --fix`, then `npx expo install --check` until clean.
3. `npx expo-doctor` — confirm the Hermes check now passes.
4. `npm run verify` — typecheck, lint, seed lint, tests, dependency check.
5. `npm run smoke:web` — catches bundler and module-resolution breakage cheaply, before any native build.
6. `npm audit --audit-level=high` — record what actually cleared rather than assuming.
7. `eas build --profile preview --platform android` and install on a physical low-RAM device.
8. Device smoke test, prioritising the risk areas: reminder scheduling across quiet hours, notification permission flow, camera capture and document upload, biometric lock, OTA update check, deep links.
9. `npm run e2e:maestro` against the preview build.
10. Publish a preview OTA update and confirm an existing install receives it.
11. Bump `versionCode` and cut the production build.

## Rollback

The upgrade touches `package.json`, `package-lock.json`, and possibly `app.json` only — no data migration, no schema change. Reverting the branch is sufficient. The one-way door is the OTA channel: do not publish a production update built on SDK 57 until a preview build has been validated on a physical device, because installs that take the update cannot be rolled back to an older runtime version.

## Estimate

Half a day if nothing breaks beyond lint. One to two days realistically, with `expo-notifications` scheduling behaviour the most likely source of the difference.

## Outcome

Steps 1-6 are done on `upgrade/sdk-57`. Nothing in the codebase needed changing: no source edits, no `app.json` changes, and no new lint findings from `eslint-config-expo@57`.

| Gate | Result |
| --- | --- |
| `npx expo-doctor` | 21/21 checks pass; the Hermes check clears |
| `npm run verify` | pass |
| `npm run smoke:web` | pass |
| `npm audit --audit-level=high` | exits 0 |
| `npm run release:check` | **exits 0** |

Runtime-checked in a browser against the web target: language selection, onboarding, the home tab, and a dynamic `services/[slug]` route all render with zero console errors, and the deleted `/admin/error` route correctly reports an unmatched route.

### Correction to the audit expectation above

The upgrade on its own cleared nothing — high-severity findings stayed at 9. The cause was more specific than "transitive Metro tooling pinned through the Expo tree": Expo already resolves the patched `metro@0.84.5`, but `react-native@0.86.2` pulls `@react-native/community-cli-plugin`, which depends on the vulnerable `metro@0.84.4`, so the tree carried two copies.

Getting to zero took two further steps, each committed separately:

1. `npm audit fix` — lockfile only, no declared dependency changed. Took high findings from 9 to 4.
2. An `overrides` block pinning `metro`, `metro-config`, and `metro-transform-worker` to `0.84.5`, deduping both copies onto the version Expo already bundles and drives bundling with. Took the remaining 4 to 0.

Revisit the override at the next React Native upgrade: once `@react-native/community-cli-plugin` ships a patched Metro, it should be removed rather than left to pin an aging version.

11 moderate advisories remain, all in `@expo/config-plugins` and its dependents. `audit:high` does not gate on them.

### Still outstanding

Steps 7-11 need hardware and build credentials, so they are untouched:

- Android preview build via EAS, installed on a physical low-RAM device.
- Device smoke test of the risk areas above, especially reminder scheduling across quiet hours, the notification permission flow, camera capture, and biometric lock. The web runtime check exercises none of these, and `expo-notifications` remains the most likely place for a behaviour change to hide.
- `npm run e2e:maestro` against that preview build.
- A preview OTA update, confirmed to reach an existing install before anything ships to production.
- `versionCode` bump and the production build.
