/** HTTP methods supported by the app */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

/** A single key-value header or query parameter */
export interface HeaderParam {
  key: string;
  value: string;
  enabled: boolean;
}

/** Request body types */
export type BodyType = "none" | "raw" | "json" | "xml" | "form" | "formData";

/** Authentication types */
export type AuthType = "none" | "basic" | "bearer" | "apiKey" | "oauth2";

export interface AuthConfig {
  type: AuthType;
  /** For basic auth — username */
  username?: string;
  /** For basic auth — password */
  password?: string;
  /** For bearer token */
  token?: string;
  /** For API key — the header or query param name */
  apiKeyName?: string;
  /** For API key — the value */
  apiKeyValue?: string;
  /** For API key — location (header or query) */
  apiKeyLocation?: "header" | "query";
}

/** A saved HTTP request */
export interface RequestItem {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: HeaderParam[];
  queryParams: HeaderParam[];
  bodyType: BodyType;
  body: string;
  auth: AuthConfig;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

/** Response from an HTTP request */
export interface ResponseItem {
  id: string;
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number; // milliseconds
  size: number; // bytes
  timestamp: number;
}

/** A folder that groups requests */
export interface Folder {
  id: string;
  name: string;
  description?: string;
  items: (RequestItem | Folder)[];
  order: number;
}

/** A top-level collection (workspace) */
export interface Collection {
  id: string;
  name: string;
  description?: string;
  folders: Folder[];
  standaloneRequests: RequestItem[];
  createdAt: number;
  updatedAt: number;
}

/** A history entry linking a request to its response */
export interface HistoryEntry {
  id: string;
  request: RequestItem;
  response?: ResponseItem;
  timestamp: number;
}

/** Environment variable key-value pair */
export interface EnvironmentVariable {
  key: string;
  value: string;
}

/** An environment profile */
export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
  createdAt: number;
  updatedAt: number;
}

/** Available theme names */
export type ThemeName =
  | "dark"
  | "light"
  | "midnight"
  | "dracula"
  | "nord"
  | "solarized-dark"
  | "solarized-light"
  | "monokai"
  | "high-contrast";

/** Appearance mode for auto light/dark */
export type AppearanceMode = "system" | "light" | "dark";

/** Interface density */
export type DensityMode = "compact" | "comfortable" | "spacious";

/** App-wide settings */
export interface AppSettings {
  // Appearance
  theme: ThemeName;
  appearanceMode: AppearanceMode;
  liquidGlass: boolean;
  macOSControls: boolean;
  density: DensityMode;
  accentColor: string;

  // Editor
  fontSize: number;
  fontFamily: string;

  // Request/Response
  wrapResponse: boolean;
  formatJson: boolean;
  followRedirects: boolean;
  sslVerification: boolean;
  timeout: number; // seconds
  maxHistoryEntries: number;
}
