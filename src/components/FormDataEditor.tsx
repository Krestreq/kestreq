import { useRef } from "react";
import type { FormDataEntry } from "@/types";
import { Plus, Trash2, FileText, Upload, X } from "lucide-react";
import "./FormDataEditor.css";

function createBlankEntry(): FormDataEntry {
  return { key: "", value: "", fileType: "text", enabled: true };
}

interface FormDataEditorProps {
  entries: FormDataEntry[];
  onChange: (entries: FormDataEntry[]) => void;
}

export const FormDataEditor: React.FC<FormDataEditorProps> = ({ entries, onChange }) => {
  const fileInputRef = useRef<Map<number, HTMLInputElement>>(new Map());

  const addEntry = () => {
    onChange([...entries, createBlankEntry()]);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof FormDataEntry, value: string | boolean) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = [...entries];
      updated[index] = {
        ...updated[index],
        fileType: "file",
        fileName: file.name,
        value: file.name,
      };
      onChange(updated);
    }
  };

  const clearFile = (index: number) => {
    const updated = [...entries];
    updated[index] = {
      ...updated[index],
      fileType: "text",
      fileName: undefined,
      value: "",
    };
    onChange(updated);
    // Reset file input
    const input = fileInputRef.current.get(index);
    if (input) input.value = "";
  };

  return (
    <div className="formdata-editor">
      {entries.length === 0 && (
        <div className="formdata-empty">
          <FileText size={32} className="formdata-empty-icon" />
          <p className="formdata-empty-title">No form data</p>
          <p className="formdata-empty-description">
            Add form fields or files to send with your request.
          </p>
        </div>
      )}

      <div className="formdata-header">
        <span className="formdata-col-key">Key</span>
        <span className="formdata-col-value">Value</span>
        <span className="formdata-col-type">Type</span>
        <span className="formdata-col-actions" />
      </div>

      <div className="formdata-rows">
        {entries.map((entry, index) => (
          <div key={index} className={`formdata-row ${!entry.enabled ? "disabled" : ""}`}>
            {/* Key input */}
            <input
              type="text"
              className="formdata-input formdata-input-key"
              placeholder="Key"
              value={entry.key}
              onChange={(e) => updateEntry(index, "key", e.target.value)}
              aria-label={`Form data key ${index + 1}`}
            />

            {/* Value input or file upload */}
            <div className="formdata-value-wrapper">
              {entry.fileType === "file" ? (
                <div className="formdata-file-display">
                  <Upload size={14} className="formdata-file-icon" />
                  <span className="formdata-file-name">{entry.fileName}</span>
                  <button
                    className="formdata-file-remove"
                    onClick={() => clearFile(index)}
                    aria-label="Remove file"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  className="formdata-input formdata-input-value"
                  placeholder="Value"
                  value={entry.value}
                  onChange={(e) => updateEntry(index, "value", e.target.value)}
                  aria-label={`Form data value ${index + 1}`}
                />
              )}
            </div>

            {/* Type selector */}
            <div className="formdata-type-selector">
              <button
                className={`formdata-type-btn ${entry.fileType === "text" ? "active" : ""}`}
                onClick={() => updateEntry(index, "fileType", "text")}
                data-tooltip="Text"
                aria-label="Text type"
              >
                <FileText size={13} />
              </button>
              <label
                className={`formdata-type-btn ${entry.fileType === "file" ? "active" : ""}`}
                data-tooltip="File"
              >
                <input
                  type="file"
                  className="formdata-file-hidden"
                  ref={(el) => {
                    if (el) fileInputRef.current.set(index, el);
                  }}
                  onChange={(e) => handleFileChange(index, e)}
                />
                <Upload size={13} />
              </label>
            </div>

            {/* Actions */}
            <div className="formdata-actions">
              <label className="toggle-switch" data-tooltip={entry.enabled ? "Disable" : "Enable"}>
                <input
                  type="checkbox"
                  checked={entry.enabled}
                  onChange={(e) => updateEntry(index, "enabled", e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
              <button
                className="formdata-remove-btn"
                onClick={() => removeEntry(index)}
                data-tooltip="Remove"
                aria-label={`Remove form data ${index + 1}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="add-row-btn" onClick={addEntry}>
        <Plus size={14} />
        <span>Add Field</span>
      </button>
    </div>
  );
};
