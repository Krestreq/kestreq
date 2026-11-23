/** Default app settings */
export const DEFAULT_SETTINGS: import("@/types").AppSettings = {
  theme: "dark",
  appearanceMode: "dark",
  liquidGlass: false,
  macOSControls: false,
  density: "comfortable",
  accentColor: "#6C63FF",
  fontSize: 14,
  fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  wrapResponse: true,
  formatJson: true,
  followRedirects: true,
  sslVerification: true,
  timeout: 30,
  maxHistoryEntries: 100,
  defaultMethod: "GET",
  defaultLayout: "vertical",
  sidebarWidth: 260,
};

/** Default auth config */
export const DEFAULT_AUTH: import("@/types").AuthConfig = {
  type: "none",
};

/** Create a blank request item */
export const createBlankRequest = (): import("@/types").RequestItem => {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: "Untitled Request",
    method: "GET",
    url: "",
    headers: [],
    queryParams: [],
    bodyType: "none",
    body: "",
    auth: { type: "none" },
    createdAt: now,
    updatedAt: now,
  };
};

/** Create a blank header param */
export const createBlankHeader = (): import("@/types").HeaderParam => ({
  key: "",
  value: "",
  enabled: true,
});

/** Create a blank collection */
export const createBlankCollection = (): import("@/types").Collection => ({
  id: crypto.randomUUID(),
  name: "New Collection",
  folders: [],
  standaloneRequests: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

/** Create a blank environment */
export const createBlankEnvironment = (): import("@/types").Environment => ({
  id: crypto.randomUUID(),
  name: "New Environment",
  variables: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

/** Create a blank automated test */
export const createBlankTest = (): import("@/types").AutomatedTest => {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: "New Test",
    request: createBlankRequest(),
    testCases: [],
    lastResult: "pending",
    createdAt: now,
    updatedAt: now,
  };
};
