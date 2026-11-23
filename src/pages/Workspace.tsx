import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { RequestPanel } from "@/components/RequestPanel";
import { ResponsePanel } from "@/components/ResponsePanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { WifiOff } from "lucide-react";
import "@/styles/global.css";

export const Workspace = () => {
  const { loadCollections, loadHistory, loadEnvironments, loadSettings, isSending } = useAppStore();

  useEffect(() => {
    // Load persisted data on mount
    loadCollections();
    loadHistory();
    loadEnvironments();
    loadSettings();
  }, [loadCollections, loadHistory, loadEnvironments, loadSettings]);

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <div className="main-content">
          <div className="split-panels">
            <RequestPanel />
            <ResponsePanel />
          </div>

          {/* Status Bar */}
          <div className="status-bar">
            <div className="status-bar-left">
              <div className="status-bar-item">
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
            </div>
            <div className="status-bar-right">
              <div className="status-bar-item">
                <span>KrestReq v0.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel />
    </div>
  );
};
