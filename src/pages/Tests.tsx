import { useAppStore } from "@/store/appStore";
import { createBlankTest } from "@/utils/constants";
import { formatDateTime } from "@/utils/helpers";
import {
  TestTube2,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import "./shared.css";
import "./Tests.css";

export const Tests = () => {
  const {
    automatedTests,
    addAutomatedTest,
    deleteAutomatedTest,
  } = useAppStore();

  const handleAddTest = () => {
    const newTest = createBlankTest();
    addAutomatedTest(newTest);
  };

  const handleDeleteTest = (id: string) => {
    if (confirm("Are you sure you want to delete this test?")) {
      deleteAutomatedTest(id);
    }
  };

  const passedCount = automatedTests.filter(
    (t) => t.lastResult === "pass"
  ).length;
  const failedCount = automatedTests.filter(
    (t) => t.lastResult === "fail"
  ).length;
  const pendingCount = automatedTests.filter(
    (t) => t.lastResult === "pending" || !t.lastResult
  ).length;

  return (
    <div className="tests-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Automated Tests</h1>
          <span className="page-count">{automatedTests.length} tests</span>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={handleAddTest}>
            <Plus size={14} />
            <span>New Test</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      {automatedTests.length > 0 && (
        <div className="test-stats">
          <div className="test-stat">
            <CheckCircle2 size={16} className="test-stat-icon pass" />
            <span className="test-stat-value">{passedCount}</span>
            <span className="test-stat-label">Passed</span>
          </div>
          <div className="test-stat">
            <XCircle size={16} className="test-stat-icon fail" />
            <span className="test-stat-value">{failedCount}</span>
            <span className="test-stat-label">Failed</span>
          </div>
          <div className="test-stat">
            <Clock size={16} className="test-stat-icon pending" />
            <span className="test-stat-value">{pendingCount}</span>
            <span className="test-stat-label">Pending</span>
          </div>
        </div>
      )}

      {/* Tests List */}
      {automatedTests.length === 0 ? (
        <div className="page-empty-state">
          <TestTube2 size={48} className="page-empty-icon" />
          <h3 className="page-empty-title">No automated tests</h3>
          <p className="page-empty-description">
            Create automated tests to ensure your APIs work correctly.
          </p>
          <button className="btn btn-primary" onClick={handleAddTest}>
            <Plus size={14} />
            <span>Create Test</span>
          </button>
        </div>
      ) : (
        <div className="tests-list">
          {automatedTests.map((test) => (
            <div key={test.id} className="test-card">
              <div className="test-card-header">
                <div className="test-card-info">
                  <span
                    className={`status-badge ${test.lastResult || "pending"}`}
                  >
                    {test.lastResult === "pass" && <CheckCircle2 size={10} />}
                    {test.lastResult === "fail" && <XCircle size={10} />}
                    {(!test.lastResult || test.lastResult === "pending") && (
                      <Clock size={10} />
                    )}
                    {(test.lastResult || "pending").toUpperCase()}
                  </span>
                  <span className="test-card-name">{test.name}</span>
                </div>
                <div className="test-card-actions">
                  <button
                    className="action-btn run"
                    data-tooltip="Run test"
                  >
                    <Play size={12} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteTest(test.id)}
                    data-tooltip="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              {test.lastRun && (
                <div className="test-card-footer">
                  <span className="test-card-time">
                    Last run: {formatDateTime(test.lastRun)}
                  </span>
                  {test.testCases.length > 0 && (
                    <span className="test-card-cases">
                      {test.testCases.filter((tc) => tc.passed).length}/
                      {test.testCases.length} assertions
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
