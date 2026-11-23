import { invoke } from "@tauri-apps/api/core";
import type {
  RequestItem,
  ResponseItem,
  AppSettings,
} from "@/types";
import { buildUrl, interpolateVariables } from "@/utils/helpers";

/**
 * Service for sending HTTP requests via the Tauri backend.
 * The Rust backend handles the actual HTTP calls for better
 * performance, SSL control, and offline capability.
 */

interface SendRequestPayload {
  request: RequestItem;
  environmentVariables?: Record<string, string>;
  settings?: Partial<AppSettings>;
}

/**
 * Send an HTTP request through the Tauri backend
 */
export const sendRequest = async ({
  request,
  environmentVariables = {},
  settings,
}: SendRequestPayload): Promise<ResponseItem> => {
  const startTime = Date.now();

  try {
    // Interpolate environment variables in URL and body
    const interpolatedUrl = interpolateVariables(request.url, environmentVariables);
    const interpolatedBody = interpolateVariables(request.body, environmentVariables);

    const interpolatedHeaders = request.headers.map((h) => ({
      ...h,
      key: interpolateVariables(h.key, environmentVariables),
      value: interpolateVariables(h.value, environmentVariables),
    }));

    const interpolatedQueryParams = request.queryParams.map((p) => ({
      ...p,
      key: interpolateVariables(p.key, environmentVariables),
      value: interpolateVariables(p.value, environmentVariables),
    }));

    // Build full URL with query params
    const fullUrl = buildUrl(interpolatedUrl, interpolatedQueryParams);

    // Build headers map
    const headers: Record<string, string> = {};
    interpolatedHeaders
      .filter((h) => h.enabled && h.key)
      .forEach((h) => {
        headers[h.key] = h.value;
      });

    // Apply auth headers
    if (request.auth.type === "bearer" && request.auth.token) {
      headers["Authorization"] = `Bearer ${request.auth.token}`;
    } else if (request.auth.type === "basic" && request.auth.username && request.auth.password) {
      headers["Authorization"] = `Basic ${btoa(`${request.auth.username}:${request.auth.password}`)}`;
    } else if (request.auth.type === "apiKey" && request.auth.apiKeyName && request.auth.apiKeyValue) {
      if (request.auth.apiKeyLocation === "header") {
        headers[request.auth.apiKeyName] = request.auth.apiKeyValue;
      }
    }

    // Call the Tauri backend command
    const response = await invoke<Record<string, unknown>>("send_http_request", {
      method: request.method,
      url: fullUrl,
      headers,
      body: request.bodyType !== "none" ? interpolatedBody : undefined,
      timeout: settings?.timeout ?? 30,
      followRedirects: settings?.followRedirects ?? true,
      sslVerification: settings?.sslVerification ?? true,
    });

    return {
      id: crypto.randomUUID(),
      requestId: request.id,
      status: response.status as number,
      statusText: response.statusText as string,
      headers: response.headers as Record<string, string>,
      body: response.body as string,
      duration: response.duration as number,
      size: response.size as number,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    // Return an error response so the UI can display it
    const errorMessage = error?.message ?? error?.toString() ?? "Unknown error";
    return {
      id: crypto.randomUUID(),
      requestId: request.id,
      status: 0,
      statusText: "Request Failed",
      headers: {},
      body: `Error: ${errorMessage}`,
      duration: Date.now() - startTime,
      size: 0,
      timestamp: Date.now(),
    };
  }
};

/**
 * Test connectivity to a URL
 */
export const testConnection = async (url: string): Promise<boolean> => {
  try {
    await invoke<boolean>("test_connection", { url });
    return true;
  } catch {
    return false;
  }
};
