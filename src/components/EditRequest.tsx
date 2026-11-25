import { useEffect, useRef, useState } from "react";
import { X, Pencil, Save, Folder, FileText } from "lucide-react";
import type { RequestItem, HttpMethod } from "@/types";
import "./EditRequest.css";

interface EditRequestProps {
  isOpen: boolean;
  request: RequestItem | null;
  onSave: (request: RequestItem) => void;
  onClose: () => void;
}

export const EditRequest = ({ isOpen, request, onSave, onClose }: EditRequestProps) => {
  const [editData, setEditData] = useState<RequestItem | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && request) {
      setEditData({ ...request });
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, request]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        if (editData) onSave(editData);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, editData, onSave, onClose]);

  if (!isOpen || !editData) return null;

  const handleFieldChange = (field: keyof RequestItem, value: string) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value, updatedAt: Date.now() } : null));
  };

  const handleSave = () => {
    if (editData && editData.name.trim()) {
      onSave(editData);
    }
  };

  return (
    <div className="edit-request-overlay" onClick={onClose}>
      <div className="edit-request-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="edit-request-header">
          <div className="edit-request-title">
            <Pencil size={16} />
            <span>Edit Request</span>
          </div>
          <button className="edit-request-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="edit-request-body">
          {/* Name */}
          <div className="edit-field">
            <label className="edit-field-label" htmlFor="edit-name">
              Request Name
            </label>
            <div className="edit-field-input-wrapper">
              <FileText size={14} className="edit-field-icon" />
              <input
                id="edit-name"
                ref={nameInputRef}
                type="text"
                className="edit-field-input"
                value={editData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Enter request name..."
              />
            </div>
          </div>

          {/* Method & URL */}
          <div className="edit-field-row">
            <div className="edit-field edit-field--half">
              <label className="edit-field-label" htmlFor="edit-method">
                Method
              </label>
              <select
                id="edit-method"
                className="edit-field-select"
                value={editData.method}
                onChange={(e) => handleFieldChange("method", e.target.value as HttpMethod)}
                data-method={editData.method}
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="edit-field">
            <label className="edit-field-label" htmlFor="edit-url">
              URL
            </label>
            <div className="edit-field-input-wrapper">
              <Folder size={14} className="edit-field-icon" />
              <input
                id="edit-url"
                type="text"
                className="edit-field-input"
                value={editData.url}
                onChange={(e) => handleFieldChange("url", e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
          </div>

          {/* Description */}
          <div className="edit-field">
            <label className="edit-field-label" htmlFor="edit-description">
              Description
            </label>
            <textarea
              id="edit-description"
              className="edit-field-textarea"
              value={editData.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Optional description..."
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="edit-request-footer">
          <button className="edit-request-btn edit-request-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="edit-request-btn edit-request-btn--save"
            onClick={handleSave}
            disabled={!editData.name.trim()}
          >
            <Save size={14} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
