import { useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { formatDateTime, formatDuration } from "@/utils/helpers";
import type { HttpMethod } from "@/types";
import {
  Clock,
  Search,
  Trash2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import "./shared.css";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export const History = () => {
  const {
    history,
    clearHistory,
    setCurrentScreen,
    setCurrentRequest,
    sendRequest,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const matchesSearch =
        !searchQuery ||
        entry.request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.request.url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMethod =
        methodFilter === "all" || entry.request.method === methodFilter;

      const status = entry.response?.status;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "success" &&
          status !== undefined &&
          status >= 200 &&
          status < 300) ||
        (statusFilter === "error" &&
          (status !== undefined && status >= 400 || !entry.response));

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [history, searchQuery, methodFilter, statusFilter]);

  const handleOpenRequest = (entry: typeof history[0]) => {
    setCurrentRequest({ ...entry.request });
    setCurrentScreen("workspace");
  };

  const handleReRun = async (entry: typeof history[0]) => {
    setCurrentRequest({ ...entry.request });
    setCurrentScreen("workspace");
    await sendRequest();
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      clearHistory();
    }
  };

  return (
    <div className="history-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">History</h1>
          <span className="page-count">{history.length} requests</span>
        </div>
        <div className="page-header-right">
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {history.length > 0 && (
            <button className="btn btn-ghost" onClick={handleClearHistory}>
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span className="filter-label">Method:</span>
        <button
          className={`filter-chip ${methodFilter === "all" ? "active" : ""}`}
          onClick={() => setMethodFilter("all")}
        >
          All
        </button>
        {METHODS.map((method) => (
          <button
            key={method}
            className={`filter-chip ${methodFilter === method ? "active" : ""}`}
            data-method={method}
            onClick={() => setMethodFilter(method)}
          >
            {method}
          </button>
        ))}
        <span className="filter-label" style={{ marginLeft: "var(--space-4)" }}>Status:</span>
        <button
          className={`filter-chip ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-chip status-filter ${statusFilter === "success" ? "active" : ""}`}
          data-status="success"
          onClick={() => setStatusFilter("success")}
        >
          Success
        </button>
        <button
          className={`filter-chip status-filter ${statusFilter === "error" ? "active" : ""}`}
          data-status="error"
          onClick={() => setStatusFilter("error")}
        >
          Error
        </button>
      </div>

      {/* History List */}
      <div className="history-list-container">
        {filteredHistory.length === 0 ? (
          <div className="page-empty-state">
            <Clock size={48} className="page-empty-icon" />
            <h3 className="page-empty-title">
              {searchQuery || methodFilter !== "all" || statusFilter !== "all"
                ? "No matching requests"
                : "No history yet"}
            </h3>
            <p className="page-empty-description">
              {searchQuery || methodFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "Send your first API request to see it here."}
            </p>
          </div>
        ) : (
          <div className="history-list">
            {filteredHistory.map((entry) => (
              <div key={entry.id} className="history-card">
                <div className="history-card-main">
                  <span
                    className="history-method-badge"
                    data-method={entry.request.method}
                  >
                    {entry.request.method}
                  </span>
                  <div className="history-card-info">
                    <span className="history-card-name">
                      {entry.request.name || entry.request.url}
                    </span>
                    <span className="history-card-url">{entry.request.url}</span>
                  </div>
                  {entry.response && (
                    <span
                      className={`history-status-badge status-${
                        entry.response.status >= 200 && entry.response.status < 300
                          ? "success"
                          : entry.response.status >= 400
                          ? "error"
                          : "warning"
                      }`}
                    >
                      {entry.response.status}
                    </span>
                  )}
                  <span className="history-duration">
                    {entry.response ? formatDuration(entry.response.duration) : "—"}
                  </span>
                </div>
                <div className="history-card-footer">
                  <span className="history-timestamp">
                    {formatDateTime(entry.timestamp)}
                  </span>
                  <div className="history-card-actions">
                    <button
                      className="action-btn"
                      onClick={() => handleOpenRequest(entry)}
                      data-tooltip="Open in workspace"
                    >
                      <ExternalLink size={12} />
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleReRun(entry)}
                      data-tooltip="Re-run request"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
