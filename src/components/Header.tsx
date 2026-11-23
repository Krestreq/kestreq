import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { getMethodColorVar } from "@/utils/helpers";
import type { HttpMethod } from "@/types";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Loader2,
  Settings2,
  Globe,
  ChevronDown,
} from "lucide-react";
import "./Header.css";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export const Header = () => {
  const {
    currentRequest,
    setCurrentRequest,
    sendRequest,
    isSending,
    toggleSidebar,
    sidebarOpen,
    toggleSettings,
    settingsOpen,
    settings,
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

  const methodColor = getMethodColorVar(currentRequest.method);

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

      {/* Sidebar toggle */}
      <button
        className="icon-btn sidebar-toggle"
        onClick={toggleSidebar}
        data-tooltip={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>

      {/* Request bar */}
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
                  style={currentRequest.method === method ? { color: methodColor } : {}}
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
      </div>

      {/* Settings button */}
      <button
        className={`icon-btn settings-btn ${settingsOpen ? "active" : ""}`}
        onClick={toggleSettings}
        data-tooltip="Settings"
        aria-label="Toggle settings"
      >
        <Settings2 size={18} />
      </button>
    </header>
  );
};
