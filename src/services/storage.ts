import type {
  Collection,
  HistoryEntry,
  Environment,
  AppSettings,
} from "@/types";

/**
 * Local storage service for persisting app data.
 * Uses localStorage for simplicity; can be swapped for
 * IndexedDB or Tauri's filesystem API for larger datasets.
 */

const STORAGE_KEYS = {
  COLLECTIONS: "krestreq_collections",
  HISTORY: "krestreq_history",
  ENVIRONMENTS: "krestreq_environments",
  ACTIVE_ENVIRONMENT: "krestreq_active_env",
  SETTINGS: "krestreq_settings",
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
  const saved = load<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, {});
  return { ...defaults, ...saved };
};

export const saveSettings = (settings: AppSettings): void =>
  save(STORAGE_KEYS.SETTINGS, settings);
