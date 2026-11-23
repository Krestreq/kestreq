import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { getMethodColorVar } from "@/utils/helpers";
import type { HttpMethod } from "@/types";
import {
  Send,
  Loader2,
  Globe,
  ChevronDown,
  Command,
  Settings,
  Save,
  FolderPlus,
} from "lucide-react";
import "./Header.css";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export const Header = () => {
  const {
    currentRequest,
    setCurrentRequest,
    sendRequest,
    isSending,
    currentScreen,
    setCurrentScreen,
    toggleCommandPalette,
    settings,
    saveRequest,
    savedCollectionId,
    setSaveAsModalOpen,
  } = useAppStore();

  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);

  const handleMethodChange = (method: HttpMethod) => {
    setCurrentRequest({ ...currentRequest, method, updatedAt: Date.now() });
    setMethodDropdownOpen(false);
  };

  const handleUrlChange = (url: string) => {
    setCurrentRequest({ ...currentRequest, url, updatedAt: Date.now() });
  };

  const handleNameChange = (name: string) => {
    setCurrentRequest({ ...currentRequest, name, updatedAt: Date.now() });
  };

  const handleSend = () => {
    if (currentRequest.url.trim()) {
      sendRequest();
    }
  };

  const handleSave = () => {
    if (savedCollectionId) {
      // Already saved to a collection — update in place
      saveRequest(savedCollectionId);
    } else {
      // No collection selected — open Save As modal
      setSaveAsModalOpen(true);
    }
  };

  const methodColor = getMethodColorVar(currentRequest.method);
  const isWorkspace = currentScreen === "workspace";

  return (
    <header className="header">
      {/* macOS-style traffic lights */}
      {settings.macOSControls && (
        <div className="traffic-lights">
          <span className="traffic-light traffic-light-close" />
          <span className="traffic-light traffic-light-minimize" />
          <span className="traffic-light traffic-light-maximize" />
        </div>
      )}

      {isWorkspace ? (
        <>
          {/* Request bar for workspace */}
          <div className="request-bar">
            {/* Request name */}
            <input
              type="text"
              className="request-name"
              placeholder="Request name"
              value={currentRequest.name}
              onChange={(e) => handleNameChange(e.target.value)}
              aria-label="Request name"
            />

            {/* Method dropdown */}
            <div className="method-dropdown-wrapper">
              <button
                className="method-dropdown"
                onClick={() => setMethodDropdownOpen(!methodDropdownOpen)}
                style={{ color: methodColor }}
                aria-label="HTTP method"
                aria-expanded={methodDropdownOpen}
              >
                <span className="method-text">{currentRequest.method}</span>
                <ChevronDown size={12} className="method-chevron" />
              </button>
              {methodDropdownOpen && (
                <div className="method-dropdown-menu" role="listbox">
                  {METHODS.map((method) => (
                    <button
                      key={method}
                      className={`method-dropdown-item ${currentRequest.method === method ? "active" : ""}`}
                      data-method={method}
                      onClick={() => handleMethodChange(method)}
                      role="option"
                      aria-selected={currentRequest.method === method}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* URL input */}
            <div className="url-input-wrapper">
              <Globe size={14} className="url-icon" />
              <input
                type="text"
                className="url-input"
                placeholder="Enter request URL"
                value={currentRequest.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                aria-label="Request URL"
              />
            </div>

            {/* Send button */}
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={isSending || !currentRequest.url.trim()}
              aria-label={isSending ? "Sending request" : "Send request"}
            >
              {isSending ? (
                <Loader2 size={16} className="send-icon spin" />
              ) : (
                <Send size={16} className="send-icon" />
              )}
              <span className="send-text">{isSending ? "Sending" : "Send"}</span>
            </button>

            {/* Save button */}
            <button
              className="icon-btn save-btn-icon"
              onClick={handleSave}
              data-tooltip={savedCollectionId ? "Saved" : "Save to collection"}
              aria-label={savedCollectionId ? "Saved to collection" : "Save to collection"}
            >
              {savedCollectionId ? (
                <Save size={16} className="saved-icon" />
              ) : (
                <FolderPlus size={16} />
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="header-spacer" />
      )}

      {/* Right side actions */}
      <div className="header-actions">
        <button
          className="icon-btn"
          onClick={toggleCommandPalette}
          data-tooltip="Command Palette"
          aria-label="Command Palette"
        >
          <Command size={16} />
        </button>
        <button
          className="icon-btn"
          onClick={() => setCurrentScreen("settings")}
          data-tooltip="Settings"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>

    </header>
  );
};
