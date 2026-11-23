import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { RequestPanel } from "@/components/RequestPanel";
import { ResponsePanel } from "@/components/ResponsePanel";
import { CommandPalette } from "@/components/CommandPalette";
import { SaveAsModal } from "@/components/SaveAsModal";
import { NewRequestModal } from "@/components/NewRequestModal";
import { Home } from "@/pages/Home";
import { Collections } from "@/pages/Collections";
import { History } from "@/pages/History";
import { Environments } from "@/pages/Environments";
import { Tests } from "@/pages/Tests";
import { Import } from "@/pages/Import";
import { Settings } from "@/pages/Settings";
import { WifiOff } from "lucide-react";
import "@/styles/global.css";

export const Workspace = () => {
  const {
    loadCollections,
    loadHistory,
    loadEnvironments,
    loadSettings,
    loadAutomatedTests,
    isSending,
    currentScreen,
    currentRequest,
    saveRequest,
    savedCollectionId,
    savedRequestId,
    saveAsModalOpen,
    setSaveAsModalOpen,
  } = useAppStore();

  useEffect(() => {
    loadCollections();
    loadHistory();
    loadEnvironments();
    loadSettings();
    loadAutomatedTests();
  }, [loadCollections, loadHistory, loadEnvironments, loadSettings, loadAutomatedTests]);

  // Keyboard shortcuts: Ctrl+S to save, Ctrl+Shift+S to save as
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only in workspace screen
      if (currentScreen !== "workspace") return;

      // Ctrl+S / Cmd+S: Save request
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && !e.shiftKey) {
        e.preventDefault();
        if (savedCollectionId) {
          saveRequest(savedCollectionId);
        } else {
          setSaveAsModalOpen(true);
        }
      }

      // Ctrl+Shift+S / Cmd+Shift+S: Save As
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && e.shiftKey) {
        e.preventDefault();
        setSaveAsModalOpen(true);
      }

      // Ctrl+Enter / Cmd+Enter: Send request
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        const { sendRequest } = useAppStore.getState();
        if (currentRequest.url.trim()) {
          sendRequest();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentScreen, savedCollectionId, saveRequest, currentRequest.url, setSaveAsModalOpen]);

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home />;
      case "workspace":
        return (
          <div className="workspace-screen">
            <div className="split-panels">
              <RequestPanel />
              <ResponsePanel />
            </div>
          </div>
        );
      case "collections":
        return <Collections />;
      case "history":
        return <History />;
      case "environments":
        return <Environments />;
      case "tests":
        return <Tests />;
      case "import":
        return <Import />;
      case "settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <div className="main-content">
          {renderScreen()}

          {/* Status Bar */}
          <div className="status-bar">
            <div className="status-bar-left">
              <div className={`status-bar-item ${isSending ? "sending" : ""}`}>
                {isSending ? (
                  <>
                    <WifiOff size={10} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span className="status-dot" />
                    <span>Ready</span>
                  </>
                )}
              </div>
              {savedCollectionId && savedRequestId && (
                <div className="status-bar-item saved">
                  <span>Saved: {currentRequest.name || "Untitled"}</span>
                </div>
              )}
            </div>
            <div className="status-bar-right">
              <div className="status-bar-item">
                <span>Kestreq v0.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette />

      {/* Save As Modal */}
      {currentScreen === "workspace" && (
        <SaveAsModal
          isOpen={saveAsModalOpen}
          onClose={() => setSaveAsModalOpen(false)}
          onRequestName={currentRequest.name || "Untitled Request"}
        />
      )}

      {/* New Request Modal */}
      <NewRequestModal />
    </div>
  );
};
