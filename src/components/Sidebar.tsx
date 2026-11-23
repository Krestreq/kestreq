import { useAppStore } from "@/store/appStore";
import type { ScreenName } from "@/types";
import {
  Home,
  Send,
  FolderOpen,
  Clock,
  Globe,
  TestTube2,
  Download,
  Settings,
  Command,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import "./Sidebar.css";

const NAV_ITEMS: { id: ScreenName; label: string; icon: any }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "workspace", label: "Workspace", icon: Send },
  { id: "collections", label: "Collections", icon: FolderOpen },
  { id: "history", label: "History", icon: Clock },
  { id: "environments", label: "Environments", icon: Globe },
  { id: "tests", label: "Tests", icon: TestTube2 },
  { id: "import", label: "Import / Export", icon: Download },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Sidebar = () => {
  const {
    currentScreen,
    setCurrentScreen,
    sidebarOpen,
    toggleSidebar,
    toggleCommandPalette,
  } = useAppStore();

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
      {/* Sidebar header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <Search size={18} className="brand-icon" />
          <span className="brand-text">KrestReq</span>
        </div>
        <button
          className="icon-btn sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
        </button>
      </div>

      {/* Command Palette shortcut */}
      <button
        className="command-palette-trigger"
        onClick={toggleCommandPalette}
        data-tooltip="Command Palette (Ctrl+K)"
      >
        <Command size={14} />
        <span>Quick Search</span>
        <kbd>⌘K</kbd>
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => setCurrentScreen(item.id)}
              data-tooltip={!sidebarOpen ? item.label : undefined}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {isActive && <span className="nav-indicator" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
