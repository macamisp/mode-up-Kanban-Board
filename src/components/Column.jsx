import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

export const Column = ({ column, tasks, onAddTask, onEditTask }) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: 'Column',
            column
        }
    });

    const taskIds = tasks.map(t => t.id);

    return (
        <div className="flex flex-col w-80 min-w-[320px] h-full max-h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full shadow-glow"
                        style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-semibold text-slate-200 text-sm uppercase tracking-wider">
                        {column.title}
                    </h3>
                    <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>

                <button
                    onClick={() => onAddTask(column.id)}
                    className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                    aria-label="Add task"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            {/* Column Body (Droppable Area) */}
            <div
                ref={setNodeRef}
                className="flex-1 glass-surface-elevated p-3 rounded-xl overflow-y-auto min-h-[150px]"
            >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={onEditTask}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-700/50 rounded-lg flex items-center justify-center text-slate-600 text-sm">
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    );
};
