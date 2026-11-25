import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { createBlankCollection, createBlankWorkspace } from "@/utils/constants";
import { formatDateTime } from "@/utils/helpers";
import { deleteRequestFromCollection } from "@/services/storage";
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
  FileText,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditRequest } from "@/components/EditRequest";
import "./Collections.css";

export const Collections = () => {
  const {
    collections,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    addWorkspace,
    activeCollectionId,
    setActiveCollectionId,
    addCollection,
    updateCollection,
    deleteCollection,
    openRequest,
    openConfirm,
    closeConfirm,
    confirmDialog,
    openEditRequest,
    closeEditRequest,
    editModalOpen,
    editModalRequest,
    updateRequestInStore,
    loadCollections,
    openNewRequestModal,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(collections.map((c) => c.id)));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [expandedWorkspaceIds, setExpandedWorkspaceIds] = useState<Set<string>>(new Set());
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspaces.find((workspace) => workspace.id === c.workspaceId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredWorkspaces = workspaces.filter((workspace) =>
    !searchQuery ||
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    filteredCollections.some((collection) => collection.workspaceId === workspace.id)
  );

  const toggleExpand = (id: string) => {
    const next = expandedIds.size === 0 ? new Set(collections.map((collection) => collection.id)) : new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const toggleWorkspace = (id: string) => {
    const next = expandedWorkspaceIds.size === 0 ? new Set(workspaces.map((workspace) => workspace.id)) : new Set(expandedWorkspaceIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedWorkspaceIds(next);
  };

  const handleAddCollection = (workspaceId = activeWorkspaceId) => {
    const newCollection = createBlankCollection();
    newCollection.name = `Collection ${collections.filter((collection) => collection.workspaceId === workspaceId).length + 1}`;
    newCollection.workspaceId = workspaceId || undefined;
    if (workspaceId) setActiveWorkspaceId(workspaceId);
    addCollection(newCollection);
    setExpandedIds(new Set([...expandedIds, newCollection.id]));
  };

  const handleAddWorkspace = () => {
    const name = workspaceName.trim();
    if (!name) return;
    const workspace = { ...createBlankWorkspace(), name };
    addWorkspace(workspace);
    setExpandedWorkspaceIds((current) => new Set([...current, workspace.id]));
    setWorkspaceName("");
    setShowWorkspaceForm(false);
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

  const handleDeleteCollection = (collection: Collection) => {
    const itemCount = collection.standaloneRequests.length;
    openConfirm({
      variant: "danger",
      title: "Delete Collection",
      message: `Are you sure you want to delete "${collection.name}"?`,
      detail: itemCount > 0 ? `This will also delete ${itemCount} request${itemCount > 1 ? "s" : ""} in this collection. This action cannot be undone.` : undefined,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: () => {
        deleteCollection(collection.id);
        closeConfirm();
      },
    });
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

  const handleEditRequest = (request: RequestItem) => {
    openEditRequest(request);
  };

  const handleDeleteRequest = (request: RequestItem, collectionId: string) => {
    openConfirm({
      variant: "danger",
      title: "Delete Request",
      message: `Are you sure you want to delete "${request.name || request.url}"?`,
      detail: "This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: () => {
        deleteRequestFromCollection(collectionId, request.id);
        loadCollections();
        closeConfirm();
      },
    });
  };

  const handleSaveEditRequest = (updatedRequest: RequestItem) => {
    updateRequestInStore(updatedRequest);
    closeEditRequest();
    loadCollections();
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
          <h1 className="page-title">Workspaces</h1>
          <span className="page-count">{workspaces.length} workspaces · {collections.length} collections</span>
        </div>
        <div className="page-header-right">
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search workspaces and collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => openNewRequestModal()}
            title="Create a new request"
          >
            <FileText size={14} />
            <span>New Request</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowWorkspaceForm((open) => !open)}>
            <Plus size={14} />
            <span>New Workspace</span>
          </button>
        </div>
      </div>

      {showWorkspaceForm && (
        <form
          className="workspace-create-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleAddWorkspace();
          }}
        >
          <input
            className="edit-input"
            aria-label="Workspace name"
            placeholder="e.g. Payments API"
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            autoFocus
          />
          <button className="btn btn-primary" type="submit" disabled={!workspaceName.trim()}>
            <Plus size={14} /> Create workspace
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => setShowWorkspaceForm(false)}>
            Cancel
          </button>
        </form>
      )}

      {/* Collections List */}
      {filteredWorkspaces.length === 0 ? (
        <div className="page-empty-state">
          <FolderOpen size={48} className="page-empty-icon" />
          <h3 className="page-empty-title">
            {searchQuery ? "No workspaces found" : "No workspaces yet"}
          </h3>
          <p className="page-empty-description">
            {searchQuery
              ? "Try a different search term."
              : "Create a workspace to keep related collections and requests together."}
          </p>
          {!searchQuery && (
            <button className="btn btn-primary" onClick={() => setShowWorkspaceForm(true)}>
              <Plus size={14} />
              <span>Create Workspace</span>
            </button>
          )}
        </div>
      ) : (
        <div className="workspaces-list">
          {filteredWorkspaces.map((workspace) => {
            const workspaceCollections = filteredCollections.filter((collection) => collection.workspaceId === workspace.id);
            const isWorkspaceExpanded = expandedWorkspaceIds.has(workspace.id) || expandedWorkspaceIds.size === 0;
            const isWorkspaceActive = activeWorkspaceId === workspace.id;

            return (
              <section key={workspace.id} className={`workspace-group ${isWorkspaceActive ? "active" : ""}`}>
                <div className="workspace-group-header">
                  <button
                    className="workspace-group-toggle"
                    onClick={() => {
                      if (activeWorkspaceId !== workspace.id) setActiveCollectionId(null);
                      setActiveWorkspaceId(workspace.id);
                      toggleWorkspace(workspace.id);
                    }}
                    aria-expanded={isWorkspaceExpanded}
                  >
                    {isWorkspaceExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <FolderOpen size={18} />
                    <span className="workspace-group-name">{workspace.name}</span>
                    <span className="workspace-group-meta">{workspaceCollections.length} collection{workspaceCollections.length === 1 ? "" : "s"}</span>
                  </button>
                  <button
                    className="btn btn-secondary btn-sm workspace-add-collection"
                    onClick={() => {
                      setActiveWorkspaceId(workspace.id);
                      handleAddCollection(workspace.id);
                    }}
                    title={`Add a collection to ${workspace.name}`}
                  >
                    <Plus size={13} /> Collection
                  </button>
                </div>
                {isWorkspaceExpanded && (
                  <div className="workspace-collections">
                    {workspaceCollections.length === 0 && (
                      <div className="workspace-empty">
                        <span>No collections in this workspace yet.</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleAddCollection(workspace.id)}>
                          <Plus size={13} /> Add collection
                        </button>
                      </div>
                    )}
                    {workspaceCollections.map((collection) => {
            const isExpanded = expandedIds.has(collection.id) || expandedIds.size === 0;
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
                        handleDeleteCollection(collection);
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
                                <div className="request-item-actions">
                                  <button
                                    className="request-action-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditRequest(item);
                                    }}
                                    title="Edit"
                                  >
                                    <Pencil size={11} />
                                  </button>
                                  <button
                                    className="request-action-btn request-action-btn--delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRequest(item, collection.id);
                                    }}
                                    title="Delete"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                  <ExternalLink size={12} className="request-open-icon" />
                                </div>
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
                        <div className="request-item-actions">
                          <button
                            className="request-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRequest(request);
                            }}
                            title="Edit"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            className="request-action-btn request-action-btn--delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRequest(request, collection.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                          <ExternalLink size={12} className="request-open-icon" />
                        </div>
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
              </section>
            );
          })}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        variant={confirmDialog.variant}
        title={confirmDialog.title}
        message={confirmDialog.message}
        detail={confirmDialog.detail}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
        }}
        onCancel={closeConfirm}
      />

      {/* Edit Request Modal */}
      <EditRequest
        isOpen={editModalOpen}
        request={editModalRequest}
        onSave={handleSaveEditRequest}
        onClose={closeEditRequest}
      />
    </div>
  );
};
