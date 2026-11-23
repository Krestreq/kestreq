import { useState } from "react";
import {
  Download,
  Upload,
  FileText,
  Code2,
  FolderOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import "./shared.css";
import "./Import.css";

const IMPORT_FORMATS = [
  { id: "curl", label: "cURL Command", icon: Code2, description: "Paste a cURL command to import" },
  { id: "postman", label: "Postman Collection", icon: FolderOpen, description: "Import a Postman collection JSON file" },
  { id: "openapi", label: "OpenAPI Spec", icon: FileText, description: "Import an OpenAPI/Swagger specification" },
];

export const Import = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [curlInput, setCurlInput] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImport = () => {
    // Placeholder — actual import logic would parse the input
    if (selectedFormat === "curl" && curlInput.trim()) {
      setImportStatus("success");
      setStatusMessage("cURL command imported successfully!");
    } else {
      setImportStatus("error");
      setStatusMessage("Please provide valid input for the selected format.");
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // Placeholder — actual file parsing would go here
    setImportStatus("success");
    setStatusMessage("File imported successfully!");
  };

  return (
    <div className="import-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Import / Export</h1>
        </div>
      </div>

      <div className="import-content">
        {/* Import Section */}
        <section className="import-section">
          <h2 className="import-section-title">Import</h2>

          {/* Format Selection */}
          <div className="import-formats">
            {IMPORT_FORMATS.map((format) => {
              const Icon = format.icon;
              return (
                <button
                  key={format.id}
                  className={`import-format-card ${selectedFormat === format.id ? "selected" : ""}`}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <Icon size={24} className="import-format-icon" />
                  <span className="import-format-label">{format.label}</span>
                  <span className="import-format-description">
                    {format.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* cURL Input */}
          {selectedFormat === "curl" && (
            <div className="import-input-section">
              <label className="import-input-label">Paste cURL Command</label>
              <textarea
                className="import-textarea"
                placeholder="curl -X GET https://api.example.com/..."
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                rows={4}
              />
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={!curlInput.trim()}
              >
                <Download size={14} />
                <span>Import cURL</span>
              </button>
            </div>
          )}

          {/* File Upload */}
          {(selectedFormat === "postman" || selectedFormat === "openapi") && (
            <div
              className={`drop-zone ${isDragOver ? "drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={() => {
                  setImportStatus("success");
                  setStatusMessage("File selected!");
                }}
              />
              <Upload size={40} className="drop-zone-icon" />
              <h3 className="drop-zone-title">Drop your file here</h3>
              <p className="drop-zone-description">
                or click to browse for a {selectedFormat === "postman" ? "Postman" : "OpenAPI"} JSON file
              </p>
            </div>
          )}

          {/* Status Message */}
          {importStatus !== "idle" && (
            <div
              className={`import-status ${importStatus === "success" ? "success" : "error"}`}
            >
              {importStatus === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <XCircle size={16} />
              )}
              <span>{statusMessage}</span>
            </div>
          )}
        </section>

        {/* Export Section */}
        <section className="import-section">
          <h2 className="import-section-title">Export</h2>
          <div className="export-options">
            <button className="export-option-card">
              <FileText size={20} />
              <div className="export-option-info">
                <span className="export-option-label">KrestReq Format</span>
                <span className="export-option-description">
                  Export all collections in KrestReq native format
                </span>
              </div>
              <Download size={16} className="export-option-icon" />
            </button>
            <button className="export-option-card">
              <FolderOpen size={20} />
              <div className="export-option-info">
                <span className="export-option-label">Postman Format</span>
                <span className="export-option-description">
                  Export collections compatible with Postman
                </span>
              </div>
              <Download size={16} className="export-option-icon" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
