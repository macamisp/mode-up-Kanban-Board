import React, { useState, useEffect } from 'react';

export const TaskModal = ({ isOpen, onClose, onSave, onDelete, task, columnId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
        } else {
            setTitle('');
            setDescription('');
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            id: task?.id,
            columnId: task?.columnId || columnId,
            title,
            description
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="glass-surface-elevated w-full max-w-md p-6 rounded-2xl shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {task ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                            rows={4}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        {task && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this task?')) {
                                        onDelete(task.id);
                                        onClose();
                                    }
                                }}
                                className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors mr-auto"
                            >
                                Delete
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {task ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
