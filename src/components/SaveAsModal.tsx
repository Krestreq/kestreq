import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { X, FolderPlus, Folder, Check } from "lucide-react";
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="save-as-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Save request to collection"
    >
      <div className="save-as-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="save-as-header">
          <div className="save-as-title">
            <FolderPlus size={18} />
            <span>Save Request</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Request name */}
        <div className="save-as-request-name">
          Saving: <strong>{onRequestName}</strong>
        </div>

        {/* Existing collections */}
        {collections.length > 0 ? (
          <div className="save-as-collections">
            <div className="save-as-section-title">Save to collection</div>
            <div className="collection-list">
              {collections.map((col) => (
                <button
                  key={col.id}
                  className="collection-option"
                  onClick={() => handleSaveToCollection(col.id)}
                >
                  <Folder size={16} />
                  <span className="collection-option-name">{col.name}</span>
                  <span className="collection-option-count">
                    {col.standaloneRequests.length} request{col.standaloneRequests.length !== 1 ? "s" : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="save-as-empty">
            <Folder size={24} />
            <p>No collections yet. Create one to save your request.</p>
          </div>
        )}

        {/* Create new collection */}
        <div className="save-as-new">
          {showNewInput ? (
            <div className="new-collection-form">
              <input
                type="text"
                className="new-collection-input"
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
                autoFocus
              />
              <div className="new-collection-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowNewInput(false);
                    setNewCollectionName("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-create"
                  onClick={handleCreateCollection}
                >
                  <Check size={14} />
                  Create & Save
                </button>
              </div>
            </div>
          ) : (
            <button
              className="create-new-btn"
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
