# Local Persistence: MMKV Consideration

HudumaGuide currently uses AsyncStorage for the persisted Zustand store because it is Expo-friendly, simple to migrate, and adequate for the current offline payload size.

`react-native-mmkv` is a good candidate when:

- hydration time becomes visible on cold start,
- local document metadata or guide cache grows substantially,
- sync queue writes become frequent enough to show AsyncStorage latency.

Before switching:

- verify Expo SDK 56 prebuild/dev-build compatibility,
- add a one-time migration from `hudumaguide-tz-store`,
- keep SecureStore for secrets and private auth material,
- benchmark hydration on a low-end Android device.

Decision for this pass: keep AsyncStorage and document MMKV as the next performance migration rather than changing persistence while the sync conflict model is still evolving.
