# Kestreq — Offline API Testing Desktop App

A lightweight, offline-first desktop application for testing REST APIs. Built with **Tauri 2**, **React 19**, and **TypeScript**.

## Features

- **HTTP Request Builder** — Compose requests with method, URL, headers, query params, body, and authentication
- **Response Viewer** — View response body, headers, and metadata (status, duration, size)
- **Collections** — Organize requests into collections for easy management
- **Request History** — Track all sent requests with their responses
- **Environment Variables** — Manage environments with `{{variable}}` interpolation
- **Authentication** — Support for Bearer tokens, Basic Auth, and API Keys
- **Dark/Light Theme** — Toggle between dark and light themes
- **Offline-First** — All data stored locally; no cloud dependency

## Architecture

```
Kestreq/
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   │   ├── Header.tsx          # Request bar (method, URL, send)
│   │   ├── Sidebar.tsx         # Collections & history sidebar
│   │   ├── RequestPanel.tsx    # Request config (params, headers, body, auth)
│   │   └── ResponsePanel.tsx   # Response viewer (body, headers, info)
│   ├── pages/                  # App pages
│   │   └── Workspace.tsx       # Main workspace layout
│   ├── services/               # Business logic
│   │   ├── apiClient.ts        # HTTP request service (Tauri IPC)
│   │   └── storage.ts          # Local storage persistence
│   ├── store/                  # State management
│   │   └── appStore.ts         # Zustand global store
│   ├── types/                  # TypeScript interfaces
│   │   └── index.ts            # All type definitions
│   ├── utils/                  # Utilities
│   │   ├── constants.ts        # Defaults and factory functions
│   │   └── helpers.ts          # Formatting and helper functions
│   └── styles/                 # Global styles
│       └── global.css          # CSS variables, reset, layout
├── src-tauri/                  # Tauri Rust backend (HTTP client)
│   ├── src/
│   │   ├── lib.rs              # Tauri commands entry point
│   │   ├── main.rs             # Binary entry point
│   │   └── http_client.rs      # HTTP request handler (reqwest)
│   └── Cargo.toml              # Rust dependencies
└── backend/                    # Express.js mock API server
    ├── src/
    │   ├── index.ts            # Express server entry point
    │   ├── routes/
    │   │   └── api.ts          # API routes (health, echo, users)
    │   ├── middleware/
    │   │   └── errorHandler.ts # Error handling & logging middleware
    │   └── types/
    │       └── index.ts        # Backend TypeScript types
    ├── tsconfig.json           # Backend TypeScript config
    └── package.json            # Backend dependencies
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| State | Zustand |
| Desktop Backend | Rust + Tauri 2 + reqwest |
| API Server | Express.js + TypeScript |
| Storage | localStorage (swappable for IndexedDB) |
| Styling | CSS Variables + Dark/Light themes |

## Getting Started

### Prerequisites

- Node.js 18+
- Rust (latest stable)
- System dependencies for Tauri

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Run the desktop app in development mode
npm run tauri dev

# Run the Express mock API server
cd backend && npm run dev

# Build for production
npm run tauri build
```

### API Endpoints (Mock Server)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server info |
| GET | `/api/health` | Health check |
| POST | `/api/echo` | Echo request data back |
| GET | `/api/users` | List mock users |
| GET | `/api/users/:id` | Get a single user |
| POST | `/api/users` | Create a user |

## Project Structure

### Frontend (`src/`)

- **`types/`** — All TypeScript interfaces (Request, Response, Collection, Environment, etc.)
- **`store/`** — Zustand store for global state (requests, collections, history, settings)
- **`services/`** — API client (Tauri IPC calls) and storage (localStorage persistence)
- **`components/`** — UI components with co-located CSS files
- **`pages/`** — Top-level page components
- **`utils/`** — Helper functions and constants
- **`styles/`** — Global CSS with theme variables

### Backend (`src-tauri/`)

- **`http_client.rs`** — HTTP request handler using `reqwest` with timeout, SSL, and redirect control
- **`lib.rs`** — Tauri command handlers (`send_http_request`, `test_connection`)

### Express Mock Server (`backend/`)

- **`src/index.ts`** — Express server entry point with middleware setup
- **`src/routes/api.ts`** — Mock API routes (health, echo, users CRUD)
- **`src/middleware/errorHandler.ts`** — Request logging, error handling, 404 handler
- **`src/types/index.ts`** — Backend TypeScript types

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Cross-platform desktop builds

The `Build desktop installers` GitHub Actions workflow builds native installers for Linux (x64 and ARM64), macOS (Intel and Apple Silicon), and Windows (x64 and ARM64). It runs when a `v*` tag is pushed or can be started manually from the repository's Actions tab. Each operating-system and architecture build is uploaded as a separate workflow artifact.

The generated bundles are unsigned; macOS notarization and Windows code signing are not configured.

### Build locally on macOS

- Install Node.js 22, Rust stable, and the Xcode Command Line Tools (`xcode-select --install`).
- From the repository root, run `npm ci`, then `npm run tauri dev` to launch the app.
- Run `npm run tauri build` to create a native installer. The `.app` bundle and `.dmg` are written under `src-tauri/target/release/bundle/`.

### Build locally on Windows

- Install Node.js 22, Rust stable with the MSVC toolchain, Visual Studio Build Tools with the **Desktop development with C++** workload, and the Microsoft Edge WebView2 Runtime.
- From the repository root, run `npm ci`, then `npm run tauri dev` to launch the app.
- Run `npm run tauri build` to create native installers. The `.msi` and NSIS `.exe` are written under `src-tauri/target/release/bundle/`.

Local builds target the architecture of the machine. To get all supported architectures, run the `Build desktop installers` workflow from the Actions tab; download the desired `kestreq-macos-*` or `kestreq-windows-*` artifact from its completed run.
