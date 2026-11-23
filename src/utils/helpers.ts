/** Generate a unique ID using crypto API */
export const generateId = (): string => {
  return crypto.randomUUID();
};

/** Format a duration in milliseconds to a human-readable string */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/** Format bytes to a human-readable string */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
};

/** Format a timestamp to a readable date string */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/** Ensure a URL has a protocol prefix */
export const ensureProtocol = (url: string): string => {
  // If it already has a protocol (e.g. http://, https://, ftp://), return as-is
  if (/^\w+:\/\//.test(url)) {
    return url;
  }
  // Default to https:// for bare domains or paths
  return `https://${url}`;
};

/** Build a full URL with query parameters */
export const buildUrl = (baseUrl: string, queryParams: { key: string; value: string; enabled: boolean }[]): string => {
  const urlWithProtocol = ensureProtocol(baseUrl);
  const url = new URL(urlWithProtocol);
  queryParams
    .filter((p) => p.enabled && p.key)
    .forEach((p) => url.searchParams.append(p.key, p.value));
  return url.toString();
};

/** Interpolate environment variables in a string */
export const interpolateVariables = (
  text: string,
  variables: Record<string, string>
): string => {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
};

/** Format JSON string with proper indentation */
export const formatJson = (jsonStr: string, indent: number = 2): string => {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, indent);
  } catch {
    return jsonStr;
  }
};

/** Get a CSS variable for an HTTP method color */
export const getMethodColorVar = (method: string): string => {
  const vars: Record<string, string> = {
    GET: "var(--method-get)",
    POST: "var(--method-post)",
    PUT: "var(--method-put)",
    PATCH: "var(--method-patch)",
    DELETE: "var(--method-delete)",
    HEAD: "var(--method-head)",
    OPTIONS: "var(--method-options)",
  };
  return vars[method] ?? "var(--method-head)";
};

/** Get a CSS class for an HTTP method badge */
export const getMethodBadgeClass = (method: string): string => {
  return `method-badge method-${method.toLowerCase()}`;
};

/** Get status text for an HTTP status code */
export const getStatusText = (status: number): string => {
  const statusTexts: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    301: "Moved Permanently",
    302: "Found",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return statusTexts[status] ?? "Unknown";
};

/** Get a CSS color class for status code categories */
export const getStatusCategory = (status: number): string => {
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "redirect";
  if (status >= 400 && status < 500) return "client-error";
  if (status >= 500) return "server-error";
  return "unknown";
};
