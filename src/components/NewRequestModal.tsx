import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { createBlankCollection } from "@/utils/constants";
import { Plus, X, Globe, ChevronDown } from "lucide-react";
import "./NewRequestModal.css";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export const NewRequestModal = () => {
  const {
    newRequestModalOpen,
    newRequestModalCollectionId,
    collections,
    closeNewRequestModal,
    createNewRequest,
  } = useAppStore();

  const [name, setName] = useState("");
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [createNewCollection, setCreateNewCollection] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const methodDropdownRef = useRef<HTMLDivElement>(null);
  const collectionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newRequestModalOpen) {
      setName("");
      setMethod("GET");
      setUrl("");
      setCreateNewCollection(false);
      setNewCollectionName("");
      setShowMethodDropdown(false);
      setShowCollectionDropdown(false);
      // Pre-select the passed collection or the first one
      setSelectedCollectionId(newRequestModalCollectionId || collections[0]?.id || "");
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [newRequestModalOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (methodDropdownRef.current && !methodDropdownRef.current.contains(e.target as Node)) {
        setShowMethodDropdown(false);
      }
      if (collectionDropdownRef.current && !collectionDropdownRef.current.contains(e.target as Node)) {
        setShowCollectionDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!newRequestModalOpen) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleCreate();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [newRequestModalOpen, name, method, url, selectedCollectionId]);

  const handleClose = () => {
    closeNewRequestModal();
  };

  const handleCreate = () => {
    if (!url.trim()) return;
    let targetCollectionId = selectedCollectionId;

    // If creating a new collection
    if (createNewCollection && newCollectionName.trim()) {
      const { addCollection } = useAppStore.getState();
      const newCol = createBlankCollection();
      newCol.name = newCollectionName.trim();
      addCollection(newCol);
      targetCollectionId = newCol.id;
    }

    if (!targetCollectionId) return;
    createNewRequest(name, method, url, targetCollectionId);
  };

  const canSubmit = url.trim() && selectedCollectionId;

  if (!newRequestModalOpen) return null;

  return (
    <div className="new-request-overlay" onClick={handleClose}>
      <div
        className="new-request-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-request-title"
      >
        {/* Header */}
        <div className="new-request-header">
          <h2 id="new-request-title" className="new-request-title">
            <Plus size={18} />
            New Request
          </h2>
          <button className="new-request-close" onClick={handleClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="new-request-body">
          {/* Request Name */}
          <div className="new-request-field">
            <label className="new-request-label" htmlFor="nr-name">
              Request Name
            </label>
            <div className="new-request-input-wrapper">
              <input
                id="nr-name"
                ref={nameRef}
                type="text"
                className="new-request-input"
                placeholder="My API Request"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Method + URL Row */}
          <div className="new-request-field">
            <label className="new-request-label">Method & URL</label>
            <div className="new-request-url-row">
              {/* Method Dropdown */}
              <div className="new-request-method-wrapper" ref={methodDropdownRef}>
                <button
                  className={`new-request-method-btn ${showMethodDropdown ? "open" : ""}`}
                  data-method={method}
                  onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                >
                  <span>{method}</span>
                  <ChevronDown size={12} />
                </button>
                {showMethodDropdown && (
                  <div className="new-request-dropdown new-request-method-dropdown">
                    {HTTP_METHODS.map((m) => (
                      <button
                        key={m}
                        className="new-request-dropdown-item"
                        data-method={m}
                        onClick={() => {
                          setMethod(m);
                          setShowMethodDropdown(false);
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* URL Input */}
              <div className="new-request-url-input-wrapper">
                <Globe size={14} className="new-request-url-icon" />
                <input
                  type="text"
                  className="new-request-url-input"
                  placeholder="https://api.example.com/endpoint"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Collection Selector */}
          <div className="new-request-field">
            <label className="new-request-label" htmlFor="nr-collection">
              Save to Collection
            </label>
            {!createNewCollection ? (
              <>
                <div className="new-request-collection-wrapper" ref={collectionDropdownRef}>
                  <button
                    className={`new-request-collection-btn ${showCollectionDropdown ? "open" : ""}`}
                    onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                  >
                    <span className="new-request-collection-name">
                      {collections.find((c) => c.id === selectedCollectionId)?.name ||
                        "Select a collection"}
                    </span>
                    <ChevronDown size={12} />
                  </button>
                  {showCollectionDropdown && (
                    <div className="new-request-dropdown new-request-collection-dropdown">
                      {collections.length === 0 ? (
                        <div className="new-request-dropdown-empty">No collections</div>
                      ) : (
                        collections.map((c) => (
                          <button
                            key={c.id}
                            className={`new-request-dropdown-item ${
                              c.id === selectedCollectionId ? "selected" : ""
                            }`}
                            onClick={() => {
                              setSelectedCollectionId(c.id);
                              setShowCollectionDropdown(false);
                            }}
                          >
                            {c.name}
                          </button>
                        ))
                      )}
                      <div className="new-request-dropdown-divider" />
                      <button
                        className="new-request-dropdown-item new-request-dropdown-create"
                        onClick={() => {
                          setCreateNewCollection(true);
                          setShowCollectionDropdown(false);
                        }}
                      >
                        <Plus size={12} />
                        Create New Collection
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="new-request-create-collection">
                <input
                  type="text"
                  className="new-request-input"
                  placeholder="New collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                />
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setCreateNewCollection(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="new-request-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!canSubmit}
            onClick={handleCreate}
          >
            <Plus size={14} />
            Create & Open
          </button>
        </div>
      </div>
    </div>
  );
};
