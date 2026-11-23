import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import {
  Search,
  X,
  Home,
  Send,
  FolderOpen,
  Clock,
  Globe,
  TestTube2,
  Download,
  Settings,
  ChevronRight,
  Save,
} from "lucide-react";
import "./CommandPalette.css";

const COMMANDS = [
  { id: "home", label: "Go to Home", icon: Home, category: "Navigate" },
  { id: "workspace", label: "Go to Workspace", icon: Send, category: "Navigate" },
  { id: "collections", label: "Go to Collections", icon: FolderOpen, category: "Navigate" },
  { id: "history", label: "Go to History", icon: Clock, category: "Navigate" },
  { id: "environments", label: "Go to Environments", icon: Globe, category: "Navigate" },
  { id: "tests", label: "Go to Tests", icon: TestTube2, category: "Navigate" },
  { id: "import", label: "Go to Import/Export", icon: Download, category: "Navigate" },
  { id: "settings", label: "Go to Settings", icon: Settings, category: "Navigate" },
  { id: "save", label: "Save Request", icon: Save, category: "Actions" },
];

export const CommandPalette = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setCurrentScreen,
    saveRequest,
    savedCollectionId,
    setSaveAsModalOpen,
  } = useAppStore();
  const [query, setQuery] = useState("");

  const filteredCommands = useMemo(() => {
    if (!query) return COMMANDS;
    return COMMANDS.filter((cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, typeof COMMANDS> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const handleSelect = (id: string) => {
    if (id === "save") {
      // Save request action
      if (savedCollectionId) {
        saveRequest(savedCollectionId);
      } else {
        setSaveAsModalOpen(true);
      }
      setCommandPaletteOpen(false);
      setQuery("");
      return;
    }
    setCurrentScreen(id as any);
    setCommandPaletteOpen(false);
    setQuery("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={() => { setCommandPaletteOpen(false); setQuery(""); }}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div className="command-palette-search">
          <Search size={16} className="command-search-icon" />
          <input
            type="text"
            className="command-search-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            className="command-close-btn"
            onClick={() => { setCommandPaletteOpen(false); setQuery(""); }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="command-palette-results">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="command-empty">No results found</div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className="command-group">
                <div className="command-group-label">{category}</div>
                {commands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      className="command-item"
                      onClick={() => handleSelect(cmd.id)}
                    >
                      <Icon size={16} className="command-item-icon" />
                      <span className="command-item-label">{cmd.label}</span>
                      <ChevronRight size={14} className="command-item-arrow" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="command-palette-footer">
          <span className="command-hint">
            <kbd>⌘K</kbd> to toggle
          </span>
          <span className="command-hint">
            <kbd>Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
