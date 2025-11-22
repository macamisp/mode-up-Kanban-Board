import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { useKanbanStore } from '../hooks/useKanbanStore';

export const Board = () => {
    const { board, status, actions } = useKanbanStore();
    const [activeId, setActiveId] = useState(null);
    const [modalState, setModalState] = useState({
        isOpen: false,
        task: null,
        columnId: null
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Wait 5px movement before drag starts to prevent accidental clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Get tasks for a specific column
    const getTasksForColumn = (columnId) => {
        return Object.values(board.tasks)
            .filter(task => task.columnId === columnId)
            .sort((a, b) => {
                // If we had an order field, we'd sort by that
                // For now, sort by update time or creation time
                return b.updatedAt - a.updatedAt;
            });
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeTask = board.tasks[active.id];
        const overId = over.id;

        // Find which column we dropped over
        // It could be a column itself or a task within a column
        let targetColumnId = null;

        // Check if we dropped on a column
        const isOverColumn = board.columns.some(col => col.id === overId);

        if (isOverColumn) {
            targetColumnId = overId;
        } else {
            // We dropped on another task, find its column
            const overTask = board.tasks[overId];
            if (overTask) {
                targetColumnId = overTask.columnId;
            }
        }

        if (targetColumnId && activeTask.columnId !== targetColumnId) {
            actions.moveTask(active.id, targetColumnId);
        }

        setActiveId(null);
    };

    const handleAddTask = (columnId) => {
        setModalState({
            isOpen: true,
            task: null,
            columnId
        });
    };

    const handleEditTask = (task) => {
        setModalState({
            isOpen: true,
            task,
            columnId: task.columnId
        });
    };

    const handleSaveTask = (taskData) => {
        if (taskData.id) {
            actions.updateTask(taskData.id, taskData);
        } else {
            actions.addTask(taskData.columnId, taskData.title, taskData.description);
        }
    };

    const activeTask = activeId ? board.tasks[activeId] : null;

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-transparent">
            {/* Header */}
            <header className="glass-surface m-4 p-4 flex items-center justify-between z-10">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        {board.title}
                    </h1>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status.synced ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500'}`}></span>
                        {status.synced ? 'Synced' : 'Connecting...'}
                        <span className="mx-1">•</span>
                        {status.peers} peer{status.peers !== 1 ? 's' : ''} online
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {/* Fake avatars for demo */}
                        {[...Array(Math.min(status.peers + 1, 4))].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-800 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}
                        {status.peers > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-xs text-white">
                                +{status.peers - 3}
                            </div>
                        )}
                    </div>

                    <button className="btn btn-primary btn-sm">
                        Share Board
                    </button>
                </div>
            </header>

            {/* Board Area */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4">
                    <div className="flex h-full gap-6 min-w-max">
                        {board.columns.map((col) => (
                            <Column
                                key={col.id}
                                column={col}
                                tasks={getTasksForColumn(col.id)}
                                onAddTask={handleAddTask}
                                onEditTask={handleEditTask}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} onClick={() => { }} /> : null}
                </DragOverlay>
            </DndContext>

            <TaskModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onSave={handleSaveTask}
                onDelete={actions.deleteTask}
                task={modalState.task}
                columnId={modalState.columnId}
            />
        </div>
    );
};
