/**
 * YJS CRDT Store - Decentralized State Management
 * 
 * This module manages the shared CRDT state using Yjs.
 * It handles:
 * - IndexedDB persistence (local-first)
 * - WebRTC P2P synchronization
 * - Board state (columns, tasks)
 * - Real-time delta broadcasting
 */

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';

class YjsStore {
  constructor() {
    this.ydoc = null;
    this.provider = null;
    this.indexeddbProvider = null;
    this.yBoard = null;
    this.yColumns = null;
    this.yTasks = null;
    this.listeners = new Set();
    this.roomName = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the Yjs document and providers
   * @param {string} roomName - Unique room identifier for P2P collaboration
   */
  async initialize(roomName = 'kanban-default-room') {
    if (this.isInitialized) {
      console.warn('YjsStore already initialized');
      return;
    }

    this.roomName = roomName;

    // Create a new Yjs document
    this.ydoc = new Y.Doc();

    // Get shared types from the document
    this.yBoard = this.ydoc.getMap('board');
    this.yColumns = this.ydoc.getArray('columns');
    this.yTasks = this.ydoc.getMap('tasks');

    // Set up IndexedDB persistence (local-first)
    this.indexeddbProvider = new IndexeddbPersistence(roomName, this.ydoc);

    // Wait for IndexedDB to load
    await new Promise((resolve) => {
      this.indexeddbProvider.once('synced', () => {
        console.log('✅ IndexedDB synced - Local state loaded');
        resolve();
      });
    });

    // Initialize default board structure if empty
    if (this.yColumns.length === 0) {
      this.initializeDefaultBoard();
    }

    // Set up WebRTC provider for P2P sync
    this.provider = new WebrtcProvider(roomName, this.ydoc, {
      signaling: [
        'ws://localhost:4444', // Local signaling server
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com'
      ],
      password: null, // Optional: add password for private rooms
      awareness: this.ydoc.getMap('awareness'),
      maxConns: 20 + Math.floor(Math.random() * 15), // Random connection limit
      filterBcConns: true,
      peerOpts: {} // WebRTC peer options
    });

    // Listen for peer connections
    this.provider.on('status', (event) => {
      console.log('WebRTC status:', event.status);
    });

    this.provider.on('synced', (synced) => {
      if (synced) {
        console.log('✅ WebRTC synced - Connected to peers');
      }
    });

    this.provider.on('peers', (event) => {
      console.log('👥 Connected peers:', event.added, 'added,', event.removed, 'removed');
      console.log('Total peers:', this.provider.peers || []);
    });

    // Set up observers for changes
    this.setupObservers();

    this.isInitialized = true;
    console.log(`🚀 YjsStore initialized for room: ${roomName}`);
  }

  /**
   * Initialize the default Kanban board structure
   */
  initializeDefaultBoard() {
    const defaultColumns = [
      { id: 'todo', title: 'To Do', color: '#6366f1' },
      { id: 'in-progress', title: 'In Progress', color: '#8b5cf6' },
      { id: 'done', title: 'Done', color: '#10b981' }
    ];

    this.ydoc.transact(() => {
      // Set columns
      defaultColumns.forEach(column => {
        this.yColumns.push([column]);
      });

      // Set board metadata
      this.yBoard.set('title', 'My Kanban Board');
      this.yBoard.set('createdAt', Date.now());

      console.log('✨ Default board structure created');
    });
  }

  /**
   * Set up observers to listen for changes
   */
  setupObservers() {
    // Observe columns changes
    this.yColumns.observe((event) => {
      this.notifyListeners({ type: 'columns', event });
    });

    // Observe tasks changes
    this.yTasks.observe((event) => {
      this.notifyListeners({ type: 'tasks', event });
    });

    // Observe board metadata changes
    this.yBoard.observe((event) => {
      this.notifyListeners({ type: 'board', event });
    });
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function to handle changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners(change) {
    this.listeners.forEach(listener => {
      try {
        listener(change);
      } catch (error) {
        console.error('Error in listener:', error);
      }
    });
  }

  /**
   * Get current board state as plain JavaScript objects
   */
  getBoardState() {
    return {
      title: this.yBoard.get('title'),
      createdAt: this.yBoard.get('createdAt'),
      columns: this.yColumns.toArray(),
      tasks: Object.fromEntries(this.yTasks.entries())
    };
  }

  /**
   * Add a new task to a column
   */
  addTask(task) {
    if (!task.id || !task.columnId) {
      throw new Error('Task must have id and columnId');
    }

    this.ydoc.transact(() => {
      this.yTasks.set(task.id, task);
    });

    console.log('✅ Task added:', task.id);
  }

  /**
   * Update an existing task
   */
  updateTask(taskId, updates) {
    const task = this.yTasks.get(taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    this.ydoc.transact(() => {
      this.yTasks.set(taskId, { ...task, ...updates });
    });

    console.log('✅ Task updated:', taskId);
  }

  /**
   * Delete a task
   */
  deleteTask(taskId) {
    this.ydoc.transact(() => {
      this.yTasks.delete(taskId);
    });

    console.log('✅ Task deleted:', taskId);
  }

  /**
   * Move a task to a different column
   */
  moveTask(taskId, newColumnId) {
    this.updateTask(taskId, { columnId: newColumnId });
    console.log('✅ Task moved:', taskId, 'to column:', newColumnId);
  }

  /**
   * Get all tasks for a specific column
   */
  getTasksByColumn(columnId) {
    const allTasks = Object.fromEntries(this.yTasks.entries());
    return Object.values(allTasks).filter(task => task.columnId === columnId);
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      webrtc: this.provider?.connected || false,
      peers: this.provider?.room?.peers?.size || 0,
      synced: this.provider?.synced || false
    };
  }

  /**
   * Destroy the store and clean up
   */
  destroy() {
    if (this.provider) {
      this.provider.destroy();
    }
    if (this.indexeddbProvider) {
      this.indexeddbProvider.destroy();
    }
    if (this.ydoc) {
      this.ydoc.destroy();
    }
    this.listeners.clear();
    this.isInitialized = false;
    console.log('🔴 YjsStore destroyed');
  }
}

// Export singleton instance
export const yjsStore = new YjsStore();
