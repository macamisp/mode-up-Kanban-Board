# Decentralized Collaborative Kanban Board 🚀

A **local-first, peer-to-peer (P2P)** Kanban board built with **React**, **Yjs**, and **WebRTC**. 

This application allows multiple users to collaborate on a Kanban board in real-time **without a central database**. Data is stored locally in your browser (IndexedDB) and synchronized directly between peers.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## ✨ Key Features

- **Local-First Architecture**: Data lives on your device. The app works offline and syncs when you reconnect.
- **Real-Time Collaboration**: See cards move and update instantly across all connected peers.
- **Decentralized (P2P)**: Uses WebRTC for direct peer-to-peer communication. No central server stores your data.
- **Drag & Drop Interface**: Smooth, intuitive Kanban board experience using `@dnd-kit`.
- **Conflict Resolution**: Powered by **Yjs** CRDTs (Conflict-free Replicated Data Types) to handle concurrent edits gracefully.
- **Modern UI**: Glassmorphic design system with dark mode and fluid animations.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **State & Sync**: Yjs (CRDT), y-webrtc, y-indexeddb
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Styling**: CSS Variables, Glassmorphism
- **Signaling**: Node.js WebSocket server (for peer discovery only)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/macamisp/mode-up-Kanban-Board.git
   cd mode-up-Kanban-Board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the Signaling Server** (Required for P2P discovery)
   ```bash
   npm run server
   ```
   *Runs on port 4444*

4. **Start the Frontend** (In a new terminal)
   ```bash
   npm run dev
   ```
   *Opens at http://localhost:5173*

### How to Test Collaboration

1. Open the app in one browser window (`http://localhost:5173`).
2. Open the same URL in a **second window** (or Incognito mode).
3. Move a card in Window A -> Watch it move instantly in Window B.
4. Edit a task title -> See the update reflect immediately.
5. Close the signaling server -> The app still works offline!

## 🏗️ Architecture

### 1. Data Layer (CRDT)
The application state is managed by **Yjs**, a high-performance CRDT library.
- `y-array`: Manages the list of columns.
- `y-map`: Manages task properties and board metadata.
- `y-indexeddb`: Persists this state to the browser's IndexedDB.

### 2. Synchronization
- **y-webrtc**: Connects peers via WebRTC.
- **Signaling Server**: A lightweight WebSocket server (`server/signaling.js`) that helps peers exchange "handshakes" (SDP offers/answers). Once connected, data flows directly between peers.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
