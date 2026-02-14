type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  key: (index: number) => string | null;
  length: number;
};

function createStorageShim(): StorageLike {
  const store = new Map<string, string>();

  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

export async function register() {
  const runtime = globalThis as typeof globalThis & {
    localStorage?: { getItem?: unknown };
  };

  if (
    runtime.localStorage &&
    typeof runtime.localStorage.getItem !== "function"
  ) {
    // Some Node runtimes expose a malformed localStorage object.
    (runtime as typeof runtime & { localStorage: StorageLike }).localStorage =
      createStorageShim();
  }
}
