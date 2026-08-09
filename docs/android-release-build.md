# Android Play Release Build

This document is the source of truth for creating the HudumaGuide TZ Android App Bundle (`.aab`) for Google Play.

## Current Status

Checked on 2026-08-09:

- Expo account `kadioko` is authenticated locally.
- The confirmed Google Play identity is `com.hudumaguide.tz`, version name `0.1.0`, version code `11`.
- This identity was recovered from `11.aab`, `11.apk`, and `11-archived.apk` in `Downloads`; all three match.
- `HudumaGuide-TZ-android-v0.1.0-code9.aab` was also verified on 2026-08-09. Its certificate has the same expected SHA-1 `4A:01:17:A3:A9:70:EC:A6:96:B7:0B:B4:E2:8F:6D:06:E5:C5:54:3A` and subject `CN=HudumaGuide TZ, OU=Mobile, O=HudumaGuide TZ`.
- The next configured release is version name `0.1.1`, version code `12`.
- `app.json` now contains the confirmed package identity and `eas.json` contains the production Android App Bundle profile.
- The project is linked to EAS project `3ec512a7-d16b-4e3a-a962-20b54f72669c` under `@kadioko/hudumaguide-tz`.
- EAS production environment variables are configured for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` with sensitive visibility.
- EAS created a new remote Android keystore for this linked project. Its upload-certificate SHA-1 is `DE:B0:54:9F:72:18:0B:26:B0:3F:EC:29:0E:78:80:36:BB:04:74:28`.
- Production build `9a4a9f83-acc7-4bf8-8578-30675f49f3b1` finished successfully for version `0.1.1` / code `12`: [EAS build page](https://expo.dev/accounts/kadioko/projects/hudumaguide-tz/builds/9a4a9f83-acc7-4bf8-8578-30675f49f3b1).
- Google Play rejected this build because it expects the existing upload-certificate SHA-1 `4A:01:17:A3:A9:70:EC:A6:96:B7:0B:B4:E2:8F:6D:06:E5:C5:54:3A`. The historical upload keystore has now been recovered and verified; do not re-upload this build until EAS is configured to use that key.
- The recovered prior bundle `11.aab` is signed with that expected SHA-1, confirming it is the established HudumaGuide TZ upload identity. A bundle contains only the public certificate; it cannot restore the old private upload key.
- The recovered code-9 bundle is signed with the same certificate, independently confirming that this is the historical HudumaGuide TZ upload identity.
- The generated bundle remains available for later upload after key registration: [HudumaGuide TZ 0.1.1 (12) AAB](https://expo.dev/artifacts/eas/EB4m91KUatRkTtZbTzuGrKyWjGWZJdZU0IfhkDrVjI4.aab). The download expires on 2026-09-07.
- The downloaded EAS bundles in `Downloads` were inspected from their embedded manifests. They belong to Budget It, not HudumaGuide TZ:

| Bundle file | Embedded package | Version name | Version code |
| --- | --- | --- | --- |
| `application-564d05e2-5db1-49af-8aaa-753945551c83.aab` | `com.kadioko.budgetit` | `1.0.1` | `2` |
| `application-5f57aee3-33c4-4769-ab2f-37ccdc27885c.aab` | `com.kadioko.budgetit` | `1.0.5` | `6` |
| `application-8de76d78-10fb-43ff-ae1e-6f4bb65c2a97.aab` | `com.kadioko.budgetit` | `1.0.0` | `1` |
| `application-96a3ba55-4aa2-4f80-93ba-08e37b7c97fa.aab` | `com.budgetit.app` | `1.0.0` | `1` |
| `application-a206755f-6786-4a26-b4eb-7885ef541bc2.aab` | `com.kadioko.budgetit` | `1.0.2` | `3` |

- Do not use any of those bundles or their signing configuration for HudumaGuide TZ.

The identity and next version code are now confirmed. A new `.aab` must use the same application ID, a version code greater than `11`, and the upload key registered in Play Console.

## Required Inputs

Before running a production build, confirm the existing upload-key arrangement in Google Play Console:

1. The app has Play App Signing enabled or is using the expected existing signing arrangement.
2. Whether the existing upload key is managed by EAS. If another service or local keystore made the prior build, its upload key must be reused.
3. If the private upload key cannot be recovered, request an upload-key reset in Play Console before uploading an EAS-signed update.

Never replace or guess the upload key. A mismatch can make an otherwise valid bundle impossible to upload as an update.

## Resolve The Current Upload-Key Mismatch

Google Play expects the historical upload certificate `4A:01:17:A3:A9:70:EC:A6:96:B7:0B:B4:E2:8F:6D:06:E5:C5:54:3A`, while the newly linked EAS project uses `DE:B0:54:9F:72:18:0B:26:B0:3F:EC:29:0E:78:80:36:BB:04:74:28`.

Choose one path:

1. **Reuse the historical upload key.** This is now the selected path. `android-upload-keystore.jks` was recovered and verified as JKS version 2 with alias `upload`; its certificate is the exact SHA-1 expected by Google Play. Move it to a private folder outside the repository, obtain its keystore and key passwords, then import it into EAS Credentials before creating another build. This preserves the existing Play upload-key arrangement.
2. **Reset the Play upload key.** In Play Console, open **Release > Setup > App signing**, request an upload-key reset, and register the public certificate for the EAS-managed key. This is the correct route when the old private key is unavailable. It does not require a new Play listing and does not change the app-signing key delivered to users.

Do not generate further builds until one path is complete. A different bundle signed by the same new EAS key will receive the same rejection. Follow the official [Android app-signing guidance](https://developer.android.com/studio/publish/app-signing) when completing the reset.

### Import The Recovered Key Into EAS

The recovered keystore is sufficient only when its passwords are available. The alias is known: `upload`. Do not store the key or passwords in Git, chat, screenshots, or app code.

1. Move `android-upload-keystore.jks` to a private folder outside the repository.
2. Locate the keystore password and key password. Check the original build computer for `credentials.json`, `keystore.properties`, `gradle.properties`, password manager entries, or deployment notes. There is no safe way to recover a forgotten private-key password from the bundle.
3. Create a temporary local `credentials.json` at the repository root using the private file path, alias `upload`, and the two passwords. This file is ignored by Git.
4. Run `npx eas-cli@latest credentials -p android`, choose the `production` profile, then use the credentials sync option to upload the values from `credentials.json` to EAS.
5. Confirm the hosted Android keystore shows SHA-1 `4A:01:17:A3:A9:70:EC:A6:96:B7:0B:B4:E2:8F:6D:06:E5:C5:54:3A`, remove the local `credentials.json`, and create a fresh production AAB.

The previous code-12 bundle remains signed with the wrong EAS key and cannot become valid through configuration changes. Build a new AAB only after step 4.

### Password-Prompt Recovery Build

The repository contains a one-time `play-upload-recovery` EAS profile that uses local credentials only for the build. Copy the recovered keystore to the signed-in Windows user's `Downloads` folder as `android-upload-keystore.jks`, then run `scripts/start-play-upload-recovery-build.ps1` from a local terminal. It prompts for the recovered keystore and key passwords locally, validates both passwords against alias `upload`, creates an ignored temporary `credentials.json`, starts an EAS Android App Bundle build, and removes all temporary credential files. It never stores passwords in the repository.

The initial recovery build attempt (`affc05d9-d815-4a88-b5b7-4080e415d52d`) was rejected before compilation with `EAS_BUILD_INVALID_KEYSTORE_ALIAS_ERROR`. Treat that as an unverified password combination; use the validated recovery script before attempting another build.

### Historical Release Evidence

| File | Claimed version code | Signing SHA-1 | Result |
| --- | --- | --- | --- |
| `11.aab` | `11` | `4A:01:17:A3:A9:70:EC:A6:96:B7:0B:B4:E2:8F:6D:06:E5:C5:54:3A` | Matches Play's expected upload certificate |
| `HudumaGuide-TZ-android-v0.1.0-code9.aab` | `9` (from filename) | `4A:01:17:A3:A9:70:EC:A6:96:B7:0B:B4:E2:8F:6D:06:E5:C5:54:3A` | Matches Play's expected upload certificate |
| `android-upload-keystore.jks` | N/A | `4A:01:17:A3:A9:70:EC:A6:96:B7:0B:B4:E2:8F:6D:06:E5:C5:54:3A` | Recovered JKS v2 keystore; alias `upload`; ready to import once passwords are available |

These bundles are evidence only. They do not include the private key required to sign an update. Keep any recovered `.jks`, `.keystore`, and `credentials.json` files outside source control; repository ignore rules cover these names.

## App Configuration

The production identity is already configured in `app.json`:

```json
{
  "expo": {
    "owner": "kadioko",
    "version": "0.1.1",
    "android": {
      "package": "com.hudumaguide.tz",
      "versionCode": 12,
      "adaptiveIcon": {
        "backgroundColor": "#0A7A55"
      }
    }
  }
}
```

The configured version code `12` is valid because the recovered Play artifact uses code `11`. Keep future version codes increasing.

The Expo project is already linked under the authenticated `kadioko` account. To inspect it:

```bash
npx eas-cli@latest project:info
```

The EAS project ID is stored in `app.json`. Keep it committed with the release configuration.

## Production Build Profile

The repository now contains this `eas.json` production profile:

```json
{
  "cli": {
    "version": ">= 21.4.0",
    "appVersionSource": "local"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

Run the local quality gate before every release build:

```bash
npm run verify
```

Create the signed Android App Bundle:

```bash
npx eas-cli build --platform android --profile production
```

EAS will provide the completed build URL. Download the `.aab` from that URL and retain it with the Play release record. Increment `android.versionCode` manually before the next release.

## Play Console Upload

1. Create a new release in the intended testing or production track.
2. Upload the EAS-generated `.aab`.
3. Confirm the upload-key mismatch has been resolved before uploading. If the old key is unavailable, open **Release > Setup > App signing** and complete the upload-key reset/registration process using the certificate for the EAS-managed keystore. Do not create a second app listing.
4. Confirm Play reports package `com.hudumaguide.tz` and version code `12`.
5. Paste the matching locale notes from `docs/release-notes.md`.
6. Review Android vitals, the pre-launch report, and the app-content declarations before rollout.

## Release Safety Checks

- Do not place Supabase service-role keys, upload keys, or EAS access tokens in the app or repository.
- Keep `EXPO_PUBLIC_` variables limited to values that are safe for the mobile client.
- Confirm all service guides retain the independent-guide disclaimer.
- Do not replace `TO_BE_VERIFIED` official links until they have passed content review.
- Validate notifications, offline saved guides, document access, and authentication on a physical Android device before each major release.
