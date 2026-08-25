import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { reportRuntimeIssue } from "@/services/runtimeLogger";

/**
 * SecureStore rejects values larger than 2048 bytes on Android, and Supabase
 * session payloads (access token + refresh token + user object) routinely pass
 * that. Values are therefore split across numbered chunk keys, with a companion
 * key holding the chunk count so reads know how many parts to reassemble.
 */
const CHUNK_SIZE = 1800;

export type AuthStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

type SecureStoreLike = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

type AsyncStorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function countKey(key: string) {
  return `${key}.parts`;
}

function chunkKey(key: string, index: number) {
  return `${key}.${index}`;
}

function splitIntoChunks(value: string) {
  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += CHUNK_SIZE) {
    chunks.push(value.slice(index, index + CHUNK_SIZE));
  }

  // An empty string still needs one chunk so reads can tell it apart from a miss.
  return chunks.length > 0 ? chunks : [""];
}

/**
 * Exported for testing so the chunking, migration, and fallback behaviour can be
 * exercised without native modules. App code should use `authStorage`.
 */
export function createSecureAuthStorage(
  secureStore: SecureStoreLike,
  asyncStorage: AsyncStorageLike
): AuthStorage {
  async function clearChunks(key: string, count: number) {
    for (let index = 0; index < count; index += 1) {
      await secureStore.deleteItemAsync(chunkKey(key, index));
    }
    await secureStore.deleteItemAsync(countKey(key));
  }

  async function readFromSecureStore(key: string) {
    const rawCount = await secureStore.getItemAsync(countKey(key));
    if (rawCount === null) {
      return null;
    }

    const count = Number.parseInt(rawCount, 10);
    if (!Number.isInteger(count) || count < 1) {
      await secureStore.deleteItemAsync(countKey(key));
      return null;
    }

    const parts: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const part = await secureStore.getItemAsync(chunkKey(key, index));
      if (part === null) {
        // A partial write is unusable; drop it so the session is re-established
        // rather than handing Supabase a truncated token.
        await clearChunks(key, count);
        return null;
      }
      parts.push(part);
    }

    return parts.join("");
  }

  async function writeToSecureStore(key: string, value: string) {
    const previousCount = Number.parseInt((await secureStore.getItemAsync(countKey(key))) ?? "0", 10);
    const chunks = splitIntoChunks(value);

    for (let index = 0; index < chunks.length; index += 1) {
      await secureStore.setItemAsync(chunkKey(key, index), chunks[index]);
    }
    await secureStore.setItemAsync(countKey(key), String(chunks.length));

    // Shrinking values leave stale chunks behind that would corrupt later reads.
    for (let index = chunks.length; index < previousCount; index += 1) {
      await secureStore.deleteItemAsync(chunkKey(key, index));
    }
  }

  return {
    async getItem(key) {
      try {
        const stored = await readFromSecureStore(key);
        if (stored !== null) {
          return stored;
        }

        // Sessions written by earlier builds live in AsyncStorage. Migrate them
        // on first read so upgrading users are not silently signed out.
        const legacy = await asyncStorage.getItem(key);
        if (legacy === null) {
          return null;
        }

        await writeToSecureStore(key, legacy);
        await asyncStorage.removeItem(key);
        return legacy;
      } catch (error) {
        reportRuntimeIssue("secure-auth-storage", error, { operation: "getItem" });
        return asyncStorage.getItem(key);
      }
    },

    async setItem(key, value) {
      try {
        await writeToSecureStore(key, value);
      } catch (error) {
        // Keychain/keystore access can fail on some devices. Falling back keeps
        // the user signed in rather than trapping them in a login loop.
        reportRuntimeIssue("secure-auth-storage", error, { operation: "setItem" });
        await asyncStorage.setItem(key, value);
      }
    },

    async removeItem(key) {
      try {
        const rawCount = await secureStore.getItemAsync(countKey(key));
        const count = Number.parseInt(rawCount ?? "0", 10);
        await clearChunks(key, Number.isInteger(count) && count > 0 ? count : 0);
      } catch (error) {
        reportRuntimeIssue("secure-auth-storage", error, { operation: "removeItem" });
      }

      // Always clear AsyncStorage too, so a legacy copy can never resurrect a
      // signed-out session.
      await asyncStorage.removeItem(key);
    }
  };
}

/**
 * SecureStore has no web implementation, so the browser keeps using
 * AsyncStorage (localStorage under react-native-web).
 */
export const authStorage: AuthStorage =
  Platform.OS === "web" ? AsyncStorage : createSecureAuthStorage(SecureStore, AsyncStorage);
