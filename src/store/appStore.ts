import { create } from "zustand";
import type {
  RequestItem,
  ResponseItem,
  Collection,
  HistoryEntry,
  Environment,
  AppSettings,
  ThemeName,
  ScreenName,
  AutomatedTest,
  WorkspaceItem,
} from "@/types";
import { DEFAULT_SETTINGS, createBlankRequest, createBlankWorkspace } from "@/utils/constants";
import {
  getCollections,
  addCollection as persistCollection,
  updateCollection as persistCollectionUpdate,
  deleteCollection as persistCollectionDelete,
  getWorkspaces,
  addWorkspace as persistWorkspace,
  getActiveWorkspaceId,
  setActiveWorkspaceId as persistActiveWorkspace,
  saveWorkspaces,
  saveCollections,
  addRequestToCollection as persistAddRequest,
  updateRequestInCollection as persistUpdateRequest,
  deleteRequestFromCollection as persistDeleteRequest,
  getHistory,
  addToHistory as persistHistory,
  clearHistory as persistClearHistory,
  getEnvironments,
  addEnvironment as persistEnvironment,
  updateEnvironment as persistEnvironmentUpdate,
  deleteEnvironment as persistEnvironmentDelete,
  getActiveEnvironmentId,
  setActiveEnvironmentId as persistActiveEnv,
  getActiveEnvironment,
  getSettings as loadSettings,
  saveSettings as persistSettings,
  getAutomatedTests,
  addAutomatedTest as persistAutomatedTest,
  updateAutomatedTest as persistAutomatedTestUpdate,
  deleteAutomatedTest as persistAutomatedTestDelete,
} from "@/services/storage";
import { sendRequest as apiSendRequest } from "@/services/apiClient";

/** Available themes with display names */
export const THEMES: { value: ThemeName; label: string; category: "dark" | "light" }[] = [
  { value: "dark", label: "Dark", category: "dark" },
  { value: "light", label: "Light", category: "light" },
  { value: "midnight", label: "Midnight", category: "dark" },
  { value: "dracula", label: "Dracula", category: "dark" },
  { value: "nord", label: "Nord", category: "dark" },
  { value: "solarized-dark", label: "Solarized Dark", category: "dark" },
  { value: "solarized-light", label: "Solarized Light", category: "light" },
  { value: "monokai", label: "Monokai", category: "dark" },
  { value: "high-contrast", label: "High Contrast", category: "dark" },
];

/** Apply theme to DOM */
const applyTheme = (theme: ThemeName) => {
  document.documentElement.setAttribute("data-theme", theme);
};

/** Apply density to DOM */
const applyDensity = (density: string) => {
  document.documentElement.setAttribute("data-density", density);
};

interface AppState {
  // ——— Navigation ———
  currentScreen: ScreenName;
  setCurrentScreen: (screen: ScreenName) => void;
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // ——— Request Editor ———
  currentRequest: RequestItem;
  setCurrentRequest: (request: RequestItem) => void;
  resetCurrentRequest: () => void;
  savedRequestId: string | null;
  savedCollectionId: string | null;
  saveRequest: (collectionId?: string) => void;
  openRequest: (request: RequestItem, collectionId: string) => void;
  deleteRequest: () => void;
  updateRequestInStore: (request: RequestItem) => void;

  // ——— Response ———
  currentResponse: ResponseItem | null;
  isSending: boolean;
  sendRequest: () => Promise<void>;

  // ——— Collections ———
  collections: Collection[];
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
  addWorkspace: (workspace: WorkspaceItem) => void;
  updateWorkspace: (workspace: WorkspaceItem) => void;
  deleteWorkspace: (id: string) => void;
  activeCollectionId: string | null;
  setActiveCollectionId: (id: string | null) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (collection: Collection) => void;
  deleteCollection: (id: string) => void;
  loadCollections: () => void;

  // ——— History ———
  history: HistoryEntry[];
  loadHistory: () => void;
  clearHistory: () => void;

  // ——— Environments ———
  environments: Environment[];
  activeEnvironmentId: string | null;
  setActiveEnvironmentId: (id: string | null) => void;
  addEnvironment: (env: Environment) => void;
  updateEnvironment: (env: Environment) => void;
  deleteEnvironment: (id: string) => void;
  loadEnvironments: () => void;

  // ——— Automated Tests ———
  automatedTests: AutomatedTest[];
  loadAutomatedTests: () => void;
  addAutomatedTest: (test: AutomatedTest) => void;
  updateAutomatedTest: (test: AutomatedTest) => void;
  deleteAutomatedTest: (id: string) => void;

  // ——— Settings ———
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  loadSettings: () => void;

  // ——— Theme ———
  setTheme: (theme: ThemeName) => void;

  // ——— UI ———
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  responseTab: "body" | "headers" | "info";
  setResponseTab: (tab: "body" | "headers" | "info") => void;
  settingsOpen: boolean;
  toggleSettings: () => void;
  saveAsModalOpen: boolean;
  setSaveAsModalOpen: (open: boolean) => void;
  
  // ——— Confirm Dialog ———
  confirmDialog: {
    isOpen: boolean;
    variant: "danger" | "warning" | "info";
    title: string;
    message: string;
    detail?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: (() => void) | null;
  };
  openConfirm: (opts: {
    variant?: "danger" | "warning" | "info";
    title: string;
    message: string;
    detail?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
  }) => void;
  closeConfirm: () => void;
  
  // ——— Edit Request ———
  editModalOpen: boolean;
  editModalRequest: RequestItem | null;
  openEditRequest: (request: RequestItem) => void;
  closeEditRequest: () => void;
  
  // ——— New Request ———
  newRequestModalOpen: boolean;
  newRequestModalCollectionId: string | null;
  openNewRequestModal: (collectionId?: string) => void;
  closeNewRequestModal: () => void;
  createNewRequest: (name: string, method: string, url: string, collectionId: string) => void;
  startNewRequest: () => void;
  
  // ——— Auto Save ———
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ——— Navigation ———
  currentScreen: "home",
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  commandPaletteOpen: false,
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // ——— Request Editor ———
  currentRequest: createBlankRequest(),
  setCurrentRequest: (request) => set({ currentRequest: request }),
  resetCurrentRequest: () => set({ currentRequest: createBlankRequest() }),
  savedRequestId: null,
  savedCollectionId: null,
  saveRequest: (collectionId) => {
    const { currentRequest, savedRequestId, savedCollectionId } = get();
    
    // Determine target collection
    const targetCollectionId = collectionId || savedCollectionId;
    
    if (!targetCollectionId) {
      // No collection selected — the UI should show a "Save As" dialog
      // This is handled by the component calling this function with a collectionId
      console.warn("No collection selected. Please create a collection first or use Save As.");
      return;
    }

    // Update the request in storage
    if (savedRequestId && savedCollectionId) {
      // Update existing saved request
      persistUpdateRequest(savedCollectionId, currentRequest);
    } else {
      // New request — add to collection
      persistAddRequest(targetCollectionId, currentRequest);
    }

    // Reload collections and set saved state
    set({
      collections: getCollections(),
      savedRequestId: currentRequest.id,
      savedCollectionId: targetCollectionId,
    });
  },
  openRequest: (request, collectionId) => {
    set({
      currentRequest: { ...request },
      savedRequestId: request.id,
      savedCollectionId: collectionId,
      currentScreen: "workspace",
      currentResponse: null,
    });
  },
  deleteRequest: () => {
    const { savedRequestId, savedCollectionId } = get();
    if (!savedRequestId || !savedCollectionId) return;
    persistDeleteRequest(savedCollectionId, savedRequestId);
    set({
      collections: getCollections(),
      savedRequestId: null,
      savedCollectionId: null,
      currentRequest: createBlankRequest(),
      currentResponse: null,
    });
  },
  updateRequestInStore: (request) => {
    const { savedCollectionId } = get();
    if (!savedCollectionId) return;
    persistUpdateRequest(savedCollectionId, request);
    set({
      collections: getCollections(),
      currentRequest: { ...request },
    });
  },

  // ——— Response ———
  currentResponse: null,
  isSending: false,
  sendRequest: async () => {
    const { currentRequest, settings } = get();
    set({ isSending: true, currentResponse: null });

    try {
      const activeEnv = getActiveEnvironment();
      const envVars: Record<string, string> = {};
      if (activeEnv) {
        activeEnv.variables.forEach((v) => {
          envVars[v.key] = v.value;
        });
      }

      const response = await apiSendRequest({
        request: currentRequest,
        environmentVariables: envVars,
        settings,
      });

      set({ currentResponse: response });

      // Add to history
      persistHistory(
        {
          id: crypto.randomUUID(),
          request: { ...currentRequest },
          response,
          timestamp: Date.now(),
        },
        settings.maxHistoryEntries
      );

      // Update history in store
      set({ history: getHistory() });
    } catch (error) {
      // This catch handles unexpected errors outside of apiSendRequest
      // (e.g., history persistence failures). apiSendRequest itself
      // always returns a ResponseItem, even on network errors.
      console.error("Request failed:", error);
      // Still show an error response in the UI
      set({
        currentResponse: {
          id: crypto.randomUUID(),
          requestId: currentRequest.id,
          status: 0,
          statusText: "Unexpected Error",
          headers: {},
          body: "An unexpected error occurred while processing the request.",
          duration: 0,
          size: 0,
          timestamp: Date.now(),
        },
      });
    } finally {
      set({ isSending: false });
    }
  },

  // ——— Collections ———
  collections: [],
  workspaces: [],
  activeWorkspaceId: null,
  setActiveWorkspaceId: (id) => {
    persistActiveWorkspace(id);
    set({ activeWorkspaceId: id });
  },
  addWorkspace: (workspace) => {
    const updated = persistWorkspace(workspace);
    persistActiveWorkspace(workspace.id);
    set({ workspaces: updated, activeWorkspaceId: workspace.id });
  },
  updateWorkspace: (workspace) => {
    const updated = get().workspaces.map((item) => item.id === workspace.id ? workspace : item);
    saveWorkspaces(updated);
    set({ workspaces: updated });
  },
  deleteWorkspace: (id) => {
    const state = get();
    if (state.workspaces.length <= 1) return;

    const workspaces = state.workspaces.filter((workspace) => workspace.id !== id);
    const collections = state.collections.filter((collection) => collection.workspaceId !== id);
    const removedCollectionIds = new Set(
      state.collections.filter((collection) => collection.workspaceId === id).map((collection) => collection.id)
    );
    const activeWorkspaceId = state.activeWorkspaceId && state.activeWorkspaceId !== id &&
      workspaces.some((workspace) => workspace.id === state.activeWorkspaceId)
      ? state.activeWorkspaceId
      : workspaces[0].id;
    const currentRequestRemoved = Boolean(state.savedCollectionId && removedCollectionIds.has(state.savedCollectionId));

    saveWorkspaces(workspaces);
    saveCollections(collections);
    persistActiveWorkspace(activeWorkspaceId);
    set({
      workspaces,
      collections,
      activeWorkspaceId,
      activeCollectionId: state.activeCollectionId && removedCollectionIds.has(state.activeCollectionId)
        ? null
        : state.activeCollectionId,
      ...(currentRequestRemoved ? {
        currentRequest: createBlankRequest(),
        currentResponse: null,
        savedRequestId: null,
        savedCollectionId: null,
      } : {}),
    });
  },
  activeCollectionId: null,
  setActiveCollectionId: (id) => set({ activeCollectionId: id }),
  addCollection: (collection) => {
    const workspaceId = collection.workspaceId || get().activeWorkspaceId || get().workspaces[0]?.id;
    const updated = persistCollection({ ...collection, workspaceId });
    set({ collections: updated });
  },
  updateCollection: (collection) => {
    const updated = persistCollectionUpdate(collection.id, collection);
    set({ collections: updated });
  },
  deleteCollection: (id) => {
    const updated = persistCollectionDelete(id);
    set({
      collections: updated,
      activeCollectionId:
        get().activeCollectionId === id ? null : get().activeCollectionId,
    });
  },
  loadCollections: () => {
    let workspaces = getWorkspaces();
    let collections = getCollections();
    if (workspaces.length === 0) {
      workspaces = [createBlankWorkspace()];
      workspaces[0].name = "My Workspace";
      saveWorkspaces(workspaces);
    }
    const defaultWorkspaceId = workspaces[0].id;
    let migratedCollections = false;
    collections = collections.map((collection) => {
      if (collection.workspaceId && workspaces.some((workspace) => workspace.id === collection.workspaceId)) return collection;
      migratedCollections = true;
      return { ...collection, workspaceId: defaultWorkspaceId };
    });
    if (migratedCollections) saveCollections(collections);
    const storedActiveWorkspaceId = getActiveWorkspaceId();
    const activeWorkspaceId = workspaces.some((workspace) => workspace.id === storedActiveWorkspaceId)
      ? storedActiveWorkspaceId
      : defaultWorkspaceId;
    persistActiveWorkspace(activeWorkspaceId);
    set({ collections, workspaces, activeWorkspaceId });
  },

  // ——— History ———
  history: [],
  loadHistory: () => set({ history: getHistory() }),
  clearHistory: () => {
    persistClearHistory();
    set({ history: [] });
  },

  // ——— Environments ———
  environments: [],
  activeEnvironmentId: null,
  setActiveEnvironmentId: (id) => {
    persistActiveEnv(id);
    set({ activeEnvironmentId: id });
  },
  addEnvironment: (env) => {
    const updated = persistEnvironment(env);
    set({ environments: updated });
  },
  updateEnvironment: (env) => {
    const updated = persistEnvironmentUpdate(env.id, env);
    set({ environments: updated });
  },
  deleteEnvironment: (id) => {
    const updated = persistEnvironmentDelete(id);
    set({
      environments: updated,
      activeEnvironmentId:
        get().activeEnvironmentId === id ? null : get().activeEnvironmentId,
    });
  },
  loadEnvironments: () => {
    const envs = getEnvironments();
    const activeId = getActiveEnvironmentId();
    set({ environments: envs, activeEnvironmentId: activeId });
  },

  // ——— Automated Tests ———
  automatedTests: [],
  loadAutomatedTests: () => set({ automatedTests: getAutomatedTests() }),
  addAutomatedTest: (test) => {
    const updated = persistAutomatedTest(test);
    set({ automatedTests: updated });
  },
  updateAutomatedTest: (test) => {
    const updated = persistAutomatedTestUpdate(test.id, test);
    set({ automatedTests: updated });
  },
  deleteAutomatedTest: (id) => {
    const updated = persistAutomatedTestDelete(id);
    set({ automatedTests: updated });
  },

  // ——— Settings ———
  settings: DEFAULT_SETTINGS,
  updateSettings: (partial) => {
    const current = get().settings;
    const updated = { ...current, ...partial };
    persistSettings(updated);
    set({ settings: updated });

    // Apply appearance changes to DOM
    if (partial.theme) applyTheme(partial.theme);
    if (partial.density) applyDensity(partial.density);
  },
  loadSettings: () => {
    const settings = loadSettings(DEFAULT_SETTINGS);
    set({ settings });
    // Apply loaded settings to DOM
    applyTheme(settings.theme);
    applyDensity(settings.density);
  },

  // ——— Theme ———
  setTheme: (theme) => {
    applyTheme(theme);
    get().updateSettings({ theme });
  },

  // ——— UI ———
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  responseTab: "body",
  setResponseTab: (tab) => set({ responseTab: tab }),
  settingsOpen: false,
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
  saveAsModalOpen: false,
  setSaveAsModalOpen: (open) => set({ saveAsModalOpen: open }),
  
  // ——— Confirm Dialog ———
  confirmDialog: {
    isOpen: false,
    variant: "danger",
    title: "",
    message: "",
    onConfirm: null,
  },
  openConfirm: (opts) => set({
    confirmDialog: {
      isOpen: true,
      variant: opts.variant || "danger",
      title: opts.title,
      message: opts.message,
      detail: opts.detail,
      confirmLabel: opts.confirmLabel || "Confirm",
      cancelLabel: opts.cancelLabel || "Cancel",
      onConfirm: opts.onConfirm,
    },
  }),
  closeConfirm: () => set((s) => ({
    confirmDialog: { ...s.confirmDialog, isOpen: false, onConfirm: null },
  })),
  
  // ——— Edit Request ———
  editModalOpen: false,
  editModalRequest: null,
  openEditRequest: (request) => set({ editModalOpen: true, editModalRequest: request }),
  closeEditRequest: () => set({ editModalOpen: false, editModalRequest: null }),
  
  // ——— New Request ———
  newRequestModalOpen: false,
  newRequestModalCollectionId: null,
  openNewRequestModal: (collectionId) => set({ 
    newRequestModalOpen: true, 
    newRequestModalCollectionId: collectionId || null 
  }),
  closeNewRequestModal: () => set({ 
    newRequestModalOpen: false, 
    newRequestModalCollectionId: null 
  }),
  createNewRequest: (name, method, url, collectionId) => {
    const now = Date.now();
    const newRequest: RequestItem = {
      id: crypto.randomUUID(),
      name: name.trim() || "Untitled Request",
      method: method.toUpperCase() as import("@/types").HttpMethod,
      url: url.trim(),
      headers: [],
      queryParams: [],
      bodyType: "none",
      body: "",
      auth: { type: "none" },
      createdAt: now,
      updatedAt: now,
    };
    // Save to collection
    persistAddRequest(collectionId, newRequest);
    // Reload collections
    set({ collections: getCollections() });
    // Open in workspace
    set({
      currentRequest: { ...newRequest },
      savedRequestId: newRequest.id,
      savedCollectionId: collectionId,
      currentScreen: "workspace",
      currentResponse: null,
      newRequestModalOpen: false,
      newRequestModalCollectionId: null,
    });
  },
  startNewRequest: () => set({
    currentRequest: createBlankRequest(),
    currentResponse: null,
    savedRequestId: null,
    savedCollectionId: null,
    currentScreen: "workspace",
  }),
  
  // ——— Auto Save ———
  autoSave: false,
  setAutoSave: (enabled) => {
    set({ autoSave: enabled });
    const current = get().settings;
    persistSettings({ ...current, autoSave: enabled });
  },
}));
