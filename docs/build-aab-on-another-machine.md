# Building the AAB on Another Machine

Everything needed to produce an uploadable Android App Bundle from a fresh laptop and get it into Play Console.

## The one thing that is not in the repo

`eas.json` sets `credentialsSource: "local"` on the `production` profile, so EAS signs with a keystore that lives **only on your machine**. It is gitignored on purpose. Cloning the repo is not enough:

| File | Tracked by git? | Needed to build? |
| --- | --- | --- |
| `credentials.json` | No — gitignored | **Yes** |
| `credentials/android-upload-keystore.jks` | No — `*.jks` gitignored | **Yes** |
| `.env` | No — gitignored | No (build reads Supabase vars from the EAS `production` environment) |

If a build on a second machine fails with a credentials or keystore error, this is almost always why.

### Moving the keystore safely

The keystore is the single most important file in the project. Lose it and you cannot update the Play listing without a Google key reset.

- Transfer it through a password manager, encrypted archive, or private cloud vault — **not** email, chat, or a public repo.
- Never commit it. `.gitignore` already covers `*.jks`, `*.keystore`, and `credentials.json`; keep it that way.
- Keep an encrypted backup somewhere other than the two laptops.
- `credentials.json` stores the keystore and key passwords in plaintext, so treat it with exactly the same care as the `.jks` itself.

### Verify you copied the right keystore

After copying, confirm the fingerprint matches. Play Console shows the same SHA-1 under **Setup → App integrity → Upload key certificate**.

```bash
keytool -list -v -keystore credentials/android-upload-keystore.jks -alias upload
```

Expected values for this project:

```text
Alias name: upload
SHA1: 4A:01:17:A3:A9:70:EC:A6:96:B7:0B:B4:E2:8F:6D:06:E5:C5:54:3A
SHA256: 4C:F8:DC:42:B2:1F:B6:A4:D6:80:FF:11:BB:C6:C4:DD:F5:91:4B:6E:01:13:DD:77:B2:01:F3:36:3E:EF:33:C7
Valid until: Fri Oct 31 2053
```

If the SHA-1 does not match, stop — signing with the wrong key produces an AAB that Play will reject.

## Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| Node | 22.x | Matches CI and local (`v22.15.0`) |
| npm | 10.x | Ships with Node 22 |
| `eas-cli` | **>= 21.4.0** | `eas.json` enforces this; an older CLI fails before it builds anything |
| JDK | 17 | Only needed for `keytool` verification, not for the build itself |
| Expo account | `kadioko` | Must own or have access to project `hudumaguide-tz` |

Project identifiers, for reference:

```text
EAS project ID   3ec512a7-d16b-4e3a-a962-20b54f72669c
Owner            kadioko
Android package  com.hudumaguide.tz
```

## Steps

```bash
git clone https://github.com/kadioko/HudumaGuide-TZ.git
cd HudumaGuide-TZ
npm ci
```

Copy `credentials.json` and `credentials/android-upload-keystore.jks` into the project root, preserving that exact folder layout — the path in `credentials.json` is relative.

```bash
npm i -g eas-cli@latest
npx eas login
npx eas whoami
```

Confirm the project is healthy before spending a cloud build:

```bash
npm run release:check
```

Then build:

```bash
npx eas build --platform android --profile production --non-interactive
```

The command prints an artifact URL when it finishes. Builds take roughly 15–45 minutes.

### Commit the versionCode bump

The `production` profile has `autoIncrement: true` with `appVersionSource: "local"`, so EAS edits `app.json` on the machine that runs the build. Commit and push that change, or the next build from a different machine will reuse a version code Play has already seen:

```bash
git add app.json
git commit -m "Record Android versionCode <n>"
git push
```

## Uploading to Play Console

1. Download the `.aab` from the artifact URL.
2. Play Console → **HudumaGuide TZ** → **Testing → Internal testing** (or the track you want) → **Create new release**.
3. Upload the `.aab`. Play rejects any version code less than or equal to one already uploaded, so confirm the number went up.
4. Paste release notes for both `en-US` and `sw` — 500 character limit each.
5. Roll out.

Ship to internal testing first and install on a real device before promoting to production.

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| `eas.json` version error before the build starts | Global `eas-cli` older than 21.4.0 | `npm i -g eas-cli@latest` |
| Credentials or keystore error | `credentials.json` / `.jks` not copied, or wrong relative path | Copy both, keep the `credentials/` folder layout |
| Build runs but Play rejects the upload | Signed with the wrong keystore | Compare SHA-1 against the table above |
| `Version code N has already been used` | The `autoIncrement` bump was never committed on the other machine | Pull latest `app.json`, or raise `versionCode` manually |
| Not logged in / wrong account | Fresh machine has no EAS session | `npx eas login` as `kadioko` |
| Command hangs with no output | Piping through `tail`, which buffers until exit | Let output stream, or write to a file and `tail -f` it |

## Worth doing: stop copying the keystore

`credentialsSource: "local"` is the reason a second machine is painful at all. Switching the `production` profile to EAS-managed (remote) credentials uploads the keystore to Expo once, after which **any machine logged into the `kadioko` account can build with no keystore file present.**

```bash
npx eas credentials
```

Choose Android → production → keystore → upload the existing `.jks`. Expo then stores and applies it. Keep your encrypted local backup regardless — remote credentials are a convenience, not a substitute for owning a copy of the key.

Two cautions before switching: the existing `play-upload-recovery` profile in `eas.json` explicitly pins `credentialsSource: "local"` and would need reviewing, and you must upload the *same* keystore so the SHA-1 stays identical — a different key means Play rejects the bundle.
