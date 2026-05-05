import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle, Circle, Clock, Trash2, Edit2 } from 'lucide-react';
import clsx from 'clsx';

export default function TaskCard({ task, onToggle, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    High: 'text-error bg-error/10 border-error/20',
    Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Low: 'text-green-400 bg-green-400/10 border-green-400/20',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      ref={setNodeRef}
      style={style}
      className={clsx(
        "glass p-4 rounded-xl mb-3 flex items-start gap-4 group transition-all duration-300",
        isDragging ? "opacity-50 shadow-2xl scale-105 z-50 border-primary/50" : "hover:border-white/20 hover:shadow-[0_0_20px_rgba(138,43,226,0.15)]"
      )}
      {...attributes}
      {...listeners}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(task._id); }}
        className="mt-1 flex-shrink-0 text-gray-400 hover:text-primary transition-colors"
      >
        {task.status === 'completed' ? (
          <CheckCircle className="w-6 h-6 text-primary fill-primary/20" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h3 className={clsx(
          "text-lg font-semibold truncate transition-colors",
          task.status === 'completed' ? "text-gray-500 line-through" : "text-white group-hover:text-primary/90"
        )}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className={clsx("text-xs px-2 py-1 rounded-md border", priorityColors[task.priority])}>
            {task.priority}
          </span>
          <span className="text-xs px-2 py-1 rounded-md bg-surface border border-white/5 text-gray-300">
            {task.category}
          </span>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
          className="p-2 rounded-lg text-gray-400 hover:text-error hover:bg-error/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
