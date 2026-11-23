import { useAppStore } from "@/store/appStore";
import { formatJson, formatDuration, formatBytes, getStatusCategory } from "@/utils/helpers";
import {
  FileText,
  List,
  Info,
  Copy,
  Download,
  Loader2,
  Send,
} from "lucide-react";
import "./ResponsePanel.css";

const TABS = [
  { id: "body" as const, label: "Body", icon: FileText },
  { id: "headers" as const, label: "Headers", icon: List },
  { id: "info" as const, label: "Info", icon: Info },
];

export const ResponsePanel = () => {
  const { currentResponse, isSending, responseTab, setResponseTab } = useAppStore();
  const { settings } = useAppStore();

  // Check for JSON content-type (case-insensitive header lookup)
  const isJsonResponse = Object.keys(currentResponse?.headers ?? {}).some(
    (key) => key.toLowerCase() === "content-type" && currentResponse!.headers[key].toLowerCase().includes("json")
  );

  const responseBody =
    currentResponse && settings.formatJson && isJsonResponse
      ? formatJson(currentResponse.body)
      : currentResponse?.body ?? "";

  const statusCategory = currentResponse ? getStatusCategory(currentResponse.status) : "";

  const handleCopy = () => {
    if (responseBody) {
      navigator.clipboard.writeText(responseBody);
    }
  };

  if (!currentResponse) {
    return (
      <div className="response-panel">
        {/* Tabs */}
        <div className="panel-tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`panel-tab ${responseTab === tab.id ? "active" : ""}`}
                onClick={() => setResponseTab(tab.id)}
                role="tab"
                aria-selected={responseTab === tab.id}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="response-content">
          {isSending ? (
            <div className="empty-state">
              <Loader2 size={32} className="empty-state-icon spin" />
              <p className="empty-state-title">Sending request...</p>
              <p className="empty-state-description">
                Waiting for the server response.
              </p>
            </div>
          ) : (
            <div className="empty-state">
              <Send size={32} className="empty-state-icon" />
              <p className="empty-state-title">No response yet</p>
              <p className="empty-state-description">
                Send a request to see the response here.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="response-panel">
      {/* Status bar */}
      <div className="response-status-bar">
        <span className={`response-status-code status-${statusCategory}`}>
          {currentResponse.status}
        </span>
        <span className={`response-status-text status-${statusCategory}`}>
          {currentResponse.statusText}
        </span>
        <span className="status-separator" />
        <span className="response-meta-item">
          {formatDuration(currentResponse.duration)}
        </span>
        <span className="status-separator" />
        <span className="response-meta-item">
          {formatBytes(currentResponse.size)}
        </span>
      </div>

      {/* Tabs with actions */}
      <div className="panel-tabs response-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`panel-tab ${responseTab === tab.id ? "active" : ""}`}
              onClick={() => setResponseTab(tab.id)}
              role="tab"
              aria-selected={responseTab === tab.id}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
        {responseTab === "body" && (
          <div className="response-actions">
            <button
              className="response-action-btn"
              onClick={handleCopy}
              data-tooltip="Copy"
              aria-label="Copy response body"
            >
              <Copy size={13} />
            </button>
            <button
              className="response-action-btn"
              data-tooltip="Download"
              aria-label="Download response"
            >
              <Download size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="response-content">
        {responseTab === "body" && (
          <pre
            className={`response-body ${settings.wrapResponse ? "wrap" : "nowrap"}`}
          >
            {responseBody}
          </pre>
        )}

        {responseTab === "headers" && (
          <div className="response-headers">
            {Object.entries(currentResponse.headers).length === 0 ? (
              <p className="kv-empty">No response headers</p>
            ) : (
              Object.entries(currentResponse.headers).map(([key, value]) => (
                <div key={key} className="header-row">
                  <span className="header-key">{key}</span>
                  <span className="header-value">{value}</span>
                </div>
              ))
            )}
          </div>
        )}

        {responseTab === "info" && (
          <div className="response-info">
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className="info-value">
                {currentResponse.status} {currentResponse.statusText}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Duration</span>
              <span className="info-value">{formatDuration(currentResponse.duration)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Size</span>
              <span className="info-value">{formatBytes(currentResponse.size)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Timestamp</span>
              <span className="info-value">
                {new Date(currentResponse.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
