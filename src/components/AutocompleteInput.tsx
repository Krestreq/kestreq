import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";
import "./AutocompleteInput.css";

/** Common HTTP headers for autocomplete suggestions */
const COMMON_HEADERS = [
  "Accept",
  "Accept-Charset",
  "Accept-Encoding",
  "Accept-Language",
  "Accept-Ranges",
  "Authorization",
  "Cache-Control",
  "Connection",
  "Content-Type",
  "Content-Length",
  "Content-Encoding",
  "Cookie",
  "Date",
  "Expect",
  "From",
  "Host",
  "If-Match",
  "If-Modified-Since",
  "If-None-Match",
  "If-Unmodified-Since",
  "Origin",
  "Pragma",
  "Referer",
  "Retry-After",
  "User-Agent",
  "X-Requested-With",
  "X-API-Key",
  "X-CSRF-Token",
];

/** Common Content-Type values */
const COMMON_CONTENT_TYPES = [
  "application/json",
  "application/xml",
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
  "text/html",
  "text/xml",
  "image/png",
  "image/jpeg",
  "application/octet-stream",
];

/** Common Accept values */
const COMMON_ACCEPT_VALUES = [
  "application/json",
  "text/html",
  "application/xml",
  "*/*",
  "text/plain",
  "image/png",
  "image/jpeg",
];

/** Common Cache-Control values */
const COMMON_CACHE_CONTROL = [
  "no-cache",
  "no-store",
  "max-age=0",
  "max-age=3600",
  "public",
  "private",
  "must-revalidate",
  "no-transform",
];

/** Common Authorization prefixes */
const COMMON_AUTH_VALUES = [
  "Bearer ",
  "Basic ",
  "ApiKey ",
  "Token ",
];

/** Common query parameter names */
const COMMON_QUERY_PARAMS = [
  "page",
  "limit",
  "offset",
  "sort",
  "order",
  "search",
  "q",
  "filter",
  "fields",
  "expand",
  "include",
  "format",
  "callback",
  "token",
  "key",
  "api_key",
  "access_token",
  "timestamp",
  "debug",
  "verbose",
  "dry_run",
  "id",
  "name",
  "email",
  "status",
  "type",
];


/**
 * Determine suggestions based on the key/name of the field being edited.
 */
function getValueSuggestions(key: string): string[] {
  if (!key) return [];

  const lower = key.toLowerCase();

  if (lower === "content-type") return COMMON_CONTENT_TYPES;
  if (lower === "accept") return COMMON_ACCEPT_VALUES;
  if (lower === "cache-control") return COMMON_CACHE_CONTROL;
  if (lower === "authorization") return COMMON_AUTH_VALUES;
  if (lower === "user-agent") return ["Mozilla/5.0", "Kestreq/1.0"];
  if (lower === "x-requested-with") return ["XMLHttpRequest"];
  if (lower === "x-api-key" || lower === "api-key" || lower === "apikey") return ["your-api-key-here"];
  if (lower === "x-csrf-token") return ["your-csrf-token-here"];
  if (lower === "cookie") return ["session=abc123", "token=xyz789"];
  if (lower === "referer" || lower === "origin") return ["https://example.com"];
  if (lower === "host") return ["api.example.com", "localhost:3000"];

  // Query param suggestions
  if (lower === "page" || lower === "limit" || lower === "offset") return ["1", "10", "20", "50", "100"];
  if (lower === "sort" || lower === "order") return ["asc", "desc", "created_at", "name"];
  if (lower === "search" || lower === "q") return ["search term"];
  if (lower === "format") return ["json", "xml", "html"];
  if (lower === "callback") return ["handleResponse"];
  if (lower === "token" || lower === "access_token") return ["your-token-here"];
  if (lower === "debug") return ["true", "false", "1", "0"];
  if (lower === "status") return ["active", "inactive", "pending", "completed"];
  if (lower === "type") return ["user", "post", "comment", "api"];

  return [];
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  keyName?: string; // The associated key for context-aware suggestions
  suggestions?: string[]; // Custom suggestions override
  className?: string;
  ariaLabel?: string;
  type?: "text" | "password";
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder,
  keyName,
  suggestions: customSuggestions,
  className = "",
  ariaLabel,
  type = "text",
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const getSuggestions = useCallback(() => {
    if (customSuggestions) return customSuggestions;
    if (keyName !== undefined) return getValueSuggestions(keyName);
    // Fallback: if it looks like a header, suggest headers
    if (value.includes("-") || value.length > 2) {
      return [...COMMON_HEADERS, ...COMMON_QUERY_PARAMS];
    }
    return [];
  }, [customSuggestions, keyName, value]);

  const filterSuggestions = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const allSuggestions = getSuggestions();
      if (!value || value.length < 1) {
        setFilteredSuggestions(allSuggestions.slice(0, 8));
        return;
      }

      const lower = value.toLowerCase();
      const filtered = allSuggestions.filter((s) => s.toLowerCase().includes(lower));
      setFilteredSuggestions(filtered.slice(0, 8));
      setSelectedIndex(0);
    }, 150);
  }, [value, getSuggestions]);

  useEffect(() => {
    filterSuggestions();
  }, [filterSuggestions]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (inputRef.current && !inputRef.current.contains(target) && listRef.current && !listRef.current.contains(target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (filteredSuggestions[selectedIndex]) {
        e.preventDefault();
        onChange(filteredSuggestions[selectedIndex]);
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <div className={`autocomplete-input ${className}`}>
      <div className="autocomplete-wrapper">
        <input
          ref={inputRef}
          type={type}
          className="autocomplete-field"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoComplete="off"
        />
        {value && (
          <button
            className="autocomplete-clear"
            onClick={handleClear}
            tabIndex={-1}
            aria-label="Clear value"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown size={12} className="autocomplete-chevron" />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul ref={listRef} className="autocomplete-list" role="listbox">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              role="option"
              aria-selected={index === selectedIndex}
              className={`autocomplete-item ${index === selectedIndex ? "selected" : ""}`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="autocomplete-item-text">{suggestion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
