import React from "react";

type JsonToken = {
  type: "key" | "string" | "number" | "boolean" | "null" | "bracket" | "punctuation" | "whitespace" | "text";
  value: string;
};

function tokenizeJson(json: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let i = 0;

  while (i < json.length) {
    // Whitespace
    if (isWhitespace(json[i])) {
      let ws = "";
      while (i < json.length && isWhitespace(json[i])) {
        ws += json[i];
        i++;
      }
      tokens.push({ type: "whitespace", value: ws });
      continue;
    }

    // Strings
    if (json[i] === '"') {
      let str = '"';
      i++;
      while (i < json.length && json[i] !== '"') {
        if (json[i] === "\\" && i + 1 < json.length) {
          str += json[i] + json[i + 1];
          i += 2;
        } else {
          str += json[i];
          i++;
        }
      }
      if (i < json.length) {
        str += '"';
        i++;
      }
      tokens.push({ type: "string", value: str });
      continue;
    }

    // Numbers
    if (json[i] === "-" || (json[i] >= "0" && json[i] <= "9")) {
      let num = "";
      if (json[i] === "-") {
        num += "-";
        i++;
      }
      while (i < json.length && json[i] >= "0" && json[i] <= "9") {
        num += json[i];
        i++;
      }
      if (i < json.length && json[i] === ".") {
        num += ".";
        i++;
        while (i < json.length && json[i] >= "0" && json[i] <= "9") {
          num += json[i];
          i++;
        }
      }
      if (i < json.length && (json[i] === "e" || json[i] === "E")) {
        num += json[i];
        i++;
        if (i < json.length && (json[i] === "+" || json[i] === "-")) {
          num += json[i];
          i++;
        }
        while (i < json.length && json[i] >= "0" && json[i] <= "9") {
          num += json[i];
          i++;
        }
      }
      tokens.push({ type: "number", value: num });
      continue;
    }

    // Booleans and null
    if (json.substring(i, i + 4) === "true") {
      tokens.push({ type: "boolean", value: "true" });
      i += 4;
      continue;
    }
    if (json.substring(i, i + 5) === "false") {
      tokens.push({ type: "boolean", value: "false" });
      i += 5;
      continue;
    }
    if (json.substring(i, i + 4) === "null") {
      tokens.push({ type: "null", value: "null" });
      i += 4;
      continue;
    }

    // Brackets
    if (json[i] === "{" || json[i] === "}" || json[i] === "[" || json[i] === "]") {
      tokens.push({ type: "bracket", value: json[i] });
      i++;
      continue;
    }

    // Punctuation
    if (json[i] === ":" || json[i] === ",") {
      tokens.push({ type: "punctuation", value: json[i] });
      i++;
      continue;
    }

    // Fallback
    tokens.push({ type: "text", value: json[i] });
    i++;
  }

  return tokens;
}

function isWhitespace(char: string): boolean {
  return char === " " || char === "\n" || char === "\r" || char === "\t";
}

/**
 * Determine if a string token is actually a JSON key.
 * A key is a string followed by optional whitespace and a colon.
 */
function resolveKeys(tokens: JsonToken[]): JsonToken[] {
  const resolved: JsonToken[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === "string") {
      // Look ahead past whitespace for a colon
      let j = i + 1;
      while (j < tokens.length && tokens[j].type === "whitespace") {
        j++;
      }
      if (j < tokens.length && tokens[j].type === "punctuation" && tokens[j].value === ":") {
        resolved.push({ type: "key", value: token.value });
      } else {
        resolved.push(token);
      }
    } else {
      resolved.push(token);
    }
  }
  return resolved;
}

interface JsonHighlighterProps {
  json: string;
  className?: string;
}

export const JsonHighlighter: React.FC<JsonHighlighterProps> = ({ json, className }) => {
  const tokens = resolveKeys(tokenizeJson(json));

  return (
    <pre className={className}>
      {tokens.map((token, i) => {
        if (token.type === "whitespace") {
          return <React.Fragment key={i}>{token.value}</React.Fragment>;
        }
        return (
          <span key={i} className={`json-token json-token-${token.type}`}>
            {token.value}
          </span>
        );
      })}
    </pre>
  );
};
