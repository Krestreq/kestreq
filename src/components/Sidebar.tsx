import { useEffect, useRef, useState } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ChevronDown,
  Check,
} from "lucide-react";
import "./Sidebar.css";

const NAV_ITEMS: { id: ScreenName; label: string; icon: any }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "workspace", label: "Workspace", icon: Send },
  { id: "collections", label: "Workspaces", icon: FolderOpen },
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
    startNewRequest,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    setActiveCollectionId,
  } = useAppStore();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
      {/* Sidebar header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img src="/kestreq_logo.svg" alt="Kestreq" className="brand-logo" />
          <span className="brand-text">Kestreq</span>
        </div>
        <button
          className="icon-btn sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
        </button>
      </div>

      <div className="workspace-switcher" ref={workspaceMenuRef}>
        <button
          className="workspace-switcher-trigger"
          onClick={() => setWorkspaceMenuOpen((open) => !open)}
          aria-expanded={workspaceMenuOpen}
          aria-label={`Current workspace: ${activeWorkspace?.name || "Select workspace"}`}
          data-tooltip={!sidebarOpen ? activeWorkspace?.name || "Select workspace" : undefined}
        >
          <FolderOpen size={15} />
          <span className="workspace-switcher-label">
            <span className="workspace-switcher-caption">Workspace</span>
            <span className="workspace-switcher-name">{activeWorkspace?.name || "Select workspace"}</span>
          </span>
          <ChevronDown size={13} className="workspace-switcher-chevron" />
        </button>
        {workspaceMenuOpen && (
          <div className="workspace-switcher-menu" role="menu">
            <div className="workspace-switcher-menu-title">Switch workspace</div>
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={`workspace-switcher-option ${workspace.id === activeWorkspaceId ? "active" : ""}`}
                onClick={() => {
                  setActiveWorkspaceId(workspace.id);
                  setActiveCollectionId(null);
                  setWorkspaceMenuOpen(false);
                }}
                role="menuitemradio"
                aria-checked={workspace.id === activeWorkspaceId}
              >
                <span>{workspace.name}</span>
                {workspace.id === activeWorkspaceId && <Check size={14} />}
              </button>
            ))}
            <div className="workspace-switcher-divider" />
            <button
              className="workspace-switcher-manage"
              onClick={() => {
                setCurrentScreen("collections");
                setWorkspaceMenuOpen(false);
              }}
            >
              <Plus size={14} /> Manage workspaces
            </button>
          </div>
        )}
      </div>

      <button
        className="sidebar-new-request-trigger"
        onClick={startNewRequest}
        aria-label="Create a new request"
        data-tooltip={!sidebarOpen ? "New Request" : undefined}
      >
        <Plus size={16} />
        <span>New Request</span>
      </button>

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
