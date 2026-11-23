import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { createBlankEnvironment } from "@/utils/constants";
import type { Environment, EnvironmentVariable } from "@/types";
import {
  Globe,
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import "./shared.css";
import "./Environments.css";

export const Environments = () => {
  const {
    environments,
    activeEnvironmentId,
    setActiveEnvironmentId,
    addEnvironment,
    updateEnvironment,
    deleteEnvironment,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [secretVisible, setSecretVisible] = useState<Set<string>>(new Set());

  const filteredEnvironments = environments.filter((env) =>
    env.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEnvironment = () => {
    const newEnv = createBlankEnvironment();
    addEnvironment(newEnv);
  };

  const handleDeleteEnvironment = (id: string) => {
    if (confirm("Are you sure you want to delete this environment?")) {
      deleteEnvironment(id);
    }
  };

  const handleDuplicateEnvironment = (env: Environment) => {
    const duplicated: Environment = {
      ...env,
      id: crypto.randomUUID(),
      name: `${env.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addEnvironment(duplicated);
  };

  const handleUpdateVariable = (
    envId: string,
    varIndex: number,
    field: keyof EnvironmentVariable,
    value: string | boolean
  ) => {
    const env = environments.find((e) => e.id === envId);
    if (!env) return;
    const vars = [...env.variables];
    vars[varIndex] = { ...vars[varIndex], [field]: value };
    updateEnvironment({ ...env, variables: vars, updatedAt: Date.now() });
  };

  const handleAddVariable = (envId: string) => {
    const env = environments.find((e) => e.id === envId);
    if (!env) return;
    const newVar: EnvironmentVariable = {
      key: "",
      value: "",
      enabled: true,
      isSecret: false,
    };
    updateEnvironment({
      ...env,
      variables: [...env.variables, newVar],
      updatedAt: Date.now(),
    });
  };

  const handleRemoveVariable = (envId: string, varIndex: number) => {
    const env = environments.find((e) => e.id === envId);
    if (!env) return;
    updateEnvironment({
      ...env,
      variables: env.variables.filter((_, i) => i !== varIndex),
      updatedAt: Date.now(),
    });
  };

  const toggleSecret = (varKey: string) => {
    const next = new Set(secretVisible);
    if (next.has(varKey)) next.delete(varKey);
    else next.add(varKey);
    setSecretVisible(next);
  };

  return (
    <div className="environments-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Environments</h1>
          <span className="page-count">{environments.length} environments</span>
        </div>
        <div className="page-header-right">
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search environments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAddEnvironment}>
            <Plus size={14} />
            <span>New Environment</span>
          </button>
        </div>
      </div>

      {/* Environments List */}
      {filteredEnvironments.length === 0 ? (
        <div className="page-empty-state">
          <Globe size={48} className="page-empty-icon" />
          <h3 className="page-empty-title">
            {searchQuery ? "No environments found" : "No environments yet"}
          </h3>
          <p className="page-empty-description">
            {searchQuery
              ? "Try a different search term."
              : "Create an environment to manage variables across your requests."}
          </p>
          {!searchQuery && (
            <button className="btn btn-primary" onClick={handleAddEnvironment}>
              <Plus size={14} />
              <span>Create Environment</span>
            </button>
          )}
        </div>
      ) : (
        <div className="environments-list">
          {filteredEnvironments.map((env) => {
            const isActive = activeEnvironmentId === env.id;
            return (
              <div
                key={env.id}
                className={`environment-card ${isActive ? "active" : ""}`}
              >
                {/* Card Header */}
                <div className="environment-header">
                  <div className="environment-header-left">
                    <div
                      className={`environment-dot ${isActive ? "active" : ""}`}
                    />
                    {editingId === env.id ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => {
                          if (editName.trim()) {
                            updateEnvironment({
                              ...env,
                              name: editName.trim(),
                              updatedAt: Date.now(),
                            });
                          }
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (editName.trim()) {
                              updateEnvironment({
                                ...env,
                                name: editName.trim(),
                                updatedAt: Date.now(),
                              });
                            }
                            setEditingId(null);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="environment-name"
                        onClick={() => setActiveEnvironmentId(env.id)}
                      >
                        {env.name}
                      </div>
                    )}
                    <span className="environment-count">
                      {env.variables.length} variables
                    </span>
                  </div>
                  <div className="environment-actions">
                    {isActive && (
                      <span className="active-badge">Active</span>
                    )}
                    <button
                      className="action-btn"
                      onClick={() => {
                        setEditingId(env.id);
                        setEditName(env.name);
                      }}
                      data-tooltip="Rename"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleDuplicateEnvironment(env)}
                      data-tooltip="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteEnvironment(env.id)}
                      data-tooltip="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Variables Table */}
                {env.variables.length > 0 && (
                  <div className="environment-variables">
                    <div className="variable-header">
                      <span>Key</span>
                      <span>Value</span>
                      <span>Enabled</span>
                      <span />
                    </div>
                    {env.variables.map((variable, varIndex) => (
                      <div key={varIndex} className="variable-row">
                        <input
                          type="text"
                          placeholder="Variable name"
                          value={variable.key}
                          onChange={(e) =>
                            handleUpdateVariable(
                              env.id,
                              varIndex,
                              "key",
                              e.target.value
                            )
                          }
                        />
                        <div className="variable-value-wrapper">
                          <input
                            type={
                              variable.isSecret &&
                              !secretVisible.has(`${env.id}-${varIndex}`)
                                ? "password"
                                : "text"
                            }
                            placeholder="Value"
                            value={variable.value}
                            onChange={(e) =>
                              handleUpdateVariable(
                                env.id,
                                varIndex,
                                "value",
                                e.target.value
                              )
                            }
                          />
                          {variable.isSecret && (
                            <button
                              className="secret-toggle"
                              onClick={() =>
                                toggleSecret(`${env.id}-${varIndex}`)
                              }
                            >
                              {secretVisible.has(`${env.id}-${varIndex}`) ? (
                                <EyeOff size={12} />
                              ) : (
                                <Eye size={12} />
                              )}
                            </button>
                          )}
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={variable.enabled}
                            onChange={(e) =>
                              handleUpdateVariable(
                                env.id,
                                varIndex,
                                "enabled",
                                e.target.checked
                              )
                            }
                          />
                          <span className="toggle-slider" />
                        </label>
                        <div className="variable-actions">
                          <button
                            className="action-btn"
                            onClick={() =>
                              handleUpdateVariable(
                                env.id,
                                varIndex,
                                "isSecret",
                                !variable.isSecret
                              )
                            }
                            data-tooltip={
                              variable.isSecret ? "Show" : "Hide value"
                            }
                          >
                            {variable.isSecret ? (
                              <EyeOff size={12} />
                            ) : (
                              <Eye size={12} />
                            )}
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() =>
                              handleRemoveVariable(env.id, varIndex)
                            }
                            data-tooltip="Remove"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Variable Button */}
                <button
                  className="add-variable-btn"
                  onClick={() => handleAddVariable(env.id)}
                >
                  <Plus size={12} />
                  <span>Add Variable</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
