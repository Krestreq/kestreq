import { useState } from "react";
import { useAppStore, THEMES } from "@/store/appStore";
import {
  Clock,
  Database,
  Shield,
  Info,
  Check,
  Sparkles,
  Zap,
  HardDrive,
  Save,
} from "lucide-react";
import "./shared.css";
import "./Settings.css";

const DENSITY_OPTIONS = [
  { value: "compact" as const, label: "Compact", icon: "🗜️" },
  { value: "comfortable" as const, label: "Comfortable", icon: "😊" },
  { value: "spacious" as const, label: "Spacious", icon: "🌌" },
];

type SettingsSection = "appearance" | "request" | "response" | "data" | "about";

const SECTION_NAV: { key: SettingsSection; label: string; icon: any }[] = [
  { key: "appearance", label: "Appearance", icon: Shield },
  { key: "request", label: "Request Defaults", icon: Shield },
  { key: "response", label: "Response", icon: Clock },
  { key: "data", label: "Data & Storage", icon: Database },
  { key: "about", label: "About", icon: Info },
];

export const Settings = () => {
  const { settings, updateSettings, setTheme, autoSave, setAutoSave } = useAppStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance");

  const darkThemes = THEMES.filter((t) => t.category === "dark");
  const lightThemes = THEMES.filter((t) => t.category === "light");

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="settings-header-left">
          <div className="settings-header-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">Customize your Kestreq experience</p>
          </div>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <nav className="settings-nav">
          {SECTION_NAV.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                className={`settings-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveSection(section.key)}
              >
                <Icon size={16} />
                <span>{section.label}</span>
                {isActive && <Check size={12} className="settings-nav-check" />}
              </button>
            );
          })}
        </nav>

        {/* Main Content */}
        <div className="settings-main">
          {/* Appearance */}
          {activeSection === "appearance" && (
            <div className="settings-section-animate">
              {/* Theme Selection */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Theme</h3>
                    <p className="settings-card-description">
                      Choose a color scheme for your workspace
                    </p>
                  </div>
                </div>

                <div className="theme-grid">
                  <div className="theme-category">
                    <span className="theme-category-label">Dark Themes</span>
                    <div className="theme-options">
                      {darkThemes.map((theme) => (
                        <button
                          key={theme.value}
                          className={`theme-option ${settings.theme === theme.value ? "active" : ""}`}
                          onClick={() => setTheme(theme.value)}
                          aria-label={theme.label}
                          aria-pressed={settings.theme === theme.value}
                        >
                          <span className="theme-preview" data-theme={theme.value} aria-hidden="true">
                            <span className="theme-preview-toolbar">
                              <i />
                              <i />
                              <i />
                            </span>
                            <span className="theme-preview-body">
                              <span className="theme-preview-sidebar" />
                              <span className="theme-preview-lines">
                                <i />
                                <i />
                                <i />
                              </span>
                            </span>
                          </span>
                          <span className="theme-name">{theme.label}</span>
                          {settings.theme === theme.value && (
                            <span className="theme-check">
                              <Check size={10} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="theme-category">
                    <span className="theme-category-label">Light Themes</span>
                    <div className="theme-options">
                      {lightThemes.map((theme) => (
                        <button
                          key={theme.value}
                          className={`theme-option ${settings.theme === theme.value ? "active" : ""}`}
                          onClick={() => setTheme(theme.value)}
                          aria-label={theme.label}
                          aria-pressed={settings.theme === theme.value}
                        >
                          <span className="theme-preview" data-theme={theme.value} aria-hidden="true">
                            <span className="theme-preview-toolbar">
                              <i />
                              <i />
                              <i />
                            </span>
                            <span className="theme-preview-body">
                              <span className="theme-preview-sidebar" />
                              <span className="theme-preview-lines">
                                <i />
                                <i />
                                <i />
                              </span>
                            </span>
                          </span>
                          <span className="theme-name">{theme.label}</span>
                          {settings.theme === theme.value && (
                            <span className="theme-check">
                              <Check size={10} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interface Density */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Interface Density</h3>
                    <p className="settings-card-description">
                      Adjust spacing and padding across the interface
                    </p>
                  </div>
                </div>

                <div className="density-options">
                  {DENSITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`density-option ${
                        settings.density === option.value ? "active" : ""
                      }`}
                      onClick={() =>
                        updateSettings({ density: option.value })
                      }
                    >
                      <span className="density-icon">{option.icon}</span>
                      <span className="density-label">{option.label}</span>
                      {settings.density === option.value && (
                        <Check size={12} className="density-check" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Request Defaults */}
          {activeSection === "request" && (
            <div className="settings-section-animate">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Request Configuration</h3>
                    <p className="settings-card-description">
                      Default settings for all HTTP requests
                    </p>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">
                      <Clock size={14} />
                      <span>Timeout</span>
                    </div>
                    <p className="settings-row-description">
                      Default request timeout in seconds
                    </p>
                  </div>
                  <div className="settings-row-control">
                    <input
                      type="number"
                      className="settings-number-input"
                      value={settings.timeout}
                      onChange={(e) =>
                        updateSettings({ timeout: Number(e.target.value) })
                      }
                      min={1}
                      max={300}
                    />
                    <span className="settings-unit">seconds</span>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">
                      <Zap size={14} />
                      <span>Follow Redirects</span>
                    </div>
                    <p className="settings-row-description">
                      Automatically follow HTTP redirects
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.followRedirects}
                      onChange={(e) =>
                        updateSettings({ followRedirects: e.target.checked })
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">
                      <Shield size={14} />
                      <span>SSL Verification</span>
                    </div>
                    <p className="settings-row-description">
                      Verify SSL certificates on HTTPS requests
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.sslVerification}
                      onChange={(e) =>
                        updateSettings({ sslVerification: e.target.checked })
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">
                      <Save size={14} />
                      <span>Auto Save</span>
                    </div>
                    <p className="settings-row-description">
                      Automatically save requests when editing in the workspace
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={autoSave}
                      onChange={(e) =>
                        setAutoSave(e.target.checked)
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Response */}
          {activeSection === "response" && (
            <div className="settings-section-animate">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Response Display</h3>
                    <p className="settings-card-description">
                      How API responses are formatted and displayed
                    </p>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">
                      <Sparkles size={14} />
                      <span>Format JSON</span>
                    </div>
                    <p className="settings-row-description">
                      Pretty-print JSON responses with syntax highlighting
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.formatJson}
                      onChange={(e) =>
                        updateSettings({ formatJson: e.target.checked })
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">
                      <Shield size={14} />
                      <span>Wrap Response</span>
                    </div>
                    <p className="settings-row-description">
                      Wrap long lines in the response body viewer
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.wrapResponse}
                      onChange={(e) =>
                        updateSettings({ wrapResponse: e.target.checked })
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Data & Storage */}
          {activeSection === "data" && (
            <div className="settings-section-animate">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <HardDrive size={16} />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Data & Storage</h3>
                    <p className="settings-card-description">
                      Manage your local data and storage preferences
                    </p>
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">
                      <Database size={14} />
                      <span>Max History Entries</span>
                    </div>
                    <p className="settings-row-description">
                      Maximum number of request history entries to retain
                    </p>
                  </div>
                  <div className="settings-row-control">
                    <input
                      type="number"
                      className="settings-number-input"
                      value={settings.maxHistoryEntries}
                      onChange={(e) =>
                        updateSettings({
                          maxHistoryEntries: Number(e.target.value),
                        })
                      }
                      min={10}
                      max={1000}
                    />
                    <span className="settings-unit">entries</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About */}
          {activeSection === "about" && (
            <div className="settings-section-animate">
              <div className="settings-card about-card">
                <div className="about-logo">
                  <img src="/kestreq_logo.svg" alt="Kestreq" className="about-logo-img" />
                </div>
                <h2 className="about-title">Kestreq</h2>
                <p className="about-version">Version 0.1.0</p>
                <p className="about-description">
                  Offline-first API development and testing environment.
                  Built with Tauri 2, React, and TypeScript.
                </p>
                <div className="about-footer">
                  <span>Crafted with care for developers</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
