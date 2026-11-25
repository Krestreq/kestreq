import type {
  Collection,
  Folder,
  HistoryEntry,
  Environment,
  AppSettings,
  AutomatedTest,
  RequestItem,
  WorkspaceItem,
} from "@/types";

/**
 * Local storage service for persisting app data.
 * Uses localStorage for simplicity; can be swapped for
 * IndexedDB or Tauri's filesystem API for larger datasets.
 */

const STORAGE_KEYS = {
  COLLECTIONS: "krestreq_collections",
  WORKSPACES: "krestreq_workspaces",
  ACTIVE_WORKSPACE: "krestreq_active_workspace",
  HISTORY: "krestreq_history",
  ENVIRONMENTS: "krestreq_environments",
  ACTIVE_ENVIRONMENT: "krestreq_active_env",
  SETTINGS: "krestreq_settings",
  AUTOMATED_TESTS: "krestreq_automated_tests",
};

/** Generic save helper */
const save = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to ${key}:`, e);
  }
};

/** Generic load helper */
const load = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load from ${key}:`, e);
  }
  return fallback;
};

// ——— Collections ———

export const getCollections = (): Collection[] =>
  load<Collection[]>(STORAGE_KEYS.COLLECTIONS, []);

export const saveCollections = (collections: Collection[]): void =>
  save(STORAGE_KEYS.COLLECTIONS, collections);

export const addCollection = (collection: Collection): Collection[] => {
  const collections = getCollections();
  collections.push(collection);
  saveCollections(collections);
  return collections;
};

export const updateCollection = (
  id: string,
  collection: Collection
): Collection[] => {
  const collections = getCollections();
  const index = collections.findIndex((c) => c.id === id);
  if (index !== -1) {
    collections[index] = collection;
  }
  saveCollections(collections);
  return collections;
};

export const deleteCollection = (id: string): Collection[] => {
  const collections = getCollections().filter((c) => c.id !== id);
  saveCollections(collections);
  return collections;
};

// ——— Workspaces ———

export const getWorkspaces = (): WorkspaceItem[] =>
  load<WorkspaceItem[]>(STORAGE_KEYS.WORKSPACES, []);

export const saveWorkspaces = (workspaces: WorkspaceItem[]): void =>
  save(STORAGE_KEYS.WORKSPACES, workspaces);

export const addWorkspace = (workspace: WorkspaceItem): WorkspaceItem[] => {
  const workspaces = [...getWorkspaces(), workspace];
  saveWorkspaces(workspaces);
  return workspaces;
};

export const getActiveWorkspaceId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE);
  } catch (e) {
    console.error("Failed to load active workspace:", e);
    return null;
  }
};

export const setActiveWorkspaceId = (id: string | null): void => {
  try {
    if (id) localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE, id);
    else localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKSPACE);
  } catch (e) {
    console.error("Failed to save active workspace:", e);
  }
};

// ——— History ———

export const getHistory = (): HistoryEntry[] =>
  load<HistoryEntry[]>(STORAGE_KEYS.HISTORY, []);

export const saveHistory = (history: HistoryEntry[]): void =>
  save(STORAGE_KEYS.HISTORY, history);

export const addToHistory = (entry: HistoryEntry, maxEntries: number = 100): HistoryEntry[] => {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > maxEntries) {
    history.length = maxEntries;
  }
  saveHistory(history);
  return history;
};

export const clearHistory = (): void => {
  save(STORAGE_KEYS.HISTORY, []);
};

// ——— Environments ———

export const getEnvironments = (): Environment[] =>
  load<Environment[]>(STORAGE_KEYS.ENVIRONMENTS, []);

export const saveEnvironments = (environments: Environment[]): void =>
  save(STORAGE_KEYS.ENVIRONMENTS, environments);

export const addEnvironment = (env: Environment): Environment[] => {
  const environments = getEnvironments();
  environments.push(env);
  saveEnvironments(environments);
  return environments;
};

export const updateEnvironment = (
  id: string,
  env: Environment
): Environment[] => {
  const environments = getEnvironments();
  const index = environments.findIndex((e) => e.id === id);
  if (index !== -1) {
    environments[index] = env;
  }
  saveEnvironments(environments);
  return environments;
};

export const deleteEnvironment = (id: string): Environment[] => {
  const environments = getEnvironments().filter((e) => e.id !== id);
  saveEnvironments(environments);
  return environments;
};

export const getActiveEnvironmentId = (): string | null =>
  localStorage.getItem(STORAGE_KEYS.ACTIVE_ENVIRONMENT);

export const setActiveEnvironmentId = (id: string | null): void => {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ENVIRONMENT, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ENVIRONMENT);
  }
};

export const getActiveEnvironment = (): Environment | undefined => {
  const activeId = getActiveEnvironmentId();
  if (!activeId) return undefined;
  return getEnvironments().find((e) => e.id === activeId);
};

// ——— Settings ———

export const getSettings = (defaults: AppSettings): AppSettings => {
  const saved = load<Partial<AppSettings> & Record<string, unknown>>(
    STORAGE_KEYS.SETTINGS,
    {}
  );
  delete saved.liquidGlass;
  delete saved.macOSControls;
  return { ...defaults, ...saved };
};

export const saveSettings = (settings: AppSettings): void =>
  save(STORAGE_KEYS.SETTINGS, settings);

// ——— Automated Tests ———

export const getAutomatedTests = (): AutomatedTest[] =>
  load<AutomatedTest[]>(STORAGE_KEYS.AUTOMATED_TESTS, []);

export const saveAutomatedTests = (tests: AutomatedTest[]): void =>
  save(STORAGE_KEYS.AUTOMATED_TESTS, tests);

export const addAutomatedTest = (test: AutomatedTest): AutomatedTest[] => {
  const tests = getAutomatedTests();
  tests.push(test);
  saveAutomatedTests(tests);
  return tests;
};

export const updateAutomatedTest = (
  id: string,
  test: AutomatedTest
): AutomatedTest[] => {
  const tests = getAutomatedTests();
  const index = tests.findIndex((t) => t.id === id);
  if (index !== -1) {
    tests[index] = test;
  }
  saveAutomatedTests(tests);
  return tests;
};

export const deleteAutomatedTest = (id: string): AutomatedTest[] => {
  const tests = getAutomatedTests().filter((t) => t.id !== id);
  saveAutomatedTests(tests);
  return tests;
};

// ——— Requests within Collections ———

/**
 * Add a request to a collection's standalone requests.
 * Returns the updated collections array.
 */
export const addRequestToCollection = (
  collectionId: string,
  request: RequestItem
): Collection[] => {
  const collections = getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  if (collection) {
    // Check if request with same id already exists (update case)
    const existingIndex = collection.standaloneRequests.findIndex(
      (r) => r.id === request.id
    );
    if (existingIndex !== -1) {
      collection.standaloneRequests[existingIndex] = request;
    } else {
      collection.standaloneRequests.push(request);
    }
    collection.updatedAt = Date.now();
  }
  saveCollections(collections);
  return collections;
};

/**
 * Update a request in a collection (searches both standalone and folders).
 * Returns the updated collections array.
 */
export const updateRequestInCollection = (
  collectionId: string,
  request: RequestItem
): Collection[] => {
  const collections = getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return collections;

  // Search standalone requests
  const standaloneIndex = collection.standaloneRequests.findIndex(
    (r) => r.id === request.id
  );
  if (standaloneIndex !== -1) {
    collection.standaloneRequests[standaloneIndex] = request;
    collection.updatedAt = Date.now();
    saveCollections(collections);
    return collections;
  }

  // Search in folders recursively
  const updateInFolder = (folder: Folder): boolean => {
    const idx = folder.items.findIndex(
      (item): item is RequestItem =>
        "method" in item && item.id === request.id
    );
    if (idx !== -1) {
      folder.items[idx] = request;
      return true;
    }
    // Check nested folders
    for (const item of folder.items) {
      if ("items" in item && updateInFolder(item as Folder)) {
        return true;
      }
    }
    return false;
  };

  for (const folder of collection.folders) {
    if (updateInFolder(folder)) {
      collection.updatedAt = Date.now();
      saveCollections(collections);
      return collections;
    }
  }

  saveCollections(collections);
  return collections;
};

/**
 * Delete a request from a collection.
 * Returns the updated collections array.
 */
export const deleteRequestFromCollection = (
  collectionId: string,
  requestId: string
): Collection[] => {
  const collections = getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return collections;

  // Remove from standalone
  collection.standaloneRequests = collection.standaloneRequests.filter(
    (r) => r.id !== requestId
  );

  // Remove from folders recursively
  const deleteFromFolder = (folder: Folder): boolean => {
    const before = folder.items.length;
    folder.items = folder.items.filter(
      (item) => !("method" in item && item.id === requestId)
    );
    // Check nested folders
    for (const item of folder.items) {
      if ("items" in item) {
        deleteFromFolder(item as Folder);
      }
    }
    return folder.items.length !== before;
  };

  for (const folder of collection.folders) {
    deleteFromFolder(folder);
  }

  collection.updatedAt = Date.now();
  saveCollections(collections);
  return collections;
};

/**
 * Find a request by ID across all collections.
 * Returns the request and the collection it belongs to.
 */
export const findRequestInCollections = (
  requestId: string
): { request: RequestItem; collectionId: string } | null => {
  const collections = getCollections();

  for (const collection of collections) {
    // Check standalone
    const standalone = collection.standaloneRequests.find(
      (r) => r.id === requestId
    );
    if (standalone) {
      return { request: standalone, collectionId: collection.id };
    }

    // Check folders recursively
    const searchFolder = (
      folder: Folder
    ): RequestItem | null => {
      for (const item of folder.items) {
        if ("method" in item && item.id === requestId) {
          return item;
        }
        if ("items" in item) {
          const found = searchFolder(item as Folder);
          if (found) return found;
        }
      }
      return null;
    };

    for (const folder of collection.folders) {
      const found = searchFolder(folder);
      if (found) {
        return { request: found, collectionId: collection.id };
      }
    }
  }

  return null;
};
