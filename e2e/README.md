# E2E Smoke Tests

These Maestro flows cover the critical MVP paths:

- onboarding skip
- service search
- guide checklist
- reminder creation
- document metadata creation

Run them against a development build with:

```bash
npm run e2e:maestro
```

The flows are intentionally smoke-level and avoid private Supabase credentials or real file uploads.

Local runner path:

1. Install Maestro from https://maestro.mobile.dev/getting-started/installing-maestro.
2. Start an Android emulator or connect a device.
3. Install an Expo development build for `com.hudumaguide.tz`.
4. Run `npm run e2e:maestro`.

CI matrix recommendation:

| Target | Build | Purpose |
| --- | --- | --- |
| Android API 35 emulator | EAS preview/dev build | Primary smoke gate for onboarding, guide search, checklist, reminder, and document metadata flows. |
| Android API 33 emulator | EAS preview/dev build | Backward-compatibility smoke for lower-end beta devices. |
| Physical Android beta device | Internal preview build | Manual release candidate check for file picker, notifications, biometric lock, and storage behavior. |

GitHub Actions should run Maestro only after the preview APK is available. Keep the automated matrix to emulator smoke flows, and reserve real uploads, notification permissions, and biometric prompts for the physical-device checklist.
