import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { createBlankCollection } from "@/utils/constants";
import { formatDateTime } from "@/utils/helpers";
import type { Collection, RequestItem } from "@/types";
import {
  FolderOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  Copy,
  ExternalLink,
} from "lucide-react";
import "./Collections.css";

export const Collections = () => {
  const {
    collections,
    activeCollectionId,
    setActiveCollectionId,
    addCollection,
    updateCollection,
    deleteCollection,
    openRequest,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(collections.map((c) => c.id)));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

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

  const handleDeleteCollection = (id: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      deleteCollection(id);
    }
  };

  const handleDuplicateCollection = (collection: Collection) => {
    const duplicated: Collection = {
      ...collection,
      id: crypto.randomUUID(),
      name: `${collection.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addCollection(duplicated);
  };

  const handleOpenRequest = (request: RequestItem, collectionId: string) => {
    openRequest(request, collectionId);
  };

  const countItems = (collection: Collection) => {
    let count = collection.standaloneRequests.length;
    collection.folders.forEach((f) => {
      count += f.items.length;
    });
    return count;
  };

  return (
    <div className="collections-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Collections</h1>
          <span className="page-count">{collections.length} collections</span>
        </div>
        <div className="page-header-right">
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAddCollection}>
            <Plus size={14} />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* Collections List */}
      {filteredCollections.length === 0 ? (
        <div className="page-empty-state">
          <FolderOpen size={48} className="page-empty-icon" />
          <h3 className="page-empty-title">
            {searchQuery ? "No collections found" : "No collections yet"}
          </h3>
          <p className="page-empty-description">
            {searchQuery
              ? "Try a different search term."
              : "Create your first collection to organize your API requests."}
          </p>
          {!searchQuery && (
            <button className="btn btn-primary" onClick={handleAddCollection}>
              <Plus size={14} />
              <span>Create Collection</span>
            </button>
          )}
        </div>
      ) : (
        <div className="collections-list">
          {filteredCollections.map((collection) => {
            const isExpanded = expandedIds.has(collection.id);
            const isActive = activeCollectionId === collection.id;
            const itemCount = countItems(collection);

            return (
              <div
                key={collection.id}
                className={`collection-row ${isActive ? "active" : ""}`}
              >
                {/* Collection Header */}
                <div
                  className="collection-header"
                  onClick={() => {
                    toggleExpand(collection.id);
                    setActiveCollectionId(collection.id);
                  }}
                >
                  <button
                    className="expand-btn"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>

                  <div className="collection-icon">
                    <FolderOpen size={16} />
                  </div>

                  {editingId === collection.id ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSaveEdit(collection.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(collection.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <div className="collection-info">
                      <span className="collection-name">{collection.name}</span>
                      <span className="collection-meta">
                        {itemCount} items · {formatDateTime(collection.updatedAt)}
                      </span>
                    </div>
                  )}

                  <div className="collection-actions">
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(collection);
                      }}
                      data-tooltip="Rename"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateCollection(collection);
                      }}
                      data-tooltip="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.id);
                      }}
                      data-tooltip="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="collection-content">
                    {/* Folders */}
                    {collection.folders.map((folder) => (
                      <div key={folder.id} className="folder-section">
                        <div className="folder-header">
                          <ChevronRight size={12} />
                          <span className="folder-name">{folder.name}</span>
                          <span className="folder-count">{folder.items.length}</span>
                        </div>
                        <div className="folder-items">
                          {folder.items
                            .filter((item): item is RequestItem => 'method' in item)
                            .map((item) => (
                              <div
                                key={item.id}
                                className="request-item"
                                onClick={() => handleOpenRequest(item, collection.id)}
                              >
                                <span
                                  className="request-method"
                                  data-method={item.method}
                                >
                                  {item.method}
                                </span>
                                <span className="request-name">
                                  {item.name || item.url}
                                </span>
                                <ExternalLink size={12} className="request-open-icon" />
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}

                    {/* Standalone Requests */}
                    {collection.standaloneRequests.map((request) => (
                      <div
                        key={request.id}
                        className="request-item standalone"
                        onClick={() => handleOpenRequest(request, collection.id)}
                      >
                        <span
                          className="request-method"
                          data-method={request.method}
                        >
                          {request.method}
                        </span>
                        <span className="request-name">
                          {request.name || request.url}
                        </span>
                        <ExternalLink size={12} className="request-open-icon" />
                      </div>
                    ))}

                    {itemCount === 0 && (
                      <div className="collection-empty">
                        <p>This collection is empty. Add requests to organize them.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
