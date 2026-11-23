import { useAppStore } from "@/store/appStore";
import { createBlankCollection } from "@/utils/constants";
import { formatDateTime } from "@/utils/helpers";
import {
  Zap,
  FolderPlus,
  Clock,
  Download,
  Plus,
  ArrowRight,
  TrendingUp,
  FolderOpen,
  Globe,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import "./Home.css";

const QUICK_ACTIONS = [
  { icon: Plus, label: "New Request", screen: "workspace" as const, color: "var(--method-get)" },
  { icon: FolderPlus, label: "New Collection", screen: "collections" as const, color: "var(--accent)" },
  { icon: Download, label: "Import cURL", screen: "import" as const, color: "var(--info)" },
  { icon: Globe, label: "New Environment", screen: "environments" as const, color: "var(--success)" },
  { icon: Clock, label: "View History", screen: "history" as const, color: "var(--warning)" },
  { icon: Settings, label: "Settings", screen: "settings" as const, color: "var(--text-secondary)" },
];

export const Home = () => {
  const {
    collections,
    history,
    environments,
    automatedTests,
    addCollection,
    setCurrentScreen,
  } = useAppStore();

  const recentHistory = history.slice(0, 5);
  const recentCollections = collections.slice(-3).reverse();

  const stats = {
    requests: history.length,
    collections: collections.length,
    environments: environments.length,
    tests: automatedTests.length,
  };

  const handleNewRequest = () => {
    setCurrentScreen("workspace");
  };

  const handleNewCollection = () => {
    const newCollection = createBlankCollection();
    addCollection(newCollection);
    setCurrentScreen("collections");
  };

  return (
    <div className="home-page">
      {/* Welcome Section */}
      <section className="home-welcome">
        <div className="welcome-content">
          <div className="welcome-header">
            <Sparkles size={24} className="welcome-sparkle" />
            <h1 className="welcome-title">Welcome to KrestReq</h1>
          </div>
          <p className="welcome-subtitle">
            Your premium offline-first API development environment.
            <br />
            Build, test, and document your APIs with elegance.
          </p>
          <div className="welcome-actions">
            <button className="btn btn-primary" onClick={handleNewRequest}>
              <Plus size={16} />
              <span>New Request</span>
            </button>
            <button className="btn btn-secondary" onClick={handleNewCollection}>
              <FolderPlus size={16} />
              <span>New Collection</span>
            </button>
            <button className="btn btn-ghost" onClick={() => setCurrentScreen("import")}>
              <Download size={16} />
              <span>Import Collection</span>
            </button>
          </div>
        </div>
        <div className="welcome-illustration">
          <div className="illustration-grid">
            {["GET", "POST", "PUT", "DELETE"].map((method, i) => (
              <div
                key={method}
                className="illustration-method"
                data-method={method}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {method}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="home-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="quick-action-card"
                onClick={() => setCurrentScreen(action.screen)}
              >
                <div className="quick-action-icon" style={{ color: action.color }}>
                  <Icon size={20} />
                </div>
                <span className="quick-action-label">{action.label}</span>
                <ChevronRight size={14} className="quick-action-arrow" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Stats Overview */}
      <section className="home-section">
        <h2 className="section-title">Workspace Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ color: "var(--method-get)" }}>
              <Zap size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.requests}</span>
              <span className="stat-label">Requests Sent</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: "var(--accent)" }}>
              <FolderOpen size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.collections}</span>
              <span className="stat-label">Collections</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: "var(--success)" }}>
              <Globe size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.environments}</span>
              <span className="stat-label">Environments</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: "var(--warning)" }}>
              <TrendingUp size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.tests}</span>
              <span className="stat-label">Automated Tests</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
          {history.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentScreen("history")}
            >
              View All
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        {recentHistory.length === 0 ? (
          <div className="home-empty-state">
            <Clock size={40} className="home-empty-icon" />
            <h3 className="home-empty-title">No recent activity</h3>
            <p className="home-empty-description">
              Send your first API request to see it here.
            </p>
            <button className="btn btn-primary" onClick={handleNewRequest}>
              <Plus size={14} />
              <span>Create your first request</span>
            </button>
          </div>
        ) : (
          <div className="recent-list">
            {recentHistory.map((entry) => (
              <div
                key={entry.id}
                className="recent-item"
                onClick={() => setCurrentScreen("workspace")}
              >
                <span
                  className="recent-method"
                  data-method={entry.request.method}
                >
                  {entry.request.method}
                </span>
                <div className="recent-info">
                  <span className="recent-name">{entry.request.name || entry.request.url}</span>
                  <span className="recent-time">{formatDateTime(entry.timestamp)}</span>
                </div>
                {entry.response && (
                  <span
                    className={`recent-status status-${
                      entry.response.status >= 200 && entry.response.status < 300
                        ? "success"
                        : entry.response.status >= 400 && entry.response.status < 500
                        ? "warning"
                        : "error"
                    }`}
                  >
                    {entry.response.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Collections */}
      {recentCollections.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">Recent Collections</h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentScreen("collections")}
            >
              View All
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="recent-collections-grid">
            {recentCollections.map((collection) => (
              <div
                key={collection.id}
                className="collection-card"
                onClick={() => setCurrentScreen("collections")}
              >
                <div className="collection-card-icon">
                  <FolderOpen size={20} />
                </div>
                <div className="collection-card-info">
                  <span className="collection-card-name">{collection.name}</span>
                  <span className="collection-card-count">
                    {collection.standaloneRequests.length + collection.folders.length} items
                  </span>
                </div>
                <ChevronRight size={14} className="collection-card-arrow" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Getting Started */}
      <section className="home-section home-getting-started">
        <h2 className="section-title">Getting Started</h2>
        <div className="getting-started-grid">
          <div className="getting-started-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Create a Request</h4>
              <p>Click "New Request" to start building your first API call.</p>
            </div>
          </div>
          <div className="getting-started-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Organize Collections</h4>
              <p>Group related requests into collections for easy management.</p>
            </div>
          </div>
          <div className="getting-started-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Set Environments</h4>
              <p>Configure environments for dev, staging, and production.</p>
            </div>
          </div>
          <div className="getting-started-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Automate Tests</h4>
              <p>Write automated tests to ensure your APIs work correctly.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
