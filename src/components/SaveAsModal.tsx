import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { X, FolderPlus, Folder, Check, HardDrive } from "lucide-react";
import "./SaveAsModal.css";

interface SaveAsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestName: string;
}

export const SaveAsModal = ({ isOpen, onClose, onRequestName }: SaveAsModalProps) => {
  const { collections, addCollection, saveRequest } = useAppStore();
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveToCollection = (collectionId: string) => {
    saveRequest(collectionId);
    onClose();
  };

  const handleCreateCollection = () => {
    const name = newCollectionName.trim() || "New Collection";
    const collection = {
      id: crypto.randomUUID(),
      name,
      folders: [],
      standaloneRequests: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addCollection(collection);
    saveRequest(collection.id);
    setNewCollectionName("");
    setShowNewInput(false);
    onClose();
  };

  const countItems = (col: typeof collections[0]) => {
    let count = col.standaloneRequests.length;
    col.folders.forEach((f) => { count += f.items.length; });
    return count;
  };

  return (
    <div className="save-as-overlay" onClick={onClose}>
      <div className="save-as-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="save-as-header">
          <div className="save-as-title">
            <HardDrive size={16} />
            <span>Save Request</span>
          </div>
          <button className="save-as-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Request info */}
        <div className="save-as-request-info">
          <span className="save-as-request-label">Saving</span>
          <strong className="save-as-request-name">{onRequestName}</strong>
        </div>

        {/* Existing collections */}
        {collections.length > 0 ? (
          <div className="save-as-body">
            <div className="save-as-section-label">Save to collection</div>
            <div className="save-as-collection-list">
              {collections.map((col) => (
                <button
                  key={col.id}
                  className="save-as-collection-item"
                  onClick={() => handleSaveToCollection(col.id)}
                >
                  <div className="save-as-collection-icon">
                    <Folder size={16} />
                  </div>
                  <div className="save-as-collection-info">
                    <span className="save-as-collection-name">{col.name}</span>
                    <span className="save-as-collection-meta">
                      {countItems(col)} item{countItems(col) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Check size={14} className="save-as-collection-check" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="save-as-empty">
            <Folder size={32} className="save-as-empty-icon" />
            <p className="save-as-empty-text">No collections yet</p>
            <p className="save-as-empty-hint">Create one below to save your request.</p>
          </div>
        )}

        {/* Create new collection */}
        <div className="save-as-footer">
          {showNewInput ? (
            <div className="save-as-new-form">
              <input
                ref={inputRef}
                type="text"
                className="save-as-new-input"
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCollection();
                  if (e.key === "Escape") {
                    setShowNewInput(false);
                    setNewCollectionName("");
                  }
                }}
              />
              <div className="save-as-new-actions">
                <button
                  className="save-as-btn save-as-btn--cancel"
                  onClick={() => {
                    setShowNewInput(false);
                    setNewCollectionName("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="save-as-btn save-as-btn--create"
                  onClick={handleCreateCollection}
                >
                  <Check size={14} />
                  Create & Save
                </button>
              </div>
            </div>
          ) : (
            <button
              className="save-as-create-btn"
              onClick={() => setShowNewInput(true)}
            >
              <FolderPlus size={14} />
              Create new collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
