import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSecureAuthStorage } from "@/lib/secureAuthStorage";

vi.mock("expo-secure-store", () => ({}));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: {} }));
vi.mock("react-native", () => ({ Platform: { OS: "android" } }));
vi.mock("@/services/runtimeLogger", () => ({ reportRuntimeIssue: vi.fn() }));

function createFakeSecureStore(overrides: { failOn?: "get" | "set" } = {}) {
  const values = new Map<string, string>();

  return {
    values,
    getItemAsync: vi.fn(async (key: string) => {
      if (overrides.failOn === "get") {
        throw new Error("keystore unavailable");
      }
      return values.has(key) ? (values.get(key) as string) : null;
    }),
    setItemAsync: vi.fn(async (key: string, value: string) => {
      if (overrides.failOn === "set") {
        throw new Error("keystore unavailable");
      }
      if (value.length > 2048) {
        throw new Error("value exceeds SecureStore limit");
      }
      values.set(key, value);
    }),
    deleteItemAsync: vi.fn(async (key: string) => {
      values.delete(key);
    })
  };
}

function createFakeAsyncStorage(seed: Record<string, string> = {}) {
  const values = new Map<string, string>(Object.entries(seed));

  return {
    values,
    getItem: vi.fn(async (key: string) => (values.has(key) ? (values.get(key) as string) : null)),
    setItem: vi.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      values.delete(key);
    })
  };
}

const KEY = "sb-hudumaguide-auth-token";

describe("secure auth storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("round-trips a session larger than the SecureStore value limit", async () => {
    const secureStore = createFakeSecureStore();
    const storage = createSecureAuthStorage(secureStore, createFakeAsyncStorage());
    const session = "a".repeat(5000);

    await storage.setItem(KEY, session);

    expect(await storage.getItem(KEY)).toBe(session);
    // Nothing written may breach the native limit, or Android rejects the write.
    for (const value of secureStore.values.values()) {
      expect(value.length).toBeLessThanOrEqual(2048);
    }
  });

  it("migrates a legacy AsyncStorage session into SecureStore once", async () => {
    const secureStore = createFakeSecureStore();
    const asyncStorage = createFakeAsyncStorage({ [KEY]: "legacy-session" });
    const storage = createSecureAuthStorage(secureStore, asyncStorage);

    expect(await storage.getItem(KEY)).toBe("legacy-session");
    expect(asyncStorage.values.has(KEY)).toBe(false);

    expect(await storage.getItem(KEY)).toBe("legacy-session");
    expect(asyncStorage.getItem).toHaveBeenCalledTimes(1);
  });

  it("does not leave stale chunks behind when a session shrinks", async () => {
    const secureStore = createFakeSecureStore();
    const storage = createSecureAuthStorage(secureStore, createFakeAsyncStorage());

    await storage.setItem(KEY, "b".repeat(5000));
    await storage.setItem(KEY, "short");

    expect(await storage.getItem(KEY)).toBe("short");
    expect(secureStore.values.has(`${KEY}.1`)).toBe(false);
  });

  it("treats a partially written value as absent rather than returning a truncated token", async () => {
    const secureStore = createFakeSecureStore();
    const storage = createSecureAuthStorage(secureStore, createFakeAsyncStorage());

    await storage.setItem(KEY, "c".repeat(5000));
    secureStore.values.delete(`${KEY}.1`);

    expect(await storage.getItem(KEY)).toBeNull();
    expect(secureStore.values.has(`${KEY}.parts`)).toBe(false);
  });

  it("falls back to AsyncStorage when the keystore is unavailable", async () => {
    const asyncStorage = createFakeAsyncStorage();
    const storage = createSecureAuthStorage(createFakeSecureStore({ failOn: "set" }), asyncStorage);

    await storage.setItem(KEY, "session");

    expect(asyncStorage.values.get(KEY)).toBe("session");
  });

  it("clears both stores on sign-out", async () => {
    const secureStore = createFakeSecureStore();
    const asyncStorage = createFakeAsyncStorage({ [KEY]: "legacy-session" });
    const storage = createSecureAuthStorage(secureStore, asyncStorage);

    await storage.setItem(KEY, "d".repeat(5000));
    await storage.removeItem(KEY);

    expect(secureStore.values.size).toBe(0);
    expect(asyncStorage.values.has(KEY)).toBe(false);
    expect(await storage.getItem(KEY)).toBeNull();
  });
});
