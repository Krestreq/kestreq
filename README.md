<div align="center">

<img width="150" height="150" alt="Kestreq logo" src="https://github.com/user-attachments/assets/9158ee40-1a07-492e-aa5c-f72b48c3de61" />

# Kestreq

### Offline API Testing Desktop App

A lightweight, offline-first desktop application for testing REST APIs.

![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-DEA584?style=for-the-badge&logo=rust&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge)

[Features](#-features) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Mock API](#-mock-api-endpoints) · [Project Structure](#-project-structure)

</div>

---

## ✨ Features

| | Feature | Description |
|---|---------|-------------|
| 🛠️ | **HTTP Request Builder** | Compose requests with method, URL, headers, query params, body and authentication |
| 📬 | **Response Viewer** | View response body, headers and metadata (status, duration, size) |
| 📁 | **Collections** | Organize requests into collections for easy management |
| 🕘 | **Request History** | Track all sent requests with their responses |
| 🌍 | **Environment Variables** | Manage environments with `{{variable}}` interpolation |
| 🔐 | **Authentication** | Bearer tokens, Basic Auth and API Keys |
| 🌗 | **Dark / Light Theme** | Toggle between dark and light themes |
| 📴 | **Offline-First** | All data stored locally, no cloud dependency |

---

## 🏗️ Architecture

```
krestreq/
├── src/                        # ⚛️  React frontend
│   ├── components/             # Reusable UI components
│   │   ├── Header.tsx          # Request bar (method, URL, send)
│   │   ├── Sidebar.tsx         # Collections & history sidebar
│   │   ├── RequestPanel.tsx    # Request config (params, headers, body, auth)
│   │   └── ResponsePanel.tsx   # Response viewer (body, headers, info)
│   ├── pages/
│   │   └── Workspace.tsx       # Main workspace layout
│   ├── services/               # Business logic
│   │   ├── apiClient.ts        # HTTP request service (Tauri IPC)
│   │   └── storage.ts          # Local storage persistence
│   ├── store/
│   │   └── appStore.ts         # Zustand global store
│   ├── types/
│   │   └── index.ts            # All type definitions
│   ├── utils/
│   │   ├── constants.ts        # Defaults and factory functions
│   │   └── helpers.ts          # Formatting and helper functions
│   └── styles/
│       └── global.css          # CSS variables, reset, layout
├── src-tauri/                  # 🦀 Tauri Rust backend (HTTP client)
│   ├── src/
│   │   ├── lib.rs              # Tauri commands entry point
│   │   ├── main.rs             # Binary entry point
│   │   └── http_client.rs      # HTTP request handler (reqwest)
│   └── Cargo.toml              # Rust dependencies
└── backend/                    # 🟢 Express.js mock API server
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

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| 🖥️ Frontend | React 19 + TypeScript + Vite |
| 🧠 State | Zustand |
| 🦀 Desktop Backend | Rust + Tauri 2 + reqwest |
| 🌐 API Server | Express.js + TypeScript |
| 💾 Storage | localStorage (swappable for IndexedDB) |
| 🎨 Styling | CSS Variables + Dark/Light themes |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Rust** (latest stable)
- System dependencies for [Tauri](https://tauri.app/start/prerequisites/)

### Installation

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..
```

### Run

```bash
# Desktop app in development mode
npm run tauri dev

# Express mock API server (in a second terminal)
cd backend && npm run dev
```

### Build

```bash
# Production build
npm run tauri build
```

---

## 🔌 Mock API Endpoints

The Express server in `backend/` gives you something to test against.

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET` | `/` | Server info |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/echo` | Echo request data back |
| `GET` | `/api/users` | List mock users |
| `GET` | `/api/users/:id` | Get a single user |
| `POST` | `/api/users` | Create a user |

---

## 📂 Project Structure

### Frontend (`src/`)

| Folder | Purpose |
|--------|---------|
| `types/` | All TypeScript interfaces (Request, Response, Collection, Environment, etc.) |
| `store/` | Zustand store for global state (requests, collections, history, settings) |
| `services/` | API client (Tauri IPC calls) and storage (localStorage persistence) |
| `components/` | UI components with co-located CSS files |
| `pages/` | Top-level page components |
| `utils/` | Helper functions and constants |
| `styles/` | Global CSS with theme variables |

### Tauri backend (`src-tauri/`)

| File | Purpose |
|------|---------|
| `http_client.rs` | HTTP request handler using `reqwest` with timeout, SSL and redirect control |
| `lib.rs` | Tauri command handlers (`send_http_request`, `test_connection`) |

### Express mock server (`backend/`)

| File | Purpose |
|------|---------|
| `src/index.ts` | Express server entry point with middleware setup |
| `src/routes/api.ts` | Mock API routes (health, echo, users CRUD) |
| `src/middleware/errorHandler.ts` | Request logging, error handling, 404 handler |
| `src/types/index.ts` | Backend TypeScript types |

---

## 💡 Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Tauri extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

---

<div align="center">

**Your APIs. Your Workspace. Your Control.**

</div>
