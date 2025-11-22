import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const TaskCard = ({ task, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(task)}
            className="glass-surface p-4 mb-3 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors group relative overflow-hidden"
        >
            {/* Decorative gradient bar on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-70" />

            <div className="pl-2">
                <h4 className="font-medium text-white mb-1 text-sm leading-tight">{task.title}</h4>

                {task.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                        {new Date(task.updatedAt).toLocaleDateString()}
                    </span>

                    {/* Edit icon that appears on hover */}
                    <button
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity"
                        aria-label="Edit task"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
