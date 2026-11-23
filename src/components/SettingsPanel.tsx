import { useAppStore, THEMES } from "@/store/appStore";
import type { ThemeName } from "@/types";
import {
  X,
  Palette,
  Monitor,
  Droplets,
  MonitorCog,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import "./SettingsPanel.css";

const DENSITY_OPTIONS = [
  { value: "compact" as const, label: "Compact" },
  { value: "comfortable" as const, label: "Comfortable" },
  { value: "spacious" as const, label: "Spacious" },
];

export const SettingsPanel = () => {
  const { settings, updateSettings, setTheme, toggleSettings, settingsOpen } = useAppStore();

  if (!settingsOpen) return null;

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
  };

  const darkThemes = THEMES.filter((t) => t.category === "dark");
  const lightThemes = THEMES.filter((t) => t.category === "light");

  return (
    <div className="settings-overlay" onClick={toggleSettings}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <div className="settings-title">
            <MonitorCog size={18} />
            <span>Settings</span>
          </div>
          <button
            className="settings-close-btn"
            onClick={toggleSettings}
            data-tooltip="Close settings"
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        <div className="settings-body">
          {/* Appearance Section */}
          <section className="settings-section">
            <div className="settings-section-header">
              <Palette size={14} />
              <h3>Appearance</h3>
            </div>

            {/* Theme Selection */}
            <div className="settings-group">
              <label className="settings-label">Theme</label>
              <div className="theme-grid">
                {/* Dark themes */}
                <div className="theme-category">
                  <span className="theme-category-label">Dark</span>
                  <div className="theme-options">
                    {darkThemes.map((theme) => (
                      <button
                        key={theme.value}
                        className={`theme-option ${settings.theme === theme.value ? "active" : ""}`}
                        onClick={() => handleThemeChange(theme.value)}
                        data-tooltip={theme.label}
                      >
                        <span
                          className="theme-preview"
                          data-theme={theme.value}
                        />
                        <span className="theme-name">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Light themes */}
                <div className="theme-category">
                  <span className="theme-category-label">Light</span>
                  <div className="theme-options">
                    {lightThemes.map((theme) => (
                      <button
                        key={theme.value}
                        className={`theme-option ${settings.theme === theme.value ? "active" : ""}`}
                        onClick={() => handleThemeChange(theme.value)}
                        data-tooltip={theme.label}
                      >
                        <span
                          className="theme-preview"
                          data-theme={theme.value}
                        />
                        <span className="theme-name">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Liquid Glass */}
            <div className="settings-group">
              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-title">
                    <Droplets size={14} />
                    <span>Liquid Glass</span>
                  </div>
                  <p className="settings-row-description">
                    Translucent surfaces with frosted-glass panels
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.liquidGlass}
                    onChange={(e) =>
                      updateSettings({ liquidGlass: e.target.checked })
                    }
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>

            {/* macOS Controls */}
            <div className="settings-group">
              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-title">
                    <Monitor size={14} />
                    <span>macOS Window Controls</span>
                  </div>
                  <p className="settings-row-description">
                    Show traffic-light window controls in the title bar
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.macOSControls}
                    onChange={(e) =>
                      updateSettings({ macOSControls: e.target.checked })
                    }
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </section>

          {/* Layout Section */}
          <section className="settings-section">
            <div className="settings-section-header">
              <LayoutGrid size={14} />
              <h3>Layout</h3>
            </div>

            {/* Density */}
            <div className="settings-group">
              <label className="settings-label">Interface Density</label>
              <div className="density-options">
                {DENSITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`density-option ${settings.density === option.value ? "active" : ""}`}
                    onClick={() => updateSettings({ density: option.value })}
                  >
                    <Sparkles size={14} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
