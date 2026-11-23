import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { createBlankHeader } from "@/utils/constants";
import type { BodyType, AuthType, HeaderParam } from "@/types";
import {
  Search,
  List,
  FileText,
  Shield,
  Plus,
  Trash2,
} from "lucide-react";
import "./RequestPanel.css";

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "raw", label: "Raw" },
  { value: "form", label: "Form" },
  { value: "formData", label: "Form Data" },
];

const AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: "none", label: "No Auth" },
  { value: "bearer", label: "Bearer Token" },
  { value: "basic", label: "Basic Auth" },
  { value: "apiKey", label: "API Key" },
];

const TABS = [
  { id: "params" as const, label: "Params", icon: Search },
  { id: "headers" as const, label: "Headers", icon: List },
  { id: "body" as const, label: "Body", icon: FileText },
  { id: "auth" as const, label: "Auth", icon: Shield },
];

export const RequestPanel = () => {
  const { currentRequest, setCurrentRequest } = useAppStore();
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body" | "auth">("params");

  // ——— Query Params ———
  const queryParams = currentRequest.queryParams;
  const setQueryParams = (params: HeaderParam[]) => {
    setCurrentRequest({ ...currentRequest, queryParams: params, updatedAt: Date.now() });
  };
  const addQueryParam = () => setQueryParams([...queryParams, createBlankHeader()]);
  const removeQueryParam = (index: number) =>
    setQueryParams(queryParams.filter((_, i) => i !== index));
  const updateQueryParam = (index: number, field: keyof HeaderParam, value: string | boolean) => {
    const updated = [...queryParams];
    updated[index] = { ...updated[index], [field]: value };
    setQueryParams(updated);
  };

  // ——— Headers ———
  const headers = currentRequest.headers;
  const setHeaders = (h: HeaderParam[]) => {
    setCurrentRequest({ ...currentRequest, headers: h, updatedAt: Date.now() });
  };
  const addHeader = () => setHeaders([...headers, createBlankHeader()]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: keyof HeaderParam, value: string | boolean) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: value };
    setHeaders(updated);
  };

  // ——— Body ———
  const setBodyType = (type: BodyType) => {
    setCurrentRequest({ ...currentRequest, bodyType: type, updatedAt: Date.now() });
  };
  const setBody = (body: string) => {
    setCurrentRequest({ ...currentRequest, body, updatedAt: Date.now() });
  };

  // ——— Auth ———
  const setAuth = (auth: typeof currentRequest.auth) => {
    setCurrentRequest({ ...currentRequest, auth, updatedAt: Date.now() });
  };

  const renderKeyValueEditor = (
    items: HeaderParam[],
    _setItems: (items: HeaderParam[]) => void,
    addItem: () => void,
    removeItem: (index: number) => void,
    updateItem: (index: number, field: keyof HeaderParam, value: string | boolean) => void,
    placeholder: string
  ) => (
    <div className="kv-editor">
      {items.length === 0 && (
        <div className="kv-empty">
          <p>No {placeholder} added yet</p>
        </div>
      )}
      <div className="kv-header">
        <span className="kv-col-key">Key</span>
        <span className="kv-col-value">Value</span>
        <span className="kv-col-actions" />
      </div>
      <div className="kv-rows">
        {items.map((item, index) => (
          <div key={index} className={`kv-row ${!item.enabled ? "disabled" : ""}`}>
            <input
              type="text"
              className="kv-input kv-input-key"
              placeholder="Key"
              value={item.key}
              onChange={(e) => updateItem(index, "key", e.target.value)}
              aria-label={`${placeholder} key ${index + 1}`}
            />
            <input
              type="text"
              className="kv-input kv-input-value"
              placeholder="Value"
              value={item.value}
              onChange={(e) => updateItem(index, "value", e.target.value)}
              aria-label={`${placeholder} value ${index + 1}`}
            />
            <div className="kv-actions">
              <label className="toggle-switch" data-tooltip={item.enabled ? "Disable" : "Enable"}>
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) => updateItem(index, "enabled", e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
              <button
                className="kv-remove-btn"
                onClick={() => removeItem(index)}
                data-tooltip="Remove"
                aria-label={`Remove ${placeholder} ${index + 1}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="add-row-btn" onClick={addItem}>
        <Plus size={14} />
        <span>Add {placeholder}</span>
      </button>
    </div>
  );

  return (
    <div className="request-panel">
      {/* Tabs */}
      <div className="panel-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`panel-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="panel-content">
        {activeTab === "params" &&
          renderKeyValueEditor(
            queryParams, setQueryParams, addQueryParam, removeQueryParam, updateQueryParam,
            "Param"
          )}

        {activeTab === "headers" &&
          renderKeyValueEditor(
            headers, setHeaders, addHeader, removeHeader, updateHeader,
            "Header"
          )}

        {/* Body */}
        {activeTab === "body" && (
          <div className="body-section">
            <div className="body-type-selector">
              {BODY_TYPES.map((type) => (
                <button
                  key={type.value}
                  className={`body-type-btn ${currentRequest.bodyType === type.value ? "active" : ""}`}
                  onClick={() => setBodyType(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {currentRequest.bodyType !== "none" && (
              <textarea
                className="body-textarea"
                placeholder={
                  currentRequest.bodyType === "json"
                    ? '{"key": "value"}'
                    : currentRequest.bodyType === "xml"
                    ? "<root>\n  <key>value</key>\n</root>"
                    : "Request body..."
                }
                value={currentRequest.body}
                onChange={(e) => setBody(e.target.value)}
                spellCheck={false}
              />
            )}
            {currentRequest.bodyType === "none" && (
              <div className="empty-state">
                <FileText size={32} className="empty-state-icon" />
                <p className="empty-state-title">No body</p>
                <p className="empty-state-description">
                  Select a body type above to add a request body.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Auth */}
        {activeTab === "auth" && (
          <div className="auth-section">
            <div className="auth-type-selector">
              {AUTH_TYPES.map((type) => (
                <button
                  key={type.value}
                  className={`auth-type-btn ${currentRequest.auth.type === type.value ? "active" : ""}`}
                  onClick={() => setAuth({ ...currentRequest.auth, type: type.value })}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {currentRequest.auth.type === "bearer" && (
              <div className="auth-fields">
                <label className="auth-field-label">Token</label>
                <input
                  type="text"
                  className="auth-field-input"
                  placeholder="Enter bearer token"
                  value={currentRequest.auth.token ?? ""}
                  onChange={(e) =>
                    setAuth({ ...currentRequest.auth, token: e.target.value })
                  }
                />
              </div>
            )}

            {currentRequest.auth.type === "basic" && (
              <div className="auth-fields">
                <label className="auth-field-label">Username</label>
                <input
                  type="text"
                  className="auth-field-input"
                  placeholder="Username"
                  value={currentRequest.auth.username ?? ""}
                  onChange={(e) =>
                    setAuth({ ...currentRequest.auth, username: e.target.value })
                  }
                />
                <label className="auth-field-label">Password</label>
                <input
                  type="password"
                  className="auth-field-input"
                  placeholder="Password"
                  value={currentRequest.auth.password ?? ""}
                  onChange={(e) =>
                    setAuth({ ...currentRequest.auth, password: e.target.value })
                  }
                />
              </div>
            )}

            {currentRequest.auth.type === "apiKey" && (
              <div className="auth-fields">
                <label className="auth-field-label">Key Name</label>
                <input
                  type="text"
                  className="auth-field-input"
                  placeholder="e.g. X-API-Key"
                  value={currentRequest.auth.apiKeyName ?? ""}
                  onChange={(e) =>
                    setAuth({ ...currentRequest.auth, apiKeyName: e.target.value })
                  }
                />
                <label className="auth-field-label">Key Value</label>
                <input
                  type="text"
                  className="auth-field-input"
                  placeholder="API key value"
                  value={currentRequest.auth.apiKeyValue ?? ""}
                  onChange={(e) =>
                    setAuth({ ...currentRequest.auth, apiKeyValue: e.target.value })
                  }
                />
                <label className="auth-field-label">Location</label>
                <select
                  className="auth-field-input"
                  value={currentRequest.auth.apiKeyLocation ?? "header"}
                  onChange={(e) =>
                    setAuth({
                      ...currentRequest.auth,
                      apiKeyLocation: e.target.value as "header" | "query",
                    })
                  }
                >
                  <option value="header">Header</option>
                  <option value="query">Query</option>
                </select>
              </div>
            )}

            {currentRequest.auth.type === "none" && (
              <div className="empty-state">
                <Shield size={32} className="empty-state-icon" />
                <p className="empty-state-title">No authentication</p>
                <p className="empty-state-description">
                  Select an authentication type above to secure your request.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
