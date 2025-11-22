import { useState, useEffect, useCallback } from 'react';
import { yjsStore } from '../store/yjs-store';
import { nanoid } from 'nanoid';

export const useKanbanStore = (roomName = 'kanban-demo-room') => {
    const [boardState, setBoardState] = useState({
        columns: [],
        tasks: {},
        title: 'Loading...',
        createdAt: null
    });

    const [connectionStatus, setConnectionStatus] = useState({
        webrtc: false,
        peers: 0,
        synced: false
    });

    // Initialize store on mount
    useEffect(() => {
        const init = async () => {
            await yjsStore.initialize(roomName);
            setBoardState(yjsStore.getBoardState());
            setConnectionStatus(yjsStore.getConnectionStatus());
        };

        init();

        // Subscribe to changes
        const unsubscribe = yjsStore.subscribe((change) => {
            // Update state when Yjs data changes
            setBoardState(yjsStore.getBoardState());

            // Update connection status periodically or on events
            setConnectionStatus(yjsStore.getConnectionStatus());
        });

        // Poll for connection status updates (peer count changes often don't trigger Yjs events)
        const statusInterval = setInterval(() => {
            setConnectionStatus(yjsStore.getConnectionStatus());
        }, 2000);

        return () => {
            unsubscribe();
            clearInterval(statusInterval);
            // We don't destroy the store here to persist state across re-renders
            // In a real app, you might want to handle cleanup more carefully
        };
    }, [roomName]);

    // Actions
    const addTask = useCallback((columnId, title, description = '') => {
        const newTask = {
            id: nanoid(),
            columnId,
            title,
            description,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: 'user-' + nanoid(4) // In real app, use actual user ID
        };
        yjsStore.addTask(newTask);
        return newTask;
    }, []);

    const updateTask = useCallback((taskId, updates) => {
        yjsStore.updateTask(taskId, {
            ...updates,
            updatedAt: Date.now()
        });
    }, []);

    const moveTask = useCallback((taskId, newColumnId) => {
        yjsStore.moveTask(taskId, newColumnId);
    }, []);

    const deleteTask = useCallback((taskId) => {
        yjsStore.deleteTask(taskId);
    }, []);

    return {
        board: boardState,
        status: connectionStatus,
        actions: {
            addTask,
            updateTask,
            moveTask,
            deleteTask
        }
    };
};
