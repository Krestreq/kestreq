import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { createBlankCollection } from "@/utils/constants";
import { getMethodColorVar } from "@/utils/helpers";
import type { Collection } from "@/types";
import {
  FolderOpen,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
} from "lucide-react";
import "./Sidebar.css";

export const Sidebar = () => {
  const {
    collections,
    activeCollectionId,
    setActiveCollectionId,
    addCollection,
    updateCollection,
    deleteCollection,
    history,
    clearHistory,
    sidebarOpen,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"collections" | "history">("collections");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAddCollection = () => {
    const newCollection = createBlankCollection();
    addCollection(newCollection);
  };

  const handleStartEdit = (collection: Collection) => {
    setEditingId(collection.id);
    setEditName(collection.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      const collection = collections.find((c) => c.id === id);
      if (collection) {
        updateCollection({
          ...collection,
          name: editName.trim(),
          updatedAt: Date.now(),
        });
      }
    }
    setEditingId(null);
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
      {/* Sidebar header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <Search size={16} className="brand-icon" />
          <span className="brand-text">KrestReq</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === "collections" ? "active" : ""}`}
          onClick={() => setActiveTab("collections")}
          aria-label="Collections tab"
        >
          <FolderOpen size={14} />
          <span>Collections</span>
        </button>
        <button
          className={`sidebar-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
          aria-label="History tab"
        >
          <Clock size={14} />
          <span>History</span>
        </button>
      </div>

      {/* Collections tab */}
      {activeTab === "collections" && (
        <div className="sidebar-content">
          <button className="add-collection-btn" onClick={handleAddCollection}>
            <Plus size={14} />
            <span>New Collection</span>
          </button>
          {collections.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={32} className="empty-state-icon" />
              <p className="empty-state-title">No collections</p>
              <p className="empty-state-description">
                Create a collection to organize your API requests.
              </p>
            </div>
          ) : (
            <ul className="collection-list">
              {collections.map((collection) => (
                <li
                  key={collection.id}
                  className={`collection-item ${
                    activeCollectionId === collection.id ? "active" : ""
                  }`}
                  onClick={() => setActiveCollectionId(collection.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveCollectionId(collection.id);
                    }
                  }}
                >
                  {editingId === collection.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSaveEdit(collection.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(collection.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="collection-edit-input"
                    />
                  ) : (
                    <>
                      <ChevronRight size={14} className="collection-chevron" />
                      <span className="collection-name">{collection.name}</span>
                      <div className="collection-actions">
                        <button
                          className="collection-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(collection);
                          }}
                          data-tooltip="Rename"
                          aria-label="Rename collection"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className="collection-action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCollection(collection.id);
                          }}
                          data-tooltip="Delete"
                          aria-label="Delete collection"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <div className="sidebar-content">
          {history.length > 0 && (
            <div className="history-header">
              <span className="history-count">{history.length} requests</span>
              <button className="clear-history-btn" onClick={clearHistory}>
                Clear
              </button>
            </div>
          )}
          {history.length === 0 ? (
            <div className="empty-state">
              <Clock size={32} className="empty-state-icon" />
              <p className="empty-state-title">No history</p>
              <p className="empty-state-description">
                Sent requests will appear here.
              </p>
            </div>
          ) : (
            <ul className="history-list">
              {history.map((entry) => {
                const methodColor = getMethodColorVar(entry.request.method);
                return (
                  <li key={entry.id} className="history-item">
                    <span
                      className="history-method-badge"
                      style={{ color: methodColor }}
                    >
                      {entry.request.method}
                    </span>
                    <span className="history-name">{entry.request.name}</span>
                    {entry.response && (
                      <span
                        className={`history-status status-${entry.response.status}`}
                      >
                        {entry.response.status}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
};
